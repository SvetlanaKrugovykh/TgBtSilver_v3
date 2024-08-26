// server.js
require('dotenv').config()
const updateTables = require('./db/tablesUpdate').updateTables

updateTables()

const { app, app_api } = require('./index')
const HOST = process.env.HOST || '127.0.0.1'
const PORT = Number(process.env.PORT) || 7173
const API_PORT = Number(process.env.API_PORT) || 7172

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