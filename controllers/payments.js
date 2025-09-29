require('dotenv').config()
const dbRequests = require('../db/requests')
const inputLineScene = require('./inputLine')
const sendReqToDB = require('../modules/tlg_to_DB')
const { logWithTime } = require('../logger')
const formPaymentLink = require('../services/paymentService').formPaymentLink

async function paymentScene(bot, msg) {
  try {
    const mode = process.env.MODE || 'PROD'
    const ligpay_env = process.env.LIQPAY_ENV || 'Test'

    if (mode === 'PROD' && ligpay_env === 'Test') {
      await bot.sendMessage(msg.chat.id, `⛔️ Оплата через LiqPay в даний час недоступна`, { parse_mode: 'HTML' })
      return
    }

    const chatId = msg.chat.id
    const contract = await dbRequests.getContractByTgID(chatId)
    logWithTime(contract)

    if (!contract?.organization_abbreviation) {
      logWithTime('No contract found')
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

    await bot.sendMessage(chatId, "Введіть <i>суму оплати в грн без копійок, наприклад введення суми 200 означає 200 гривень </i>\n⚠️Увага, до суми платежу додається комісія! \n⚠️ Комісія становить 1,5% від суми платежу!\n", { parse_mode: "HTML" })
    let userInput = await inputLineScene(bot, msg)
    let amount = userInput.replace(/[^0-9]/g, "")
    if (amount.length === 0) {
      await bot.sendMessage(chatId, "Ви не ввели суму оплати, спробуйте ще раз")
      return
    }

    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      await bot.sendMessage(chatId, "Введена некоректна сума, спробуйте ще раз");
      return
    }

    const commissionRate = 0.015;
    const totalAmount = (Math.ceil((amount / (1 - commissionRate)) * 100) / 100).toFixed(2)

    logWithTime(totalAmount)
    let paymentLink = await formPaymentLink(bot, chatId, abbreviation, contract, totalAmount)
    const urlLink = paymentLink?.message?.paymentLink || null

    if (urlLink) {
      const markdownLink = `[Задля оплати, будь ласка, перейдіть за посиланням](${urlLink})`
      bot.sendMessage(chatId, markdownLink, { parse_mode: 'Markdown' })
    }

  } catch (err) {
    logWithTime(err)
  }
}

module.exports = paymentScene
