const HttpError = require('http-errors')
require('dotenv').config()

module.exports.getCallback = async function (request, reply) {
  const { amount, currency, description } = request.body

  const data = Buffer.from(JSON.stringify({
    version: '3',
    public_key: process.env.LIQPAY_PUBLIC_KEY,
    action: 'pay',
    amount: amount,
    currency: currency,
    description: description,
    order_id: `order_${Date.now()}`,
    server_url: `${process.env.WEB_APP_URL}/liqpay/callback`,
  })).toString('base64')

  const signature = crypto.createHash('sha1')
    .update(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY)
    .digest('base64')

  const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`

  res.json({ paymentLink })
}

