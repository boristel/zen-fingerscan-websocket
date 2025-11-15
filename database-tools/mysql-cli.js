#!/usr/bin/env node

/**
 * MySQL Database CLI Tool
 * Simple command-line interface for MySQL database management
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class MySQLCLI {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'bc_zen',
            charset: 'utf8mb4'
        };
        this.connection = null;
    }

    async connect() {
        try {
            console.log('🔄 Connecting to MySQL database...');
            console.log(`📍 Host: ${this.config.host}:${this.config.port}`);
            console.log(`🗄️  Database: ${this.config.database}`);
            console.log(`👤 User: ${this.config.user}`);

            this.connection = await mysql.createConnection(this.config);

            // Test connection
            const [result] = await this.connection.execute('SELECT 1 as test');
            if (result[0].test === 1) {
                console.log('✅ Connected to MySQL database successfully');
                return true;
            }
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Database connection closed');
        }
    }

    async testConnection() {
        console.log('\n🧪 Testing Database Connection');
        console.log('================================');

        const connected = await this.connect();
        if (connected) {
            // Get MySQL version
            try {
                const [version] = await this.connection.execute('SELECT VERSION() as version');
                console.log(`📊 MySQL Version: ${version[0].version}`);

                // Get database size
                const [size] = await this.connection.execute(`
                    SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
                    FROM information_schema.tables
                    WHERE table_schema = '${this.config.database}'
                `);
                console.log(`💾 Database Size: ${size[0]['Size (MB)']} MB`);

            } catch (error) {
                console.log('⚠️  Could not retrieve additional info:', error.message);
            }

            await this.disconnect();
        }
        return connected;
    }

    async listTables() {
        console.log('\n📋 Database Tables');
        console.log('===================');

        if (!await this.connect()) return;

        try {
            const [tables] = await this.connection.execute('SHOW TABLES');
            console.log(`📊 Found ${tables.length} tables:\n`);

            tables.forEach((table, index) => {
                const tableName = Object.values(table)[0];
                console.log(`${(index + 1).toString().padStart(3)}. ${tableName}`);
            });

        } catch (error) {
            console.error('❌ Error listing tables:', error.message);
        }

        await this.disconnect();
    }

    async describeTable(tableName) {
        console.log(`\n📝 Table Structure: ${tableName}`);
        console.log('================================');

        if (!await this.connect()) return;

        try {
            const [structure] = await this.connection.execute(`DESCRIBE ${tableName}`);

            console.log('Field'.padEnd(20) + 'Type'.padEnd(25) + 'Null'.padEnd(8) + 'Key'.padEnd(8) + 'Default');
            console.log('-'.repeat(80));

            structure.forEach(column => {
                console.log(
                    column.Field.padEnd(20) +
                    column.Type.padEnd(25) +
                    column.Null.padEnd(8) +
                    column.Key.padEnd(8) +
                    (column.Default || 'NULL')
                );
            });

            // Get record count
            const [count] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`\n📊 Total Records: ${count[0].count}`);

        } catch (error) {
            console.error('❌ Error describing table:', error.message);
        }

        await this.disconnect();
    }

    async showTableData(tableName, limit = 10) {
        console.log(`\n📄 Table Data: ${tableName} (Limited to ${limit} records)`);
        console.log('======================================================');

        if (!await this.connect()) return;

        try {
            const [data] = await this.connection.execute(`SELECT * FROM ${tableName} LIMIT ?`, [limit]);

            if (data.length === 0) {
                console.log('📭 No records found');
                return;
            }

            // Display headers
            const headers = Object.keys(data[0]);
            console.log(headers.join(' | '));
            console.log('-'.repeat(headers.join(' | ').length));

            // Display rows
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    if (value === null) return 'NULL';
                    if (typeof value === 'string' && value.length > 50) {
                        return value.substring(0, 47) + '...';
                    }
                    return value;
                });
                console.log(values.join(' | '));
            });

        } catch (error) {
            console.error('❌ Error showing table data:', error.message);
        }

        await this.disconnect();
    }

    async executeQuery(query, params = []) {
        console.log('\n🔍 Executing Custom Query');
        console.log('===========================');
        console.log(`💭 Query: ${query}`);
        if (params.length > 0) {
            console.log(`📋 Parameters: ${params.join(', ')}`);
        }

        if (!await this.connect()) return;

        try {
            const [result] = await this.connection.execute(query, params);

            if (Array.isArray(result)) {
                // SELECT query
                console.log(`\n📊 Returned ${result.length} records:`);
                if (result.length > 0) {
                    const headers = Object.keys(result[0]);
                    console.log(headers.join(' | '));
                    console.log('-'.repeat(headers.join(' | ').length));

                    result.slice(0, 20).forEach(row => {
                        const values = headers.map(header => {
                            const value = row[header];
                            if (value === null) return 'NULL';
                            if (typeof value === 'string' && value.length > 50) {
                                return value.substring(0, 47) + '...';
                            }
                            return value;
                        });
                        console.log(values.join(' | '));
                    });

                    if (result.length > 20) {
                        console.log(`\n... and ${result.length - 20} more records`);
                    }
                }
            } else {
                // INSERT, UPDATE, DELETE query
                console.log(`✅ Query executed successfully`);
                console.log(`📊 Affected rows: ${result.affectedRows}`);
                if (result.insertId) {
                    console.log(`🆔 Insert ID: ${result.insertId}`);
                }
            }

        } catch (error) {
            console.error('❌ Error executing query:', error.message);
        }

        await this.disconnect();
    }

    async showFingerprintData() {
        console.log('\n👆 Fingerprint Data Analysis');
        console.log('=============================');

        if (!await this.connect()) return;

        try {
            // Check if karyawanfpreg table exists
            const [tables] = await this.connection.execute("SHOW TABLES LIKE 'karyawanfpreg'");
            if (tables.length === 0) {
                console.log('❌ karyawanfpreg table not found');
                await this.disconnect();
                return;
            }

            // Total fingerprint registrations
            const [total] = await this.connection.execute('SELECT COUNT(*) as count FROM karyawanfpreg');
            console.log(`📊 Total fingerprint registrations: ${total[0].count}`);

            // Unique employees with fingerprints
            const [employees] = await this.connection.execute('SELECT COUNT(DISTINCT karyawanid) as count FROM karyawanfpreg');
            console.log(`👥 Employees with fingerprints: ${employees[0].count}`);

            // Finger distribution
            const [distribution] = await this.connection.execute(`
                SELECT fingerindex, COUNT(*) as count
                FROM karyawanfpreg
                GROUP BY fingerindex
                ORDER BY fingerindex
            `);

            const fingerNames = ['Left Thumb', 'Left Index', 'Left Middle', 'Left Ring', 'Left Little',
                               'Right Thumb', 'Right Index', 'Right Middle', 'Right Ring', 'Right Little'];

            console.log('\n📈 Finger Distribution:');
            distribution.forEach(item => {
                const fingerName = fingerNames[item.fingerindex] || `Finger ${item.fingerindex}`;
                console.log(`   Finger ${item.fingerindex} (${fingerName}): ${item.count} registrations`);
            });

            // Recent registrations
            const [recent] = await this.connection.execute(`
                SELECT karyawanid, namakaryawan, fingerindex,
                       DATE_FORMAT(autonum, '%Y-%m-%d %H:%i:%s') as registration_date
                FROM karyawanfpreg
                ORDER BY autonum DESC
                LIMIT 5
            `);

            if (recent.length > 0) {
                console.log('\n🕐 Recent Registrations:');
                recent.forEach((record, index) => {
                    const fingerName = fingerNames[record.fingerindex] || `Finger ${record.fingerindex}`;
                    console.log(`   ${index + 1}. ${record.namakaryawan} (${record.karyawanid}) - ${fingerName}`);
                    console.log(`      Registered: ${record.registration_date}`);
                });
            }

        } catch (error) {
            console.error('❌ Error analyzing fingerprint data:', error.message);
        }

        await this.disconnect();
    }

    async showDatabaseStats() {
        console.log('\n📊 Database Statistics');
        console.log('======================');

        if (!await this.connect()) return;

        try {
            // Database info
            const [dbInfo] = await this.connection.execute(`
                SELECT
                    SCHEMA_NAME as 'Database',
                    DEFAULT_CHARACTER_SET_NAME as 'Charset',
                    DEFAULT_COLLATION_NAME as 'Collation'
                FROM information_schema.SCHEMATA
                WHERE SCHEMA_NAME = '${this.config.database}'
            `);

            if (dbInfo.length > 0) {
                console.log(`🗄️  Database: ${dbInfo[0]['Database']}`);
                console.log(`🔤 Charset: ${dbInfo[0]['Charset']}`);
                console.log(`📝 Collation: ${dbInfo[0]['Collation']}`);
            }

            // Table count
            const [tableCount] = await this.connection.execute(`
                SELECT COUNT(*) as count FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = '${this.config.database}'
            `);
            console.log(`📋 Total Tables: ${tableCount[0].count}`);

            // Database size
            const [size] = await this.connection.execute(`
                SELECT
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)',
                    SUM(data_length + index_length) AS 'Size (Bytes)'
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = '${this.config.database}'
            `);
            console.log(`💾 Database Size: ${size[0]['Size (MB)']} MB (${size[0]['Size (Bytes)']} bytes)`);

            // Largest tables
            const [largestTables] = await this.connection.execute(`
                SELECT
                    TABLE_NAME as 'Table',
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
                    TABLE_ROWS as 'Rows'
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = '${this.config.database}'
                ORDER BY (data_length + index_length) DESC
                LIMIT 10
            `);

            if (largestTables.length > 0) {
                console.log('\n🏆 Largest Tables:');
                console.log('Table'.padEnd(30) + 'Size (MB)'.padEnd(12) + 'Rows');
                console.log('-'.repeat(55));
                largestTables.forEach(table => {
                    console.log(
                        table['Table'].padEnd(30) +
                        (table['Size (MB)'] || 0).toString().padEnd(12) +
                        (table['Rows'] || 0)
                    );
                });
            }

        } catch (error) {
            console.error('❌ Error getting database statistics:', error.message);
        }

        await this.disconnect();
    }
}

// CLI Command Handler
async function main() {
    const args = process.argv.slice(2);
    const cli = new MySQLCLI();

    // Show help
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
🔧 MySQL Database CLI Tool

Usage: node mysql-cli.js [command] [arguments]

Commands:
  --help, -h                    Show this help message
  --test                        Test database connection
  --tables                      List all tables
  --describe <table>            Describe table structure
  --show <table> [limit]        Show table data (default limit: 10)
  --query "SQL" [params...]     Execute custom SQL query
  --fingerprints                Show fingerprint data analysis
  --stats                       Show database statistics

Examples:
  node mysql-cli.js --test
  node mysql-cli.js --tables
  node mysql-cli.js --describe karyawanfpreg
  node mysql-cli.js --show karyawanfpreg 5
  node mysql-cli.js --query "SELECT * FROM ben_hrd_karyawan_info WHERE active = ?" "Y"
  node mysql-cli.js --fingerprints
  node mysql-cli.js --stats
        `);
        process.exit(0);
    }

    // Parse and execute commands
    try {
        if (args.includes('--test')) {
            await cli.testConnection();
        }
        else if (args.includes('--tables')) {
            await cli.listTables();
        }
        else if (args.includes('--describe')) {
            const tableIndex = args.indexOf('--describe') + 1;
            const tableName = args[tableIndex];
            if (!tableName) {
                console.error('❌ Table name required for --describe command');
                process.exit(1);
            }
            await cli.describeTable(tableName);
        }
        else if (args.includes('--show')) {
            const tableIndex = args.indexOf('--show') + 1;
            const tableName = args[tableIndex];
            if (!tableName) {
                console.error('❌ Table name required for --show command');
                process.exit(1);
            }
            const limitIndex = args.indexOf('--show') + 2;
            const limit = args[limitIndex] ? parseInt(args[limitIndex]) : 10;
            await cli.showTableData(tableName, limit);
        }
        else if (args.includes('--query')) {
            const queryIndex = args.indexOf('--query') + 1;
            const query = args[queryIndex];
            if (!query) {
                console.error('❌ SQL query required for --query command');
                process.exit(1);
            }
            const params = args.slice(queryIndex + 1);
            await cli.executeQuery(query, params);
        }
        else if (args.includes('--fingerprints')) {
            await cli.showFingerprintData();
        }
        else if (args.includes('--stats')) {
            await cli.showDatabaseStats();
        }
        else {
            console.error('❌ Unknown command. Use --help for available commands.');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = MySQLCLI;