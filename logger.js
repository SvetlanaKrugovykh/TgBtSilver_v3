function logWithTime(...args) {
  const now = new Date();
  const timeStr = now.toLocaleString('ru-RU', { hour12: false }).replace(',', '')
  console.log(`[${timeStr}]`, ...args)
}
module.exports = { logWithTime }