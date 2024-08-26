const HttpError = require('http-errors')
require('dotenv').config()
const crypto = require('crypto')

module.exports.getCallback = function (organization) {
  return async function (request, reply) {
    const { amount, currency, description } = request.body

    const data = Buffer.from(JSON.stringify({
      version: '3',
      public_key: process.env[`LIQPAY_PUBLIC_KEY_${organization.toUpperCase()}`],
      action: 'pay',
      amount: amount,
      currency: currency,
      description: description,
      order_id: `order_${Date.now()}`,
      server_url: `${process.env.WEB_APP_URL}/liqpay/callback/${organization}`,
    })).toString('base64')

    const signature = crypto.createHash('sha1')
      .update(process.env[`LIQPAY_PRIVATE_KEY_${organization.toUpperCase()}`] + data + process.env[`LIQPAY_PRIVATE_KEY_${organization.toUpperCase()}`])
      .digest('base64')

    const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`

    reply.send({ paymentLink })
  }
}