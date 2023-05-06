const axios = require('axios');
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { cli, devices } = require('../data/cli.model');
const telnetCall = require('../modules/telnet');


async function netwareAdmin(bot, msg) {

	try {
		// console.log(msg);	
	}
	catch (err) {
		console.log(err);
	}
}

module.exports = netwareAdmin;