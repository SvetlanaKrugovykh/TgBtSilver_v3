const nodemailer = require('nodemailer');
const SENDER =  process.env.SENDER;
const MAILHOST =  process.env.MAILHOST;

const recipient = 'zzz@mmm.com';
const Subject   = 'It`s real mail from tgbot'; 
const text      = 'dfghfghfgh /n sertsertert /n ertertert'; 
const html      = "<b>Hello world?</b>";
const filename  = 'test3.txt';
const path      = '';

const message = {
    from: `${SENDER}`,
    to: recipient,
    subject: Subject,
    text: text,
    html: html,
attachments: [{
    filename: filename, 
    path: path
    }] 
};

async function sendmail(message) {

    let transporter = nodemailer.createTransport({
        host: `${MAILHOST}`,
        port: 25,
        secure: false, 
        auth: {
            user: `${SENDER}`,
            pass: undefined
        }
    });
    
    let info = await transporter.sendMail(message);
  
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
  
  sendmail(message).catch(console.error); 

  module.exports = { sendmail };