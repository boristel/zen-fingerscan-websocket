const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Increase body parser limits for fingerprint data
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Database Connection Configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
};

// Database Connection Pool
let db;

async function initializeDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database successfully');

        // Test connection with a simple query
        const [rows] = await db.execute('SELECT 1 as test');
        console.log('🔍 Database test query result:', rows[0]);

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

// API Routes

// Test database connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 as test');
        res.json({
            success: true,
            message: 'Database connection successful',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Test database contents
app.get('/api/test-contents', async (req, res) => {
    try {
        // Count total employees
        const [countResult] = await db.execute('SELECT COUNT(*) as total FROM ben_hrd_karyawan_info');

        // Get all active employees
        const [activeResult] = await db.execute('SELECT COUNT(*) as active FROM ben_hrd_karyawan_info WHERE active = "Y"');

        // Get first 5 employees regardless of status
        const [sampleResult] = await db.execute('SELECT kodekaryawan, idkaryawan, namakaryawan, active FROM ben_hrd_karyawan_info LIMIT 5');

        // Search for ANNISA specifically
        const [annisaResult] = await db.execute('SELECT kodekaryawan, idkaryawan, namakaryawan, active FROM ben_hrd_karyawan_info WHERE namakaryawan LIKE "%ANNISA%"');

        console.log('🔍 Database contents test results:', {
            total: countResult[0].total,
            active: activeResult[0].active,
            annisaFound: annisaResult.length,
            sampleEmployees: sampleResult
        });

        res.json({
            success: true,
            message: 'Database contents test',
            data: {
                totalEmployees: countResult[0].total,
                activeEmployees: activeResult[0].active,
                annisaEmployees: annisaResult.length,
                sampleEmployees: sampleResult
            }
        });
    } catch (error) {
        console.error('Database contents test error:', error);
        res.status(500).json({
            success: false,
            message: 'Database contents test failed',
            error: error.message
        });
    }
});

// Employee Search API
app.post('/api/search-employee', async (req, res) => {
    try {
        const { searchTerm } = req.body;

        if (!searchTerm || searchTerm.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        console.log('🔍 Search term received:', searchTerm.trim());

        const query = `
            SELECT kodekaryawan, idkaryawan, namakaryawan, idoutlet, departemen,
                   tglmasukkerja, active, departemen, idoutlet
            FROM ben_hrd_karyawan_info
            WHERE (namakaryawan LIKE ? OR idkaryawan LIKE ?)
            AND active = 'Y'
            ORDER BY namakaryawan
            LIMIT 20
        `;

        const searchPattern = `%${searchTerm.trim()}%`;
        console.log('🔍 Search pattern:', searchPattern);
        console.log('🔍 Executing query:', query);

        const [rows] = await db.execute(query, [searchPattern, searchPattern]);

        console.log('🔍 Query result:', rows.length, 'employees found');
        if (rows.length > 0) {
            console.log('🔍 First employee:', rows[0]);
        }

        res.json({
            success: true,
            message: `Found ${rows.length} employees`,
            data: rows
        });

    } catch (error) {
        console.error('Search employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search employees',
            error: error.message
        });
    }
});

// Simple API Test
app.get('/api/test-simple', async (req, res) => {
    console.log('🔍 Simple test API called from frontend!')
    res.json({
        success: true,
        message: 'API connection test successful',
        timestamp: new Date().toISOString(),
        serverInfo: {
            port: parseInt(process.env.PORT) || 3000,
            status: 'running'
        }
    })
})

// Debug database schema
app.get('/api/debug-schema', async (req, res) => {
    try {
        console.log('🔍 Checking karyawanfpreg table schema...');

        // Get table structure
        const [structure] = await db.execute(`
            DESCRIBE karyawanfpreg
        `);

        console.log('📋 karyawanfpreg table structure:', structure);

        // Get some sample data
        const [sampleData] = await db.execute(`
            SELECT * FROM karyawanfpreg LIMIT 3
        `);

        console.log('📄 Sample data from karyawanfpreg:', sampleData);

        res.json({
            success: true,
            message: 'Database schema debug',
            data: {
                tableStructure: structure,
                sampleData: sampleData
            }
        });

    } catch (error) {
        console.error('Database schema debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Schema debug failed',
            error: error.message
        });
    }
});

// Debug ANNISA search
app.get('/api/debug-annisa', async (req, res) => {
    try {
        // Find any employee with ANNISA in name (case insensitive)
        const [annisaRows] = await db.execute(`
            SELECT kodekaryawan, idkaryawan, namakaryawan, active
            FROM ben_hrd_karyawan_info
            WHERE namakaryawan LIKE '%ANNISA%'
        `);

        console.log('🔍 ANNISA debug results:', annisaRows);

        // Check active status specifically
        const [activeAnnisaRows] = await db.execute(`
            SELECT kodekaryawan, idkaryawan, namakaryawan, active
            FROM ben_hrd_karyawan_info
            WHERE namakaryawan LIKE '%ANNISA%' AND active = 'Y'
        `);

        console.log('🔍 Active ANNISA debug results:', activeAnnisaRows);

        res.json({
            success: true,
            message: 'ANNISA debug results',
            data: {
                allAnnisa: annisaRows,
                activeAnnisa: activeAnnisaRows
            }
        });

    } catch (error) {
        console.error('ANNISA debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug failed',
            error: error.message
        });
    }
});

// Get Employee Details by ID
app.get('/api/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT kodekaryawan, idkaryawan, namakaryawan, idoutlet, departemen,
                   tglmasukkerja, active, departemen, idoutlet, namabank, norek, namarek
            FROM ben_hrd_karyawan_info
            WHERE idkaryawan = ? AND active = 'Y'
        `;

        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Get employee details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get employee details',
            error: error.message
        });
    }
});

// Get Registered Fingerprints for Employee
app.get('/api/employee/:id/fingerprints', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT autonum, karyawanid, namakaryawan, fingerindex,
                   fingerimage,
                   notes
            FROM karyawanfpreg
            WHERE karyawanid = ?
            ORDER BY fingerindex
        `;

        const [rows] = await db.execute(query, [id]);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Get fingerprints error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get registered fingerprints',
            error: error.message
        });
    }
});

// Register Fingerprint API
app.post('/api/register-fingerprint', async (req, res) => {
    try {
        console.log('🚀 === REGISTER FINGERPRINT API CALLED ===');
        console.log('📥 Request headers:', req.headers);
        console.log('📥 Request body keys:', Object.keys(req.body));
        console.log('📥 Full request body:', {
            karyawanid: req.body.karyawanid,
            namakaryawan: req.body.namakaryawan,
            fingerindex: req.body.fingerindex,
            fingerimageExists: !!req.body.fingerimage,
            fingerimageLength: req.body.fingerimage ? req.body.fingerimage.length : 0,
            fingerimageType: typeof req.body.fingerimage,
            fingerimagePreview: req.body.fingerimage ? req.body.fingerimage.substring(0, 50) + '...' : 'No data',
            notes: req.body.notes,
            bodyKeys: Object.keys(req.body)
        });

        const {
            karyawanid,
            namakaryawan,
            fingerindex,
            fingerimage,
            notes
        } = req.body;

        // Validation
        if (!karyawanid || !namakaryawan || fingerindex === undefined || !fingerimage) {
            console.log('❌ Validation failed - missing fields');
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (fingerindex < 0 || fingerindex > 9) {
            console.log('❌ Validation failed - invalid fingerindex:', fingerindex);
            return res.status(400).json({
                success: false,
                message: 'Finger index must be between 0 and 9'
            });
        }

        console.log('✅ Validation passed, checking for existing fingerprint...');
        console.log('🔍 Query parameters:', { karyawanid, fingerindex });

        // Check if fingerprint already exists for this finger
        const checkQuery = `
            SELECT autonum FROM karyawanfpreg
            WHERE karyawanid = ? AND fingerindex = ?
        `;
        const [existingRows] = await db.execute(checkQuery, [karyawanid, fingerindex]);

        console.log('🔍 Existing rows found:', existingRows.length);
        if (existingRows.length > 0) {
            console.log('🔍 Existing fingerprint details:', existingRows);
        }

        if (existingRows.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Finger ${fingerindex} is already registered for this employee`
            });
        }

        // Insert new fingerprint registration
        console.log('📝 PREPARING DATABASE INSERTION');
        const insertQuery = `
            INSERT INTO karyawanfpreg
            (karyawanid, namakaryawan, fingerindex, fingerimage, notes)
            VALUES (?, ?, ?, ?, ?)
        `;

        console.log('🗄️ EXECUTING DATABASE QUERY:', insertQuery);
        console.log('📊 Query parameters:', {
            param1: karyawanid,
            param2: namakaryawan,
            param3: fingerindex,
            param4: fingerimage ? `Data length: ${fingerimage.length}` : 'No data',
            param5: notes || `Finger ${fingerindex} registration`
        });

        const [result] = await db.execute(insertQuery, [
            karyawanid,
            namakaryawan,
            fingerindex,
            fingerimage,
            notes || `Finger ${fingerindex} registration`
        ]);

        console.log('✅ DATABASE INSERTION SUCCESSFUL!');
        console.log('📊 Insert result:', {
            insertId: result.insertId,
            affectedRows: result.affectedRows,
            warningStatus: result.warningStatus
        });

        const responseData = {
            success: true,
            message: 'Fingerprint registered successfully',
            data: {
                id: result.insertId,
                karyawanid,
                namakaryawan,
                fingerindex,
                notes: notes || `Finger ${fingerindex} registration`
            }
        };

        console.log('📤 SENDING SUCCESS RESPONSE:', responseData);
        res.status(201).json(responseData);

    } catch (error) {
        console.error('Register fingerprint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register fingerprint',
            error: error.message
        });
    }
});

// Update Fingerprint API
app.put('/api/fingerprint/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fingerimage, notes } = req.body;

        if (!fingerimage) {
            return res.status(400).json({
                success: false,
                message: 'Fingerprint image is required'
            });
        }

        const updateQuery = `
            UPDATE karyawanfpreg
            SET fingerimage = ?, notes = ?
            WHERE autonum = ?
        `;

        const [result] = await db.execute(updateQuery, [fingerimage, notes, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Fingerprint record not found'
            });
        }

        res.json({
            success: true,
            message: 'Fingerprint updated successfully'
        });

    } catch (error) {
        console.error('Update fingerprint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update fingerprint',
            error: error.message
        });
    }
});

// Delete Fingerprint API
app.delete('/api/fingerprint/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = 'DELETE FROM karyawanfpreg WHERE autonum = ?';
        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Fingerprint record not found'
            });
        }

        res.json({
            success: true,
            message: 'Fingerprint deleted successfully'
        });

    } catch (error) {
        console.error('Delete fingerprint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete fingerprint',
            error: error.message
        });
    }
});

// Serve static files from client build (only in production)
// Commented out for development mode since Vue.js dev server handles this
// app.use(express.static(path.join(__dirname, 'client/dist')));

// Catch all handler for Vue.js router (only in production)
// Commented out for development mode since Vue.js dev server handles this
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/dist/index.html'));
// });

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Start Server
async function startServer() {
    await initializeDatabase();

    // Use the PORT from environment or default to 3000
    const serverPort = parseInt(process.env.PORT) || 3000;

    app.listen(serverPort, () => {
        console.log(`🚀 Server running on port ${serverPort}`);
        console.log(`📱 API Base URL: http://localhost:${serverPort}/api`);
        console.log(`🌐 Frontend URL: http://localhost:${serverPort}`);
        console.log('📊 Database connected: bc_zen');
        console.log(`🔗 Make sure to update Vue config proxy to port ${serverPort}`);
    });
}

// Helper function to find available port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const net = require('net');

        function testPort(port) {
            const server = net.createServer();

            server.listen(port, () => {
                server.once('close', () => {
                    resolve(port);
                });
                server.close();
            });

            server.on('error', () => {
                testPort(port + 1);
            });
        }

        testPort(startPort);
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down gracefully...');
    if (db) {
        await db.end();
        console.log('✅ Database connection closed');
    }
    process.exit(0);
});

startServer().catch(console.error);