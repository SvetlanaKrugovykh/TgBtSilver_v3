const { TelegramClient, Api } = require('telegram')
const { StringSession } = require('telegram/sessions')
require('dotenv').config()
const sendReqToDB = require('../modules/tlg_to_DB')
const input = require('input')

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
    const stringSession = new StringSession('')

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


async function getContactDataFromTg(tgClient, phone_number) {
  try {
    const result = await tgClient.invoke(
      new Api.contacts.ResolvePhone({
        phone: phone_number,
      })
    );
    console.log('Result:', result);

    if (result.users.length === 0) {
      console.log('No users found');
      return null;
    }

    const user = result.users[0];
    return {
      id: user.id.value,
      first_name: user.firstName,
      last_name: user.lastName,
    };

  } catch (error) {
    console.error('Error in getContactDataFromTg:', error);
    return null;
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
    tgClient.connect()
    console.log('Connected to Telegram  server')

    for (const item of dataArray) {
      console.log(item)
      const searchInfo = await getContactDataFromTg(tgClient, item.phoneNumber)
      if (searchInfo === null) {
        console.log('No contact data found')
        continue
      }
      console.log('Contact data:', searchInfo)
      const user_data = {
        id: searchInfo.id,
        first_name: searchInfo.first_name,
        last_name: searchInfo.last_name,
        phone_number: item.phoneNumber,
        email: item.email,
        address: item.address,
        contract: item.contract,
        PIB: item.PIB,
        password: '',
      }

      const signUpRezult = await sendReqToDB('___UserRegistration__', user_data, searchInfo.id)
      console.log(signUpRezult)
      return
    }

  } catch (err) {
    console.error('Error in contactScene:', err)
  }
}

module.exports = contactScene
