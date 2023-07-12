const sendReqToDB = require("../modules/tlg_to_DB");
const sendMail = require("../modules/mailer");
const SENDER = process.env.SENDER;
const GROUP_ID = Number(process.env.GROUP_ID)

async function signUpForm(bot, msg, webAppUrl) {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 'Нижче з`явиться кнопка, заповніть форму', {
    reply_markup: {
      keyboard: [
        // [{ text: 'Заповнити форму', web_app: { url: webAppUrl + '/form' } }]
        [{ text: 'Заповнити форму', web_app: { url: webAppUrl + '/reg-form-tg-bot' } }]
      ],
      resize_keyboard: true
    }
  })
}

async function singUpDataSave(bot, chatId, data) {
  console.log(chatId, data);
  const signUpRezult = await sendReqToDB('___UserRegistration__', data, chatId);
  console.log(signUpRezult);
  const message = {
    from: SENDER,
    to: SENDER,
    subject: 'Registration event from tg-bot',
    text: 'chatId:' + chatId,
    html: 'data:' + JSON.stringify(data),
  };
  try {
    await bot.sendMessage(GROUP_ID, `Заповнена нова реєстраційна форма. Контент: ${JSON.stringify(data)},chatId=${chatId}  \n`, { parse_mode: "HTML" })
    //await sendMail.sendmail(message);
    console.log('Registration message sent', message);
  }
  catch (err) {
    console.log(err);
  }
}
module.exports = { signUpForm, singUpDataSave };


