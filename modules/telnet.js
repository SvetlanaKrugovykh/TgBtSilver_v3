const net = require('net')
const PORT = 23 // Telnet port
const { TelnetParams } = require('../data/telnet.model')


async function telnetCall(HOST, replaceStr, _conditional = undefined) {
  return new Promise((resolve, reject) => {
    let store = []
    let authorized = false
    let i = 0
    let ArrayOfCommands = []
    let _replaceStr = replaceStr

    const Params = new TelnetParams()

    switch (_conditional) {
      case 'attenuation':
        ArrayOfCommands = Params.attenuationArray
        _replaceStr = replaceStr.toLowerCase()
        break
      case 'bandwidth':
        ArrayOfCommands = Params.bandwidthArray
        _replaceStr = 'downstream'
        break
      default:
        ArrayOfCommands = Params.cliArray
        break
    }
    ArrayOfCommands = ArrayOfCommands.map(element => {
      if (Params.searchStr && element.includes(Params.searchStr)) {
        return element.replace(new RegExp(Params.searchStr, 'g'), replaceStr)
      }
      return element
    })

    const client = new net.Socket()

    try {
      client.connect(PORT, HOST, () => {
        console.log('Connected to network device')
      })

      let buffer = ''

      client.on('data', (data) => {
        buffer += data.toString().trim()
        if (buffer.includes('Username:')) {
          client.write(Params.username)
        } else if (buffer.startsWith('Password:')) {
          client.write(Params.password)
          authorized = true
        } else {
          if (authorized && (buffer.length > 1)) {
            if (i === ArrayOfCommands.length) {
              if (buffer.includes(_replaceStr)) store.push(buffer)
              client.on('close', () => {
                console.log('Connection closed')
                resolve(store)
              })
            }
            if (buffer.includes(_replaceStr)) store.push(buffer)
            client.write(ArrayOfCommands[i] + '\n')
            i++
          }
        }

        buffer = ''
      })

    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = telnetCall

