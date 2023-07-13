const sendReqToDB = require('../modules/tlg_to_DB')
const inputLineScene = require('./inputLine')
const fs = require('fs')
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
    const filePath = process.env.PATH_FOR_PAYMENTS + chatId + '.html'

    const json_string = {
      "public_key": process.env.LIQPAY_PUBLIC_KEY,
      "version": "3",
      "action": "pay",
      "amount": amount,
      "currency": "UAH",
      "description": email + " " + phoneNumber,
      "order_id": chatId + "_" + Date.now(),
      "result_url": "http://silver-service.com.ua/",
      "server_url": "http://silver-service.com.ua:8000/payment/finish"
    }
    const data_string = Buffer.from(JSON.stringify(json_string)).toString('base64')
    const sign_string = process.env.LIQPAY_PRIVATE_KEY + data_string + process.env.LIQPAY_PRIVATE_KEY
    const signature = Buffer.from(sign_string).toString('base64')
    const html = `<form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
    <input type="hidden" name="data" value="${data_string}"/>
    <input type="hidden" name="signature" value="${signature}"/>
    <input type="image" src="//static.liqpay.ua/buttons/p1ru.radius.png"/>
    </form>`
    fs.writeFile(filePath, html, function (error) {
      if (error) {
        console.error('File saving error:', error);
      } else {
        console.log('File saved succesfully.');
      }
    })

    sendReqToDB('__SaveTlgMsg__', msg.chat, `payment_${chatId}`)
    await bot.sendMessage(chatId, 'Наразі опція оплати послуг знаходиться в стані розробки. Дякуємо за те, що користуєтесь нашими послугами!')

    // await bot.sendMessage(GROUP_ID, `Проведено оплату від клієнта. ${JSON.stringify(data)},chatId=${chatId}  \n`, { parse_mode: "HTML" })
  } catch (err) {
    console.log(err)
  }
}

module.exports = paymentScene
