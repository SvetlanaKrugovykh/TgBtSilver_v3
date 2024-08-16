// src/services/audio_sender.js

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')
require('dotenv').config()

module.exports.sendAudio = async function (filePath, segmentNumber) {
  const clientId = process.env.CLIENT_ID

  if (!clientId) {
    console.error("CLIENT_ID environment variable is not set")
    return 400
  }

  const data = new FormData()
  data.append('clientId', clientId)
  data.append('segment_number', segmentNumber.toString())

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  } else {
    data.append('file', fs.createReadStream(filePath), path.basename(filePath))
  }

  const headers = data.getHeaders()

  const AUTHORIZATION = process.env.AUTHORIZATION
  const serviceId = process.env.SERVICE_ID

  if (!AUTHORIZATION || !serviceId) {
    console.error("Missing environment variables for AUTHORIZATION or SERVICE_ID")
    return 400
  }

  data.append('serviceId', serviceId)
  data.append('token', AUTHORIZATION)
  headers['Authorization'] = AUTHORIZATION

  const serverUrl = process.env.SERVER_URL

  if (!serverUrl) {
    console.error("SERVER_URL environment variable is not set")
    return 400
  }

  try {
    const startTime = Date.now()
    const response = await axios.post(serverUrl, data, { headers })

    const elapsedTime = (Date.now() - startTime) / 1000

    if (response.status !== 200) {
      console.info(`Status Code: ${response.status}`)
    }

    const responseJson = response.data

    if (response.status === 200) {
      const DELETE_WAV_FILES = parseInt(process.env.DELETE_WAV_FILES, 10) || 0
      if (DELETE_WAV_FILES === 1) {
        try {
          fs.unlinkSync(filePath)
          console.log(`File ${filePath} deleted successfully.`)
        } catch (err) {
          console.error(`Error deleting file ${filePath}: ${err}`)
        }
      }
      console.log(`Segment ${segmentNumber} sent successfully in ${elapsedTime.toFixed(2)} seconds`)

      let translatedText
      translatedText = responseJson.replyData?.translated_text

      let transcription
      if (Array.isArray(translatedText)) {
        transcription = translatedText.find(text => text) || 'No transcription found'
      } else if (typeof translatedText === 'string') {
        transcription = translatedText
      } else {
        transcription = 'No transcription found'
      }

      console.info(`: ${transcription}`)
      return transcription

    } else {
      const errorMessage = responseJson.error || 'Unknown error'
      const reason = responseJson.reason || 'No reason provided'
      console.error(`Error: ${errorMessage}`)
      console.error(`Reason: ${reason}`)
    }
  } catch (error) {
    if (error.response) {
      console.error(`ClientError occurred: ${error.response.statusText}`)
    } else {
      console.error(`Unexpected error occurred: ${error.message}`)
    }
  }

  return response.status
}


