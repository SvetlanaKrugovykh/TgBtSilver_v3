const nodemailer = require('nodemailer')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
require('dotenv').config()

const { MAILHOST, MAILPORT } = process.env

async function sendMail(message, filename) {
  try {
    let transporter = nodemailer.createTransport({
      host: MAILHOST,
      port: Number(MAILPORT),
      secure: false,
      auth: {
        user: message.from,
        pass: undefined
      }
    })

    const attachment = {
      filename: 'receipt.pdf',
      path: filename
    }

    message.attachments = [attachment]
    if (process.env.MAIL_TEST === 'true') {
      message.to = process.env.MAIL_TEST_TO
    }

    let info = await transporter.sendMail(message)

    console.log("Message sent: %s", info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  } catch (error) {
    console.error(error)
  }

}

async function sendTelegram(tg_id, fileName) {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`
    const formData = new FormData()
    formData.append('chat_id', tg_id)
    formData.append('document', fs.createReadStream(fileName), {
      filename: 'receipt.pdf',
      contentType: 'application/pdf'
    })

    const response = await axios.post(url, formData, {
      headers: formData.getHeaders()
    })

    console.log(response.data)
    return true
  } catch (error) {
    console.error(error)
  }
}

async function sendTxtMsgToTelegram(message) {

  const apiToken = process.env.TELEGRAM_BOT_TOKEN
  const GROUP_ID = process.env.GROUP_ID
  try {
    await axios.post(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
      chat_id: GROUP_ID,
      text: message,
    })
    console.log('Message sent successfully')
    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error.message)
    return false
  }

}

module.exports = { sendMail, sendTelegram, sendTxtMsgToTelegram }