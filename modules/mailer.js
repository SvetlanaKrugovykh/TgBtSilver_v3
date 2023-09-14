const nodemailer = require('nodemailer')
const { MAILHOST, MAILPORT } = process.env

async function sendMail(message, filename) {

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
}

module.exports = { sendMail }