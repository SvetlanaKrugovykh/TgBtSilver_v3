const { execPgQuery } = require('../db/common')
const sendReqToDB = require('../modules/tlg_to_DB')

async function insertOrganization(data) {
  const query = `
    INSERT INTO organizations (organization_name, organization_code , organization_abbreviation )
    VALUES ($1, $2, $3)
    RETURNING id
  `
  const values = [data.organization_name, data.organization_code, data.organization_abbreviation]
  return execPgQuery(query, values)
}

async function insertContract(organization_id, data) {
  const query = `
    INSERT INTO contracts (organization_id, contract_name, payment_code, payment_number, phone_number, email, tg_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `
  const values = [organization_id, data.contract_name, data.payment_code, data.payment_number, data.phone_number, data.email, data.tg_id]
  return execPgQuery(query, values)
}

async function insertPayment(contractId, organizationId, amount, currency, description, orderId) {
  const query = `
    INSERT INTO payments (contract_id, organization_id, amount, currency, description, order_id, pay_status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING id
  `
  const values = [contractId, organizationId, amount, currency, description, orderId]
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
    transaction_id = null
  } = paymentData

  const query = `
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
    WHERE order_id = $19
    RETURNING id
  `

  const values = [
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
    JSON.stringify(paymentData),
    order_id
  ]

  try {
    const result = await execPgQuery(query, values)
    console.log('Update result:', result)
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

module.exports.getOrgByAbbreviation = async function (abbreviation) {
  const query = `
    SELECT *
    FROM organizations
    WHERE organization_abbreviation = $1
  `
  const values = [abbreviation]
  return execPgQuery(query, values)
}

module.exports.getContractByTgID = async function (TgID) {
  const query = `
    SELECT contracts.*, organizations.organization_abbreviation
    FROM contracts
    JOIN organizations ON contracts.organization_id = organizations.id
    WHERE contracts.tg_id = $1
  `
  const values = [TgID]
  return execPgQuery(query, values)
}

module.exports.getPaymentByOrderId = async function (orderId) {
  const query = `
    SELECT *
    FROM payments
    WHERE order_id = $1
  `
  const values = [orderId]
  return execPgQuery(query, values)
}

module.exports.createOrganization = async function (data) {
  const organization = await insertOrganization(data)
  console.log('Created organization:', organization)
}

module.exports.createContract = async function (organization_id, data) {
  const contract = await insertContract(organization_id, data)
  console.log('Created organization and contract:', organization_id, contract)
}

module.exports.createPayment = async function (contractId, organizationId, amount, currency, description, orderId) {
  const payment = await insertPayment(contractId, organizationId, amount, currency, description, orderId)
  console.log('Created payment:', payment)
}

module.exports.updatePayment = async function (paymentData) {
  const { order_id, status } = paymentData

  let payment = null
  if (status === 'success') {
    payment = await updatePaymentStatus(order_id, status, paymentData, new Date())
    await sendPaymentDataToClient(paymentData, status)
  } else if (status === 'failure') {
    payment = updatePaymentStatus(order_id, status, paymentData, null, new Date())
  }
  console.log('Updated payment:', payment)
  await sendPaymentDataToClient(paymentData, status)
  return payment
}

