const sendReqToDB = require('../modules/tlg_to_DB');
const { getReceipt } = require('../modules/getReceipt');

async function receiptScene(bot, msg, isAuthorized) {
	try {
		const chatId = msg.chat.id;
		await bot.sendMessage(chatId, "Введіть <i>номер телефону </i>, який вказано в договорі на абонентське обслуговування\n", { parse_mode: "HTML" });
		const promise = new Promise(resolve => {
			bot.once('message', (message) => {
				const phone = message.text;
				console.log('Received phone number:', phone);
				resolve(phone);
			});
		});
		const userInput = await promise;
		const telNumber = userInput.replace(/[^0-9]/g, "");
		console.log(new Date());
		console.log('Tel№:', telNumber);
		sendReqToDB('__SaveTlgMsg__', msg.chat, telNumber);

		if (telNumber.length < 7 || telNumber.length > 12) {
			await bot.sendMessage(chatId, "😡Номер телефону введено помилково\nСеанс завершено.", { parse_mode: "HTML" });
		} else {
			getReceipt(telNumber, msg, bot);
		}
	} catch (err) {
		console.log(err);
	}
};

module.exports = receiptScene;
