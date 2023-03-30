require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const sendReqToDB = require('../modules/tlg_to_DB');
const telnetCall = require('../modules/telnet');
const { TelnetParams } = require('../data/telnet.model');
const { getReceipt } = require('../modules/getReceipt');



async function clientAdmin(chatId) {
	let telNumber = '';

	let infoFound = false;
	const Params = new TelnetParams();

	const startStep = (ctx) => {
		try {
			infoFound = false;
			let htmlText = "Введіть <i>номер телефону </i> або <i>адресу через # </i>, що є в договорі на абонентське обслуговування.\nТакож формат для відправки відповіді по id клієнта id#...id...id#...відповідь...\n";
			ctx.replyWithHTML(htmlText);
			ctx.wizard.next();
		} catch (err) {
			console.log(err);
		}
	};


	const conditionStep = (ctx) => {
		try {
			console.log(((new Date()).toLocaleTimeString()));
			let inputLine = ctx.message.text;
			console.log('inputLine:', inputLine);
			if (inputLine.includes("id#")) {
				let id = inputLine.split("id#")[1];
				let msgtext = inputLine.split("id#")[2];
				try {
					ctx.telegram.sendMessage(id, `Дякуємо за звернення, відповідь: \n ${msgtext}`);
					ctx.replyWithHTML(`🥎🥎 id# request sent\n`);
					return ctx.scene.leave();
				} catch (err) {
					console.log(err);
					return ctx.scene.leave();
				}
			}
			if (infoFound) {
				try {
					let txtCommand = inputLine;
					if (txtCommand.includes('switchon#')) {
						sendReqToDB('___SwitchOn__', '', txtCommand);
						ctx.replyWithHTML(`🥎🥎 switchon# request sent\n`);
						infoFound = false;
						return ctx.scene.leave();
					} else {
						if (txtCommand.includes('invoice#') && !(telNumber == '')) {
							console.log('Reguest for receipt for', telNumber);
							getReceipt(telNumber, ctx);
							return ctx.scene.leave();
						}
					}
				} catch (err) {
					console.log(err);
					infoFound = false;
					return ctx.scene.leave();
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
						ctx.replyWithHTML(`⛔️Ніякої інформації за запитом не знайдено`);
						ctx.scene.leave();
						return;
					} else {
						if (response.data.length > 3900) {
							ctx.replyWithHTML(`\n The Answer is too long. Write another request..\n`);
							ctx.scene.leave();
							return;
						}
						console.log(response.data.toString());
						ctx.replyWithHTML(`🥎\n ${response.data.toString()}.\n`);
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
											ctx.replyWithHTML(`🥎\n ${store.toString()}.\n`);
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
							return ctx.scene.leave();
						}
					}
				})
				.catch((err) => {
					ctx.replyWithHTML(`⛔️Жодної інформації за запитом не знайдено`);
					ctx.scene.leave();
					return;
				})
				.then(() => {
					ctx.replyWithHTML("👋💙💛 Have a nice day!\n");
				});
		} catch (err) {
			console.log(err);
		}
	};

}

module.exports = clientAdmin;
