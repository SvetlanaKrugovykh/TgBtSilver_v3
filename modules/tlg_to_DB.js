const custom_axios = require('../custom_axios')
const { logWithTime } = require('../logger')
require('dotenv').config()
const URL = process.env.URL
const AUTH_TOKEN = process.env.AUTH_TOKEN

async function sendReqToDB(reqType, data, text) {

  let dataString = objToString(reqType, data, text)
  logWithTime(dataString);

  try {
    const response = await custom_axios({
      method: 'post',
      url: URL,
      responseType: 'string',
      timeout: 90000,
      headers: {
        Authorization: `${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        Query: `Execute;${reqType};${dataString};КОНЕЦ`,
      }
    })
    if (!response.status == 200) {
      logWithTime(response.status)
      return null
    } else {
      if (reqType === '__GetClientPersData__' || reqType === '__GetDeadIP__' || reqType === '___GetArpMac___') {
        return response.data
      } else {
        let answer = response.data.toString()
        logWithTime(answer.slice(0, 125) + '...')
        return answer;
      }
    }

  } catch (err) {
    if (err.response) {
      logWithTime(`HTTP Error: ${err.response.status} - ${err.response.statusText} | URL: ${err.config?.url}`)
    } else if (err.request) {
      logWithTime(`Network Error: No response received | URL: ${err.config?.url}`)
    } else {
      logWithTime(`Request Error: ${err.message}`)
    }
    return null
  }
}

function objToString(reqType, data, text) {

  switch (reqType) {
    case '__CheckTlgClient__':
      return (data.id + '#' + data.first_name + '#' + data.last_name + '#' + data.username)
    case '___UserRegistration__':
      return (text + '#' + data?.email + '#' + data?.phoneNumber + '#' + data?.password + '#' + data?.PIB + '#' + data?.contract + '#' + data?.address + '#' + text)
    case '___GetTgUserData__':
      return (text + '#' + data?.organization_id + '#' + data?.contract_name + '#' + data?.payment_code + '#' + data?.tg_id + '#' + data?.phone_number + '#' + data?.email + '#' + text)
    case '___SendPaymentData__':
      return (
        data.status + '#' +
        data.amount + '#' +
        data.currency + '#' +
        data.description + '#' +
        data.order_id + '#' +
        data.payment_id + '#' +
        data.create_date + '#' +
        data.liqpay_order_id + '#' +
        data.paytype + '#' +
        data.sender_card_mask2 + '#' +
        data.sender_card_bank + '#' +
        data.sender_card_type + '#' +
        data.sender_card_country + '#' +
        data.ip + '#' +
        data.sender_first_name + '#' +
        data.sender_last_name + '#' +
        data.receiver_commission + '#' +
        data.sender_commission + '#' +
        data.is_3ds + '#' +
        data.transaction_id + '#' +
        text
      )
    case '__GetClientsInfo__':
      return (text)
    case '__GetDeadIP__  ':
      return (text)
    case '___GetArpMac___':
      return (text)
    case '___SwitchRedirectedClientOn__':
      return (text)
    case '___noTelegram__':
      return (text)
    case '___SearchWebContract__':
      return (text)
    default:
      return (data.id + '#' + text)
  }
}

module.exports = sendReqToDB;