const sendReqToDB = require('../modules/tlg_to_DB')
const dbRequests = require('../db/requests')

async function getDataArray(reqType, bot, msg, txtCommand = '') {
  const response = await sendReqToDB(reqType, '', txtCommand)
  if (response === null) {
    await bot.sendMessage(msg.chat.id, `⛔️ ERROR get data from billing`, { parse_mode: 'HTML' })
    return null
  } else {
    return response
  }
}

async function dbScene(bot, msg) {
  try {
    let jsonString = await getDataArray('___SearchOrganizations__', bot, msg)
    if (jsonString !== null) {
      const data = JSON.parse(jsonString)
      const dataArray = data.ResponseArray

      for (const item of dataArray) {
        console.log(item)
        const org = await dbRequests.getOrgByAbbreviation(item.abbreviation)
        console.log(org)
        if (org === null) {
          const data = {
            organization_name: item.name,
            organization_abbreviation: item.abbreviation,
            organization_code: item.code,
          }
          await dbRequests.createOrganization(data)
        }

      }
    }

    jsonString = await getDataArray('___SearchTgContracts__', bot, msg)
    if (jsonString !== null) {
      const data = JSON.parse(jsonString)
      const dataArray = data.ResponseArray

      for (const item of dataArray) {
        console.log(item)
        const contract = await dbRequests.getContractByTgID(item.tg_id)
        console.log(contract)
        if (contract === null) {
          const org = await dbRequests.getOrgByAbbreviation(item.abbreviation)
          const organization_id = org.id || 1
          const data = {
            organization_id: organization_id,
            contract_name: item.contract_name,
            payment_code: item.payment_code,
            tg_id: item.tg_id,
            payment_number: item.payment_number,
            phone_number: item.phone_number,
            email: item.email,
          }
          await dbRequests.createContract(organization_id, data)
        }
      }
    }


  } catch (err) {
    console.error('Error in contactScene:', err)
  }
}

module.exports = { dbScene }