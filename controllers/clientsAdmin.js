require('dotenv').config();
const axios = require('axios');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const sendReqToDB = require('../modules/tlg_to_DB');
const telnetCall = require('../modules/telnet');
const { TelnetParams } = require('../data/telnet.model');
const { getReceipt } = require('../modules/getReceipt');
const inputLineScene = require('./inputLine');

async function getInfo(bot, msg, inputLine) {
	const data = await sendReqToDB('__GetClientsInfo__', msg.chat, inputLine);
	if (data === null) {
		bot.sendMessage(msg.chat.id, `⛔️Ніякої інформації за запитом не знайдено`);
		return null;
	}
	try {
		if (data.length > 3900) {
			bot.sendMessage(msg.chat.id, `\n The Answer is too long. Write another request..\n`, { parse_mode: 'HTML' });
			return null;
		}
		console.log(data.toString());
		await bot.sendMessage(msg.chat.id, `🥎\n ${data.toString()}.\n`, { parse_mode: 'HTML' });
		let responseData = JSON.parse(data);
		return responseData;
	} catch (err) {
		console.log(err);
		return null;
	}
}

async function actionsOnId(bot, msg, inputLine) {
	if (inputLine.includes("id#")) {
		let id = inputLine.split("id#")[1];
		let msgtext = inputLine.split("id#")[2];
		try {
			await bot.sendMessage(msg.chat.id, `Дякуємо за звернення, відповідь: \n ${msgtext}`, { parse_mode: 'HTML' });
			await bot.sendMessage(msg.chat.id, `🥎🥎 id# request sent\n`, { parse_mode: 'HTML' });
		} catch (err) {
			console.log(err);
		}
	}
}

async function switchOn(bot, msg, txtCommand) {
	await sendReqToDB('___SwitchOn__', '', txtCommand);
	await bot.sendMessage(msg.chat.id, `🥎🥎 switchon# request sent\n`, { parse_mode: 'HTML' });
}

async function invoice(bot, msg, telNumber) {
	console.log('Reguest for receipt for', telNumber);
	await getReceipt(telNumber, msg, bot);
}

async function goToHardware(bot, msg, responseData, store) {
	if (responseData.ResponseArray[0].HOST) {
		const HOST = responseData.ResponseArray[0].HOST.toString();
		console.log(HOST);
		if (HOST.length > 12 && !Params.excludeHOSTS.includes(HOST)) {
			try {
				let match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/);
				console.log(HOST + ' match= ' + match);
				if (match) {
					const comment = match[0];
					console.log(comment);
					await telnetCall(HOST, comment)
						.then(store => {
							console.dir(store);
							bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' });
						})
						.catch(err => {
							console.log(err);
						});
				}
			} catch (err) { console.log('HOST is not define'); }
		}
		if (response.data.split(',').length > 1) {
			infoFound = true;
		} else {
			return null;
		}
	}
}

async function clientAdmin(bot, msg) {

	let telNumber = '';
	const Params = new TelnetParams();
	const htmlText = "Введіть <i>номер телефону </i> або <i>адресу через # </i>, що є в договорі на абонентське обслуговування.\nТакож формат для відправки відповіді по id клієнта id#...id...id#...відповідь...\n";
	let infoFound = false;
	await bot.sendMessage(msg.chat.id, htmlText, { parse_mode: 'HTML' });
	console.log(((new Date()).toLocaleTimeString()));
	let inputLine = await inputLineScene(bot, msg);
	responseData = await getInfo(bot, msg, inputLine);
	if (responseData === null) {
		await bot.sendMessage(msg.chat.id, `⛔️Жодної інформації за запитом не знайдено`, { parse_mode: 'HTML' });
		return null;
	} else {
		await bot.sendMessage(msg.chat.id, `🥎\n ${responseData.ResponseArray[0].Comment}.\n`, { parse_mode: 'HTML' });
	}
	// await actionsOnId(bot, msg, inputLine);

	// let txtCommand = inputLine;
	// if (txtCommand.includes('switchon#')) {
	// 	await switchOn(bot, msg, txtCommand);
	// 	infoFound = false;
	// } else {
	// 	if (txtCommand.includes('invoice#') && !(telNumber == '')) {
	// 		await invoice(bot, msg, telNumber);
	// 	}
	// }

	// telNumber = responseData.ResponseArray[0].telNumber;
	// console.log(`Admin request for the receipt ${telNumber}`);

	// await goToHardware(bot, msg, responseData, store);


	// await bot.sendMessage(msg.chat.id, "👋💙💛 Have a nice day!\n", { parse_mode: 'HTML' });

}



module.exports = clientAdmin;
