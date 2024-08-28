module.exports = {
  description: 'Callback liqpay string',
  tags: ['callback'],
  summary: 'Callback liqpay string',
  headers: {
    type: 'object',
  },
  body: {
    type: 'object',
    properties: {
      data: { type: 'string' },
      signature: { type: 'string' }
    },
    required: ['data', 'signature']
  },
  response: {
    201: {
      description: 'Successful response',
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        statusCode: { type: 'integer' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
}
