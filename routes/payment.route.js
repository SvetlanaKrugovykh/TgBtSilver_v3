const paymentController = require('../controllers/payment.controller')
const isAuthorizedGuard = require('../guards/is-authorized.guard')
const getPaymentLinkSchema = require('../schemas/dataExchange.schema')

module.exports = (fastify, _opts, done) => {

  fastify.route({
    method: 'POST',
    url: '/p-link/',
    handler: paymentController.getPaymentLink(),
    preHandler: [
      isAuthorizedGuard
    ],
    schema: getPaymentLinkSchema
  })

  done()
}