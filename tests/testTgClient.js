const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const { Api } = require('telegram/tl')
require('dotenv').config()
const input = require('input')

const apiId = Number(process.env.TG_API_ID)
const apiHash = process.env.TG_API_HASH
const phoneNumber = process.env.TG_NUMBER
const tg_passwd = process.env.TG_PASSWD
const stringSession = new StringSession('')

const phoneNumbers = [
  phoneNumber,
]

async function startTelegramClient() {
  try {
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

    const contacts = phoneNumbers.map(number => ({ phone: number }))
    const result = await client.invoke(new Api.contacts.ImportContacts({
      contacts: contacts.map(c => ({ phone: c.phone, firstName: '', lastName: '' }))
    }))

    console.log('Contacts import result:', result)

    const users = result.users
    users.forEach(user => {
      console.log(`User ID: ${user.id}, First Name: ${user.firstName}, Last Name: ${user.lastName}`)
    })

  } catch (error) {
    console.error('Failed to start Telegram client:', error.message)
  }
}

startTelegramClient()
