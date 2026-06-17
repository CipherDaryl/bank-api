const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bank API',
      version: '1.0.0',
      description: 'API Bancaire - Système de Transaction',
    },
    servers: [
      {
        url: 'https://bank-api-r3lj.onrender.com/api/v1',
        description: 'Production',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsDoc(options);