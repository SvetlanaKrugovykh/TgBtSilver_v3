const LiqPay = require('liqpay')
const sendReqToDB = require('../modules/tlg_to_DB')
const inputLineScene = require('./inputLine')
const GROUP_ID = process.env.GROUP_ID
require('dotenv').config()

const liqpay = new LiqPay(process.env.LIQPAY_PUBLIC_KEY, process.env.LIQPAY_PRIVATE_KEY)

async function paymentScene(bot, msg) {
  try {
    const html = liqpay.cnb_form({
      'action': 'pay',
      'amount': '1',
      'currency': 'UAH',
      'description': 'description text',
      'order_id': chatId.toSring() + Date.now(),
      'version': '3'
    })

    const chatId = msg.chat.id
    sendReqToDB('__SaveTlgMsg__', msg.chat, `payment_${chatId}`)
    await bot.sendMessage(chatId, 'Наразі опція оплати послуг знаходиться в стані розробки. Дякуємо за те, що користуєтесь нашими послугами!')

    // await bot.sendMessage(GROUP_ID, `Проведено оплату від клієнта. ${JSON.stringify(data)},chatId=${chatId}  \n`, { parse_mode: "HTML" })
  } catch (err) {
    console.log(err)
  }
}

module.exports = paymentScene
