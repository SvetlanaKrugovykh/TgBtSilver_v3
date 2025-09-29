const { logWithTime } = require('../logger')
async function inputLineScene(bot, msg, templateString = '') {
  const chatId = msg.chat.id
  const promise = new Promise(resolve => {
    if (templateString.length > 0) {
      //bot.sendMessage(msg.chat.id, templateString)
    }
    const messageHandler = (message) => {
      if (message.chat.id === chatId) {
        const inputLine = message.text
        logWithTime('Received input Line:', inputLine)
        bot.removeListener('message', messageHandler)
        resolve(inputLine)
      }
    }

    bot.on('message', messageHandler)
    if (templateString.length > 0) {
      bot.sendMessage(msg.chat.id, templateString)
    }
  })
  const userInput = await promise
  return userInput
}

module.exports = inputLineScene
