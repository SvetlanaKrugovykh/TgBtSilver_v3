require('dotenv').config()
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

const { MAILHOST, MAILPORT, MAIL_USER, MAIL_PASS, TEMP_CATALOG } = process.env

async function testSimpleEmail() {
  console.log('\n=== Test 1: Sending simple text email ===')
  console.log(`SMTP Config: host=${MAILHOST}, port=${MAILPORT}, user=${MAIL_USER}`)
  
  try {
    const transporter = nodemailer.createTransport({
      host: MAILHOST,
      port: Number(MAILPORT),
      secure: false,
      auth: MAIL_USER && MAIL_PASS ? {
        user: MAIL_USER,
        pass: MAIL_PASS
      } : undefined,
      tls: {
        rejectUnauthorized: false
      }
    })

    const testEmail = process.argv[2] || 'test@example.com'
    
    const message = {
      from: 'AbonOtdel@silver-service.com.ua',
      to: testEmail,
      subject: 'Test Email - Simple Text',
      text: 'This is a test email with simple text message.',
      html: '<p><b>This is a test email</b> with simple text message.</p>'
    }

    console.log(`Sending to: ${testEmail}`)
    const info = await transporter.sendMail(message)
    
    console.log('✅ SUCCESS: Simple email sent!')
    console.log(`Message ID: ${info.messageId}`)
    console.log(`Response: ${info.response}`)
    return true
    
  } catch (error) {
    console.error('❌ FAILED: Simple email error')
    console.error(`Error: ${error.message}`)
    console.error(error)
    return false
  }
}

async function testEmailWithAttachment() {
  console.log('\n=== Test 2: Sending email with PDF attachment ===')
  
  try {
    const transporter = nodemailer.createTransport({
      host: MAILHOST,
      port: Number(MAILPORT),
      secure: false,
      auth: MAIL_USER && MAIL_PASS ? {
        user: MAIL_USER,
        pass: MAIL_PASS
      } : undefined,
      tls: {
        rejectUnauthorized: false
      }
    })

    const testEmail = process.argv[2] || 'test@example.com'
    
    // Find any PDF file in TEMP_CATALOG
    const files = fs.readdirSync(TEMP_CATALOG)
    const pdfFile = files.find(f => f.endsWith('.pdf'))
    
    if (!pdfFile) {
      console.log('❌ No PDF files found in TEMP_CATALOG')
      console.log(`Directory: ${TEMP_CATALOG}`)
      console.log(`Files: ${files.join(', ')}`)
      return false
    }
    
    const filePath = path.join(TEMP_CATALOG, pdfFile)
    console.log(`Found PDF: ${filePath}`)
    console.log(`File size: ${fs.statSync(filePath).size} bytes`)
    
    const message = {
      from: 'AbonOtdel@silver-service.com.ua',
      to: testEmail,
      subject: 'Test Email - With PDF Attachment',
      text: 'This is a test email with PDF attachment.',
      html: '<p><b>This is a test email</b> with PDF attachment.</p>',
      attachments: [{
        filename: 'receipt.pdf',
        path: filePath
      }]
    }

    console.log(`Sending to: ${testEmail}`)
    const info = await transporter.sendMail(message)
    
    console.log('✅ SUCCESS: Email with attachment sent!')
    console.log(`Message ID: ${info.messageId}`)
    console.log(`Response: ${info.response}`)
    return true
    
  } catch (error) {
    console.error('❌ FAILED: Email with attachment error')
    console.error(`Error: ${error.message}`)
    console.error(error)
    return false
  }
}

async function runTests() {
  console.log('========================================')
  console.log('       MAIL SERVER TEST SUITE')
  console.log('========================================')
  console.log(`Usage: node testMailer.js [email@address.com]`)
  console.log(`TEMP_CATALOG: ${TEMP_CATALOG}`)
  console.log('========================================')
  
  const result1 = await testSimpleEmail()
  
  if (result1) {
    console.log('\nWaiting 2 seconds before next test...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    await testEmailWithAttachment()
  }
  
  console.log('\n========================================')
  console.log('       TESTS COMPLETED')
  console.log('========================================')
}

runTests().catch(console.error)
