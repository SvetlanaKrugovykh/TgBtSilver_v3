const HttpError = require('http-errors')

module.exports = function (request, _reply, done) {

  if (request.body.liqpay_order_id) {
    done()
    return
  }

  if (!request.body.data || !request.body.signature) {
    throw new HttpError.Unauthorized('Authorization required')
  }

  done()
}
