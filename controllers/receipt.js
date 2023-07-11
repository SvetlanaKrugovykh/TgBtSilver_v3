
const sendReqToDB = require('../modules/tlg_to_DB');
const { getReceipt } = require('../modules/getReceipt');
const inputLineScene = require('./inputLine');

async function receiptScene(bot, msg, isAuthorized) {
  try {
    const chatId = msg.chat.id;
    let telNumber = '';
    if (!isAuthorized) {
      await bot.sendMessage(chatId, "Введіть <i>номер телефону </i>, який вказано в договорі на абонентське обслуговування\n", { parse_mode: "HTML" });
      let userInput = await inputLineScene(bot, msg);
      telNumber = userInput.replace(/[^0-9]/g, "");
    } else {
      try {
        const data = await sendReqToDB('__ReadTelNum__', msg.chat, '');
        let parsedData = JSON.parse(data);
        telNumber = parsedData.ResponseArray.toString();
      } catch (err) {
        await bot.sendMessage(chatId, "😡Номер телефону введено помилково\nСеанс буде завершено.", { parse_mode: "HTML" });
      }
    }
    console.log(new Date());
    console.log('Tel№:', telNumber);
    sendReqToDB('__SaveTlgMsg__', msg.chat, telNumber);

    if (telNumber.length < 7 || telNumber.length > 12) {
      await bot.sendMessage(chatId, "😡Номер телефону введено помилково\nСеанс буде завершено.", { parse_mode: "HTML" });
    } else {
      await getReceipt(telNumber, msg, bot);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = receiptScene;
