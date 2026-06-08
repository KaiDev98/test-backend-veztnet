// src/config/database.js
require('dotenv').config({ path: '.env.test' });

module.exports = {
  test: {
    url:     process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
  },
  development: {
    url:     process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  production: {
    url:     process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
};