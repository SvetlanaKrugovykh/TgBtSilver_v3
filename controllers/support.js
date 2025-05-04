const menu = require('../modules/common_menu')


async function supportScene(bot, msg, isAuthorized) {
  try {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, "<i>Залиште нижче текстове або інше  повідомлення для служби технічної підтримки.\n Прохання вказати номер телефону та як нам зручніше з Вами зв'язатись</i>", { parse_mode: "HTML" })
    await menu.notTextScene(bot, msg)
  } catch (err) {
    console.log(err)
  }
}

module.exports = supportScene
