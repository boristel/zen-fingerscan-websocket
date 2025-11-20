require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bc_zen',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',

    // Connection pool configuration
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: 30000,
      idle: 10000
    },

    // Timezone configuration
    timezone: '+00:00',

    // Logging
    logging: process.env.ENABLE_QUERY_LOG === 'true' ? console.log : false,

    // SSL configuration
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      charset: 'utf8mb4'
    }
  },

  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME + '_test' || 'bc_zen_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',

    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000
    },

    logging: false,

    dialectOptions: {
      charset: 'utf8mb4'
    }
  },

  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',

    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: 30000,
      idle: 10000
    },

    logging: false,

    timezone: '+00:00',

    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      charset: 'utf8mb4'
    }
  }
};