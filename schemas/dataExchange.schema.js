module.exports = {
  description: 'Sign string',
  tags: ['sign'],
  summary: 'Sign string',
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string' }
    },
    required: ['Authorization']
  },
  body: {
    type: 'object',
    properties: {
      reqType: { type: 'string' },
      device_ip: { type: 'string' },
      epon_id: { type: 'string' }
    },
    required: ['reqType', 'epon_id', 'device_ip']
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
