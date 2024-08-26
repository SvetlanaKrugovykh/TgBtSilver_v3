const { execPgQuery } = require('./db/common')

async function insertOrganization(organizationName) {
  const query = `
    INSERT INTO organizations (organization_name)
    VALUES ($1)
    RETURNING id
  `
  const values = [organizationName]
  return execPgQuery(query, values)
}

async function insertContract(organizationId, contractName, paymentCode, paymentNumber, phoneNumber, email) {
  const query = `
    INSERT INTO contracts (organization_id, contract_name, payment_code, payment_number, phone_number, email)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `
  const values = [organizationId, contractName, paymentCode, paymentNumber, phoneNumber, email]
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

async function getPaymentByOrderId(orderId) {
  const query = `
    SELECT *
    FROM payments
    WHERE order_id = $1
  `
  const values = [orderId]
  return execPgQuery(query, values)
}

async function createOrganization() {
  const organization = await insertOrganization('Company A')
  console.log('Created organization and contract:', organization, contract)
}

async function createContract() {
  const contract = await insertContract(organization.id, 'Contract A', 'PAY123', 456, '+380123456789', 'example@company.com')
  console.log('Created organization and contract:', organization, contract)
}

async function createPayment() {
  const payment = await insertPayment(1, 1, 1000.00, 'UAH', 'Payment for services', 'ORDER123')
  console.log('Created payment:', payment)
}

async function markPaymentAsSuccess() {
  const payment = await updatePaymentStatus('ORDER123', 'success', 'LiqPay response data', new Date())
  console.log('Updated payment status to success:', payment)
}

async function markPaymentAsFailure() {
  const payment = await updatePaymentStatus('ORDER123', 'failure', 'LiqPay response data', null, new Date())
  console.log('Updated payment status to failure:', payment)
}

module.exports = { insertOrganization, insertContract, insertPayment, updatePaymentStatus, getPaymentByOrderId, createOrganization, createContract, createPayment, markPaymentAsSuccess, markPaymentAsFailure }