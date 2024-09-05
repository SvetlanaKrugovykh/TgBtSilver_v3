const dbController = require('../controllers/dbController')
const isDbAuthorizedGuard = require('../guards/is-db-authorized.guard')

module.exports = (fastify, _opts, done) => {
  fastify.route({
    method: 'POST',
    url: '/db-update/',
    handler: dbController.dbUpdate,
    preHandler: [
      isDbAuthorizedGuard
    ]
  })

  fastify.route({
    method: 'POST',
    url: '/db-add-user/',
    handler: dbController.dbAddUser,
    preHandler: [
      isDbAuthorizedGuard
    ]
  })


  done()
}