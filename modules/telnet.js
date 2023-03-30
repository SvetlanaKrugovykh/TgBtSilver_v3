const net = require('net');
const PORT = 23; // Telnet port
const { TelnetParams } = require('../data/telnet.model');


function telnetCall(HOST, replaceStr) {
	return new Promise((resolve, reject) => {
		let store = [];
		let authorized = false;
		let i = 0;

		const Params = new TelnetParams();
		Params.cliArray = Params.cliArray.map(element => {
			if (Params.searchStr && element.includes(Params.searchStr)) {
				return element.replace(new RegExp(Params.searchStr, 'g'), replaceStr);
			}
			return element;
		});

		const client = new net.Socket();

		client.connect(PORT, HOST, () => {
			console.log('Connected to network device');
		});

		let buffer = '';

		client.on('data', (data) => {
			buffer += data.toString().trim();
			if (buffer.includes('Username:')) {
				client.write(Params.username);
			} else if (buffer.startsWith('Password:')) {
				client.write(Params.password);
				authorized = true;
			} else {
				if (authorized && (buffer.length > 1)) {
					if (i === Params.cliArray.length) {
						if (buffer.includes(replaceStr)) store.push(buffer);
						client.on('close', () => {
							console.log('Connection closed');
							resolve(store);
						});
					}
					if (buffer.includes(replaceStr)) store.push(buffer);
					client.write(Params.cliArray[i] + '\n');
					i++;
				}
			}

			buffer = '';
		});


	});
}

module.exports = telnetCall;

