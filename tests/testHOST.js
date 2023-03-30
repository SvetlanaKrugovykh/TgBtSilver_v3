//'use strict'

require('dotenv').config();
const axios = require(`axios`);
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const telnetCall = require('../modules/telnet');

try {
	let inputLine = "Линник Г.І.";
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
				console.log(`⛔️Ніякої інформації за запитом не знайдено`);
				return ctx.scene.leave();
			} else {
				let responseData = JSON.parse(response.data);
				if (responseData.ResponseArray[0].HOST) {
					HOST = responseData.ResponseArray[0].HOST;
					console.log(HOST);
					let match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/);
					if (match)
						comment = match[0];
					console.log(comment);
					let store = [];
					telnetCall(HOST, comment)
						.then(store => {
							console.dir(store);
						})
						.catch(err => {
							console.log(err);
						});
				}
			}
		})
		.catch((err) => {
		})
		.then(() => {
		});
} catch (err) {
	console.log(err);
}



