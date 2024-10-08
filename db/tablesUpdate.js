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

const tableNames = ['organizations', 'contracts', 'payments']

const tableQueries = {
  'organizations': `
    CREATE TABLE organizations (
      id SERIAL PRIMARY KEY,
      organization_name VARCHAR,
      organization_code VARCHAR,
      organization_abbreviation VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  'contracts': `
    CREATE TABLE contracts (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      contract_name VARCHAR,
      payment_code VARCHAR, 
      tg_id BIGINT,
      payment_number INTEGER, 
      phone_number VARCHAR, 
      email VARCHAR, -- email,
      ip VARCHAR(15),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
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
      pay_callback_received_time TIMESTAMP,
      payment_id VARCHAR,
      liqpay_order_id VARCHAR,
      paytype VARCHAR,
      sender_card_mask2 VARCHAR,
      sender_card_bank VARCHAR,
      sender_card_type VARCHAR,
      sender_card_country VARCHAR,
      ip VARCHAR(15),
      sender_first_name VARCHAR,
      sender_last_name VARCHAR,
      receiver_commission DECIMAL(10, 2),
      sender_commission DECIMAL(10, 2),
      is_3ds BOOLEAN,
      transaction_id  VARCHAR
    )`
}


module.exports.updateTables = function () {
  checkAndCreateTable('organizations')
    .then(() => checkAndCreateTable('contracts'))
    .then(() => checkAndCreateTable('payments'))
    .then(() => {
      console.log('All tables created or already exist.')
    })
    .catch((err) => {
      console.error('Error in table creation sequence:', err)
    })
}


function checkAndCreateTable(tableName) {
  return new Promise((resolve, reject) => {
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