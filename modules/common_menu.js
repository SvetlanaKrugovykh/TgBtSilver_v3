
const fs = require('fs')
const path = require('path')
const { globalBuffer } = require('../globalBuffer')
const sendReqToDB = require('../modules/tlg_to_DB')
const { respondToSelectedClient } = require('../modules/adminMessageHandler')
require('dotenv').config()

module.exports.notTextScene = async function (bot, msg, lang = "en", toSend = true, voice = false, toChatID = null) {
  const GROUP_ID = toChatID || process.env.GROUP_ID
  try {
    const chatId = msg.chat.id
    const collectedMessages = []

    const handleMessage = async (message) => {
      if (message.chat.id === chatId) {
        if (message.text) {
          collectedMessages.push({ type: 'text', content: message.text })
        } else if (message.photo) {
          const fileId = message.photo[message.photo.length - 1].file_id
          collectedMessages.push({ type: 'photo', fileId })
        } else if (message.document) {
          const fileId = message.document.file_id
          collectedMessages.push({ type: 'document', fileId })
        } else if (message.audio) {
          const fileId = message.audio.file_id
          collectedMessages.push({ type: 'audio', fileId })
        } else if (message.voice) {
          const fileId = message.voice.file_id
          collectedMessages.push({ type: 'voice', fileId })
        }
      }
    }

    bot.on('message', handleMessage)

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        bot.removeListener('message', handleMessage)
        resolve()
      }, 30000)

      bot.on('message', (message) => {
        if (message.chat.id === chatId) {
          clearTimeout(timeout)
          bot.removeListener('message', handleMessage)
          resolve()
        }
      })
    })

    for (const message of collectedMessages) {
      if (!toChatID) {
        if (!globalBuffer.msgQueue) globalBuffer.msgQueue = {}
        if (!globalBuffer.msgQueue[msg.chat.id]) globalBuffer.msgQueue[msg.chat.id] = []
      } else {
        respondToSelectedClient(bot, msg, toChatID)
      }

      if (message.type === 'text') {
        const replyFromDB = await sendReqToDB("__SaveTlgMsg__", msg.chat, message.content)
        let additionalInfo = ''
        try {
          const parsedReply = JSON.parse(replyFromDB)
          if (parsedReply.ResponseArray && Array.isArray(parsedReply.ResponseArray)) {
            const match = parsedReply.ResponseArray[0].match(/\(.*\)/)
            if (match) {
              additionalInfo = match[0]
            }
          }
        } catch (err) {
          console.error('Error parsing replyFromDB or extracting additional info:', err)
        }

        const fullContent = additionalInfo ? `${message.content} ${additionalInfo}` : message.content

        if (!toChatID) {
          globalBuffer.msgQueue[msg.chat.id].push({ type: 'text', content: fullContent })
          if (toSend) {
            await bot.sendMessage(
              GROUP_ID,
              `Message from ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):\n${fullContent}`,
              { parse_mode: "HTML" }
            )
          }
        } else {
          await bot.sendMessage(
            GROUP_ID,
            `Reply from admin group:\n${message.content}`,
            { parse_mode: "HTML" }
          )
        }
      } else {
        if (toSend) {
          const header = !toChatID
            ? `Message from ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):`
            : `Reply from admin group:\n`
          await bot.sendMessage(GROUP_ID, header, { parse_mode: "HTML" })
        }
        if (message.type === 'photo') {
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'photo', fileId: message.fileId })
          await bot.sendPhoto(GROUP_ID, message.fileId)
        } else if (message.type === 'document') {
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'document', fileId: message.fileId })
          await bot.sendDocument(GROUP_ID, message.fileId)
        } else if (message.type === 'audio') {
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'audio', fileId: message.fileId })
          await bot.sendAudio(GROUP_ID, message.fileId)
        } else if (message.type === 'voice') {
          const dirPath = process.env.TEMP_DOWNLOADS_CATALOG
          fs.mkdirSync(dirPath, { recursive: true })
          const filePath = path.join(dirPath, `${message.fileId}.ogg`)
          await downloadFile(bot, message.fileId, filePath)
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'voice', filePath })
          return filePath
        }
      }
    }

    if (toSend && !toChatID) {
      await bot.sendMessage(chatId, "Дякуємо! Ваше повідомлення відправлено.\n Очікуйте відповіді протягом 30 хвилин", { parse_mode: "HTML" })
    }
  } catch (err) {
    console.log(err)
    await bot.sendMessage(msg.chat.id, "Вибачте, сталася помилка під час відправлення файлу.")
  }
}
