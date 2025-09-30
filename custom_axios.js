const axios = require('axios')
const { logWithTime } = require('./logger')
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
  logWithTime(
    `[custom_axios] method=${config.method || 'get'} url=${config.url} localAddress=${config.localAddress}`
  )
  const result = await axios(config)
  let shortData = ''
  if (result && result.data) {
    if (typeof result.data === 'string') {
      shortData = result.data.slice(0, 200)
    } else if (typeof result.data === 'object') {
      shortData = JSON.stringify(result.data).slice(0, 200)
    }
  }
  logWithTime(
    `[custom_axios] status=${result.status} data=${shortData}`
  )
  return result
}

module.exports = custom_axios