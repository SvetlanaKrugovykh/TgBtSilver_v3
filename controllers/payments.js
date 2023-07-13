const sendReqToDB = require('../modules/tlg_to_DB')
const inputLineScene = require('./inputLine')
const GROUP_ID = process.env.GROUP_ID
require('dotenv').config()

async function paymentScene(bot, msg) {
  try {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, "Введіть <i>суму оплати в грн без копійок, наприклад введення суми 100 означає 100 гривень </i>, \n", { parse_mode: "HTML" })
    let userInput = await inputLineScene(bot, msg)
    let amount = userInput.replace(/[^0-9]/g, "")
    if (amount.length === 0) {
      await bot.sendMessage(chatId, "Ви не ввели суму оплати, спробуйте ще раз")
      return
    }
    const jsonString = await sendReqToDB('__GetClientPersData__', msg.chat, `payment_${chatId}`)
    const data = JSON.parse(jsonString);
    const response = JSON.parse(data.ResponseArray[0]);
    const email = response.email;
    const phoneNumber = response.PhoneNumber;
    //const liqpay = new LiqPay(process.env.LIQPAY_PUBLIC_KEY, process.env.LIQPAY_PRIVATE_KEY)
    // liqpay.api("request", {
    //   "action": "invoice_bot",
    //   "version": "3",
    //   "email": email,
    //   "amount": amount,
    //   "currency": "UAH",
    //   "order_id": chatId,
    //   "phone": phoneNumber,
    // }, function (json) {
    //   console.log(json.result);
    // })

    sendReqToDB('__SaveTlgMsg__', msg.chat, `payment_${chatId}`)
    await bot.sendMessage(chatId, 'Наразі опція оплати послуг знаходиться в стані розробки. Дякуємо за те, що користуєтесь нашими послугами!')

    // await bot.sendMessage(GROUP_ID, `Проведено оплату від клієнта. ${JSON.stringify(data)},chatId=${chatId}  \n`, { parse_mode: "HTML" })
  } catch (err) {
    console.log(err)
  }
}

module.exports = paymentScene
