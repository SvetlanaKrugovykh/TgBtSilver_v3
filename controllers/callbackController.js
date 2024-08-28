const HttpError = require('http-errors')
const crypto = require('crypto')
const dbRequests = require('../db/requests')
const getLiqpayKeys = require('../globalBuffer').getLiqpayKeys

module.exports.getCallback = function (abbreviation) {
  return async function (request, _reply) {
    try {
      const { data, signature } = request.body

      const liqpayKeys = getLiqpayKeys(abbreviation)
      if (!liqpayKeys) {
        console.log(`No LiqPay keys found for abbreviation: ${abbreviation}`)
        return null
      }

      const { publicKey, privateKey } = liqpayKeys

      console.log(`LiqPay Public Key: ${publicKey}`)
      const calculatedSignature = crypto.createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64')

      if (signature !== calculatedSignature) {
        return res.status(400).send('Invalid signature')
      }

      const paymentData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'))
      console.log(paymentData)

      const payment = await dbRequests.updatePayment(paymentData)
      console.log(payment)

      res.status(200).send('OK')

    } catch (error) {
      throw new HttpError[500](error.message)
    }
  }
}