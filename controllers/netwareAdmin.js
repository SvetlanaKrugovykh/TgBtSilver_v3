const { netwareAdminButtons } = require('../modules/keyboard')
const inputLineScene = require('./inputLine')
const { getNagiosReport } = require('../modules/getReceipt')
const ping = require('ping')
const sendReqToDB = require('../modules/tlg_to_DB')
const { plot } = require('../services/plots')
const axios = require('axios')
require('dotenv').config()

async function netwareAdmin(bot, msg) {
  await netwareAdminMenuStarter(bot, msg, netwareAdminButtons)
}

async function netwareAdminMenuStarter(bot, msg, netwareAdminButtons) {
  await bot.sendMessage(msg.chat.id, netwareAdminButtons.title, {
    reply_markup: {
      keyboard: netwareAdminButtons.buttons,
      resize_keyboard: true
    }
  })
}

async function netwareAdminPing(bot, msg) {
  try {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, "Введіть <i>ip address</i>, \n", { parse_mode: "HTML" })
    const ip_address = await inputLineScene(bot, msg, '192.168.1.1')
    ping.sys.probe(ip_address, function (isAlive) {
      const msg = isAlive ? 'host ' + ip_address + ' is alive' : 'host ' + ip_address + ' is dead'
      bot.sendMessage(chatId, msg)
    })
  }
  catch (err) {
    console.log(err)
  }
}

async function netwareAdminDeadIPCheck(bot, msg) {
  try {
    const chatId = msg.chat.id
    const data = await sendReqToDB('__GetDeadIP__', chatId)
    const text = data.toString()
    if (text.length < 28) {
      await bot.sendMessage(msg.chat.id, `🌟🌟🌟🌟🌟 Everything's good ✅ 👍 Absolutely 🆗.\n`, { parse_mode: 'HTML' })
    } else {
      await bot.sendMessage(msg.chat.id, `🥎\n The problems are}.\n`, { parse_mode: 'HTML' })
      await reportOfNEtProblems(bot, msg, data)
      await getAndSendReportForNetProblems(bot, msg, data)
    }
  }
  catch (err) {
    console.log(err)
  }
}

async function getAndSendReportForNetProblems(bot, msg, data) {
  console.log(`Admin request for the nagios report ${msg.chat.id}`)
  getNagiosReport(bot, msg)
  await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
}

async function reportOfNEtProblems(bot, msg, data) {
  const dataObj = JSON.parse(data)
  const batches = Math.ceil(dataObj.ResponseArray.length / 10)

  for (let i = 0; i < batches; i++) {
    let message = ''
    const start = i * 10
    const end = start + 10
    const batch = dataObj.ResponseArray.slice(start, end)

    for (const item of batch) {
      message += `IP Address: ${item.ip_address}\n`
      message += `IP Description: ${item.ip_description}\n`
      message += `Started At: ${item.StartedAt}\n`
      message += `Duration Minutes: ${item.durationMinutes}\n`
      message += `Value: ${item.value}\n`
      message += `Response: ${item.response}\n`
      message += '\n'
    }

    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })
  }
}

async function netwareAdminServiceCheck(bot, msg) {
  try {
    console.log('netwareAdminServiceCheck')
    const now = new Date()
    const period = {
      day: now.getDate().toString(),
      month: (now.getMonth() + 1).toString(),
      year: now.getFullYear().toString()
    }
    plot(bot, msg, period, '192.168.65.239_UP%')
  }
  catch (err) {
    console.log(err)
  }
}

async function getAndSendMrtgReport(bot, msg) {
  console.log(`Admin request for the mrtg report ${msg.chat.id}`)
  try {

    const data = {
      "abonentId": msg.chat.id,
      "ipAddress": "127.0.0.1",
      "vlanId": "no"
    }
    const response = await axios({
      method: 'POST',
      url: `${process.env.CM_URL}mrtg-report/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${process.env.CM_AUTH_TOKEN}`,

      },
      data: data,
      responseType: 'json',
    })

    if (response.status !== 200) {
      console.error(`Failed to fetch MRTG report. Status: ${response.status}`)
      await bot.sendMessage(msg.chat.id, `⛔️ Failed to fetch MRTG report.`, { parse_mode: 'HTML' })
      return
    }
    await bot.sendMessage(msg.chat.id, '👋💙💛 Have a nice day!\n', { parse_mode: 'HTML' })
  } catch (error) {
    console.error(error)
  }

}


module.exports = { netwareAdmin, netwareAdminPing, netwareAdminServiceCheck, netwareAdminDeadIPCheck, getAndSendMrtgReport }