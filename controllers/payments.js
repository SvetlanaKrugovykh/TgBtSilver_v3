const dbRequests = require('../db/requests')
require('dotenv').config()
const crypto = require('crypto')
const inputLineScene = require('./inputLine')
const sendReqToDB = require('../modules/tlg_to_DB')
const getLiqpayKeys = require('../globalBuffer').getLiqpayKeys


async function paymentScene(bot, msg) {
  try {
    const mode = process.env.MODE || 'PROD'
    const ligpay_env = process.env.LIQPAY_ENV || 'Test'

    if (mode === 'PROD' && ligpay_env === 'Test') {
      await bot.sendMessage(msg.chat.id, `⛔️ Оплата через LiqPay в даний час недоступна`, { parse_mode: 'HTML' })
      return
    }

    const chatId = msg.chat.id
    const currency = 'UAH'
    const contract = await dbRequests.getContractByTgID(chatId)
    console.log(contract)

    if (!contract?.organization_abbreviation) {
      console.log('No contract found')
      await bot.sendMessage(chatId, '⚠️Ваш договір не знайдено в системі!\n Зверніться до служби підтримки за допомогою', { parse_mode: "HTML" })
      return null
    }

    let jsonString = await sendReqToDB('___GetTgUserData__', contract, '')
    const jsondata = JSON.parse(jsonString)
    if (!jsondata?.ResponseArray) {
      await bot.sendMessage(msg.chat.id, `⛔️ На жаль, сталася помилка отримання даних за Вашим договором. Операція не може бути продовжена`, { parse_mode: 'HTML' })
      return null
    }

    await bot.sendMessage(msg.chat.id, `☑︎ ${jsondata?.ResponseArray[0]}`, { parse_mode: 'HTML' })
    const abbreviation = contract.organization_abbreviation
    const liqpayKeys = getLiqpayKeys(abbreviation)
    if (!liqpayKeys) {
      console.log(`No LiqPay keys found for abbreviation: ${abbreviation}`)
      await bot.sendMessage(chatId, '⛔️ Сталася помилка при завантаженні ключів доступу до LiqPay ', { parse_mode: "HTML" })
      return null
    }

    const { publicKey, privateKey } = liqpayKeys
    console.log(`LiqPay Public Key: ${publicKey}`)

    await bot.sendMessage(chatId, "Введіть <i>суму оплати в грн без копійок, наприклад введення суми 200 означає 200 гривень </i>\n⚠️Увага, до суми платежу додається комісія! \n⚠️ Комісія становить 1,5% від суми платежу!\n", { parse_mode: "HTML" })
    let userInput = await inputLineScene(bot, msg)
    let amount = userInput.replace(/[^0-9]/g, "")
    if (amount.length === 0) {
      await bot.sendMessage(chatId, "Ви не ввели суму оплати, спробуйте ще раз")
      return
    }

    const description = `Оплата за послугу. Код оплати: ${contract.payment_code}. Сума оплати: ${amount} грн.`
    const callBackUrl = process.env.LIQPAY_CALLBACK_URL
    const URL_MDL = process.env.URL_MDL || ''
    const server_callback_url = `${callBackUrl}${URL_MDL}${abbreviation}/`
    console.log(`Payment Request: ${server_callback_url} | ${description} | ${amount} | ${currency}`)
    const data = Buffer.from(JSON.stringify({
      version: '3',
      public_key: publicKey,
      action: 'pay',
      amount: amount,
      currency: currency,
      description: description,
      order_id: `order_${Date.now()}`,
      server_url: server_callback_url,
    })).toString('base64')

    const signature = crypto.createHash('sha1')
      .update(privateKey + data + privateKey)
      .digest('base64')

    const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`
    console.log(paymentLink)

    const payment = await dbRequests.createPayment(contract.id, contract.organization_id, amount, currency, description, `order_${Date.now()}`)
    console.log(payment)

    const markdownLink = `[Задля оплати, будь ласка, перейдіть за посиланням](${paymentLink})`
    bot.sendMessage(chatId, markdownLink, { parse_mode: 'Markdown' })

  } catch (err) {
    console.log(err)
  }
}

module.exports = paymentScene
