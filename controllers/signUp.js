async function signUpForm(bot, msg, webAppUrl) {
	const chatId = msg.chat.id;
	await bot.sendMessage(chatId, 'Нижче з`явиться кнопка, заповніть форму', {
		reply_markup: {
			keyboard: [
				[{ text: 'Заповнити форму', web_app: { url: webAppUrl + '/form' } }]
			],
			resize_keyboard: true
		}
	})
}

async function singUpDataSave(data) {
	console.log(data)
}
module.exports = { signUpForm, singUpDataSave };
