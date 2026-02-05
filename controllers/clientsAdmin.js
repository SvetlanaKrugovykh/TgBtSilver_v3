require('dotenv').config()
const fs = require('fs')
const sendReqToDB = require('../modules/tlg_to_DB')
const telnetCall = require('../modules/telnet')
const { TelnetParams } = require('../data/telnet.model')
const { getReceipt } = require('../modules/getReceipt')
const inputLineScene = require('./inputLine')
const checkValue = require('../modules/common')
const { sendMail, sendTelegram } = require("../modules/mailer")
const { logWithTime } = require('../logger')
const { clientAdminStarterButtons, clientAdminStep2Buttons, clientAdminChoiceClientFromList } = require('../modules/keyboard')

let telNumber = {}
let codeRule = {}
let _HOST = {}
let EPON = {}
let comment = {}
let email = {}
let fileName = {}
let IP_address = {}


async function getInfo(bot, msg, inputLine) {
  const data = await sendReqToDB('__GetClientsInfo__', msg.chat, inputLine)
  if (data === null) {
    await bot.sendMessage(msg.chat.id, `⛔️Жодної інформації за запитом не знайдено`, { parse_mode: 'HTML' })
    return null
  }
  try {
    const parsedData = JSON.parse(data)
    if (parsedData.ResponseArray === null) {
      await bot.sendMessage(msg.chat.id, `⛔️Жодної інформації за запитом не знайдено`, { parse_mode: 'HTML' })
      return null
    }
    if (parsedData.ResponseArray.length > 1 && !inputLine.includes('#')) {
      await bot.sendMessage(msg.chat.id, `⛔️За запитом знайдено ${parsedData.ResponseArray.length} записів. Введіть більш точний запит`, { parse_mode: 'HTML' })
      const clientChoiceButtons = clientAdminChoiceClientFromList(bot, msg, parsedData)
      await bot.sendMessage(msg.chat.id, clientChoiceButtons.title, {
        reply_markup: {
          keyboard: clientChoiceButtons.buttons,
          resize_keyboard: true
        }
      })
      return null
    }
    logWithTime(data.toString())
    await bot.sendMessage(msg.chat.id, `🥎\n ${data.toString()}.\n`, { parse_mode: 'HTML' })
    return parsedData
  } catch (err) {
    logWithTime(err)
    return null
  }
}

async function actionsOnId(bot, msg, inputLine) {
  if (inputLine !== undefined) {
    if (inputLine.includes('id#')) {
      let id = inputLine.split('id#')[1]
      let msgtext = inputLine.split('id#')[2]
      logWithTime('id', id)
      logWithTime('msgtext', msgtext)
      try {
        await bot.sendMessage(id, `Дякуємо за звернення, відповідь: \n ${msgtext}`, { parse_mode: 'HTML' })
        await bot.sendMessage(msg.chat.id, `🥎🥎 id# request sent\n`, { parse_mode: 'HTML' })
      } catch (err) {
        logWithTime(err)
      }
    }
  }
}

async function switchOn(bot, msg, txtCommand) {
  const response = await sendReqToDB('___SwitchOn__', '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR Client is not switch On`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
  }
}

async function switchOff(bot, msg, txtCommand) {
  const response = await sendReqToDB('___SwitchOff__', '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR Client is not switch Off`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
  }
}

async function MonthlyOFF(bot, msg, txtCommand) {
  const response = await sendReqToDB('___MonthlySwitchOFF__', '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR Monthly Switch OFF not processed`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
  }
}


async function switchOnAfterStop(bot, msg, txtCommand) {
  const response = await sendReqToDB('___SwitchOnAfterStop__', '', txtCommand)

  let responseContainsNoData = false
  if (response !== null) {
    try {
      const parsedResponse = JSON.parse(response)
      if (parsedResponse.ResponseArray && Array.isArray(parsedResponse.ResponseArray) && parsedResponse.ResponseArray.some(item => item.includes('There are no data for change'))) {
        responseContainsNoData = true
      }
    } catch (err) {
      console.error('Error parsing response JSON:', err)
    }
  }

  if (response === null || responseContainsNoData) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR Client is not switch On After Stopping`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
  }
}

async function switchRedirectedClientOn(bot, msg, ip) {
  const response = await sendReqToDB('___SwitchRedirectedClientOn__', '', ip)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR Redirected Client is not switch On`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${ip} request sent\n`, { parse_mode: 'HTML' })
  }
}

async function GetArpMac(bot, msg, ip) {
  const response = await sendReqToDB('___GetArpMac__', '', ip)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR GetArpMac`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${response}\n`, { parse_mode: 'HTML' })
  }
}

async function stopService(bot, msg, txtCommand) {
  const response = await sendReqToDB('___StopService__', '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR of stop clients service`, { parse_mode: 'HTML' })
  } else {
    await bot.sendMessage(msg.chat.id, `🥎🥎 ${txtCommand} request sent\n`, { parse_mode: 'HTML' })
  }
}

async function invoice(bot, msg, telNumber, fileName) {
  logWithTime('Reguest for receipt for', telNumber)
  await getReceipt(telNumber, msg, bot, fileName)
}

async function goToHardware(bot, msg, responseData) {
  if (process.env.HARDWARE_CHECKING === 'false') {
    return null
  }
  const Params = new TelnetParams()
  try {
    if (responseData.ResponseArray[0].HOST) {
      const HOST = responseData.ResponseArray[0].HOST.toString()
      _HOST[msg.chat.id] = HOST
      logWithTime(_HOST)
      if (HOST.length > 12 && !Params.excludeHOSTS.includes(HOST)) {
        let match = responseData.ResponseArray[0].Comment.match(/^\w+\/\d+:\d+/)
        logWithTime(HOST + ' match= ' + match)
        if (match) {
          const partComment = match[0]
          if (!partComment.startsWith('EPON')) {
            return null
          }
          logWithTime(partComment)
          EPON[msg.chat.id] = partComment
          await telnetCall(HOST, partComment)
            .then(store => {
              console.dir(store)
              bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' })
            })
            .catch(err => {
              logWithTime(err)
            })
        }
      }
    }
  } catch (err) { logWithTime(err) }
}

async function clientsAdmin(bot, msg) {

  await clientAdminMenuStarter(bot, msg, clientAdminStarterButtons)

}

//#region clientAdminMenus
async function clientAdminMenuStarter(bot, msg, clientAdminStarterButtons) {
  const { title, buttons } = clientAdminStarterButtons
  const adminIds = process.env.ADMINS.split(',').map(id => id.trim())
  const userButtons = [...buttons]
  if (adminIds.includes(String(msg.chat.id))) {
    userButtons.push([{ text: '✍ for Reply on demand', callback_data: '0_99' }])
  }

  await bot.sendMessage(msg.chat.id, title, {
    reply_markup: {
      keyboard: userButtons,
      resize_keyboard: true
    }
  })

  logWithTime(((new Date()).toLocaleTimeString()))
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
async function clientsAdminGetInfo(bot, msg, condition = undefined) {
  let inputLine = ''
  if (msg.text === 'Отримати інформацію про клієнта' || condition === 'return') {
    await bot.sendMessage(msg.chat.id,
      'Введіть <i>строку для пошуку інформаціі </i>\nПошукові параметри розділяйте через #, \nпошук ведеться через \nПІБ#город#вул#телефон0981234567#буд#кв\nПриклади: М_дв_д_в або Таран_нко\n(*якщо не впевнені яку буква, то використовуйте _)\n ?2#234\n(*використовуйте ? спочатку запиту, якщо немає прізвища)\n(*якщо ?192.168.1.1# буде пошук за IP адресою)',
      { parse_mode: 'HTML' })
    inputLine = await inputLineScene(bot, msg)
  } else {
    inputLine = msg.text
  }
  const responseData = await getInfo(bot, msg, inputLine)
  if (responseData === null) {
    return null
  }
  try {
    telNumber[msg.chat.id] = responseData.ResponseArray[0].telNumber
    codeRule[msg.chat.id] = responseData.ResponseArray[0].КодПравил
    comment[msg.chat.id] = responseData.ResponseArray[0].Comment
    email[msg.chat.id] = responseData.ResponseArray[0].email
    IP_address[msg.chat.id] = responseData.ResponseArray[0].IP_address

    if (responseData?.ResponseArray && Array.isArray(responseData?.ResponseArray)) {
      if (responseData?.ResponseArray[0]?.HOST) {
        await goToHardware(bot, msg, responseData)
      }
    } else {
      return null
    }

    await clientAdminStep2Menu(bot, msg, clientAdminStep2Buttons)
  } catch (err) {
    logWithTime(err)
  }

}

async function clientsAdminResponseToRequest(bot, msg) {
  await bot.sendMessage(msg.chat.id, 'Введіть <i>id чата для відправки відповіді клієнту </i>\n', { parse_mode: 'HTML' })
  const codeChat = await inputLineScene(bot, msg)
  if (codeChat.length < 7) {
    await bot.sendMessage(msg.chat.id, 'Wrong id. Операцію скасовано\n', { parse_mode: 'HTML' })
    return null
  }
  const commandHtmlText = 'Введіть <i>text відповіді клієнту </i>\n'
  await bot.sendMessage(msg.chat.id, commandHtmlText, { parse_mode: 'HTML' })
  const txtCommand = await inputLineScene(bot, msg)
  if (txtCommand.length < 7) {
    await bot.sendMessage(msg.chat.id, 'Незрозуміла відповідь. Операцію скасовано\n', { parse_mode: 'HTML' })
    return null
  }
  const txtCommandForSend = 'id#' + codeChat + 'id#' + txtCommand
  await actionsOnId(bot, msg, txtCommandForSend)
}

async function clientsAdminSwitchOnClient(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, 'Wrong codeRule. Операцію скасовано. Треба повторити пошук\n', { parse_mode: 'HTML' })
    return null
  }
  const txtCommand = 'switchon#' + codeRule[msg.chat.id]
  logWithTime(`Admin request for the switch on ${codeRule[msg.chat.id]}`)
  await switchOn(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}

async function clientsAdminSwitchOff(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, 'Wrong codeRule. Операцію скасовано. Треба повторити пошук\n', { parse_mode: 'HTML' })
    return null
  }
  const txtCommand = 'switchoff#' + codeRule[msg.chat.id]
  logWithTime(`Admin request for the switch off ${codeRule[msg.chat.id]}`)
  await switchOff(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}

async function clientsAdminMonthlyOFF(bot, msg) {
  const txtCommand = 'clientsAdminMonthlyOFF#'
  logWithTime(`Admin request for the monthly off sent`)
  await MonthlyOFF(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}

async function clientsAdminSwitchOnClientAfterStopping(bot, msg) {
  if (codeRule.length < 3) {
    await bot.sendMessage(msg.chat.id, 'Wrong codeRule. Операцію скасовано. Треба повторити пошук\n', { parse_mode: 'HTML' })
    return null
  }
  const txtCommand = 'switchon#' + codeRule[msg.chat.id]
  logWithTime(`Admin request for the switch on ${codeRule[msg.chat.id]}`)
  await switchOnAfterStop(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}


async function clientsAdminRedirectedClientSwitchOn(bot, msg) {
  try {
    const ip = IP_address[msg.chat.id].replace(/\s+/g, '')
    if (!ip || ip.length < 7) {
      logWithTime(`ERROR in request for the Redirected Client switch on ${ip}`)
      return null
    }
    logWithTime(`Admin request for the Redirected Client switch on ${codeRule[msg.chat.id]}`)
    await switchRedirectedClientOn(bot, msg, ip)
  } catch (err) {
    logWithTime(err)
  }
}
async function clientsAdminGetArpMac(bot, msg) {
  try {
    const ip = IP_address[msg.chat.id].replace(/\s+/g, '')
    if (!ip || ip.length < 7) {
      logWithTime(`ERROR in request for the get mac for ip ${ip}`)
      return null
    }
    logWithTime(`Admin request for get mac for ip ${ip} sent`)
    await GetArpMac(bot, msg, ip)
  } catch (err) {
    logWithTime(err)
  }
}

async function clientsAdminGetInvoice(bot, msg) {
  if (telNumber[msg.chat.id] === undefined) return null
  if (telNumber[msg.chat.id].length < 8) {
    await bot.sendMessage(msg.chat.id, 'Wrong telNumber. Операцію скасовано. Треба повторити пошук\n', { parse_mode: 'HTML' })
    return null
  }
  logWithTime(`Admin request for the receipt ${telNumber[msg.chat.id]}`)
  invoice(bot, msg, telNumber[msg.chat.id], fileName)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}

async function clientsAdminStopClientService(bot, msg) {
  if (codeRule[msg.chat.id] === undefined) return null
  if (codeRule[msg.chat.id].length < 3) {
    await bot.sendMessage(msg.chat.id, 'Wrong codeRule. Операцію скасовано. Треба повторити пошук\n', { parse_mode: 'HTML' })
    return null
  }
  const txtCommand = 'stopService#' + codeRule[msg.chat.id]
  logWithTime(`Admin request for the stop service on ${codeRule[msg.chat.id]}`)
  await stopService(bot, msg, txtCommand)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}

async function clientsAdminCheckHWService(bot, msg, request) {
  const Params = new TelnetParams()
  if (_HOST[msg.chat.id] === undefined || EPON[msg.chat.id] === undefined) {
    await bot.sendMessage(msg.chat.id, `Wrong operation! ⛔️ \n`, { parse_mode: 'HTML' })
    return null
  }
  if (_HOST[msg.chat.id].length < 12 || Params.excludeHOSTS.includes(_HOST[msg.chat.id])) {
    await bot.sendMessage(msg.chat.id, `Wrong codeRule. Операцію  ${request} скасовано. Треба повторити пошук\n`, { parse_mode: 'HTML' })
    return null
  }
  if (EPON[msg.chat.id].length > 5) {
    logWithTime(`Admin request for the check ${request} on ${_HOST[msg.chat.id]} for ${EPON[msg.chat.id]}`)
    await telnetCall(_HOST[msg.chat.id], EPON[msg.chat.id], request)
      .then(store => {
        console.dir(store)
        bot.sendMessage(msg.chat.id, `🥎\n ${store.toString()}.\n`, { parse_mode: 'HTML' })
      })
  } else {
    await bot.sendMessage(msg.chat.id, '👋💙💛 No data, but have a nice day!\n', { parse_mode: 'HTML' })
  }
}


/**
 * Validates invoice file existence and freshness for specified chat.id
 * @param {number} chatId - Chat ID
 * @param {number} maxAgeMinutes - Maximum file age in minutes (default 10)
 * @returns {string|null} - File path or null if not found or outdated
 */
function getInvoiceFilePath(chatId, maxAgeMinutes = 10) {
  try {
    const tempCatalog = process.env.TEMP_CATALOG
    const filePath = `${tempCatalog}__${chatId}__.pdf`
    
    logWithTime(`Checking invoice file: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      logWithTime(`Invoice file not found: ${filePath}`)
      return null
    }
    
    const stats = fs.statSync(filePath)
    const fileModTime = stats.mtime.getTime()
    const currentTime = Date.now()
    const fileAgeMinutes = (currentTime - fileModTime) / (1000 * 60)
    
    logWithTime(`File age: ${fileAgeMinutes.toFixed(2)} minutes`)
    
    if (fileAgeMinutes > maxAgeMinutes) {
      logWithTime(`Invoice file is too old (${fileAgeMinutes.toFixed(2)} > ${maxAgeMinutes} minutes): ${filePath}`)
      return null
    }
    
    logWithTime(`Invoice file is valid: ${filePath}`)
    return filePath
    
  } catch (err) {
    logWithTime(`Error checking invoice file: ${err}`)
    return null
  }
}

async function sendInvoice(_bot, msg, recID = false) {

  try {
    const invoiceFilePath = getInvoiceFilePath(msg.chat.id)
    
    if (!invoiceFilePath) {
      await _bot.sendMessage(msg.chat.id, '⛔️ Файл рахунку не знайдено або застарів. Спочатку згенеруйте рахунок.', { parse_mode: 'HTML' })
      return
    }

    if (recID) {
      await _bot.sendMessage(msg.chat.id, 'Введіть ID клієнта\n', { parse_mode: 'HTML' })
      const tg_id = await inputLineScene(_bot, msg)
      logWithTime(`Sending invoice via Telegram to ${tg_id}, file: ${invoiceFilePath}`)
      const res_ = await sendTelegram(tg_id, invoiceFilePath)
      if (res_) {
        logWithTime(`Invoice successfully sent via Telegram to ${tg_id}`)
        await _bot.sendMessage(msg.chat.id, `🥎🥎 Invoice succesfully sent to ${tg_id}\n`, { parse_mode: 'HTML' })
      } else {
        logWithTime(`Failed to send invoice via Telegram to ${tg_id}`)
        await _bot.sendMessage(msg.chat.id, `⛔️ Invoice not sent to ${tg_id}\n`, { parse_mode: 'HTML' })
      }
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email[msg.chat.id])) {
      logWithTime("Invalid email address:", email[msg.chat.id])
      await _bot.sendMessage(msg.chat.id, '⛔️ Невірна email адреса. Операцію скасовано.', { parse_mode: 'HTML' })
      return
    }
    const message = {
      from: 'AbonOtdel@silver-service.com.ua',
      to: email[msg.chat.id],
      subject: 'Рахунок до сплати за послуги Internet',
      text: 'Доброго дня! У вкладенні рахунок щодо сплати за послуги Інтернет',
      html: '<p>Очікуємо на своєчасну сплату рахунку</p>'
    }

    await _bot.sendMessage(msg.chat.id, `📧 Відправляю рахунок на email: ${email[msg.chat.id]}...`, { parse_mode: 'HTML' })
    logWithTime(`Sending invoice via Email to ${email[msg.chat.id]}, file: ${invoiceFilePath}`)
    
    const emailResult = await sendMail(message, invoiceFilePath)
    
    if (emailResult) {
      logWithTime(`Invoice successfully sent via Email to ${email[msg.chat.id]}`)
      await _bot.sendMessage(msg.chat.id, `🥎🥎 Рахунок успішно відправлено на email: ${email[msg.chat.id]}`, { parse_mode: 'HTML' })
    } else {
      logWithTime(`Failed to send invoice via Email to ${email[msg.chat.id]}`)
      await _bot.sendMessage(msg.chat.id, `⛔️ Помилка відправки рахунку на email: ${email[msg.chat.id]}`, { parse_mode: 'HTML' })
    }
  } catch (err) {
    logWithTime(err)
  }
}
//#endregion

module.exports = {
  clientsAdmin, clientsAdminGetInfo, clientsAdminResponseToRequest, clientsAdminMonthlyOFF,
  clientsAdminSwitchOnClient, clientsAdminSwitchOnClientAfterStopping, clientsAdminGetInvoice,
  clientsAdminStopClientService, clientsAdminCheckHWService, sendInvoice,
  clientsAdminRedirectedClientSwitchOn, clientsAdminGetArpMac, clientsAdminSwitchOff
}
