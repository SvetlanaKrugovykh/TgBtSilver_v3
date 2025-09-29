const sendReqToDB = require('../modules/tlg_to_DB')
const dbRequests = require('../db/requests')
const { logWithTime } = require('../logger')

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
        logWithTime(item)
        const org = await dbRequests.getOrgByAbbreviation(item.abbreviation)
        logWithTime(org)
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
        logWithTime(item)
        const contract = await dbRequests.getContractByTgID(item.tg_id)
        logWithTime(contract)
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
        } else {
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
          await dbRequests.updateContract(contract.id, data)
        }
      }
    }


  } catch (err) {
    console.error('Error in contactScene:', err)
  }
}

async function dbShow(bot, msg) {
  try {
    const n = 5
    const contracts = await dbRequests.getLastNContracts(n)
    logWithTime(contracts)
    const payments = await dbRequests.getLastNPayments(n)
    logWithTime(payments)

    let formattedContracts
    if (contracts && contracts.length > 0) {
      formattedContracts = contracts.map(contract => {
        return `
        Contract ID: ${contract.id}
        Name: ${contract.contract_name}
        Organization: ${contract.organization_abbreviation}
        Payment Code: ${contract.payment_code}
        ip: ${contract.ip}
        tg_id: ${contract.tg_id}
        phone_number: ${contract.phone_number}
        email: ${contract.email}
        Created At: ${new Date(contract.created_at).toLocaleString()}
        Updated At: ${new Date(contract.updated_at).toLocaleString()}
      `
      }).join('\n\n')
    } else {
      formattedContracts = 'No contracts found.'
    }

    let formattedPayments
    if (payments && payments.length > 0) {
      formattedPayments = payments.map(payment => {
        return `
        Payment ID: ${payment.id}
        Amount: ${payment.amount}
        Status: ${payment.pay_status}
        Description: ${payment.description}
        ip: ${payment.ip}
        Created At: ${new Date(payment.created_at).toLocaleString()}
        Updated At: ${new Date(payment.updated_at).toLocaleString()}
      `
      }).join('\n\n')
    } else {
      formattedPayments = 'No payments found.'
    }

    await bot.sendMessage(msg.chat.id, `Last ${n} Contracts:\n${formattedContracts}`, { parse_mode: 'HTML' })
    await bot.sendMessage(msg.chat.id, `Last ${n} Payments:\n${formattedPayments}`, { parse_mode: 'HTML' })
  } catch (err) {
    console.error('Error in dbShow:', err)
  }
}


module.exports = { dbScene, dbShow }