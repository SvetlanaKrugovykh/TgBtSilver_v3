const sendReqToDB = require('../modules/tlg_to_DB');
require('dotenv').config();


async function supportScene(bot, msg, isAuthorized) {
	const GROUP_ID = process.env.GROUP_ID;
	try {
		const chatId = msg.chat.id;
		await bot.sendMessage(chatId, "<i>Залиште нижче текстове повідомлення для служби технічної підтримки.\n Прохання вказати номер телефону та як нам зручніше з Вами зв'язатись</i>", { parse_mode: "HTML" });

		const promise = new Promise(resolve => {
			bot.once('message', (message) => {
				const text = message.text;
				console.log('Received text:', text);
				resolve(text);
			});
		});
		const userInput = await promise;
		console.log(userInput);
		await bot.sendMessage(GROUP_ID, `Звернення від ${msg.chat.first_name} ${msg.chat.last_name} id ${msg.chat.id} username ${msg.chat.username}` + `\n` + userInput, { parse_mode: "HTML" });
		await sendReqToDB("__SaveTlgMsg__", msg.chat, userInput);
		await bot.sendMessage(
			chatId, `Дякую! Ваше повідомлення надіслано.\n Чекайте на відповідь протягом 30 хвилин`, { parse_mode: "HTML" });

	} catch (err) {
		console.log(err);
	}
};

module.exports = supportScene;
