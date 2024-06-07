const { netwareAdminButtons } = require('../modules/keyboard')
const inputLineScene = require('./inputLine')
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
    }
  }
  catch (err) {
    console.log(err)
  }
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

async function nagios(bot, msg) {
  try {
    const chatId = msg.chat.id
    const username = process.env.NAGIOS_USERNAME
    const password = process.env.NAGIOS_PASSWORD
    const NAGIOS_URL = process.env.NAGIOS_URL
    const BUFFER_URL = process.env.BUFFER_URL
    const res = await axios.post(BUFFER_URL, {
      url: NAGIOS_URL,
      login: username,
      password: password
    })
    const imageBase64 = res.data.image
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    await bot.sendPhoto(chatId, imageBuffer, { caption: 'ScreenShot' })

  } catch (error) {
    console.error(error);
  }
}

module.exports = { netwareAdmin, netwareAdminPing, netwareAdminServiceCheck, netwareAdminDeadIPCheck, nagios }