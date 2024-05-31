const fs = require('fs')
const path = require('path')
const HttpError = require('http-errors')
const telnetCall = require('../modules/telnet')
const { TelnetParams } = require('../data/telnet.model')
require('dotenv').config()

const TEMP_CATALOG = process.env.TEMP_CATALOG || path.join(__dirname, '..', '..', 'temp')

module.exports.getDataFromDevice = async function (request, reply) {
  const { reqType, device_ip, epon_id } = request.body

  const Params = new TelnetParams()
  let answer = null

  if (device_ip.length < 12 || Params.excludeHOSTS.includes(device_ip)) {
    return null
  }
  if (epon_id.length > 5) {
    console.log(`Admin request for the check ${reqType} on ${device_ip} for ${epon_id}`)
    await telnetCall(device_ip, epon_id, reqType)
      .then(store => {
        console.dir(store)
        answer = store
      })
      .catch(err => {
        console.log(err)
        throw new HttpError(500, err)
      })
    return { answer }
  }

}