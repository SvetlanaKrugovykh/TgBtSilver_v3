const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = '@m_yDgK8imz0zNzYy';
const bot = new TelegramBot(token);

const sendReqToDB = require('../modules/tlg_to_DB');

const startStep = async (msg) => {
	try {
		await bot.sendMessage(msg.chat.id, "<i> Залиште нижче текстове повідомлення для служби технічної підтримки.\n Прохання вказати номер телефону та як нам зручніше з Вами зв'язатись</i>", { parse_mode: "HTML" });
		return 'next';
	} catch (err) {
		console.log(err);
	}
};

const conditionStep = async (msg) => {
	try {
		await bot.sendMessage(chatId,
			`Звернення від ${msg.chat.first_name} ${msg.chat.last_name} id ${msg.chat.id} username ${msg.chat.username}` +
			`\n` + msg.text);
		sendReqToDB('__SaveTlgMsg__', msg.chat, msg.text);
		await bot.sendMessage(msg.chat.id, `Дякую! Ваше повідомлення надіслано.\n Чекайте на відповідь протягом 30 хвилин`, { parse_mode: "HTML" });
		return 'stop';
	} catch (err) {
		console.log(err);
	}
};

const supportScene = {
	start: startStep,
	condition: conditionStep
};

module.exports = supportScene;
