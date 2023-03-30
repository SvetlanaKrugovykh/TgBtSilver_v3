const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { guestStartButtons, adminStartButtons, authStartButtons } = require('./modules/keyboard');
const { users } = require('./users/users.model');
const handler = require('./controllers/switcher');
const sendReqToDB = require('./modules/tlg_to_DB');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {

	const chatId = msg.chat.id;
	const text = msg.text;
	const ctx = msg;

	if (text === '/start') {
		console.log(new Date());
		console.log(ctx.chat);
		const adminUser = users.find(user => user.id === ctx.chat.id);
		if (!adminUser) {
			try {
				const autorized = await sendReqToDB('__CheckTlgClient__', ctx.chat, '');
				if (autorized) {
					await bot.sendMessage(chatId, `Чат-бот <b>ISP SILVER-SERVICE</b> вітає Вас, <b>${ctx.chat.first_name} ${ctx.chat.last_name}</b>!
	Вам надано авторизований доступ`, { parse_mode: "HTML" });
					await bot.sendMessage(chatId, authStartButtons.title, {
						reply_markup: {
							keyboard: authStartButtons.buttons
						}
					});
				} else {
					await bot.sendMessage(chatId, `Чат-бот <b>ISP SILVER-SERVICE</b> вітає Вас, <b>${ctx.chat.first_name} ${ctx.chat.last_name}</b>!
	Вам надано гостьовий доступ`, { parse_mode: "HTML" });
					await bot.sendMessage(chatId, guestStartButtons.title, {
						reply_markup: {
							keyboard: guestStartButtons.buttons
						},
						resize_keyboard: true,
						one_time_keyboard: true,
						force_reply: true,
					});
				}
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				await bot.sendMessage(chatId, `Hi, ${ctx.chat.first_name} ${ctx.chat.last_name}! 
				You have been granted administrative access`);
				await bot.sendMessage(chatId, adminStartButtons.title, {
					reply_markup: {
						keyboard: adminStartButtons.buttons
					}
				});
			} catch (err) {
				console.log(err);
			}
		}
	} else {
		await handler(bot, msg);
	}
});

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))

