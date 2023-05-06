require('dotenv').config();
const axios = require('axios');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const sendReqToDB = require('../modules/tlg_to_DB');
const telnetCall = require('../modules/telnet');
const { TelnetParams } = require('../data/telnet.model');
const { getReceipt } = require('../modules/getReceipt');



async function clientAdmin(bot, msg) {
	let telNumber = '';
	let infoFound = false;
	const Params = new TelnetParams();

	try {
		infoFound = false;
		let htmlText = "Введіть <i>номер телефону </i> або <i>адресу через # </i>, що є в договорі на абонентське обслуговування.\nТакож формат для відправки відповіді по id клієнта id#...id...id#...відповідь...\n";
		bot.sendMessage(msg.chat.id, htmlText, { parse_mode: 'HTML' });
	} catch (err) {
		console.log(err);
	}


	console.log(((new Date()).toLocaleTimeString()));

	let inputLine = msg.text;
	console.log('inputLine:', inputLine);
	if (inputLine.includes("id#")) {
		let id = inputLine.split("id#")[1];
		let msgtext = inputLine.split("id#")[2];
		try {
			bot.sendMessage(msg.chat.id, `Дякуємо за звернення, відповідь: \n ${msgtext}`, { parse_mode: 'HTML' });
			bot.sendMessage(msg.chat.id, `🥎🥎 id# request sent\n`, { parse_mode: 'HTML' });
		} catch (err) {
			console.log(err);
		}

		if (infoFound) {
			try {
				let txtCommand = inputLine;
				if (txtCommand.includes('switchon#')) {
					sendReqToDB('___SwitchOn__', '', txtCommand);
					bot.sendMessage(msg.chat.id, `🥎🥎 switchon# request sent\n`, { parse_mode: 'HTML' });
					infoFound = false;
				} else {
					if (txtCommand.includes('invoice#') && !(telNumber == '')) {
						console.log('Reguest for receipt for', telNumber);
						getReceipt(telNumber, ctx);
					}
				}
			} catch (err) {
				console.log(err);
				infoFound = false;
			}
		}
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
					bot.sendMessage(msg.chat.id, `⛔️Ніякої інформації за запитом не знайдено`);
					return;
				} else {
					if (response.data.length > 3900) {
						bot.sendMessage(msg.chat.id, `\n The Answer is too long. Write another request..\n`, { parse_mode: 'HTML' });
						return;
					}
					console.log(response.data.toString());
					bot.sendMessage(msg.chat.id, `🥎\n ${response.data.toString()}.\n`, { parse_mode: 'HTML' });
					let responseData = JSON.parse(response.data);
					try {
						telNumber = responseData.ResponseArray[0].telNumber;
						console.log(`Admin request for the receipt ${telNumber}`);
					} catch { };
					if (responseData.ResponseArray[0].HOST) {
						const HOST = responseData.ResponseArray[0].HOST.toString();
						console.log(HOST);
						if (HOST.length > 12 && !Params.excludeHOSTS.includes(HOST)) {
							let match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/);
							console.log(HOST + ' match= ' + match);
							if (match) {
								const comment = match[0];
								console.log(comment);
								telnetCall(HOST, comment)
									.then(store => {
										console.dir(store);
										bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' });
									})
									.catch(err => {
										console.log(err);
									});
							}
						} else console.log('HOST is not define');
					}


					if (response.data.split(',').length > 1) {
						infoFound = true;
					} else {
					}
				}
			})
			.catch((err) => {
				bot.sendMessage(msg.chat.id, `⛔️Жодної інформації за запитом не знайдено`, { parse_mode: 'HTML' });
				console.log(err);
			})
			.then(() => {
				bot.sendMessage(msg.chat.id, "👋💙💛 Have a nice day!\n", { parse_mode: 'HTML' });
			});
	}
}


module.exports = clientAdmin;
