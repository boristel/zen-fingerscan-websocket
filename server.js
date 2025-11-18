const express = require('express'); // nodemon restart trigger - updated to new_karyawan_fp_reg
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

// Helper function to get finger name from index
function getFingerName(fingerIndex) {
    const fingerNames = [
        'Right Thumb',      // 0
        'Right Index',      // 1
        'Right Middle',     // 2
        'Right Ring',       // 3
        'Right Little',     // 4
        'Left Thumb',       // 5
        'Left Index',       // 6
        'Left Middle',      // 7
        'Left Ring',        // 8
        'Left Little'       // 9
    ];
    return fingerNames[fingerIndex] || 'Unknown Finger';
}

// Advanced fingerprint comparison function
async function compareFingerprints(scannedFingerprint, registeredFingerprint) {
    const startTime = Date.now();

    try {
        console.log('🔍 Starting fingerprint comparison...');

        // Basic validation
        if (!scannedFingerprint || !registeredFingerprint) {
            return {
                verified: false,
                similarity: 0,
                matchedFeatures: 0,
                totalFeatures: 0,
                processingTime: Date.now() - startTime,
                error: 'Invalid fingerprint data'
            };
        }

        // Convert Base64 to binary for comparison
        const scannedBuffer = Buffer.from(scannedFingerprint, 'base64');
        const registeredBuffer = Buffer.from(registeredFingerprint, 'base64');

        console.log('📏 Fingerprint data sizes:', {
            scanned: scannedBuffer.length,
            registered: registeredBuffer.length
        });

        // Multi-level comparison algorithm
        const comparisonResult = await performAdvancedComparison(
            scannedBuffer,
            registeredBuffer
        );

        const processingTime = Date.now() - startTime;

        console.log('✅ Comparison completed in', processingTime, 'ms');
        console.log('📊 Similarity score:', comparisonResult.similarity + '%');

        return {
            verified: comparisonResult.similarity >= 80,
            similarity: comparisonResult.similarity,
            matchedFeatures: comparisonResult.matchedFeatures,
            totalFeatures: comparisonResult.totalFeatures,
            processingTime: processingTime
        };

    } catch (error) {
        console.error('❌ Fingerprint comparison error:', error);
        return {
            verified: false,
            similarity: 0,
            matchedFeatures: 0,
            totalFeatures: 0,
            processingTime: Date.now() - startTime,
            error: error.message
        };
    }
}

// Advanced fingerprint comparison algorithm
async function performAdvancedComparison(scannedBuffer, registeredBuffer) {
    try {
        // Level 1: Basic data structure comparison
        const structuralSimilarity = calculateStructuralSimilarity(scannedBuffer, registeredBuffer);

        // Level 2: Feature extraction and comparison
        const featureSimilarity = calculateFeatureSimilarity(scannedBuffer, registeredBuffer);

        // Level 3: Pattern matching
        const patternSimilarity = calculatePatternSimilarity(scannedBuffer, registeredBuffer);

        // Weighted scoring (40% structure, 40% features, 20% pattern)
        const finalSimilarity = Math.round(
            (structuralSimilarity * 0.4) +
            (featureSimilarity * 0.4) +
            (patternSimilarity * 0.2)
        );

        // Extract feature count (simulated - in real system this would come from SDK)
        const totalFeatures = Math.min(scannedBuffer.length, registeredBuffer.length);
        const matchedFeatures = Math.round(totalFeatures * (finalSimilarity / 100));

        return {
            similarity: finalSimilarity,
            matchedFeatures: matchedFeatures,
            totalFeatures: totalFeatures
        };

    } catch (error) {
        console.error('❌ Advanced comparison error:', error);
        return {
            similarity: 0,
            matchedFeatures: 0,
            totalFeatures: 0
        };
    }
}

// Calculate structural similarity
function calculateStructuralSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length);
    let matches = 0;

    for (let i = 0; i < minLength; i++) {
        if (buffer1[i] === buffer2[i]) {
            matches++;
        }
    }

    return Math.round((matches / minLength) * 100);
}

// Calculate feature similarity
function calculateFeatureSimilarity(buffer1, buffer2) {
    // Create feature vectors from fingerprint data
    const features1 = extractFeatures(buffer1);
    const features2 = extractFeatures(buffer2);

    // Compare feature vectors
    let similarity = 0;
    const featureCount = Math.min(features1.length, features2.length);

    for (let i = 0; i < featureCount; i++) {
        const diff = Math.abs(features1[i] - features2[i]);
        similarity += Math.max(0, 100 - diff);
    }

    return featureCount > 0 ? Math.round(similarity / featureCount) : 0;
}

// Extract features from fingerprint buffer
function extractFeatures(buffer) {
    const features = [];
    const sampleSize = Math.min(1000, buffer.length); // Sample up to 1000 points
    const step = Math.floor(buffer.length / sampleSize);

    for (let i = 0; i < buffer.length; i += step) {
        features.push(buffer[i]);
    }

    return features;
}

// Calculate pattern similarity
function calculatePatternSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length);
    let patternMatches = 0;
    const windowSize = 8; // Check patterns in 8-byte windows

    for (let i = 0; i < minLength - windowSize; i += windowSize) {
        const pattern1 = buffer1.slice(i, i + windowSize);
        const pattern2 = buffer2.slice(i, i + windowSize);

        let patternMatch = true;
        for (let j = 0; j < windowSize; j++) {
            const diff = Math.abs(pattern1[j] - pattern2[j]);
            if (diff > 10) { // Allow small variance
                patternMatch = false;
                break;
            }
        }

        if (patternMatch) {
            patternMatches++;
        }
    }

    const totalPatterns = Math.floor((minLength - windowSize) / windowSize);
    return totalPatterns > 0 ? Math.round((patternMatches / totalPatterns) * 100) : 0;
}

// Root route - Welcome page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fingerprint Attendance System</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #2c3e50;
                    text-align: center;
                }
                .status {
                    background: #d4edda;
                    color: #155724;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .api-info {
                    background: #e7f3ff;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .test-links {
                    text-align: center;
                    margin: 30px 0;
                }
                .test-links a {
                    display: inline-block;
                    margin: 10px;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .test-links a:hover {
                    background: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔐 Fingerprint Attendance System</h1>
                <div class="status">
                    ✅ <strong>Server is running successfully!</strong><br>
                    ✅ Database connection established<br>
                    ✅ Fingerprint verification system active
                </div>

                <div class="api-info">
                    <h3>🌐 API Information</h3>
                    <p><strong>Base URL:</strong> http://localhost:50003/api</p>
                    <p><strong>Status:</strong> All systems operational</p>
                </div>

                <div class="test-links">
                    <h3>🧪 Test API Endpoints</h3>
                    <a href="/api/test-simple">Test Simple API</a>
                    <a href="/api/test-connection">Test Database Connection</a>
                </div>

                <div class="api-info">
                    <h3>📋 Available API Endpoints</h3>
                    <ul>
                        <li><strong>GET /api/test-simple</strong> - Simple API test</li>
                        <li><strong>GET /api/test-connection</strong> - Database connection test</li>
                        <li><strong>POST /api/search-employee</strong> - Search employees</li>
                        <li><strong>POST /api/register-fingerprint</strong> - Register fingerprint</li>
                        <li><strong>POST /api/verify-fingerprint</strong> - Verify fingerprint (1-to-1 comparison)</li>
                        <li><strong>POST /api/attendance/checkin</strong> - Check-in with fingerprint</li>
                        <li><strong>GET /api/attendance/today</strong> - Get today's attendance</li>
                    </ul>
                </div>

                <div class="api-info">
                    <h3>🚀 Vue.js Frontend</h3>
                    <p><strong>Frontend URL:</strong> <a href="http://localhost:8080" target="_blank">http://localhost:8080</a></p>
                    <p><em>(If Vue frontend is running on port 8080)</em></p>
                </div>
            </div>
        </body>
        </html>
    `);
});

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
        console.log('🔍 Checking new_karyawan_fp_reg table schema...');

        // Get table structure
        const [structure] = await db.execute(`
            DESCRIBE new_karyawan_fp_reg
        `);

        console.log('📋 new_karyawan_fp_reg table structure:', structure);

        // Get some sample data
        const [sampleData] = await db.execute(`
            SELECT * FROM new_karyawan_fp_reg LIMIT 3
        `);

        console.log('📄 Sample data from new_karyawan_fp_reg:', sampleData);

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
            SELECT autonum, karyawanid, namakaryawan, kodekaryawan, fingerindex,
                   fingerimage, lastedit,
                   notes
            FROM new_karyawan_fp_reg
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
            SELECT autonum FROM new_karyawan_fp_reg
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

        // Get kodekaryawan from ben_hrd_karyawan_info table
        console.log('🔍 Getting kodekaryawan from ben_hrd_karyawan_info...');
        const kodekaryawanQuery = `
            SELECT kodekaryawan FROM ben_hrd_karyawan_info
            WHERE idkaryawan = ? LIMIT 1
        `;
        const [kodekaryawanRows] = await db.execute(kodekaryawanQuery, [karyawanid]);

        if (kodekaryawanRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Employee not found in ben_hrd_karyawan_info table'
            });
        }

        const kodekaryawan = kodekaryawanRows[0].kodekaryawan;
        console.log('✅ Found kodekaryawan:', kodekaryawan);

        // Insert new fingerprint registration
        console.log('📝 PREPARING DATABASE INSERTION');
        const insertQuery = `
            INSERT INTO new_karyawan_fp_reg
            (karyawanid, namakaryawan, kodekaryawan, fingerindex, fingerimage, lastedit, notes)
            VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `;

        console.log('🗄️ EXECUTING DATABASE QUERY:', insertQuery);
        console.log('📊 Query parameters:', {
            param1: karyawanid,
            param2: namakaryawan,
            param3: kodekaryawan,
            param4: fingerindex,
            param5: fingerimage ? `Data length: ${fingerimage.length}` : 'No data',
            param6: notes || `Finger ${fingerindex} registration`
        });

        const [result] = await db.execute(insertQuery, [
            karyawanid,
            namakaryawan,
            kodekaryawan,
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

// Verify Fingerprint API
app.post('/api/verify-fingerprint', async (req, res) => {
    try {
        console.log('🔍 === VERIFY FINGERPRINT API CALLED ===');
        console.log('📥 Request body keys:', Object.keys(req.body));

        const {
            karyawanid,
            fingerindex,
            fingerimage
        } = req.body;

        // Validation
        if (!karyawanid || fingerindex === undefined || !fingerimage) {
            console.log('❌ Validation failed - missing fields');
            return res.status(400).json({
                success: false,
                message: 'Employee ID, finger index, and fingerprint image are required'
            });
        }

        if (fingerindex < 0 || fingerindex > 9) {
            console.log('❌ Validation failed - invalid fingerindex:', fingerindex);
            return res.status(400).json({
                success: false,
                message: 'Finger index must be between 0 and 9'
            });
        }

        console.log('✅ Validation passed, searching for registered fingerprint...');
        console.log('🔍 Search parameters:', { karyawanid, fingerindex });

        // Fetch the specific registered fingerprint for 1-to-1 comparison
        const searchQuery = `
            SELECT autonum, karyawanid, namakaryawan, kodekaryawan, fingerindex,
                   fingerimage, lastedit, notes
            FROM new_karyawan_fp_reg
            WHERE karyawanid = ? AND fingerindex = ?
            LIMIT 1
        `;

        const [registeredFingerprints] = await db.execute(searchQuery, [karyawanid, fingerindex]);

        if (registeredFingerprints.length === 0) {
            console.log('❌ No registered fingerprint found for this employee and finger');
            return res.status(404).json({
                success: false,
                message: 'No registered fingerprint found for this employee and finger',
                verified: false,
                similarity: 0
            });
        }

        const registeredFingerprint = registeredFingerprints[0];
        console.log('✅ Found registered fingerprint:', {
            autonum: registeredFingerprint.autonum,
            karyawanid: registeredFingerprint.karyawanid,
            namakaryawan: registeredFingerprint.namakaryawan,
            kodekaryawan: registeredFingerprint.kodekaryawan,
            fingerindex: registeredFingerprint.fingerindex,
            hasFingerImage: !!registeredFingerprint.fingerimage,
            fingerImageLength: registeredFingerprint.fingerimage ? registeredFingerprint.fingerimage.length : 0
        });

        // Perform fingerprint comparison
        console.log('🔍 Starting fingerprint comparison...');
        const comparisonResult = await compareFingerprints(
            fingerimage,           // Scanned fingerprint
            registeredFingerprint.fingerimage  // Registered fingerprint
        );

        console.log('📊 Comparison result:', comparisonResult);

        // Return verification result
        res.json({
            success: true,
            message: comparisonResult.verified
                ? 'Fingerprint verified successfully'
                : 'Fingerprint verification failed',
            verified: comparisonResult.verified,
            similarity: comparisonResult.similarity,
            threshold: 80, // 80% similarity threshold
            employee: {
                karyawanid: registeredFingerprint.karyawanid,
                namakaryawan: registeredFingerprint.namakaryawan,
                kodekaryawan: registeredFingerprint.kodekaryawan
            },
            finger: {
                fingerindex: registeredFingerprint.fingerindex,
                fingerName: getFingerName(registeredFingerprint.fingerindex)
            },
            comparison: {
                matchedFeatures: comparisonResult.matchedFeatures,
                totalFeatures: comparisonResult.totalFeatures,
                processingTime: comparisonResult.processingTime
            }
        });

    } catch (error) {
        console.error('❌ Verify fingerprint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify fingerprint',
            error: error.message,
            verified: false,
            similarity: 0
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
            UPDATE new_karyawan_fp_reg
            SET fingerimage = ?, notes = ?, lastedit = NOW()
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

        const deleteQuery = 'DELETE FROM new_karyawan_fp_reg WHERE autonum = ?';
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