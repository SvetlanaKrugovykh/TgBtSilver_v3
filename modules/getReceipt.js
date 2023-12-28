const axios = require('axios')
const fs = require('fs')
const { AUTH_TOKEN, URL } = process.env

async function getReceipt(telNumber, msg, bot, fileName) {
  try {
    const response = await axios({
      method: 'post',
      url: URL,
      responseType: 'stream',
      headers: {
        Authorization: `${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        Query: `Execute;GetReceipt;${telNumber};КОНЕЦ`,
      },
    })
    if (!response.status == 200) {
      console.log(response.status)
      return null
    } else {
      console.log('response.status', response.status)
      const TEMP_CATALOG = process.env.TEMP_CATALOG
      if (!fs.existsSync(TEMP_CATALOG)) fs.mkdirSync(TEMP_CATALOG, { recursive: true })
      let fileFullName = `${TEMP_CATALOG}__${msg.chat.id}__.pdf`
      if (!response.status == 200) {
        bot.sendMessage(msg.chat.id,
          `⛔️За номером ${telNumber} даних не існує.\nВи можете надіслати своє питання в службу технічної підтримки.\n`, { parse_mode: 'HTML' })
      } else {
        try {
          response.data.pipe(fs.createWriteStream(fileFullName))
          console.log(`File ${fileFullName} saved.`)
          fileName[msg.chat.id] = fileFullName

          bot.sendMessage(msg.chat.id, '🥎Рахунок отримано.\n', { parse_mode: 'HTML' })
          bot.sendMessage(msg.chat.id, '👋💙💛 Дякуємо за звернення.\n', { parse_mode: 'HTML' })
          setTimeout(function () {
            bot.sendDocument(msg.chat.id, fileFullName)
              .catch(function (error) {
                console.log(error);
              })
          }, 1111)
        } catch (err) {
          console.log(err)
          console.log('File not saved!!!')
        }
      }
    }
  } catch (err) {
    bot.sendMessage(msg.chat.id,
      `⛔️За номером ${telNumber} даних не існує.\nВи можете надіслати своє питання в службу технічної підтримки.\n`, { parse_mode: 'HTML' })
    return null
  }
}

module.exports = { getReceipt }
