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
    INSERT INTO payments (contract_id, organization_id, amount, currency, description, order_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `
  const values = [contractId, organizationId, amount, currency, description, orderId]
  return execPgQuery(query, values)
}

async function updatePaymentStatus(orderId, status, liqpayData, successTime = null, failureTime = null) {
  const query = `
    UPDATE payments
    SET liqpay_status = $1,
        liqpay_data = $2,
        liqpay_success_time = $3,
        liqpay_failure_time = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = $5
    RETURNING id
  `
  const values = [status, liqpayData, successTime, failureTime, orderId]
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
    SELECT *
    FROM contracts
    WHERE tg_id = $1
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

module.exports.createPayment = async function () {
  const payment = await insertPayment(1, 1, 1000.00, 'UAH', 'Payment for services', 'ORDER123')
  console.log('Created payment:', payment)
}

module.exports.markPaymentAsSuccess = async function () {
  const payment = await updatePaymentStatus('ORDER123', 'success', 'LiqPay response data', new Date())
  console.log('Updated payment status to success:', payment)
}

module.exports.markPaymentAsFailure = async function () {
  const payment = await updatePaymentStatus('ORDER123', 'failure', 'LiqPay response data', null, new Date())
  console.log('Updated payment status to failure:', payment)
}

