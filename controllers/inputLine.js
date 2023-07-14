async function inputLineScene(bot, msg, templateString = '') {
  const promise = new Promise(resolve => {
    if (templateString.length > 0) {
      //bot.sendMessage(msg.chat.id, templateString)
    }
    bot.once('message', (message) => {
      const inputLine = message.text
      console.log('Received input Line:', inputLine)
      resolve(inputLine)
    })
  })
  const userInput = await promise
  return userInput
}

module.exports = inputLineScene
