const { execPgQuery } = require('../db/common')

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

async function updatePaymentStatus(orderId, status, payData, successTime = null, failureTime = null) {
  const query = `
    UPDATE payments
    SET pay_status = $1,
        pay_data = $2,
        pay_success_time = $3,
        pay_failure_time = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = $5
    RETURNING id
  `
  const values = [status, payData, successTime, failureTime, orderId]
  return execPgQuery(query, values)
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
  const { orderId, status, liqpayData } = paymentData
  let payment = null
  if (status === 'success') {
    payment = await updatePaymentStatus(orderId, status, liqpayData, new Date())
  } else if (status === 'failure') {
    payment = updatePaymentStatus(orderId, status, liqpayData, null, new Date())
  }
  console.log('Updated payment:', payment)
  return payment
}

