const HttpError = require('http-errors')
require('dotenv').config()
const dbRequests = require('../db/requests')
const { parse } = require('dotenv')


module.exports.dbUpdate = async function (request, reply) {

  const { data } = request.body
  const { paymentData } = data

  const { order_id, status } = paymentData

  let payment = null
  if (status === 'success') {
    payment = await dbRequests.updatePaymentStatus(order_id, status, paymentData, new Date())
    await dbRequests.sendPaymentDataToClient(paymentData, status)
  } else if (status === 'failure') {
    payment = dbRequests.updatePaymentStatus(order_id, status, paymentData, null, new Date())
  }
  console.log('Updated payment:', payment)
  await dbRequests.sendPaymentDataToClient(paymentData, status)
  return payment

}