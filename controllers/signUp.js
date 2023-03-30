require('dotenv').config();


async function signUp(bot, msg) {

	const chatId = msg.chat.id;
	console.log('chatId', chatId);
	const webAppUrl = 'https://' + process.env.WEB_APP_URL;
	console.log('webAppUrl', webAppUrl);

	try {
		await bot.sendMessage(chatId, 'Нижче з`явиться кнопка, заповніть форму', {
			reply_markup: {
				keyboard: [
					[{ text: 'Заповнити форму', web_app: { url: webAppUrl + '/form' } }]
				]
			}
		})

		console.dir(msg);

		if (msg?.web_app_data?.data) {
			try {
				const data = JSON.parse(msg?.web_app_data?.data)
				console.log(data)
				await bot.sendMessage(chatId, 'Дякуємо за зворотній зв`язок!')
				await bot.sendMessage(chatId, 'Ваш emal: ' + data?.email);
				await bot.sendMessage(chatId, 'Ваш договір: ' + data?.contract);

				setTimeout(async () => {
					await bot.sendMessage(chatId, 'Всю необхідну інформацію Ви можете отримувати в цьому чаті');
				}, 3000)
			} catch (e) {
				console.log(e);
			}
		}
	}
	catch (err) {
		console.log(err);
	}
}

module.exports = signUp;
