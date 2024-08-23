const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
require('dotenv').config()
const inputLineScene = require('./inputLine')
const sendReqToDB = require('../modules/tlg_to_DB')

async function getArrayForSearchTelegramAccounts(bot, msg, txtCommand = '') {
  const response = await sendReqToDB('___SearchTelegramAccounts__', '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR get data from billing`, { parse_mode: 'HTML' })
    return null
  } else {
    return response
  }
}

async function getCodeFromUser(bot, msg) {
  await bot.sendMessage(msg.chat.id, 'Введіть отриманий код підтвердження', { parse_mode: 'HTML' })
  const inputLine = await inputLineScene(bot, msg)
  console.log('Input code:', inputLine)

  if (!inputLine || isNaN(Number(inputLine))) {
    throw new Error('Received code is empty or not a valid number')
  }

  console.log('Parsed code:', inputLine)
  return inputLine
}

async function handleAuthError(err, bot, msg, client) {
  if (err.code === 420) {
    console.error(`FloodWaitError: Please wait ${err.seconds} seconds before retrying.`)
    await bot.sendMessage(msg.chat.id, `Too many attempts. Please wait ${err.seconds} seconds before trying again.`)
  } else if (err.message.includes('PHONE_CODE_EXPIRED')) {
    console.error('Phone code expired, requesting a new code.')
    await bot.sendMessage(msg.chat.id, 'The phone code has expired. Requesting a new code...')
    await client.sendCode(process.env.TG_NUMBER)
  } else {
    console.error('Error during authentication:', err.message)
    await bot.sendMessage(msg.chat.id, `Error during authentication: ${err.message}`)
  }
}

async function startTgClient(bot, msg) {
  try {
    const apiId = Number(process.env.TG_API_ID)
    const apiHash = process.env.TG_API_HASH
    const phoneNumber = process.env.TG_NUMBER

    if (!phoneNumber) {
      throw new Error('TG_NUMBER is not defined in environment variables')
    }

    const client = new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 5 })

    try {
      await client.start({
        phoneNumber: phoneNumber,
        phoneCode: async () => {
          const code = await getCodeFromUser(bot, msg)
          console.log('Received and entered code:', code)
          return code
        },
        onError: (err) => {
          handleAuthError(err, bot, msg, client).catch(console.error)
        },
      })
      console.log('Session string:', client.session.save())

    } catch (err) {
      console.error('Error in startTgClient:', err.message)
      if (attempts < maxAttempts) {
        await bot.sendMessage(msg.chat.id, `Authentication failed. Please try again. Attempt ${attempts} of ${maxAttempts}`)
      } else {
        await bot.sendMessage(msg.chat.id, `Authentication failed after ${maxAttempts} attempts. Please try again later.`)
      }
    }

    if (loginSuccess) {
      return client
    } else {
      throw new Error('Failed to authenticate after several attempts')
    }

  } catch (err) {
    console.error('Error in startTgClient:', err.message)
    bot.sendMessage(msg.chat.id, `An error occurred: ${err.message}`)
  }
}

async function getContactDataFromTg(client, phone_number) {
  try {
    const resolveResult = await client.invoke({
      _: 'contacts.resolvePhone',
      phone: phone_number,
    })

    if (resolveResult && resolveResult.users && resolveResult.users.length > 0) {
      const resolvedUser = resolveResult.users[0]
      return {
        id: resolvedUser.id,
        first_name: resolvedUser.first_name,
        last_name: resolvedUser.last_name,
      }
    }

    const importResult = await client.invoke({
      _: 'contacts.importContacts',
      contacts: [
        {
          _: 'inputPhoneContact',
          client_id: 0,
          phone: phone_number,
          first_name: 'Imported',
          last_name: 'Contact',
        },
      ],
    })

    console.log('Import Result:', importResult)

    if (!importResult || !importResult.imported || importResult.imported.length === 0) {
      console.log('No contacts imported')
      return null
    }

    const importedUser = importResult.users[0]

    return {
      id: importedUser.id,
      first_name: importedUser.first_name,
      last_name: importedUser.last_name,
    }

  } catch (error) {
    console.error('Error in getContactDataFromTg:', error)
    return null
  }
}



async function contactScene(bot, msg) {
  try {
    const jsonString = await getArrayForSearchTelegramAccounts(bot, msg)
    if (jsonString === null) {
      return
    }

    const data = JSON.parse(jsonString)
    const dataArray = data.ResponseArray

    const tgClient = await startTgClient(bot, msg)

    for (const item of dataArray) {
      console.log(item)
      const phone_number = '+380674407252' //item.phone_number
      const searchInfo = await getContactDataFromTg(tgClient, phone_number)
      if (searchInfo === null) {
        console.log('No contact data found')
        continue
      }
      console.log(searchInfo)
      return
    }

  } catch (err) {
    console.error('Error in contactScene:', err)
    // await bot.sendMessage(chatId, 'Сталася помилка при записі вашого голосового повідомлення. Спробуйте ще раз.')
  }
}

module.exports = contactScene
