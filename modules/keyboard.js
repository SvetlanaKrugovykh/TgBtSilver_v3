const guestStartButtons = {
  title: 'Оберіть, будь ласка, дію',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Отримати рахунок', callback_data: '0_1' }],
    [{ text: 'Надіслати повідомлення', callback_data: '0_2' }],
    [{ text: 'Зареєструватися', callback_data: '0_3' }]
  ]
}

const authStartButtons = {
  title: 'Оберіть, будь ласка, дію',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Oтримати рахунок', callback_data: '1_1' }],
    [{ text: 'Hадіслати повідомлення', callback_data: '1_2' }],
    [{ text: 'Здійснити оплату послуг', callback_data: '1_3' }]
  ]
}


const adminStartButtons = {
  title: 'Choose an action',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Clients support', callback_data: '2_1' }],
    [{ text: 'Netware support', callback_data: '2_2' }]
  ]
}

const clientAdminStarterButtons = {
  title: 'Choose a starter admin action',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Отримати інформацію про клієнта', callback_data: '3_1' }],
    [{ text: 'Надіслати відповідь на звернення', callback_data: '3_2' }],
    [{ text: 'Віконати відключення (щомісячне 10-го числа)', callback_data: '3_4' }],
    [{ text: 'Return', callback_data: '3_3' }]
  ]
}

const clientAdminStep2Buttons = {
  title: 'Choose step2 admin action',
  options: { resize_keyboard: true },
  buttons: [
    [
      { text: 'Switch ON this client', callback_data: '3_11' },
      { text: 'STOP services for this client', callback_data: '3_13' }
    ],
    [
      { text: 'Switch ON this client AFTER STOPPING', callback_data: '3_31' }
    ],
    [
      { text: 'Get INVOICE', callback_data: '3_12' },
      { text: 'Send INV by ID', callback_data: '3_28' },
      { text: 'Send INV by email', callback_data: '3_18' }
    ],
    [
      { text: 'Redirect Client Switch ON', callback_data: '3_19' },
      { text: 'Get arp mac', callback_data: '3_20' }
    ],
    [
      { text: 'Check attenuation', callback_data: '3_14' },
      { text: 'Check bandwidth', callback_data: '3_15' }
    ],
    [
      { text: 'Check macs', callback_data: '3_16' },
      { text: 'Return', callback_data: '3_17' }
    ]
  ]
}

const netwareAdminButtons = {
  title: 'Choose netware admin action',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Ping the device', callback_data: '5_11' }],
    [{ text: 'Check troubles for now', callback_data: '5_15' }],
    [{ text: 'Check service load', callback_data: '5_12' }],
    [{ text: 'Check nagios', callback_data: '5_17' }],
    [{ text: 'Return', callback_data: '5_13' }]
  ]
}

function clientAdminChoiceClientFromList(bot, msg, parsedData) {
  try {
    const ClientsValues = parsedData.ResponseArray.map((item, index) => {
      let value = item['Контрагент']
      if (item['АдресДом']) {
        value += '#H' + item['АдресДом']
        if (item['АдресКвартира']) {
          value += '#A' + item['АдресКвартира']
        }
      }
      return {
        id: index,
        value: value,
      }
    })

    const buttonsPerRow = 2
    const clientChoiceButtons = {
      title: 'Choose an client from list:',
      options: [{ resize_keyboard: true }],
      buttons: []
    }

    let currentRow = []
    ClientsValues.forEach((item) => {
      const callbackData = `11_${item.id + 1}`
      const button = { text: item.value, callback_data: callbackData }
      currentRow.push(button)

      if (currentRow.length === buttonsPerRow) {
        clientChoiceButtons.buttons.push(currentRow)
        currentRow = []
      }
    })

    if (currentRow.length > 0) {
      clientChoiceButtons.buttons.push(currentRow)
    }

    const returnButton = { text: 'Rеturn', callback_data: '11_99' }
    const homeButton = { text: 'Home', callback_data: '11_98' }

    if (
      clientChoiceButtons.buttons.length > 0 &&
      clientChoiceButtons.buttons[clientChoiceButtons.buttons.length - 1].length < buttonsPerRow
    ) {
      clientChoiceButtons.buttons[clientChoiceButtons.buttons.length - 1].push(homeButton)
      clientChoiceButtons.buttons[clientChoiceButtons.buttons.length - 1].push(returnButton)
    } else {
      clientChoiceButtons.buttons.push([homeButton])
      clientChoiceButtons.buttons.push([returnButton])
    }

    return clientChoiceButtons
  } catch (err) {
    console.log(err)
  }
}

const retunAdminButtons = {
  title: 'Choose a starter admin action',
  options: [{ resize_keyboard: true }],
  buttons: [
    [{ text: 'Rеturn', callback_data: '11_99' }],
    [{ text: 'Home', callback_data: '11_98' }]
  ]
}

const constants = [guestStartButtons, authStartButtons, adminStartButtons, clientAdminStarterButtons, clientAdminStep2Buttons, netwareAdminButtons, retunAdminButtons]

module.exports = { guestStartButtons, adminStartButtons, authStartButtons, clientAdminStarterButtons, clientAdminStep2Buttons, netwareAdminButtons, constants, clientAdminChoiceClientFromList }


