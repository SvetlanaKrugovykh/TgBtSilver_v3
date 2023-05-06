const guestStartButtons = {
	title: 'Оберіть, будь ласка, дію',
	options: [{ resize_keyboard: true }],
	buttons: [
		[{ text: 'Отримати рахунок.', callback_data: '0_1' }],
		[{ text: 'Надіслати повідомлення.', callback_data: '0_2' }],
		[{ text: 'Зареєструватися.', callback_data: '0_3' }]
	]
};

const authStartButtons = {
	title: 'Оберіть, будь ласка, дію',
	options: [{ resize_keyboard: true }],
	buttons: [
		[{ text: 'Отримати рахунок.', callback_data: '1_1' }],
		[{ text: 'Надіслати повідомлення.', callback_data: '1_2' }]
	]
};


const adminStartButtons = {
	title: 'Choose an action',
	options: [{ resize_keyboard: true }],
	buttons: [
		[{ text: 'Netware support.', callback_data: '2_1' }],
		[{ text: 'Clients support.', callback_data: '2_2' }]
	]
};

const constants = [guestStartButtons, authStartButtons, adminStartButtons];

module.exports = { guestStartButtons, adminStartButtons, authStartButtons, constants };


