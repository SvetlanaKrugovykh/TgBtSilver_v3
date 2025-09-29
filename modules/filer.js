const fs = require('fs')
const { logWithTime } = require('../logger')

const fname = () => {
  return '..\logs\\' + Date.now.toISOString()
}

fs.readFile(fname, (err, data) => {
  if (err) {
    logWithTime(err)
    return
  }
  logWithTime(data.toString())
})

fs.writeFile(fname, 'username=Max', err => {
  if (err) {
    logWithTime(err)
  } else {
    logWithTime('Wrote to file!')
  }
})
