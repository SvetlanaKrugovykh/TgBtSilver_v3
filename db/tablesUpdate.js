const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const pool = new Pool({
  user: process.env.PAY_DB_USER,
  host: process.env.PAY_DB_HOST,
  database: process.env.PAY_DB_NAME,
  password: process.env.PAY_DB_PASSWORD,
  port: process.env.PAY_DB_PORT,
})

const tableNames = ['payments', 'contracts', 'organizations'];

const tableQueries = {
  'payments': `
    CREATE TABLE payments (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2),
      currency VARCHAR(3) DEFAULT 'UAH',
      description TEXT,
      order_id VARCHAR UNIQUE,
      pay_status VARCHAR, 
      pay_data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      pay_success_time TIMESTAMP, 
      pay_failure_time TIMESTAMP, 
      pay_callback_received_time TIMESTAMP 
    )`,

  'contracts': `
    CREATE TABLE contracts (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      contract_name VARCHAR,
      payment_code VARCHAR, 
      payment_number INTEGER, 
      phone_number VARCHAR, 
      email VARCHAR, -- email
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

  'organizations': `
    CREATE TABLE organizations (
      id SERIAL PRIMARY KEY,
      organization_name VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
};



module.exports.updateTables = function () {
  const promises = tableNames.map(tableName => new Promise((resolve, reject) => {
    pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = $1
      )`,
      [tableName],
      (err, res) => {
        if (err) {
          console.error(`Error checking if table ${tableName} exists:`, err)
          reject(err)
          return
        }
        const tableExists = res.rows[0].exists
        if (!tableExists) {
          createTable(tableName).then(resolve).catch(reject)
        } else {
          console.log(`Table ${tableName} already exists.`)
          resolve()
        }
      }
    )
  }))

  Promise.all(promises).then(() => pool.end()).catch(err => {
    console.error('Error updating tables:', err)
    pool.end()
  })
}

function createTable(tableName) {
  return new Promise((resolve, reject) => {
    const query = tableQueries[tableName]
    if (!query) {
      console.error(`No query found for table ${tableName}`)
      reject(new Error(`No query found for table ${tableName}`))
      return
    }

    pool.query(query, (err, res) => {
      if (err) {
        console.error(`Error creating table ${tableName}:`, err)
        reject(err)
      } else {
        console.log(`Table ${tableName} created successfully.`)
        resolve()
      }
    })
  })
}