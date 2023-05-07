async function inputLineScene(bot, msg) {
	const promise = new Promise(resolve => {
		bot.once('message', (message) => {
			const inputLine = message.text;
			console.log('Received input Line:', inputLine);
			resolve(inputLine);
		});
	});
	const userInput = await promise;
	return userInput;
}

module.exports = inputLineScene;
