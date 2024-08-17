const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { detectLanguage } = require('../services/languageDetector.cjs')
const { sendAudio } = require('../services/audio_sender')
const { translateText } = require('../services/audio_translator')
require('dotenv').config()

async function handleVoiceMessage(bot, chatId, voiceMsg) {
  const TEMP_DIR = process.env.TEMP_CATALOG
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR)
  }

  if (voiceMsg.chat.id === chatId && voiceMsg.voice) {
    try {
      const fileId = voiceMsg.voice.file_id
      const file = await bot.getFile(fileId)
      const filePath = file.file_path
      const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`

      console.log(`Fetching file from URL: ${url}`)

      const tempFilePath = path.join(TEMP_DIR, `${chatId}_${Date.now()}.ogg`)

      const response = await axios.get(url, { responseType: 'arraybuffer' })

      if (response.status !== 200) {
        throw new Error(`Failed to fetch file from Telegram: ${response.statusText}`)
      }

      fs.writeFileSync(tempFilePath, response.data)
      console.log(`Voice message saved to ${tempFilePath}`)
      await bot.sendMessage(chatId, 'Ваше голосове повідомлення збережено.', { parse_mode: 'HTML' })
      const segmentNumber = Math.floor(Math.random() * 99) + 1
      const transcription = await sendAudio(tempFilePath, segmentNumber)
      await bot.sendMessage(chatId, `Ваш текст: ${transcription}.`, { parse_mode: 'HTML' })
      console.log(`Transcription: ${transcription}`)
      const direction = await detectLanguage(transcription)
      const LangBridgeTxt = await translateText(transcription, direction)
      await bot.sendMessage(chatId, `Ваш Переклад: ${LangBridgeTxt}.`, { parse_mode: 'HTML' })
      console.log(`Translated Text: ${LangBridgeTxt}`)

    } catch (error) {
      console.error('Error during voice message handling:', error)
      await bot.sendMessage(chatId, 'Сталася помилка при записі вашого голосового повідомлення. Спробуйте ще раз.')
    }
  }
}

module.exports = handleVoiceMessage