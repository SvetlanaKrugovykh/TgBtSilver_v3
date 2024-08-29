const dbRequests = require('../db/requests')
const crypto = require('crypto')
const getLiqpayKeys = require('../globalBuffer').getLiqpayKeys


module.exports.formPaymentLink = async function (bot = null, chatId = null, abbreviation, contract, amount,) {

  const liqpayKeys = getLiqpayKeys(abbreviation)
  if (!liqpayKeys) {
    console.log(`No LiqPay keys found for abbreviation: ${abbreviation}`)
    if (bot && chatId)
      await bot.sendMessage(chatId, '⛔️ Сталася помилка при завантаженні ключів доступу до LiqPay. Скоріше за все договір для організації постачальника з  LiqPay ще на стадії узгодження, але скоро запрацює.', { parse_mode: "HTML" })
    return null
  }

  const { publicKey, privateKey } = liqpayKeys
  console.log(`LiqPay Public Key: ${publicKey}`)

  const currency = 'UAH'
  const description = `Оплата за послугу. Код оплати: ${contract.payment_code}. Сума оплати: ${amount} грн.`
  const callBackUrl = process.env.LIQPAY_CALLBACK_URL
  const URL_MDL = process.env.URL_MDL || ''
  const server_callback_url = `${callBackUrl}${URL_MDL}${abbreviation}/`
  console.log(`Payment Request: ${server_callback_url} | ${description} | ${amount} | ${currency}`)
  const data = Buffer.from(JSON.stringify({
    version: '3',
    public_key: publicKey,
    action: 'pay',
    amount: amount,
    currency: currency,
    description: description,
    order_id: `order_${Date.now()}`,
    server_url: server_callback_url,
  })).toString('base64')

  const signature = crypto.createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64')

  const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`
  console.log(paymentLink)

  const payment = await dbRequests.createPayment(contract.id, contract.organization_id, amount, currency, description, `order_${Date.now()}`)
  console.log(payment)

  return paymentLink

}