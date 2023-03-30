const netwareAdmin = require('./netwareAdmin');
const clientsAdmin = require('./clientsAdmin');
const { constants } = require('../modules/keyboard');
const signUp = require('./signUp');

function getCallbackData(text) {
	for (const constant of Object.values(constants)) {
		const buttons = constant.buttons;
		for (const buttonRow of buttons) {
			for (const button of buttonRow) {
				if (button.text === text) {
					return button.callback_data;
				}
			}
		}
	}
	return null;
}


async function handler(bot, msg) {
	const data = getCallbackData(msg.text);
	console.log(data);
	switch (data) {
		case '0_1':
			console.log('0_1');
			break;
		case '0_2':
			console.log('0_2');
			break;
		case '0_3':
			await signUp(bot, msg);
			break;
		case '1_1':
			console.log('1_1');
			break;
		case '1_2':
			console.log('1_2');
			break;
		case '2_1':
			await netwareAdmin(bot);
			break;
		case '2_2':
			await clientsAdmin(bot);
			break;
		default:
			console.log('default');
			break;
	}
}

module.exports = handler;
