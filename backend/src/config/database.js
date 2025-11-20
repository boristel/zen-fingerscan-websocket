const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Industry-standard database configuration
 * Uses connection pooling for enterprise performance
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'bc_zen',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',

    // Connection pool configuration for enterprise performance
    pool: {
      max: 20,        // Maximum number of connections in pool
      min: 5,         // Minimum number of connections in pool
      acquire: 30000, // Maximum time to acquire a connection (ms)
      idle: 10000     // Maximum time a connection can be idle (ms)
    },

    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    // Timezone configuration
    timezone: '+00:00',

    // Security settings
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      charset: 'utf8mb4'
    },

    // Query optimization
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Test basic query
    const [results, metadata] = await sequelize.query('SELECT 1 as test');
    console.log('🔍 Database test query result:', results[0]);

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    return false;
  }
};

/**
 * Initialize database and sync models
 */
const initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Sync models (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Database models synchronized (development mode)');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};