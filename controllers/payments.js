const dbRequests = require('../db/requests')
require('dotenv').config()
const crypto = require('crypto')
const inputLineScene = require('./inputLine')
const getLiqpayKeys = require('../globalBuffer').getLiqpayKeys


async function paymentScene(bot, msg) {
  try {
    const chatId = msg.chat.id
    const currency = 'UAH'
    const contract = await dbRequests.getContractByTgID(chatId)
    console.log(contract)

    if (!contract?.organization_abbreviation) {
      console.log('No contract found')
      await bot.sendMessage(chatId, '⚠️Ваш договір не знайдено в системі!\n Зверніться до служби підтримки за допомогою', { parse_mode: "HTML" })
      return
    }

    const abbreviation = contract.organization_abbreviation
    const liqpayKeys = getLiqpayKeys(abbreviation)
    const { publicKey, privateKey } = liqpayKeys

    if (liqpayKeys) {
      console.log(`LiqPay Public Key: ${publicKey}`)
    } else {
      console.log(`No LiqPay keys found for abbreviation: ${abbreviation}`)
      await bot.sendMessage(chatId, '⚠️Сталася помилка при завантаженні ключів доступу до LiqPay ', { parse_mode: "HTML" })
      return
    }


    await bot.sendMessage(chatId, "Введіть <i>суму оплати в грн без копійок, наприклад введення суми 200 означає 200 гривень </i>, \n", { parse_mode: "HTML" })
    let userInput = await inputLineScene(bot, msg)
    let amount = userInput.replace(/[^0-9]/g, "")
    if (amount.length === 0) {
      await bot.sendMessage(chatId, "Ви не ввели суму оплати, спробуйте ще раз")
      return
    }

    const description = `Оплата за послугу. Код оплати: ${contract.payment_code}`
    const callBackUrl = process.env.LIQPAY_CALLBACK_URL
    console.log(`Web App URL: ${callBackUrl} | ${description} | ${amount} | ${currency}`)
    const data = Buffer.from(JSON.stringify({
      version: '3',
      public_key: publicKey,
      action: 'pay',
      amount: amount,
      currency: currency,
      description: description,
      order_id: `order_${Date.now()}`,
      server_url: `${callBackUrl}/liqpay/callback`,
    })).toString('base64')

    const signature = crypto.createHash('sha1')
      .update(privateKey + data + privateKey)
      .digest('base64')

    const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`
    console.log(paymentLink)


    const payment = await dbRequests.createPayment(contract.id, contract.organization_id, amount, currency, description, `order_${Date.now()}`)

    bot.sendMessage(chatId, `Задля оплати, будь ласка, перейдіть за посиланням: ${paymentLink}`)

  } catch (err) {
    console.log(err)
  }
}

module.exports = paymentScene
