const sendReqToDB = require('../modules/tlg_to_DB');
const inputLineScene = require('./inputLine');
require('dotenv').config();

async function paymentScene(bot, msg) {
  const GROUP_ID = process.env.GROUP_ID;
  try {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Наразі опція оплати послуг знаходиться в стані розробки. Дякуємо за те, що користуєтесь нашими послугами!')
    // await bot.sendMessage(GROUP_ID, `Проведено оплату від клієнта. ${JSON.stringify(data)},chatId=${chatId}  \n`, { parse_mode: "HTML" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = paymentScene
