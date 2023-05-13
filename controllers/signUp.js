const sendReqToDB = require("../modules/tlg_to_DB");

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
}
module.exports = { signUpForm, singUpDataSave };
