const fp = require('fastify-plugin')
const ipRangeCheck = require('ip-range-check')
const authService = require('../services/authService')
const { logWithTime } = require('../logger')
require('dotenv').config()
const allowedIPAddresses = process.env.API_ALLOWED_IPS.split(',')
const allowedSubnets = process.env.API_ALLOWED_SUBNETS.split(',')

const logIPMessage = (clientIP, isAllowed) => {
  const currentDate = new Date()
  const message = `${currentDate}: ${isAllowed ? 'Allowed' : 'Forbidden'} IP: ${clientIP}`
  logWithTime(message)
}

const restrictIPMiddleware = (req, reply, done) => {
  const clientIP = req.ip

  if (req.url.includes('liqpay/callback')) {
    logIPMessage(`liqpay callback ${clientIP}`, true)
    done()
  } else if (!allowedIPAddresses.includes(clientIP) && !ipRangeCheck(clientIP, allowedSubnets)) {
    logIPMessage(clientIP, false)
    reply.code(403).send('Forbidden')
  } else {
    logIPMessage(clientIP, true)
    done()
  }
}


async function authPlugin(fastify, _ = {}) {
  fastify.decorateRequest('auth', null)
  fastify.addHook('onRequest', restrictIPMiddleware)
  fastify.addHook('onRequest', async (request, _) => {
    const { authorization } = request.headers
    request.auth = {
      token: null,
      clientId: null
    }
    if (authorization) {
      try {
        //const decoded = await authService.checkAccessToken(authorization)
        request.auth = {
          token: authorization,
          //clientId: decoded.clientId
        }
      } catch (e) {
        logWithTime(e)
      }
      const decodedToken = await authService.checkAccessToken(authorization)
      if (decodedToken) {
        logWithTime('decodedToken:', decodedToken)
      }
    }
  })
}

module.exports = fp(authPlugin)
