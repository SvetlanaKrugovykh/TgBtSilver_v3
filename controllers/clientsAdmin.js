require('dotenv').config();
const axios = require('axios');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const sendReqToDB = require('../modules/tlg_to_DB');
const telnetCall = require('../modules/telnet');
const { TelnetParams } = require('../data/telnet.model');
const { getReceipt } = require('../modules/getReceipt');
const inputLineScene = require('./inputLine');
const checkValue = require('../modules/common');

async function getInfo(bot, msg, inputLine) {
  const data = await sendReqToDB('__GetClientsInfo__', msg.chat, inputLine);
  if (data === null) {
    await bot.sendMessage(msg.chat.id, `⛔️Жодної інформації за запитом не знайдено`, { parse_mode: 'HTML' });
    return null;
  }
  try {
    if (data.length > 3900) {
      bot.sendMessage(msg.chat.id, `\n The Answer is too long. Write another request..\n`, { parse_mode: 'HTML' });
      return null;
    }
    console.log(data.toString());
    await bot.sendMessage(msg.chat.id, `🥎\n ${data.toString()}.\n`, { parse_mode: 'HTML' });
    let responseData = JSON.parse(data);
    return responseData;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function actionsOnId(bot, msg, inputLine) {
  if (inputLine !== undefined) {
    if (inputLine.includes("id#")) {
      let id = inputLine.split("id#")[1];
      let msgtext = inputLine.split("id#")[2];
      console.log('id', id);
      console.log('msgtext', msgtext);
      try {
        await bot.sendMessage(id, `Дякуємо за звернення, відповідь: \n ${msgtext}`, { parse_mode: 'HTML' });
        await bot.sendMessage(msg.chat.id, `🥎🥎 id# request sent\n`, { parse_mode: 'HTML' });
      } catch (err) {
        console.log(err);
      }
    }
  }
}

async function switchOn(bot, msg, txtCommand) {
  await sendReqToDB('___SwitchOn__', '', txtCommand);
  await bot.sendMessage(msg.chat.id, `🥎🥎 switchon# request sent\n`, { parse_mode: 'HTML' });
}

async function invoice(bot, msg, telNumber) {
  console.log('Reguest for receipt for', telNumber);
  await getReceipt(telNumber, msg, bot);
}

async function goToHardware(bot, msg, responseData) {
  const Params = new TelnetParams();
  try {
    if (responseData.ResponseArray[0].HOST) {
      const HOST = responseData.ResponseArray[0].HOST.toString();
      console.log(HOST);
      if (HOST.length > 12 && !Params.excludeHOSTS.includes(HOST)) {
        try {
          let match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/);
          console.log(HOST + ' match= ' + match);
          if (match) {
            const comment = match[0];
            console.log(comment);
            await telnetCall(HOST, comment)
              .then(store => {
                console.dir(store);
                bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' });
              })
              .catch(err => {
                console.log(err);
              });
          }
        } catch (err) { console.log('HOST is not define'); }
      }
    }
  } catch (err) { console.log(err); }
}

async function clientAdmin(bot, msg) {

  const htmlText = "Введіть <i>номер телефону </i> або <i>адресу через # </i>, що є в договорі на абонентське обслуговування.\nТакож формат для відправки відповіді по id клієнта id#...id...id#...відповідь...\n";
  await bot.sendMessage(msg.chat.id, htmlText, { parse_mode: 'HTML' });
  console.log(((new Date()).toLocaleTimeString()));
  let inputLine = await inputLineScene(bot, msg);
  const responseData = await getInfo(bot, msg, inputLine);
  if (responseData?.ResponseArray && Array.isArray(responseData?.ResponseArray)) {
    if (responseData?.ResponseArray[0]?.HOST) {
      await goToHardware(bot, msg, responseData);
    }
  } else {
    return null;
  }

  let telNumber = responseData.ResponseArray[0].telNumber;
  await bot.sendMessage(msg.chat.id, `🥎\n ${responseData.ResponseArray[0].Comment}.\n`, { parse_mode: 'HTML' });
  let commandHtmlText = "Введіть <i>комаду для виконання </i>\n";
  await bot.sendMessage(msg.chat.id, commandHtmlText, { parse_mode: 'HTML' });
  let txtCommand = await inputLineScene(bot, msg);
  await actionsOnId(bot, msg, txtCommand);
  if (txtCommand.includes('switchon#')) await switchOn(bot, msg, txtCommand);
  if (txtCommand.includes('id#')) await actionsOnId(bot, msg, txtCommand);
  if (txtCommand.includes('invoice#') && (telNumber.length > 6)) {
    console.log(`Admin request for the receipt ${telNumber}`);
    await invoice(bot, msg, telNumber);
  }


  await bot.sendMessage(msg.chat.id, "👋💙💛 Have a nice day!\n", { parse_mode: 'HTML' });
}



module.exports = clientAdmin;
