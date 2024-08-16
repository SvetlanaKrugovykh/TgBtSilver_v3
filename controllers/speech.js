async function speechScene(bot, msg) {
  try {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, "🎙️ <i> Залиште голосове повідомлення для служби технічної підтримки.\n Прохання вказати номер телефону та як нам зручніше з Вами зв'язатись</i>", { parse_mode: "HTML" })
    await bot.sendMessage(chatId, "🎙️ ")
  } catch (err) {
    console.error('Error in speechScene:', err)
    await bot.sendMessage(chatId, 'Сталася помилка при записі вашого голосового повідомлення. Спробуйте ще раз.')
  }
}

module.exports = speechScene
