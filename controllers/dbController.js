const HttpError = require('http-errors')
require('dotenv').config()
const dbRequests = require('../db/requests')
const { parse } = require('dotenv')
const sendReqToDB = require('../modules/tlg_to_DB')

async function getDataArray_(reqType, bot, msg, txtCommand = '') {
  const response = await sendReqToDB(reqType, '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR get data from billing`, { parse_mode: 'HTML' })
    return null
  } else {
    return response
  }
}

module.exports.dbUpdate = async function (request, reply) {

  try {
    const data = request.body
    const { order_id, status } = request.body
    let payment = null
    if (status === 'success') {
      payment = await dbRequests.updatePaymentStatus(order_id, status, data, new Date())
      await dbRequests.sendPaymentDataToClient(data, status)
    } else if (status === 'failure') {
      payment = await dbRequests.updatePaymentStatus(order_id, status, data, null, new Date())
    }
    console.log('Updated payment:', payment)
    await dbRequests.sendPaymentDataToClient(data, status)
    return payment
  } catch (err) {
    console.error('Error in dbUpdate:', err)
    return null
  }
}


module.exports.dbAddUser = async function (request, reply) {
  const { ip_address } = request.body

  try {
    jsonString = await getDataArray_('___SearchWebContract__', null, null, ip_address)
    if (jsonString !== null) {
      const data = JSON.parse(jsonString)
      const dataArray = data.ResponseArray
      let contract = null

      for (const item of dataArray) {
        console.log(item)
        contract = await dbRequests.getContractByIP(item.tg_id)
        console.log('getContractByIP', contract)
        if (contract === null) {
          const org = await dbRequests.getOrgByAbbreviation(item.abbreviation)
          const organization_id = org.id || 1
          const data = {
            organization_id: organization_id,
            contract_name: item.contract_name,
            payment_code: item.payment_code,
            tg_id: 0,
            ip: item.tg_id,
            payment_number: item.payment_number,
            phone_number: item.phone_number,
            email: item.email,
          }
          await dbRequests.createContract(organization_id, data)
          contract = await dbRequests.getContractByIP(data.ip)
        }
      }
      return contract
    }

  } catch (err) {
    console.error('Error in contactScene:', err)
  }

  return null
}