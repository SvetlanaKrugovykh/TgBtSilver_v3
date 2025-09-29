const { execPgQuery } = require('../db/common')
const sendReqToDB = require('../modules/tlg_to_DB')
const { logWithTime } = require('../logger')

async function insertOrganization(data) {
  const query = `
    INSERT INTO organizations (organization_name, organization_code, organization_abbreviation)
    VALUES ($1, $2, $3)
    RETURNING id
  `
  const values = [data.organization_name, data.organization_code, data.organization_abbreviation]
  return execPgQuery(query, values)
}

async function insertContract(organization_id, data) {
  const ip = data?.ip || ''
  const query = `
    INSERT INTO contracts (organization_id, contract_name, payment_code, payment_number, phone_number, email, tg_id, ip)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `
  const values = [organization_id, data.contract_name, data.payment_code, data.payment_number, data.phone_number, data.email, data.tg_id, ip]
  return execPgQuery(query, values)
}

async function insertPayment(contractId, organizationId, amount, currency, description, order_id) {
  const query = `
    INSERT INTO payments (contract_id, organization_id, amount, currency, description, order_id, pay_status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING id
  `

  const cleanedDescription = description.replace(/^"|"$/g, '')
  const values = [contractId, organizationId, amount, currency, cleanedDescription, order_id]
  return execPgQuery(query, values)
}

async function updatePaymentStatus(order_id, status, paymentData, successTime = null, failureTime = null) {
  const {
    payment_id = null,
    liqpay_order_id = null,
    paytype = null,
    sender_card_mask2 = null,
    sender_card_bank = null,
    sender_card_type = null,
    sender_card_country = null,
    ip = null,
    sender_first_name = null,
    sender_last_name = null,
    receiver_commission = 0,
    sender_commission = 0,
    is_3ds = false,
    transaction_id = null,
    description,
    amount,
  } = paymentData

  const cleanedDescription = description.replace(/^"|"$/g, '')

  let query = ` SELECT *
    FROM payments
    WHERE description LIKE $1
    AND amount = $2
    AND pay_status = 'pending'
  `
  let values = [cleanedDescription, amount]
  let payment = await execPgQuery(query, values)
  if (!payment) {
    console.error('!!!!! Payment not found:', paymentData)
    return null
  }

  query = `
    UPDATE payments
    SET pay_status = $1,
        pay_success_time = $2,
        pay_failure_time = $3,
        updated_at = CURRENT_TIMESTAMP,
        payment_id = $4,
        liqpay_order_id = $5,
        paytype = $6,
        sender_card_mask2 = $7,
        sender_card_bank = $8,
        sender_card_type = $9,
        sender_card_country = $10,
        ip = $11,
        sender_first_name = $12,
        sender_last_name = $13,
        receiver_commission = $14,
        sender_commission = $15,
        is_3ds = $16,
        transaction_id = $17,
        pay_data = $18
    WHERE id = $19
    RETURNING id
  `
  const payData = {
    payment_id,
    liqpay_order_id,
    paytype,
    sender_card_mask2,
    sender_card_bank,
    sender_card_type,
    sender_card_country,
    ip,
    sender_first_name,
    sender_last_name,
    receiver_commission,
    sender_commission,
    is_3ds,
    transaction_id
  }

  values = [
    status,
    successTime,
    failureTime,
    payment_id,
    liqpay_order_id,
    paytype,
    sender_card_mask2,
    sender_card_bank,
    sender_card_type,
    sender_card_country,
    ip,
    sender_first_name,
    sender_last_name,
    parseFloat(receiver_commission),
    parseFloat(sender_commission),
    Boolean(is_3ds),
    transaction_id,
    JSON.stringify(payData),
    payment.id
  ]

  try {
    const result = await execPgQuery(query, values)
    logWithTime('Update result:', result)
    return result
  } catch (error) {
    console.error('Error updating payment status:', error)
    return null
  }
}

async function sendPaymentDataToClient(paymentData, status) {
  const response = await sendReqToDB('___SendPaymentData__', paymentData, status)
  if (response === null) {
    return null
  } else {
    return response
  }
}

async function getOrgByAbbreviation(abbreviation) {
  const query = `
    SELECT *
    FROM organizations
    WHERE organization_abbreviation = $1
  `
  const values = [abbreviation]
  return execPgQuery(query, values)
}

async function getLastNContracts(n) {
  const query = `
    SELECT c.*, o.organization_abbreviation
    FROM contracts c
    JOIN organizations o ON c.organization_id = o.id
    ORDER BY c.created_at DESC
    LIMIT $1
  `
  const values = [n]
  return execPgQuery(query, values, false, true)
}

async function getLastNPayments(n) {
  const query = `
    SELECT *
    FROM payments
    ORDER BY created_at DESC
    LIMIT $1
  `;
  const values = [n]
  return execPgQuery(query, values, false, true)
}



async function getContractByTgID(TgID) {
  const query = `
    SELECT contracts.*, organizations.organization_abbreviation
    FROM contracts
    JOIN organizations ON contracts.organization_id = organizations.id
    WHERE contracts.tg_id = $1
  `
  const values = [TgID]
  return execPgQuery(query, values)
}

async function getContractByIP(IP) {
  const query = `
    SELECT contracts.*, organizations.organization_abbreviation
    FROM contracts
    JOIN organizations ON contracts.organization_id = organizations.id
    WHERE contracts.ip = $1
  `
  const values = [IP]
  return execPgQuery(query, values)
}

async function getPaymentByOrderId(order_id) {
  const query = `
    SELECT *
    FROM payments
    WHERE order_id = $1
  `
  const values = [order_id]
  return execPgQuery(query, values)
}

async function createOrganization(data) {
  const organization = await insertOrganization(data)
  logWithTime('Created organization:', organization)
  return organization
}

async function createContract(organization_id, data) {
  const contract = await insertContract(organization_id, data)
  logWithTime('Created organization and contract:', organization_id, contract)
  return contract
}


async function createPayment(contractId, organizationId, amount, currency, description, order_id) {
  const cleanedDescription = description.replace(/^"|"$/g, '')
  const payment = await insertPayment(contractId, organizationId, amount, currency, cleanedDescription, order_id)
  logWithTime('Created payment:', payment)
  return payment
}

async function updateContract(contract_id, data) {
  const query = `
    UPDATE contracts
    SET contract_name = $1,
        payment_code = $2,
        tg_id = $3,
        payment_number = $4,
        phone_number = $5,
        email = $6
    WHERE id = $7
    RETURNING id
  `
  const values = [data.contract_name, data.payment_code, data.tg_id, data.payment_number, data.phone_number, data.email, contract_id]
  return execPgQuery(query, values)
}

async function updatePayment(paymentData) {
  const { order_id, status } = paymentData

  let payment = null
  if (status === 'success') {
    payment = await updatePaymentStatus(order_id, status, paymentData, new Date())
    await sendPaymentDataToClient(paymentData, status)
  } else if (status === 'failure') {
    payment = await updatePaymentStatus(order_id, status, paymentData, null, new Date())
  }
  logWithTime('Updated payment:', payment)
  await sendPaymentDataToClient(paymentData, status)
  return payment
}

module.exports = {
  insertOrganization,
  insertContract,
  insertPayment,
  updatePaymentStatus,
  sendPaymentDataToClient,
  getOrgByAbbreviation,
  getContractByTgID,
  getContractByIP,
  getPaymentByOrderId,
  createOrganization,
  createContract,
  createPayment,
  updatePayment,
  getLastNContracts,
  getLastNPayments,
  updateContract
}