require('dotenv').config()

const liqpayKeys = {
  org1: {
    publicKey: process.env.LIQPAY_PUBLIC_KEY_ORG1,
    privateKey: process.env.LIQPAY_PRIVATE_KEY_ORG1,
  },
  org2: {
    publicKey: process.env.LIQPAY_PUBLIC_KEY_ORG2,
    privateKey: process.env.LIQPAY_PRIVATE_KEY_ORG2,
  },
  org3: {
    publicKey: process.env.LIQPAY_PUBLIC_KEY_ORG3,
    privateKey: process.env.LIQPAY_PRIVATE_KEY_ORG3,
  },
  org4: {
    publicKey: process.env.LIQPAY_PUBLIC_KEY_ORG4,
    privateKey: process.env.LIQPAY_PRIVATE_KEY_ORG4,
  },
}

const testLiqpayKeys = {
  org1: {
    publicKey: process.env.TEST_LIQPAY_PUBLIC_KEY_ORG1,
    privateKey: process.env.TEST_LIQPAY_PRIVATE_KEY_ORG1,
  },
  org2: {
    publicKey: process.env.TEST_LIQPAY_PUBLIC_KEY_ORG2,
    privateKey: process.env.TEST_LIQPAY_PRIVATE_KEY_ORG2,
  },
  org3: {
    publicKey: process.env.TEST_LIQPAY_PUBLIC_KEY_ORG3,
    privateKey: process.env.TEST_LIQPAY_PRIVATE_KEY_ORG3,
  },
  org4: {
    publicKey: process.env.TEST_LIQPAY_PUBLIC_KEY_ORG4,
    privateKey: process.env.TEST_LIQPAY_PRIVATE_KEY_ORG4,
  },
}

function getLiqpayKeys(orgId) {
  return liqpayKeys[orgId] || null
}

module.exports = { liqpayKeys, testLiqpayKeys, getLiqpayKeys }