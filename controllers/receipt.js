const axios = require(`axios`);
const fs = require('fs');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const sendReqToDB = require('../modules/tlg_to_DB');
const { getReceipt } = require('../modules/getReceipt');

const startStep = (ctx) => {
	ctx.replyWithHTML("Введіть <i>номер телефону </i>, який вказано в договорі на абонентське обслуговування\n");
	ctx.wizard.next();
};

const conditionStep = (ctx) => {
	let telNumber = ctx.message.text.replace(/[^0-9]/g, "");
	console.log(new Date());
	console.log('Tel№:', telNumber);
	sendReqToDB('__SaveTlgMsg__', ctx.chat, telNumber);
	if (telNumber.length < 7 || telNumber.length > 12) {
		ctx.replyWithHTML("😡Номер телефону введено помилково\nСеанс завершено.");
		return ctx.scene.leave();
	} else {
		getReceipt(telNumber, ctx);
	};
	return ctx.scene.leave();
};

const receiptScene = (ctx) => {
	const stage = new WizardScene('receiptWizard',
		(ctx) => startStep(ctx),
		(ctx) => conditionStep(ctx)
	);
	return stage;
};

module.exports = receiptScene;
