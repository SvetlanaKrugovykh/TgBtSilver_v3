const { constants, adminStartButtons } = require('../modules/keyboard')
const { netwareAdmin, netwareAdminPing, netwareAdminServiceCheck } = require('./netwareAdmin')
const { clientsAdmin, clientsAdminGetInfo, clientsAdminResponseToRequest,
  clientsAdminSwitchOnClient, clientsAdminGetInvoice,
  clientsAdminStopClientService, clientsAdminCheckAttenuationService,
  clientsAdminCheckBandWidthService } = require('./clientsAdmin')
const supportScene = require('./support')
const receiptScene = require('./receipt')
const paymentScene = require('./payments')
const signUpForm = require('./signUp').signUpForm

function getCallbackData(text) {
  for (const constant of Object.values(constants)) {
    const buttons = constant.buttons
    for (const buttonRow of buttons) {
      for (const button of buttonRow) {
        if (button.text === text) {
          return button.callback_data
        }
      }
    }
  }
  return null
}


async function handler(bot, msg, webAppUrl) {
  const data = getCallbackData(msg.text)
  console.log('The choise is:', data)
  switch (data) {
    case '0_1':
      await receiptScene(bot, msg, false)
      break
    case '0_2':
      await supportScene(bot, msg, false)
      break
    case '0_3':
      await signUpForm(bot, msg, webAppUrl)
      break
    case '1_1':
      await receiptScene(bot, msg, true)
      break
    case '1_2':
      await supportScene(bot, msg, true)
      break
    case '1_3':
      await paymentScene(bot, msg)
      break
    case '2_1':
      await clientsAdmin(bot, msg)
      break
    case '2_2':
      await netwareAdmin(bot, msg)
      break
    case '3_1':
      await clientsAdminGetInfo(bot, msg)
      break
    case '3_2':
      await clientsAdminResponseToRequest(bot, msg)
      break
    case '3_3':
      await adminMenu(bot, msg, adminStartButtons)
      break
    case '3_11':
      await clientsAdminSwitchOnClient(bot, msg)
      break
    case '3_12':
      await clientsAdminGetInvoice(bot, msg)
      break
    case '3_13':
      await clientsAdminStopClientService(bot, msg)
      break
    case '3_14':
      await clientsAdminCheckAttenuationService(bot, msg)
      break
    case '3_15':
      await clientsAdminCheckBandWidthService(bot, msg)
      break
    case '3_16':
      await clientsAdmin(bot, msg)
      break
    case '5_11':
      await netwareAdminPing(bot, msg)
      break
    case '5_12':
      await netwareAdminServiceCheck(bot, msg)
      break
    case '5_13':
      await netwareAdmin(bot, msg)
      break
    case '11_98':
      await clientsAdmin(bot, msg)
      break
    case '11_99':
      await clientsAdminGetInfo(bot, msg, 'return')
      break
    default:
      console.log(`default: ${msg.text}`)
      if (msg.text.length > 3 && msg.text.includes('.')) {
        clientsAdminGetInfo(bot, msg, msg.text)
      }
      break
  }
}

async function guestMenu(bot, msg, guestStartButtons) {
  await bot.sendMessage(msg.chat.id, `Чат-бот <b>ISP SILVER-SERVICE</b> вітає Вас, <b>${msg.chat.first_name} ${msg.chat.last_name}</b>!
	Вам надано гостьовий доступ`, { parse_mode: "HTML" })
  await bot.sendMessage(msg.chat.id, guestStartButtons.title, {
    reply_markup: {
      keyboard: guestStartButtons.buttons,
      resize_keyboard: true
    }
  })
}

async function userMenu(bot, msg, authStartButtons) {
  await bot.sendMessage(msg.chat.id, `Чат-бот <b>ISP SILVER-SERVICE</b> вітає Вас, <b>${msg.chat.first_name} ${msg.chat.last_name}</b>!
	Вам надано авторизований доступ`, { parse_mode: "HTML" })
  await bot.sendMessage(msg.chat.id, authStartButtons.title, {
    reply_markup: {
      keyboard: authStartButtons.buttons,
      resize_keyboard: true
    }
  })
}

async function adminMenu(bot, msg, adminStartButtons) {
  await bot.sendMessage(msg.chat.id, `Hi, ${msg.chat.first_name} ${msg.chat.last_name}! 
				You have been granted administrative access`)
  await bot.sendMessage(msg.chat.id, adminStartButtons.title, {
    reply_markup: {
      keyboard: adminStartButtons.buttons,
      resize_keyboard: true
    }
  })
}

module.exports = { handler, guestMenu, userMenu, adminMenu }