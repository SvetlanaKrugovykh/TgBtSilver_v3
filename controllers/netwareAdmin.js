const { netwareAdminButtons } = require('../modules/keyboard')
const inputLineScene = require('./inputLine')
const ping = require('ping')
const sendReqToDB = require('../modules/tlg_to_DB')


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
    }
    await bot.sendMessage(msg.chat.id, `🥎\n ${data.toString()}.\n`, { parse_mode: 'HTML' })
  }
  catch (err) {
    console.log(err)
  }
}


async function netwareAdminServiceCheck(bot, msg) {
  try {
    console.log('netwareAdminServiceCheck')
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = { netwareAdmin, netwareAdminPing, netwareAdminServiceCheck, netwareAdminDeadIPCheck }