const axios = require(`axios`)
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
  console.log(dataString)

  try {
    const response = await axios({
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
      console.log(response.status)
      return null
    } else {
      let dataString = response.data
      let jsonObject = JSON.parse(dataString).ResponseArray
      return jsonObject
    }

  } catch (err) {
    console.log(err)
    return null
  }
}