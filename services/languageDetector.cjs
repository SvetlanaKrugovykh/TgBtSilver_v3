const supportedDirections = [
  "en_es",
  "en_fr",
  "en_ru",
  "en_uk",
  "en_de",
  "de_en",
  "es_en",
  "fr_en",
  "pl_en",
  "ru_en",
  "uk_en"
]

async function detectLanguage(transcription) {
  const { franc } = await import('franc')
  let direction = 'en-ru'
  const langCode = franc(transcription)

  if (langCode) {
    if (langCode === 'pol') {
      direction = 'pl_en'
    } else if (langCode === 'eng') {
      direction = 'en_uk'
    } else {
      direction = langCode.substring(0, 2) + '_en';
    }
  }
  if (!supportedDirections.includes(direction))
    direction = process.env.DIRECTION;

  console.log(`Language code : ${langCode} Direction : ${direction}`)
  return direction
}

module.exports = { detectLanguage }