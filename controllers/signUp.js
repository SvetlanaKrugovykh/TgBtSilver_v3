const sendReqToDB = require("../modules/tlg_to_DB");
const sendMail = require("../modules/mailer");
const SENDER = process.env.SENDER;

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

async function singUpDataSave(chatId, data) {
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
    await sendMail.sendmail(message);
    console.log('mail sent');
  }
  catch (err) {
    console.log(err);
  }
}
module.exports = { signUpForm, singUpDataSave };


