//'use strict'
//node --inspect-brk testTelnetOtherOpions.js

require('dotenv').config();
const telnetCall = require('../modules/telnet');
const _HOST = '192.168.23.238'
const EPON = 'EPON0/4:4'
await telnetCall(_HOST, EPON, 'attenuation')
  .then(store => {
    console.dir(store)
  })
