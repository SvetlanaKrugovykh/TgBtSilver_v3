const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
require('dotenv').config()
const inputLineScene = require('./inputLine')

const apiId = Number(process.env.TG_API_ID)
const apiHash = process.env.TG_API_HASH
const stringSession = new StringSession('')


async function startTgClient(bot, msg) {
  try {
    const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 })

    await bot.sendMessage(msg.chat.id,
      'Введіть отриманий код підтвердження',
      { parse_mode: 'HTML' })

    const inputLine = await inputLineScene(bot, msg)
    console.log('Input code:', inputLine)
    if (!inputLine || isNaN(inputLine)) {
      throw new Error('Received code is empty or not a number')
    }

    console.log('Parsed code:', inputLine)

    await client.start({
      phoneNumber: process.env.TG_NUMBER,
      phoneCode: async () => inputLine,
      onError: (err) => console.log(err),
    })

    console.log('Session string:', client.session.save())
    return client
  } catch (err) {
    console.error('Error in startTgClient:', err.message)
  }
}


// async function getContacts(phone_number) {
//   const result = await client.invoke({
//     _: 'contacts.importContacts',
//     contacts: [
//       { _: 'inputPhoneContact', client_id: 0, phone: phone_number }     //, first_name: 'Имя', last_name: 'Фамилия' }
//     ],
//   })

//   console.log(result)
//   return result
// }

// const userId = result.users[0].id
// await client.sendMessage(userId, { message: 'Ваше сообщение' })

// console.log('Сообщение отправлено')


async function contactScene(bot, msg) {
  try {
    const chatId = msg.chat.id
    const tgClient = await startTgClient(bot, msg)

    const abonent_phone_number = msg.text
    // const abonent = await getContacts(tgClient, abonent_phone_number)
    // console.log(abonent)
    // await bot.sendMessage(chatId, "🎙️ <i> Залиште голосове повідомлення для служби технічної підтримки.\n Прохання вказати номер телефону та як нам зручніше з Вами зв'язатись</i>", { parse_mode: "HTML" })
    // await bot.sendMessage(chatId, "🎙️ ")

  } catch (err) {
    console.error('Error in speechScene:', err)
    // await bot.sendMessage(chatId, 'Сталася помилка при записі вашого голосового повідомлення. Спробуйте ще раз.')
  }
}

module.exports = contactScene
