const axios = require('axios');
const fs = require('fs');
const { AUTH_TOKEN, URL } = process.env;

async function getReceipt(telNumber, msg, bot) {
	try {
		axios({
			method: 'post',
			url: URL,
			responseType: 'stream',
			headers: {
				Authorization: `${AUTH_TOKEN}`,
				'Content-Type': 'application/json',
			},
			data: {
				Query: `Execute;GetReceipt;${telNumber};КОНЕЦ`,
			},
		})
			.then((response) => {
				setTimeout(function () { }, 9999);
				console.log('response.status', response.status);
				let fileFullName = `C:\\Temp\\__${msg.chat.id}__.pdf`;
				if (!response.status == 200) {
					bot.sendMessage(msg.chat.id,
						`⛔️За номером ${telNumber} даних не існує.\nВи можете надіслати своє питання в службу технічної підтримки.\n`, { parse_mode: 'HTML' });
				} else {
					response.data.pipe(fs.createWriteStream(fileFullName));
					console.log(`File ${fileFullName} saved.`);
					setTimeout(function () { }, 9999);
					bot.sendMessage(msg.chat.id, '🥎Рахунок отримано.\n', { parse_mode: 'HTML' });
					setTimeout(function () {
						ctx.telegram.sendDocument(ctx.chat.id, {
							source: fileFullName,
						}).catch(function (error) {
							console.log(error);
						});
					}, 1000);
				}
			})
			.catch((err) => {
				console.log(err);
				bot.sendMessage(msg.chat.id,
					`⛔️За номером ${telNumber} даних не існує.\nВи можете надіслати своє питання в службу технічної підтримки.\n`, { parse_mode: 'HTML' });
			})
			.then(() => {
				bot.sendMessage(msg.chat.id, '👋💙💛 Дякуємо за звернення.\n', { parse_mode: 'HTML' });
			});
	} catch (err) {
		console.log(err);
	}
}

module.exports = { getReceipt };
