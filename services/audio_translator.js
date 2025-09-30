// src/services/audio_translator.js
const axios = require('axios')
const fs = require('fs')
const { logWithTime } = require('../logger')
require('dotenv').config()

module.exports.translateText = async function (transcription, direction = 'en-ru') {
  try {
    const startTime = Date.now()
    const translatorUrl = process.env.TRANSLATOR_URL
    const serviceId = process.env.SERVICE_TRANSLATE_ID
    const clientId = process.env.CLIENT_ID
    const email = process.env.EMAIL
    const authorization = process.env.AUTHORIZATION_TRANSLATE

    const data = {
      serviceId,
      clientId,
      email,
      direction,
      text: transcription,
      token: authorization
    }
    const headers = {}
    headers['Content-Type'] = 'application/json'
    headers['Authorization'] = authorization

    const response = await axios.post(translatorUrl, data, { headers, localAddress: process.env.SOURCE_AXIOS_IP })

    const elapsedTime = (Date.now() - startTime) / 1000
    logWithTime(`Elapsed Time: ${elapsedTime}`)

    if (response.status !== 200) {
      logWithTime(`Status Code: ${response.status}`)
    } else {
      const responseData = response.data
      const translatedText = responseData.replyData?.translated_text?.[0] || ''
      return translatedText
    }
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
}

