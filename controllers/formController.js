const formService = require('../services/formService')
const { logWithTime } = require('../logger')

const handleFormSubmit = (req, res) => {
  try {
    const phone = req.body.phone
    const name = req.body.name

    logWithTime('Received Form Data:')
    logWithTime('Phone:', phone)
    logWithTime('Name:', name)

    formService.processFormData(phone, name)

    res.status(200).json({ message: 'Form data received successfully.' })
  } catch (error) {
    console.error('Error processing form data:', error.message)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

module.exports = {
  handleFormSubmit,
}
