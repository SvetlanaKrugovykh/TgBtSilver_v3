const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
require('dotenv').config()
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

async function startTgClient(bot, msg) {
  try {
    const apiId = Number(process.env.TG_API_ID)
    const apiHash = process.env.TG_API_HASH
    const phoneNumber = process.env.TG_NUMBER
    const tg_passwd = process.env.TG_PASSWD

    if (!phoneNumber) {
      throw new Error('TG_NUMBER is not defined in environment variables')
    }

    console.log('Loading interactive example...')
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    })

    await client.start({
      phoneNumber: async () => phoneNumber,
      phoneCode: async () => await input.text('Please enter the code you received: '),
      password: async () => tg_passwd,
      onError: (err) => console.log('Error:', err.message),
    })

    console.log('You are now connected.')
    console.log('Your session string:', client.session.save())
    await client.sendMessage('me', { message: 'It works!' })
    await bot.sendMessage(msg.chat.id, 'Successfully authenticated!')
    return client

  } catch (err) {
    console.error('Error in startTgClient:', err.message)
    await bot.sendMessage(msg.chat.id, `Authentication failed: ${err.message}`)
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
      const phone_number = process.env.TG_NUMBER //item.phone_number
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
  }
}

module.exports = contactScene
