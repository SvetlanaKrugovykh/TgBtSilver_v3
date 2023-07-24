require('dotenv').config()
const axios = require('axios')
const URL = process.env.URL
const AUTH_TOKEN = process.env.AUTH_TOKEN
const sendReqToDB = require('../modules/tlg_to_DB')
const telnetCall = require('../modules/telnet')
const { TelnetParams } = require('../data/telnet.model')
const { getReceipt } = require('../modules/getReceipt')
const inputLineScene = require('./inputLine')
const checkValue = require('../modules/common')
const { clientAdminStarterButtons, clientAdminStep2Buttons } = require('../modules/keyboard')
let telNumber = ''
let codeRule = ''
let _HOST = ''
let EPON = ''

async function getInfo(bot, msg, inputLine) {
  const data = await sendReqToDB('__GetClientsInfo__', msg.chat, inputLine)
  if (data === null) {
    await bot.sendMessage(msg.chat.id, `⛔️Жодної інформації за запитом не знайдено`, { parse_mode: 'HTML' })
    return null
  }
  try {
    if (data.length > 3900) {
      bot.sendMessage(msg.chat.id, `\n The Answer is too long. Write another request..\n`, { parse_mode: 'HTML' })
      return null
    }
    console.log(data.toString())
    await bot.sendMessage(msg.chat.id, `🥎\n ${data.toString()}.\n`, { parse_mode: 'HTML' })
    let responseData = JSON.parse(data)
    return responseData
  } catch (err) {
    console.log(err)
    return null
  }
}

async function actionsOnId(bot, msg, inputLine) {
  if (inputLine !== undefined) {
    if (inputLine.includes("id#")) {
      let id = inputLine.split("id#")[1]
      let msgtext = inputLine.split("id#")[2]
      console.log('id', id)
      console.log('msgtext', msgtext)
      try {
        await bot.sendMessage(id, `Дякуємо за звернення, відповідь: \n ${msgtext}`, { parse_mode: 'HTML' })
        await bot.sendMessage(msg.chat.id, `🥎🥎 id# request sent\n`, { parse_mode: 'HTML' })
      } catch (err) {
        console.log(err)
      }
    }
  }
}

async function switchOn(bot, msg, txtCommand) {
  await sendReqToDB('___SwitchOn__', '', txtCommand)
  await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
}

async function stopService(bot, msg, txtCommand) {
  await sendReqToDB('___StopService__', '', txtCommand)
  await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
}

async function invoice(bot, msg, telNumber) {
  console.log('Reguest for receipt for', telNumber)
  await getReceipt(telNumber, msg, bot)
}

async function goToHardware(bot, msg, responseData) {
  if (process.env.HARDWARE_CHECKING === 'false') {
    return null
  }
  const Params = new TelnetParams()
  try {
    if (responseData.ResponseArray[0].HOST) {
      const HOST = responseData.ResponseArray[0].HOST.toString()
      _HOST = HOST
      console.log(HOST)
      if (HOST.length > 12 && !Params.excludeHOSTS.includes(HOST)) {
        try {
          let match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/)
          console.log(HOST + ' match= ' + match)
          if (match) {
            const partComment = match[0]
            if (!partComment.startsWith('EPON')) {
              return null
            }
            console.log(partComment)
            EPON = partComment
            await telnetCall(HOST, partComment)
              .then(store => {
                console.dir(store)
                bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' })
              })
              .catch(err => {
                console.log(err)
              })
          }
        } catch (err) { console.log('HOST is not define') }
      }
    }
  } catch (err) { console.log(err) }
}

async function clientsAdmin(bot, msg) {

  await clientAdminMenuStarter(bot, msg, clientAdminStarterButtons)

}


//#region clientAdminMenus
async function clientAdminMenuStarter(bot, msg, clientAdminStarterButtons) {
  await bot.sendMessage(msg.chat.id, clientAdminStarterButtons.title, {
    reply_markup: {
      keyboard: clientAdminStarterButtons.buttons,
      resize_keyboard: true
    }
  })

  console.log(((new Date()).toLocaleTimeString()))
}

async function clientAdminStep2Menu(bot, msg, clientAdminStep2Buttons) {
  await bot.sendMessage(msg.chat.id, clientAdminStep2Buttons.title, {
    reply_markup: {
      keyboard: clientAdminStep2Buttons.buttons,
      resize_keyboard: true
    }
  })
}
//#endregion

//#region clientAdminSubMenus
async function clientsAdminGetInfo(bot, msg) {
  await bot.sendMessage(msg.chat.id,
    "Введіть <i>строку для пошуку інформаціі </i>\nПошукові параметри розділяйте через #, \nпошук ведеться через \nПІБ#город#вул#телефон0981234567#буд#кв\nПриклади: М_дв_д_в або Таран_нко\n(*якщо не впевнені яку буква, то використовуйте _)\n ?2#234\n(*використовуйте ? спочатку запиту, якщо немає прізвища)",
    { parse_mode: 'HTML' })
  const inputLine = await inputLineScene(bot, msg)
  const responseData = await getInfo(bot, msg, inputLine)

  try {
    telNumber = responseData.ResponseArray[0].telNumber
    codeRule = responseData.ResponseArray[0].КодПравил
    comment = responseData.ResponseArray[0].Comment

    if (responseData?.ResponseArray && Array.isArray(responseData?.ResponseArray)) {
      if (responseData?.ResponseArray[0]?.HOST) {
        await goToHardware(bot, msg, responseData)
      }
    } else {
      return null
    }

    await clientAdminStep2Menu(bot, msg, clientAdminStep2Buttons)
  } catch (err) {
    console.log(err)
  }

}

async function clientsAdminResponseToRequest(bot, msg) {
  await bot.sendMessage(msg.chat.id, "Введіть <i>id чата для відправки відповіді клієнту </i>\n", { parse_mode: 'HTML' })
  const codeChat = await inputLineScene(bot, msg)
  if (codeChat.length < 7) {
    await bot.sendMessage(msg.chat.id, "Wrong id. Операцію скасовано\n", { parse_mode: 'HTML' })
    return null
  }
  const commandHtmlText = "Введіть <i>text відповіді клієнту </i>\n"
  await bot.sendMessage(msg.chat.id, commandHtmlText, { parse_mode: 'HTML' })
  const txtCommand = await inputLineScene(bot, msg)
  if (txtCommand.length < 7) {
    await bot.sendMessage(msg.chat.id, "Незрозуміла відповідь. Операцію скасовано\n", { parse_mode: 'HTML' })
    return null
  }
  const txtCommandForSend = 'id#' + codeChat + 'id#' + txtCommand
  await actionsOnId(bot, msg, txtCommandForSend)
}

async function clientsAdminSwitchOnClient(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, "Wrong codeRule. Операцію скасовано. Треба повторити пошук\n", { parse_mode: 'HTML' })
    return null
  }
  const txtCommand = 'switchon#' + codeRule
  console.log(`Admin request for the switch on ${codeRule}`)
  await switchOn(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, "👋💙💛 Have a nice day!\n", { parse_mode: 'HTML' })
}

async function clientsAdminGetInvoice(bot, msg) {
  if (telNumber.length < 8) {
    await bot.sendMessage(msg.chat.id, "Wrong telNumber. Операцію скасовано. Треба повторити пошук\n", { parse_mode: 'HTML' })
    return null
  }
  console.log(`Admin request for the receipt ${telNumber}`)
  await invoice(bot, msg, telNumber)
  await bot.sendMessage(msg.chat.id, "👋💙💛 Have a nice day!\n", { parse_mode: 'HTML' })
}

async function clientsAdminStopClientService(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, "Wrong codeRule. Операцію скасовано. Треба повторити пошук\n", { parse_mode: 'HTML' })
    return null
  }
  const txtCommand = 'stopService#' + codeRule
  console.log(`Admin request for the stop service on ${codeRule}`)
  await stopService(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, "👋💙💛 Have a nice day!\n", { parse_mode: 'HTML' })
}

async function clientsAdminCheckAttenuationService(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, "Wrong codeRule. Операцію скасовано. Треба повторити пошук\n", { parse_mode: 'HTML' })
    return null
  }
  if (EPON.length > 5) {
    console.log(`Admin request for the check attenuation on ${_HOST} for ${EPON}`)
    await telnetCall(_HOST, EPON, 'attenuation')
      .then(store => {
        console.dir(store)
        bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' })
      })
  } else {
    await bot.sendMessage(msg.chat.id, "👋💙💛 No data, but have a nice day!\n", { parse_mode: 'HTML' })
  }
}

async function clientsAdminCheckBandWidthService(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, "Wrong codeRule. Операцію скасовано. Треба повторити пошук\n", { parse_mode: 'HTML' })
    return null
  }
  if (EPON.length > 5) {
    console.log(`Admin request for the check attenuation on ${_HOST} for ${EPON}`)
    await telnetCall(_HOST, EPON, 'bandwidth')
      .then(store => {
        console.dir(store)
        bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' })
      })
  } else {
    await bot.sendMessage(msg.chat.id, "👋💙💛 No data, but have a nice day!\n", { parse_mode: 'HTML' })
  }
}


//#endregion

module.exports = {
  clientsAdmin, clientsAdminGetInfo, clientsAdminResponseToRequest,
  clientsAdminSwitchOnClient, clientsAdminGetInvoice,
  clientsAdminStopClientService, clientsAdminCheckAttenuationService,
  clientsAdminCheckBandWidthService
}
