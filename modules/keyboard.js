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
    [{ text: 'Oтримати рахунок.', callback_data: '1_1' }],
    [{ text: 'Hадіслати повідомлення.', callback_data: '1_2' }]
  ]
};


const adminStartButtons = {
  title: 'Choose an action',
  options: [{ resize_keyboard: true }],
  buttons: [
    //    [{ text: 'Netware support.', callback_data: '2_1' }],
    [{ text: 'Clients support.', callback_data: '2_2' }]
  ]
};

const clientAdminStarterButtons = {
  title: 'Choose a starter admin action',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Отримати інформацію про клієнта.', callback_data: '3_1' }],
    [{ text: 'Надіслати відповідь на звернення.', callback_data: '3_2' }]
  ]
};

const clientAdminStep2Buttons = {
  title: 'Choose step2 admin action',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Switch ON this client.', callback_data: '3_11' }],
    [{ text: 'Get invoice for this client.', callback_data: '3_12' }],
    [{ text: 'Return.', callback_data: '3_13' }]
  ]
};

const constants = [guestStartButtons, authStartButtons, adminStartButtons, clientAdminStarterButtons, clientAdminStep2Buttons];

module.exports = { guestStartButtons, adminStartButtons, authStartButtons, clientAdminStarterButtons, clientAdminStep2Buttons, constants };


