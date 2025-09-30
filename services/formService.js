const custom_axios = require('../custom_axios')
const { logWithTime } = require('../logger')

const processFormData = async function (phoneNumber, name) {
  const message = `New form submission from website = call request:\nName: ${name}\nPhone: ${phoneNumber}`
  const chatId = process.env.GROUP_ID
  const apiKey = process.env.TELEGRAM_BOT_TOKEN

  try {
    const response = await custom_axios({
      method: 'post',
      url: `https://api.telegram.org/bot${apiKey}/sendMessage`,
      data: {
        chat_id: chatId,
        text: message,
      }
    })
    if (response.status === 200) {
      logWithTime('Message sent to the Telegram group successfully!')
    } else {
      console.error('Error sending message to the Telegram group:', response.statusText)
    }
  } catch (error) {
    console.error('Error sending message to the Telegram group:', error.message)
  }
}

module.exports = {
  processFormData,
}
