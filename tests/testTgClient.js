const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
require('dotenv').config()
const input = require('input')
const sendReqToDB = require('../modules/tlg_to_DB')

const apiId = Number(process.env.TG_API_ID)
const apiHash = process.env.TG_API_HASH
const phoneNumber = process.env.TG_NUMBER
const tg_passwd = process.env.TG_PASSWD
const stringSession = new StringSession('')

async function getArrayForSearchTelegramAccounts(txtCommand = '') {
  const response = await sendReqToDB('___SearchTelegramAccounts__', '', txtCommand)
  if (response === null) {
    return null
  } else {
    return response
  }
}

async function getContactDataFromTg(client, phone_number) {
  try {
    const contacts = await client.getContacts()

    const contact = contacts.find(c => c.phone === phone_number)
    if (contact) {
      return {
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
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


async function startTelegramClient() {
  try {
    const jsonString = await getArrayForSearchTelegramAccounts()
    if (jsonString === null) {
      return
    }
    const data = JSON.parse(jsonString)
    const dataArray = data.ResponseArray



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

    for (const item of dataArray) {
      console.log(item)
      const phone_number = item.phone_number
      const searchInfo = await getContactDataFromTg(client, phone_number)
      if (searchInfo === null) {
        console.log('No contact data found')
        continue
      }
      console.log(searchInfo)
      return
    }


  } catch (error) {
    console.error('Failed to start Telegram client:', error.message)
  }
}

startTelegramClient()
