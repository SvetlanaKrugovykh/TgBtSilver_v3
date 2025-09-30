const custom_axios = require('../custom_axios')
const { logWithTime } = require('../logger')
const URL = process.env.URL
const AUTH_TOKEN = process.env.AUTH_TOKEN

module.exports.sendReqToDB = async function (reqType, text, employeesFIOArray) {

  let employeesString
  if (typeof employeesFIOArray !== 'undefined' && employeesFIOArray.length > 0) {
    employeesString = ';' + employeesFIOArray.join(';')
  } else {
    employeesString = ''
  }
  let dataString = text + employeesString
  logWithTime(dataString)

  try {
    const response = await custom_axios({
      method: 'post',
      url: URL,
      responseType: 'string',
      headers: {
        Authorization: `${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        Query: `ВЫПОЛНИТЬ;${reqType};${dataString};КОНЕЦ`,
      }
    })
    if (!response.status == 200) {
      logWithTime(response.status)
      return null
    } else {
      let dataString = response.data
      let jsonObject = JSON.parse(dataString).ResponseArray
      return jsonObject
    }

  } catch (err) {
    logWithTime(err)
    return null
  }
}