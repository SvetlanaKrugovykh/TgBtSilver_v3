const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { cli, devices } = require('../data/cli.model');
const telnetCall = require('../modules/telnet');


async function netwareAdmin(chatId) {

	bot.on('message', async (msg) => {
		try {
			if (msg.text === '/start') {
				const htmlText = "Введіть <i>номер телефону </i> або <i>адресу через # </i>, що є в договорі на абонентське обслуговування.\nТа команду, що необхідно виконати...\n";
				bot.sendMessage(msg.chat.id, htmlText, { parse_mode: 'HTML' });
				chatId = msg.chat.id;
			} else {
				const inputLine = msg.text;
				axios({
					method: 'post',
					url: URL,
					responseType: 'string',
					headers: {
						Authorization: `${AUTH_TOKEN}`,
						'Content-Type': 'application/json',
					},
					data: {
						Query: `Execute;__GetClientsInfo__;${inputLine};КОНЕЦ`,
					}
				})
					.then((response) => {
						if (!response.status == 200) {
							bot.sendMessage(chatId, '⛔️Ніякої інформації за запитом не знайдено');
						} else {
							const responseData = JSON.parse(response.data);
							bot.sendMessage(chatId, `🥎\n ${response.data.toString()}\n`);
							if (responseData.ResponseArray[0].HOST) {
								const HOST = responseData.ResponseArray[0].HOST;
								console.log(HOST);
								const match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/);
								if (match) {
									const comment = match[0];
									console.log(comment);
									telnetCall(HOST, comment)
										.then(store => {
											console.dir(store);
											bot.sendMessage(chatId, `🥎\n ${store.toString()}\n`);
										})
										.catch(err => {
											console.log(err);
										});
								}
							}
						}
					})
					.catch((err) => {
						bot.sendMessage(chatId, '⛔️Жодної інформації за запитом не знайдено');
					})
					.then(() => {
						bot.sendMessage(chatId, '👋💙💛 Have a nice day!\n');
					});
			}
		} catch (err) {
			console.log(err);
		}
	});
}

module.exports = netwareAdmin;