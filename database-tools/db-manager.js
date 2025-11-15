#!/usr/bin/env node

/**
 * MySQL Database Management Tool
 * Comprehensive CLI tool for managing MySQL database connections and operations
 * Reads configuration from .env file
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DatabaseManager {
    constructor() {
        this.connection = null;
        this.config = this.loadConfig();
        this.connected = false;
    }

    /**
     * Load database configuration from .env file
     */
    loadConfig() {
        const envPath = path.join(__dirname, '..', '.env');

        console.log('🔍 Loading configuration from:', envPath);

        if (!fs.existsSync(envPath)) {
            console.error('❌ .env file not found at:', envPath);
            process.exit(1);
        }

        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: parseInt(process.env.DB_PORT) || 3306,
            database: process.env.DB_NAME || 'bc_zen',
            charset: 'utf8mb4',
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        };

        console.log('📋 Database Configuration:');
        console.log(`   Host: ${config.host}`);
        console.log(`   User: ${config.user}`);
        console.log(`   Password: ${config.password ? '[HIDDEN]' : '[EMPTY]'}`);
        console.log(`   Port: ${config.port}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   Charset: ${config.charset}`);

        return config;
    }

    /**
     * Connect to MySQL database
     */
    async connect() {
        if (this.connected) {
            console.log('✅ Already connected to database');
            return;
        }

        try {
            console.log('🔄 Connecting to MySQL database...');

            this.connection = await mysql.createConnection(this.config);

            // Test connection
            await this.connection.execute('SELECT 1 as test');

            this.connected = true;
            console.log('✅ Connected to MySQL database successfully');

            // Show server info
            const [serverInfo] = await this.connection.execute('SELECT VERSION() as version, DATABASE() as current_db');
            console.log(`📊 MySQL Server Version: ${serverInfo[0].version}`);
            console.log(`📊 Current Database: ${serverInfo[0].current_db}`);

        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            console.error('🔧 Please check your .env file configuration');
            process.exit(1);
        }
    }

    /**
     * Disconnect from database
     */
    async disconnect() {
        if (this.connection && this.connected) {
            await this.connection.end();
            this.connected = false;
            console.log('🔌 Disconnected from database');
        }
    }

    /**
     * List all databases
     */
    async listDatabases() {
        try {
            console.log('\n📚 Available Databases:');
            const [databases] = await this.connection.execute('SHOW DATABASES');

            databases.forEach((db, index) => {
                const name = db.Database || Object.values(db)[0];
                console.log(`   ${index + 1}. ${name}`);
            });

        } catch (error) {
            console.error('❌ Failed to list databases:', error.message);
        }
    }

    /**
     * List all tables in current database
     */
    async listTables() {
        try {
            console.log(`\n📋 Tables in database '${this.config.database}':`);
            const [tables] = await this.connection.execute('SHOW TABLES');

            if (tables.length === 0) {
                console.log('   No tables found');
                return;
            }

            tables.forEach((table, index) => {
                const tableName = Object.values(table)[0];
                console.log(`   ${index + 1}. ${tableName}`);
            });

        } catch (error) {
            console.error('❌ Failed to list tables:', error.message);
        }
    }

    /**
     * Show table structure
     */
    async describeTable(tableName) {
        try {
            console.log(`\n📄 Structure of table '${tableName}':`);

            const [structure] = await this.connection.execute(`DESCRIBE ${tableName}`);

            if (structure.length === 0) {
                console.log(`   Table '${tableName}' not found`);
                return;
            }

            // Display in a formatted way
            console.log('   ┌─────────────────────┬──────────────┬──────┬─────┬─────────┬────────────────┐');
            console.log('   │ Field              │ Type         │ Null │ Key │ Default │ Extra          │');
            console.log('   ├─────────────────────┼──────────────┼──────┼─────┼─────────┼────────────────┤');

            structure.forEach(column => {
                const field = (column.Field || '').padEnd(19);
                const type = (column.Type || '').padEnd(12);
                const null_ = (column.Null || '').padEnd(4);
                const key = (column.Key || '').padEnd(3);
                const default_ = (column.Default || '').toString().padEnd(7);
                const extra = (column.Extra || '').padEnd(14);

                console.log(`   │ ${field} │ ${type} │ ${null_} │ ${key} │ ${default_} │ ${extra} │`);
            });

            console.log('   └─────────────────────┴──────────────┴──────┴─────┴─────────┴────────────────┘');

        } catch (error) {
            console.error(`❌ Failed to describe table '${tableName}':`, error.message);
        }
    }

    /**
     * Show table data with limit
     */
    async showTableData(tableName, limit = 10) {
        try {
            console.log(`\n📊 Data from table '${tableName}' (limit ${limit}):`);

            // Get total count
            const [countResult] = await this.connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
            const total = countResult[0].total;

            if (total === 0) {
                console.log('   No data found in table');
                return;
            }

            console.log(`📈 Total records: ${total}`);

            // Get sample data
            const [data] = await this.connection.execute(`SELECT * FROM ${tableName} LIMIT ${limit}`);

            if (data.length === 0) {
                console.log('   No data to display');
                return;
            }

            // Display headers
            const columns = Object.keys(data[0]);
            console.log('\n   Columns:', columns.join(', '));

            // Display data rows
            data.forEach((row, index) => {
                console.log(`\n   Row ${index + 1}:`);
                columns.forEach(col => {
                    let value = row[col];
                    if (value === null) value = 'NULL';
                    else if (typeof value === 'string' && value.length > 50) {
                        value = value.substring(0, 50) + '...';
                    }
                    console.log(`      ${col}: ${value}`);
                });
            });

        } catch (error) {
            console.error(`❌ Failed to show data from table '${tableName}':`, error.message);
        }
    }

    /**
     * Execute custom SQL query
     */
    async executeQuery(sql, params = []) {
        try {
            console.log(`\n🔍 Executing SQL: ${sql}`);
            if (params.length > 0) {
                console.log('📋 Parameters:', params);
            }

            const [rows] = await this.connection.execute(sql, params);

            console.log(`✅ Query executed successfully. ${rows.length} rows returned.`);

            if (rows.length > 0) {
                console.log('\n📊 Results:');
                if (Array.isArray(rows) && rows.length > 0) {
                    const columns = Object.keys(rows[0]);
                    console.log('Columns:', columns.join(', '));

                    rows.forEach((row, index) => {
                        console.log(`\nRow ${index + 1}:`);
                        columns.forEach(col => {
                            let value = row[col];
                            if (value === null) value = 'NULL';
                            else if (typeof value === 'string' && value.length > 100) {
                                value = value.substring(0, 100) + '...';
                            }
                            console.log(`  ${col}: ${value}`);
                        });
                    });
                }
            }

            return rows;

        } catch (error) {
            console.error('❌ Failed to execute query:', error.message);
            throw error;
        }
    }

    /**
     * Backup table data to JSON file
     */
    async backupTable(tableName, filePath = null) {
        try {
            if (!filePath) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                filePath = path.join(__dirname, 'backups', `${tableName}_${timestamp}.json`);

                // Create backups directory if it doesn't exist
                const backupDir = path.dirname(filePath);
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
            }

            console.log(`\n💾 Backing up table '${tableName}' to ${filePath}`);

            // Get all data
            const [data] = await this.connection.execute(`SELECT * FROM ${tableName}`);

            // Create backup object
            const backup = {
                table: tableName,
                timestamp: new Date().toISOString(),
                database: this.config.database,
                recordCount: data.length,
                data: data
            };

            // Write to file
            fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

            console.log(`✅ Backup completed: ${data.length} records saved to ${filePath}`);

        } catch (error) {
            console.error(`❌ Failed to backup table '${tableName}':`, error.message);
        }
    }

    /**
     * Get database statistics
     */
    async getDatabaseStats() {
        try {
            console.log('\n📊 Database Statistics:');

            // Get database size
            const [sizeResult] = await this.connection.execute(`
                SELECT
                    table_schema as 'Database',
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
                FROM information_schema.tables
                WHERE table_schema = ?
            `, [this.config.database]);

            if (sizeResult[0]['Size (MB)']) {
                console.log(`   Database Size: ${sizeResult[0]['Size (MB)']} MB`);
            }

            // Get table counts and row counts
            const [stats] = await this.connection.execute(`
                SELECT
                    table_name as 'Table',
                    table_rows as 'Rows',
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
                FROM information_schema.tables
                WHERE table_schema = ?
                ORDER BY (data_length + index_length) DESC
            `, [this.config.database]);

            if (stats.length > 0) {
                console.log('\n   Table Details:');
                console.log('   ┌─────────────────────────┬─────────┬───────────┐');
                console.log('   │ Table                   │ Rows    │ Size (MB) │');
                console.log('   ├─────────────────────────┼─────────┼───────────┤');

                stats.forEach(stat => {
                    const table = (stat.Table || '').padEnd(23);
                    const rows = (stat.Rows || 0).toString().padEnd(7);
                    const size = (stat['Size (MB)'] || 0).toFixed(2).padEnd(9);
                    console.log(`   │ ${table} │ ${rows} │ ${size} │`);
                });

                console.log('   └─────────────────────────┴─────────┴───────────┘');
            }

            // Get connection info
            const [connectionInfo] = await this.connection.execute(`
                SELECT
                    VARIABLE_NAME as 'Metric',
                    VARIABLE_VALUE as 'Value'
                FROM performance_schema.global_status
                WHERE VARIABLE_NAME IN ('Connections', 'Max_used_connections', 'Threads_connected')
            `);

            if (connectionInfo.length > 0) {
                console.log('\n   Connection Metrics:');
                connectionInfo.forEach(metric => {
                    console.log(`   ${metric.Metric}: ${metric.Value}`);
                });
            }

        } catch (error) {
            console.error('❌ Failed to get database statistics:', error.message);
        }
    }

    /**
     * Show fingerprint specific data
     */
    async showFingerprintData() {
        try {
            console.log('\n👆 Fingerprint Data Analysis:');

            // Check if karyawanfpreg table exists
            const [tableCheck] = await this.connection.execute(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = ? AND table_name = 'karyawanfpreg'
            `, [this.config.database]);

            if (tableCheck[0].count === 0) {
                console.log('   ⚠️  karyawanfpreg table not found');
                return;
            }

            // Get fingerprint registration stats
            const [fpStats] = await this.connection.execute(`
                SELECT
                    COUNT(*) as total_registrations,
                    COUNT(DISTINCT karyawanid) as unique_employees,
                    COUNT(DISTINCT fingerindex) as unique_fingers
                FROM karyawanfpreg
            `);

            console.log(`   📊 Total Fingerprint Registrations: ${fpStats[0].total_registrations}`);
            console.log(`   👥 Unique Employees: ${fpStats[0].unique_employees}`);
            console.log(`   👆 Unique Finger Types: ${fpStats[0].unique_fingers}`);

            // Get recent registrations
            const [recentRegs] = await this.connection.execute(`
                SELECT
                    karyawanid,
                    namakaryawan,
                    fingerindex,
                    LENGTH(fingerimage) as image_size,
                    notes
                FROM karyawanfpreg
                ORDER BY autonum DESC
                LIMIT 5
            `);

            if (recentRegs.length > 0) {
                console.log('\n   📅 Recent Registrations:');
                recentRegs.forEach((reg, index) => {
                    console.log(`   ${index + 1}. Employee: ${reg.karyawanid} - ${reg.namakaryawan}`);
                    console.log(`      Finger: ${reg.fingerindex} | Image Size: ${reg.image_size} chars | Notes: ${reg.notes || 'None'}`);
                });
            }

            // Check employee table
            const [empCheck] = await this.connection.execute(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = ? AND table_name = 'ben_hrd_karyawan_info'
            `, [this.config.database]);

            if (empCheck[0].count > 0) {
                const [empStats] = await this.connection.execute(`
                    SELECT
                        COUNT(*) as total_employees,
                        COUNT(CASE WHEN active = 'Y' THEN 1 END) as active_employees
                    FROM ben_hrd_karyawan_info
                `);

                console.log('\n   👥 Employee Database:');
                console.log(`   📊 Total Employees: ${empStats[0].total_employees}`);
                console.log(`   ✅ Active Employees: ${empStats[0].active_employees}`);
            }

        } catch (error) {
            console.error('❌ Failed to analyze fingerprint data:', error.message);
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const dbManager = new DatabaseManager();

    // Show help
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
🗄️  MySQL Database Management Tool

Usage: node db-manager.js [command] [options]

Commands:
  --help, -h                    Show this help message
  --connect                     Connect to database and show info
  --databases                   List all databases
  --tables                      List all tables in current database
  --describe [table]            Show table structure
  --show [table] [limit]        Show table data (default limit: 10)
  --query "SQL" [param1,..]     Execute custom SQL query
  --backup [table] [path]       Backup table to JSON file
  --stats                       Show database statistics
  --fingerprints                Show fingerprint-specific data
  --interactive                 Start interactive mode

Examples:
  node db-manager.js --connect
  node db-manager.js --describe karyawanfpreg
  node db-manager.js --show karyawanfpreg 5
  node db-manager.js --query "SELECT * FROM karyawanfpreg WHERE karyawanid = ?" "00123"
  node db-manager.js --backup karyawanfpreg
  node db-manager.js --fingerprints
        `);
        process.exit(0);
    }

    try {
        // Connect if any command is used
        await dbManager.connect();

        // Execute commands
        if (args.includes('--databases')) {
            await dbManager.listDatabases();
        }

        if (args.includes('--tables')) {
            await dbManager.listTables();
        }

        if (args.includes('--describe')) {
            const tableIndex = args.indexOf('--describe') + 1;
            const tableName = args[tableIndex];
            if (tableName) {
                await dbManager.describeTable(tableName);
            } else {
                console.error('❌ Please specify table name: --describe [table]');
            }
        }

        if (args.includes('--show')) {
            const tableIndex = args.indexOf('--show') + 1;
            const tableName = args[tableIndex];
            const limitIndex = args.indexOf('--show') + 2;
            const limit = args[limitIndex] ? parseInt(args[limitIndex]) : 10;

            if (tableName) {
                await dbManager.showTableData(tableName, limit);
            } else {
                console.error('❌ Please specify table name: --show [table] [limit]');
            }
        }

        if (args.includes('--query')) {
            const queryIndex = args.indexOf('--query') + 1;
            const sql = args[queryIndex];
            if (sql) {
                // Extract parameters after SQL
                const params = [];
                let i = queryIndex + 1;
                while (i < args.length && !args[i].startsWith('--')) {
                    params.push(args[i]);
                    i++;
                }
                await dbManager.executeQuery(sql, params);
            } else {
                console.error('❌ Please specify SQL query: --query "SQL" [param1,..]');
            }
        }

        if (args.includes('--backup')) {
            const tableIndex = args.indexOf('--backup') + 1;
            const tableName = args[tableIndex];
            const pathIndex = args.indexOf('--backup') + 2;
            const filePath = args[pathIndex];

            if (tableName) {
                await dbManager.backupTable(tableName, filePath);
            } else {
                console.error('❌ Please specify table name: --backup [table] [path]');
            }
        }

        if (args.includes('--stats')) {
            await dbManager.getDatabaseStats();
        }

        if (args.includes('--fingerprints')) {
            await dbManager.showFingerprintData();
        }

        if (args.includes('--interactive')) {
            await startInteractiveMode(dbManager);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    } finally {
        await dbManager.disconnect();
    }
}

/**
 * Interactive mode for database operations
 */
async function startInteractiveMode(dbManager) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n🎮 Interactive Database Mode');
    console.log('Type "help" for available commands or "exit" to quit\n');

    const commands = {
        'help': 'Show available commands',
        'tables': 'List all tables',
        'describe [table]': 'Show table structure',
        'show [table] [limit]': 'Show table data',
        'query "SQL"': 'Execute SQL query',
        'stats': 'Show database statistics',
        'fingerprints': 'Show fingerprint data',
        'exit': 'Exit interactive mode'
    };

    while (true) {
        rl.question('db> ', async (input) => {
            const trimmed = input.trim();

            if (trimmed === 'exit' || trimmed === 'quit') {
                rl.close();
                return;
            }

            if (trimmed === 'help') {
                console.log('\nAvailable commands:');
                Object.entries(commands).forEach(([cmd, desc]) => {
                    console.log(`  ${cmd}: ${desc}`);
                });
                console.log('');
                return;
            }

            if (trimmed === 'tables') {
                await dbManager.listTables();
                return;
            }

            if (trimmed.startsWith('describe ')) {
                const tableName = trimmed.substring(9);
                await dbManager.describeTable(tableName);
                return;
            }

            if (trimmed.startsWith('show ')) {
                const parts = trimmed.split(' ');
                const tableName = parts[1];
                const limit = parts[2] ? parseInt(parts[2]) : 10;
                await dbManager.showTableData(tableName, limit);
                return;
            }

            if (trimmed.startsWith('query ')) {
                const sql = trimmed.substring(6);
                try {
                    await dbManager.executeQuery(sql);
                } catch (error) {
                    console.error('❌ Query error:', error.message);
                }
                return;
            }

            if (trimmed === 'stats') {
                await dbManager.getDatabaseStats();
                return;
            }

            if (trimmed === 'fingerprints') {
                await dbManager.showFingerprintData();
                return;
            }

            console.log('❌ Unknown command. Type "help" for available commands.');
        });
    }
}

// Export for use in other files
module.exports = DatabaseManager;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}