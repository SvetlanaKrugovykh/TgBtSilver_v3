const axios = require('axios')
require('dotenv').config()

const SOURCE_AXIOS_IP = process.env.SOURCE_AXIOS_IP

let warmedUp = false
async function warmUpConnection(testUrl = 'https://google.com') {
  if (warmedUp) return
  try {
    await axios.get(testUrl, { localAddress: SOURCE_AXIOS_IP, timeout: 3000 })
    warmedUp = true
  } catch (err) {
  }
}

async function custom_axios(config) {
  await warmUpConnection()
  config.localAddress = config.localAddress || SOURCE_AXIOS_IP
  return axios(config)
}

module.exports = custom_axios