const axios = require('axios')
const fs = require('fs')
const fsPromises = require('fs').promises
const { logWithTime } = require('../logger')
const { AUTH_TOKEN, URL } = process.env

async function getReceipt(telNumber, msg, bot, fileName) {
  try {
    const response = await axios({
      method: 'post',
      url: URL,
      timeout: 90000,
      responseType: 'stream',
      headers: {
        Authorization: `${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        Query: `Execute;GetReceipt;${telNumber};КОНЕЦ`,
      }
    })

    if (!response.status == 200) {
      logWithTime(response.status)
      return null
    } else {
      logWithTime('response.status', response.status)
      const TEMP_CATALOG = process.env.TEMP_CATALOG
      if (!fs.existsSync(TEMP_CATALOG)) fs.mkdirSync(TEMP_CATALOG, { recursive: true })
      let fileFullName = `${TEMP_CATALOG}__${msg.chat.id}__.pdf`
      if (!response.status == 200) {
        bot.sendMessage(msg.chat.id,
          `⛔️За номером ${telNumber} даних не існує.\nВи можете надіслати своє питання в службу технічної підтримки.\n`, { parse_mode: 'HTML' })
      } else {
        try {
          response.data.pipe(fs.createWriteStream(fileFullName))
          logWithTime(`File ${fileFullName} saved.`)

          bot.sendMessage(msg.chat.id, '🥎Рахунок отримано.\n', { parse_mode: 'HTML' })
          bot.sendMessage(msg.chat.id, '👋💙💛 Дякуємо за звернення.\n', { parse_mode: 'HTML' })
          setTimeout(function () {
            bot.sendDocument(msg.chat.id, fileFullName)
              .catch(function (error) {
                logWithTime(error)
              })
          }, 1111)
        } catch (err) {
          logWithTime(err)
          logWithTime('File not saved!!!')
        }
      }
    }
  } catch (err) {
    bot.sendMessage(msg.chat.id,
      `⛔️За номером ${telNumber} даних не існує.\nВи можете надіслати своє питання в службу технічної підтримки.\n`, { parse_mode: 'HTML' })
    return null
  }
}

async function getNagiosReport(bot, msg, typeCheck) {
  try {
    let method = 'GetNagiosReport'
    if (typeCheck === 'upDown') method = 'GetNagiosUpDownReport'
    const response = await axios({
      method: 'post',
      url: URL,
      timeout: 90000,
      responseType: 'stream',
      headers: {
        Authorization: `${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        Query: `Execute;{${method}};Nothing;КОНЕЦ`,
      }
    })

    if (response.status !== 200) {
      logWithTime(response.status)
      return null
    } else {
      logWithTime('response.status', response.status)
      const TEMP_CATALOG = process.env.TEMP_CATALOG
      if (!fs.existsSync(TEMP_CATALOG)) fs.mkdirSync(TEMP_CATALOG, { recursive: true })
      let fileFullName = `${TEMP_CATALOG}__${msg.chat.id}__.html`

      response.data.pipe(fs.createWriteStream(fileFullName))
        .on('finish', async () => {
          logWithTime(`File ${fileFullName} saved.`)
          try {
            await fsPromises.access(fileFullName, fs.constants.R_OK)
            await bot.sendDocument(msg.chat.id, fileFullName)
          } catch (err) {
            console.error('Error accessing file:', err)
            await bot.sendMessage(msg.chat.id, '⛔️ Error sending the document.')
          }
        })
        .on('error', (err) => {
          console.error('Error writing file:', err)
          bot.sendMessage(msg.chat.id, '⛔️ Error saving the document.')
        })
    }
  } catch (err) {
    bot.sendMessage(msg.chat.id, `⛔️ Trouble...\n`, { parse_mode: 'HTML' })
    return null
  }
}

module.exports = { getReceipt, getNagiosReport }
