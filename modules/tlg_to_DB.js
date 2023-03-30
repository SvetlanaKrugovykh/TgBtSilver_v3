const axios = require(`axios`);
const URL = process.env.URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function sendReqToDB(reqType, data, text) {

	let dataString = objToString(reqType, data, text);
	return false; // for test

	try {
		axios({
			method: 'post',
			url: URL,
			responseType: 'string',
			headers: {
				Authorization: `${AUTH_TOKEN}`,
				'Content-Type': 'application/json',
			},
			data: {
				Query: `Execute;${reqType};${dataString};КОНЕЦ`,
			}
		})
			.then((response) => {
				if (!response.status == 200) {
					console.log(response.status);
				} else {
					let answer = response.data.toString();
					console.log(answer);
					if (reqType == '__CheckTlgClient__') {
						return answer.includes('authorized');
					} else return answer;
				}
			})
			.catch((err) => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
}

function objToString(reqType, data, text) {

	if (reqType == '__CheckTlgClient__') {
		return (data.id + '#' + data.first_name + '#' + data.last_name + '#' + data.username);
	} else {
		return (data.id + '#' + text);
	}

}

module.exports = sendReqToDB;