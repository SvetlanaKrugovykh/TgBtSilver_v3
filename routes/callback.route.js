const callbackController = require('../controllers/callbackController')
const isAuthorizedGuard = require('../guards/is-authorized.guard')
const dataExchangeSchema = require('../schemas/dataExchange.schema')
module.exports = (fastify, _opts, done) => {

  fastify.route({
    method: 'POST',
    url: '/kf/',
    handler: callbackController.getCallback('kf'),
    preHandler: [
      isAuthorizedGuard
    ],
    schema: dataExchangeSchema
  })

  fastify.route({
    method: 'POST',
    url: '/lev/',
    handler: callbackController.getCallback('lev'),
    preHandler: [
      isAuthorizedGuard
    ],
    schema: dataExchangeSchema
  })

  fastify.route({
    method: 'POST',
    url: '/pf/',
    handler: callbackController.getCallback('pf'),
    preHandler: [
      isAuthorizedGuard
    ],
    schema: dataExchangeSchema
  })

  fastify.route({
    method: 'POST',
    url: '/si/',
    handler: callbackController.getCallback('si'),
    preHandler: [
      isAuthorizedGuard
    ],
    schema: dataExchangeSchema
  })

  done()
}