const { globalBuffer } = require('../globalBuffer')
const { logWithTime } = require('../logger')

module.exports.handleAdminResponse = async function (bot, adminMsg) {
  try {
    const adminId = adminMsg.chat.id

    if (!globalBuffer.msgQueue || Object.keys(globalBuffer.msgQueue).length === 0) {
      await bot.sendMessage(adminId, 'The message queue is empty.')
      return
    }

    const clientIds = Object.keys(globalBuffer.msgQueue).slice(0, 10)
    const buttons = clientIds.map(chatId => [
      {
        text: `Client ID: ${chatId} (${globalBuffer.msgQueue[chatId].length} msgs) - ${globalBuffer.msgQueue[chatId][0]?.content || 'No content'}`,
        callback_data: `select_client_${chatId}`
      }
    ])

    const instructionText = `📋 *Support Response Process*\n\n` +
      `*Step 1:* Choose a clients message from the list below\n` +
      `*Step 2:* After selecting, type your response message\n Enter\n` 

    await bot.sendMessage(adminId, instructionText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    })
  } catch (error) {
    console.error('Error processing admin response:', error)
    await bot.sendMessage(adminMsg.chat.id, 'An error occurred while processing the response.')
  }
}

module.exports.respondToSelectedClient = async function (bot, adminMsg, targetChatId) {
  try {
    const adminId = adminMsg.chat.id

    if (!globalBuffer.msgQueue[targetChatId] || globalBuffer.msgQueue[targetChatId].length === 0) {
      await bot.sendMessage(adminId, 'The message queue for this client is empty.')
      return false
    }

    // Remove the message from queue
    const messageToRespond = globalBuffer.msgQueue[targetChatId].shift()
    
    if (globalBuffer.msgQueue[targetChatId].length === 0) {
      delete globalBuffer.msgQueue[targetChatId]
    }

    logWithTime(`Admin ${adminId} processing response to client ${targetChatId}`)
    return true
  } catch (error) {
    console.error('Error processing admin response:', error)
    await bot.sendMessage(adminMsg.chat.id, 'An error occurred while sending the response.')
    return false
  }
}

