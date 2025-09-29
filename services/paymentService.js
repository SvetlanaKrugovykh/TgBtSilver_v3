const axios = require('axios')
const dbRequests = require('../db/requests')
const { logWithTime } = require('../logger')

module.exports.formPaymentLink = async function (bot, chatId, abbreviation, contract, amount) {

  const formPayLinkURL = process.env.FORM_PAY_LINK_URL

  try {
    const response = await axios.post(formPayLinkURL, {
      abbreviation,
      'payment_code': contract.payment_code,
      amount
    })

    if (response.status === 200) {
      const currency = 'UAH'
      const description = `Оплата за послугу. Код оплати: ${contract.payment_code}. Сума оплати: ${amount} грн.`
      const payment = await dbRequests.createPayment(contract.id, contract.organization_id, amount, currency, description, `order_${Date.now()}`)
      logWithTime(payment)
      return response.data
    } else {
      await bot.sendMessage(chatId, '⛔️ Сталася помилка при формуванні   лінку до LiqPay. Скоріше за все договір для організації постачальника з  LiqPay ще на стадії узгодження, але скоро запрацює.', { parse_mode: "HTML" })
      console.error('Error sending message to the Telegram group:',
        response.statusText)
    }
  } catch (error) {
    await bot.sendMessage(chatId, '⛔️ Сталася помилка при формуванні   лінку до LiqPay. Скоріше за все договір для організації постачальника з  LiqPay ще на стадії узгодження, але скоро запрацює.', { parse_mode: "HTML" })
    console.error('Error sending message to the Telegram group:', error.message)
  }
}


