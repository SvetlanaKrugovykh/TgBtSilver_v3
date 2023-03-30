const sendReqToDB = require('../modules/tlg_to_DB');


async function supportScene(bot, msg) {
	try {
		await bot.sendMessage(
			msg.chat.id,
			"<i>Залиште нижче текстове повідомлення для служби технічної підтримки.\n Прохання вказати номер телефону та як нам зручніше з Вами зв'язатись</i>",
			{ parse_mode: "HTML" }
		);

		await bot.onText(/(.+)/, async (message, match) => {
			const userInput = match[1];
			console.log(userInput);

			await bot.sendMessage(
				msg.chat.id,
				`Звернення від ${msg.chat.first_name} ${msg.chat.last_name} id ${msg.chat.id} username ${msg.chat.username}` +
				`\n` +
				userInput
			);
			sendReqToDB("__SaveTlgMsg__", msg.chat, userInput);
			await bot.sendMessage(
				msg.chat.id,
				`Дякую! Ваше повідомлення надіслано.\n Чекайте на відповідь протягом 30 хвилин`,
				{ parse_mode: "HTML" }
			);
		});
	} catch (err) {
		console.log(err);
	}
};

module.exports = supportScene;
