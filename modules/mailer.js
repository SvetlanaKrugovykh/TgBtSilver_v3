const nodemailer = require('nodemailer')
const custom_axios = require('../custom_axios')
const FormData = require('form-data')
const fs = require('fs')
const { logWithTime } = require('../logger')
require('dotenv').config()

const { MAILHOST, MAILPORT, MAIL_USER, MAIL_PASS } = process.env

async function sendMail(message, filename) {
  try {
    logWithTime(`sendMail called with filename: ${filename}`)
    logWithTime(`sendMail message.to: ${message.to}, message.from: ${message.from}`)
    
    if (!filename || !fs.existsSync(filename)) {
      logWithTime(`File not found or invalid: ${filename}`)
      return false
    }
    
    let transporter = nodemailer.createTransport({
      host: MAILHOST,
      port: Number(MAILPORT),
      secure: false,
      auth: MAIL_USER && MAIL_PASS ? {
        user: MAIL_USER,
        pass: MAIL_PASS
      } : undefined
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
    return true
  } catch (error) {
    logWithTime('Error sending email:', error.message)
    console.error(error)
    return false
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
    logWithTime('Error sending Telegram document:', error.message)
    console.error(error)
    return false
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