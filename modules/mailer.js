const nodemailer = require('nodemailer')
const custom_axios = require('../custom_axios')
const FormData = require('form-data')
const fs = require('fs')
const { logWithTime } = require('../logger')
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

    logWithTime("Message sent: %s", info.messageId)
    logWithTime("Preview URL: %s", nodemailer.getTestMessageUrl(info))
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

    const response = await custom_axios({
      method: 'post',
      url: url,
      data: formData,
      headers: formData.getHeaders()
    })

    logWithTime(response.data)
    return true
  } catch (error) {
    console.error(error)
  }
}

async function sendTxtMsgToTelegram(message) {

  const apiToken = process.env.TELEGRAM_BOT_TOKEN
  const GROUP_ID = process.env.GROUP_ID
  try {
    await custom_axios({
      method: 'post',
      url: `https://api.telegram.org/bot${apiToken}/sendMessage`,
      data: {
        chat_id: GROUP_ID,
        text: message
      }
    })
    logWithTime('Message sent successfully')
    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error.message)
    return false
  }

}

module.exports = { sendMail, sendTelegram, sendTxtMsgToTelegram }