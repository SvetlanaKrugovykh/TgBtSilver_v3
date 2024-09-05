// server.js
require('dotenv').config()
const updateTables = require('./db/tablesUpdate').updateTables

try {
  updateTables()
} catch (err) {
  console.log(err)
}

const { app, app_api, app_db } = require('./index')
const HOST = process.env.HOST || '127.0.0.1'
const PORT = Number(process.env.PORT) || 7173
const API_PORT = Number(process.env.API_PORT) || 8009
const DB_PORT = Number(process.env.DB_PORT) || 8010
const DB_HOST = process.env.DB_HOST || '127.0.0.1'

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`server app started on ${address}`)
})

app_api.listen({ port: API_PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`server app_api started on ${address}`)
})

app_db.listen({ port: DB_PORT, host: DB_HOST }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`server app_api started on ${address}`)
})