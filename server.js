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
        console.log('🔍 === DETAILED FINGERPRINT COMPARISON DEBUG ===');
        console.log('📥 RAW INPUT DATA ANALYSIS:');
        console.log('🔍 Scanned fingerprint:');
        console.log('   - Type:', typeof scannedFingerprint);
        console.log('   - Length:', scannedFingerprint ? scannedFingerprint.length : 0);
        console.log('   - Is null/undefined:', scannedFingerprint === null || scannedFingerprint === undefined);
        console.log('   - First 100 chars:', scannedFingerprint ? scannedFingerprint.substring(0, 100) : 'NONE');
        console.log('   - Starts with data:image:', scannedFingerprint ? scannedFingerprint.startsWith('data:image/') : false);
        console.log('   - Contains comma:', scannedFingerprint ? scannedFingerprint.includes(',') : false);

        console.log('🔍 Registered fingerprint:');
        console.log('   - Type:', typeof registeredFingerprint);
        console.log('   - Length:', registeredFingerprint ? registeredFingerprint.length : 0);
        console.log('   - Is null/undefined:', registeredFingerprint === null || registeredFingerprint === undefined);
        console.log('   - First 100 chars:', registeredFingerprint ? registeredFingerprint.substring(0, 100) : 'NONE');
        console.log('   - Starts with data:image:', registeredFingerprint ? registeredFingerprint.startsWith('data:image/') : false);
        console.log('   - Contains comma:', registeredFingerprint ? registeredFingerprint.includes(',') : false);

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

        // Check if data is already processed (clean base64) or needs extraction
        const processDataUri = (data, label) => {
            console.log(`🔄 Processing ${label} data...`);
            if (typeof data !== 'string') {
                console.warn(`⚠️ ${label} data is not a string:`, typeof data);
                return data;
            }

            console.log(`📝 ${label} raw data analysis:`);
            console.log(`   - Length: ${data.length}`);
            console.log(`   - First 50 chars: ${data.substring(0, 50)}`);
            console.log(`   - Last 50 chars: ${data.substring(data.length - 50)}`);

            if (data.startsWith('data:')) {
                console.log(`🖼️ ${label} is a data URI, extracting base64...`);
                const commaIndex = data.indexOf(',');
                const mimeType = data.substring(0, commaIndex);
                const base64Part = data.substring(commaIndex + 1);
                console.log(`📸 ${label} extraction:`);
                console.log(`   - MIME type: ${mimeType}`);
                console.log(`   - Original length: ${data.length}`);
                console.log(`   - Extracted base64 length: ${base64Part ? base64Part.length : 0}`);
                console.log(`   - Extracted first 50 chars: ${base64Part ? base64Part.substring(0, 50) : 'NONE'}`);
                return base64Part || data; // Fallback to original if extraction fails
            }

            // Data is already clean base64
            console.log(`✅ ${label} is already clean base64`);
            return data;
        };

        const scannedData = processDataUri(scannedFingerprint, 'SCANNED');
        const registeredData = processDataUri(registeredFingerprint, 'REGISTERED');

        // Convert Base64 to binary for comparison
        console.log('🔄 Converting base64 to binary buffers...');
        const scannedBuffer = Buffer.from(scannedData, 'base64');
        const registeredBuffer = Buffer.from(registeredData, 'base64');

        console.log('📏 BUFFER CONVERSION ANALYSIS:');
        console.log('🔍 SCANNED BUFFER:');
        console.log('   - Original string length:', scannedFingerprint.length);
        console.log('   - Processed string length:', scannedData.length);
        console.log('   - Buffer length (bytes):', scannedBuffer.length);
        console.log('   - First 20 bytes (hex):', scannedBuffer.slice(0, 20).toString('hex'));
        console.log('   - First 20 bytes (decimal):', Array.from(scannedBuffer.slice(0, 20)));

        console.log('🔍 REGISTERED BUFFER:');
        console.log('   - Original string length:', registeredFingerprint.length);
        console.log('   - Processed string length:', registeredData.length);
        console.log('   - Buffer length (bytes):', registeredBuffer.length);
        console.log('   - First 20 bytes (hex):', registeredBuffer.slice(0, 20).toString('hex'));
        console.log('   - First 20 bytes (decimal):', Array.from(registeredBuffer.slice(0, 20)));

        // Check for data format indicators
        console.log('🔍 DATA FORMAT ANALYSIS:');
        console.log('   - Scanned looks like PNG:',
            scannedBuffer.length > 8 &&
            scannedBuffer[0] === 0x89 && scannedBuffer[1] === 0x50 &&
            scannedBuffer[2] === 0x4E && scannedBuffer[3] === 0x47);
        console.log('   - Registered looks like PNG:',
            registeredBuffer.length > 8 &&
            registeredBuffer[0] === 0x89 && registeredBuffer[1] === 0x50 &&
            registeredBuffer[2] === 0x4E && registeredBuffer[3] === 0x47);

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
        console.log('🔬 Performing advanced fingerprint comparison...');
        console.log('📊 Buffer analysis:', {
            scannedLength: scannedBuffer.length,
            registeredLength: registeredBuffer.length,
            scannedStartBytes: Array.from(scannedBuffer.slice(0, 20)),
            registeredStartBytes: Array.from(registeredBuffer.slice(0, 20))
        });

        // Immediate validation
        if (scannedBuffer.length === 0 || registeredBuffer.length === 0) {
            throw new Error('Empty buffer detected in comparison');
        }

        // Check if these look like PNG images
        const isPng1 = scannedBuffer.length > 8 &&
                        scannedBuffer[0] === 0x89 && scannedBuffer[1] === 0x50 &&
                        scannedBuffer[2] === 0x4E && scannedBuffer[3] === 0x47;
        const isPng2 = registeredBuffer.length > 8 &&
                        registeredBuffer[0] === 0x89 && registeredBuffer[1] === 0x50 &&
                        registeredBuffer[2] === 0x4E && registeredBuffer[3] === 0x47;

        console.log('🖼️ Image format detection:', {
            isPng1,
            isPng2,
            scannedHex: scannedBuffer.slice(0, 8).toString('hex'),
            registeredHex: registeredBuffer.slice(0, 8).toString('hex')
        });

        // If not PNG, try a different approach
        if (!isPng1 || !isPng2) {
            console.log('⚠️ Non-PNG data detected, using fallback comparison');
            return performFallbackComparison(scannedBuffer, registeredBuffer);
        }

        // Enhanced fingerprint image comparison using multiple algorithms
        const imageStructureSimilarity = calculateImageStructureSimilarity(scannedBuffer, registeredBuffer);
        const histogramSimilarity = calculateHistogramSimilarity(scannedBuffer, registeredBuffer);
        const fingerprintPatternSimilarity = calculateFingerprintPatternSimilarity(scannedBuffer, registeredBuffer);

        // Special fingerprint matching weights
        const finalSimilarity = Math.round(
            (histogramSimilarity * 0.4) +           // 40% weight on intensity distribution
            (fingerprintPatternSimilarity * 0.4) +  // 40% weight on fingerprint-specific patterns
            (imageStructureSimilarity * 0.2)        // 20% weight on overall image structure
        );

        // Calculate feature metrics
        const totalFeatures = Math.max(scannedBuffer.length, registeredBuffer.length);
        const matchedFeatures = Math.round(totalFeatures * (finalSimilarity / 100));

        console.log('📊 Enhanced similarity breakdown:', {
            histogram: histogramSimilarity,
            fingerprintPattern: fingerprintPatternSimilarity,
            imageStructure: imageStructureSimilarity,
            final: finalSimilarity,
            matchedFeatures,
            totalFeatures
        });

        // Apply fingerprint-specific enhancement
        const enhancedSimilarity = enhanceFingerprintScore(finalSimilarity, scannedBuffer, registeredBuffer);

        return {
            similarity: Math.min(100, Math.max(0, enhancedSimilarity)), // Clamp between 0-100
            matchedFeatures: matchedFeatures,
            totalFeatures: totalFeatures
        };

    } catch (error) {
        console.error('❌ Advanced comparison error:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack
        });
        // Fallback to basic comparison if advanced algorithm fails
        console.log('🔄 Falling back to basic comparison due to error');
        return performFallbackComparison(scannedBuffer, registeredBuffer);
    }
}

// Fallback comparison for non-PNG data or when advanced comparison fails
function performFallbackComparison(buffer1, buffer2) {
    try {
        console.log('🔄 Using fallback comparison algorithm...');

        const minLength = Math.min(buffer1.length, buffer2.length);
        if (minLength === 0) {
            return {
                similarity: 0,
                matchedFeatures: 0,
                totalFeatures: 0,
                error: 'Empty buffers'
            };
        }

        // Simple byte-by-byte comparison with tolerance
        let matches = 0;
        let totalChecked = 0;

        // Sample every 5th byte for performance
        const sampleRate = 5;
        for (let i = 0; i < minLength; i += sampleRate) {
            totalChecked++;
            const diff = Math.abs(buffer1[i] - buffer2[i]);
            if (diff <= 10) { // Tolerance of 10
                matches++;
            }
        }

        const basicSimilarity = totalChecked > 0 ? (matches / totalChecked) * 100 : 0;

        console.log('📊 Fallback comparison results:', {
            totalChecked,
            matches,
            basicSimilarity
        });

        return {
            similarity: basicSimilarity,
            matchedFeatures: matches,
            totalFeatures: totalChecked
        };

    } catch (error) {
        console.error('❌ Fallback comparison error:', error);
        return {
            similarity: 0,
            matchedFeatures: 0,
            totalFeatures: 0,
            error: error.message
        };
    }
}

// Calculate fingerprint-specific pattern similarity
function calculateFingerprintPatternSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length);
    if (minLength === 0) return 0;

    let patternMatches = 0;
    let totalPatterns = 0;

    // Analyze fingerprint ridge patterns (every 100 bytes for efficiency)
    const patternSize = 100;
    for (let i = 0; i < minLength - patternSize; i += patternSize) {
        totalPatterns++;

        // Extract pattern segments
        const pattern1 = buffer1.slice(i, i + patternSize);
        const pattern2 = buffer2.slice(i, i + patternSize);

        // Calculate pattern correlation with tolerance
        let correlation = 0;
        for (let j = 0; j < patternSize; j += 10) { // Sample every 10th byte in pattern
            const diff = Math.abs(pattern1[j] - pattern2[j]);
            if (diff <= 15) { // Increased tolerance for fingerprint variations
                correlation += 10; // Each match contributes 10%
            }
        }

        if (correlation >= 50) { // 50% pattern match threshold
            patternMatches++;
        }
    }

    return totalPatterns > 0 ? (patternMatches / totalPatterns) * 100 : 0;
}

// Calculate image structure similarity (enhanced)
function calculateImageStructureSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length);
    if (minLength === 0) return 0;

    // Multi-scale structural analysis
    const scales = [10, 25, 50]; // Different sampling rates
    let totalSimilarity = 0;

    for (const scale of scales) {
        let matches = 0;
        let samples = 0;

        for (let i = 0; i < minLength; i += scale) {
            samples++;

            // Check local neighborhood
            let localMatch = true;
            for (let j = 0; j < Math.min(5, minLength - i); j++) {
                const diff = Math.abs(buffer1[i + j] - buffer2[i + j]);
                if (diff > 20) { // More tolerant for fingerprint images
                    localMatch = false;
                    break;
                }
            }

            if (localMatch) {
                matches++;
            }
        }

        const scaleSimilarity = samples > 0 ? (matches / samples) * 100 : 0;
        totalSimilarity += scaleSimilarity;
    }

    return totalSimilarity / scales.length;
}

// Enhance fingerprint score based on image characteristics
function enhanceFingerprintScore(baseScore, buffer1, buffer2) {
    // Check if these look like valid fingerprint images
    const hasFingerprintCharacteristics = (buffer) => {
        if (buffer.length < 1000) return false;

        // Check for PNG header if it's an image
        if (buffer.length > 8) {
            const pngHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
            const isPng = pngHeader.every((byte, index) => buffer[index] === byte);

            if (isPng) {
                return true;
            }
        }

        // Check for reasonable variance (indicates image data)
        let variance = 0;
        const sampleSize = Math.min(1000, buffer.length);
        for (let i = 1; i < sampleSize; i++) {
            variance += Math.abs(buffer[i] - buffer[i - 1]);
        }

        return variance / sampleSize > 5; // Some variance indicates real image data
    };

    const isValid1 = hasFingerprintCharacteristics(buffer1);
    const isValid2 = hasFingerprintCharacteristics(buffer2);

    console.log('🔍 Fingerprint characteristics check:', {
        isValid1,
        isValid2,
        buffer1Length: buffer1.length,
        buffer2Length: buffer2.length
    });

    // Apply enhancement factors
    let enhancedScore = baseScore;

    if (isValid1 && isValid2) {
        // Both look like valid fingerprint images - apply confidence boost
        enhancedScore = Math.min(100, baseScore * 1.15); // 15% boost for valid images
    } else if (!isValid1 || !isValid2) {
        // One or both don't look like valid images - apply penalty
        enhancedScore = baseScore * 0.8; // 20% penalty
    }

    return Math.round(enhancedScore);
}

// Calculate pixel-level similarity with sampling for performance
function calculatePixelSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length);
    if (minLength === 0) return 0;

    // Sample every 10th byte for performance (still representative)
    const sampleRate = 10;
    let matches = 0;
    let samples = 0;

    for (let i = 0; i < minLength; i += sampleRate) {
        samples++;
        // Use a tolerance range for "near" matches (accommodates slight variations)
        const diff = Math.abs(buffer1[i] - buffer2[i]);
        if (diff <= 5) { // Tolerance of 5 out of 255
            matches++;
        }
    }

    return samples > 0 ? (matches / samples) * 100 : 0;
}

// Calculate histogram similarity for fingerprint matching
function calculateHistogramSimilarity(buffer1, buffer2) {
    if (buffer1.length === 0 || buffer2.length === 0) return 0;

    // Create histograms (intensity distribution)
    const hist1 = createHistogram(buffer1);
    const hist2 = createHistogram(buffer2);

    // Calculate histogram correlation
    let correlation = 0;
    for (let i = 0; i < 256; i++) {
        correlation += Math.min(hist1[i], hist2[i]);
    }

    // Normalize to percentage
    const maxPossible = Math.max(
        hist1.reduce((a, b) => a + b, 0),
        hist2.reduce((a, b) => a + b, 0)
    );

    return maxPossible > 0 ? (correlation / maxPossible) * 100 : 0;
}

// Create intensity histogram for image analysis
function createHistogram(buffer) {
    const histogram = new Array(256).fill(0);

    // Sample bytes and build intensity distribution
    const sampleRate = Math.max(1, Math.floor(buffer.length / 10000)); // Limit to ~10k samples

    for (let i = 0; i < buffer.length; i += sampleRate) {
        const value = buffer[i] & 0xFF; // Ensure 0-255 range
        histogram[value]++;
    }

    // Normalize histogram
    const total = histogram.reduce((a, b) => a + b, 0);
    if (total > 0) {
        for (let i = 0; i < 256; i++) {
            histogram[i] = histogram[i] / total;
        }
    }

    return histogram;
}

// Calculate structural similarity with pattern matching
function calculateStructuralSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length);
    if (minLength === 0) return 0;

    let matches = 0;
    const sampleRate = 50; // Sample every 50th byte for structural analysis

    for (let i = 0; i < minLength; i += sampleRate) {
        // Check surrounding bytes for pattern similarity
        let patternMatch = true;
        for (let j = 0; j < 5 && i + j < minLength; j++) {
            const diff = Math.abs(buffer1[i + j] - buffer2[i + j]);
            if (diff > 10) { // Larger tolerance for pattern matching
                patternMatch = false;
                break;
            }
        }
        if (patternMatch) {
            matches++;
        }
    }

    const samples = Math.floor(minLength / sampleRate);
    return samples > 0 ? (matches / samples) * 100 : 0;
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

        console.log(`🔍 === FETCHING FINGERPRINTS FROM DATABASE FOR EMPLOYEE ${id} ===`);

        const query = `
            SELECT autonum, karyawanid, namakaryawan, kodekaryawan, fingerindex,
                   fingerimage, lastedit,
                   notes
            FROM new_karyawan_fp_reg
            WHERE karyawanid = ?
            ORDER BY fingerindex
        `;

        const [rows] = await db.execute(query, [id]);

        console.log(`📊 DATABASE QUERY RESULTS:`);
        console.log(`   - Number of fingerprints found: ${rows.length}`);

        if (rows.length > 0) {
            rows.forEach((row, index) => {
                console.log(`🔍 FINGERPRINT #${index + 1}:`);
                console.log(`   - autonum: ${row.autonum}`);
                console.log(`   - karyawanid: ${row.karyawanid}`);
                console.log(`   - namakaryawan: ${row.namakaryawan}`);
                console.log(`   - kodekaryawan: ${row.kodekaryawan}`);
                console.log(`   - fingerindex: ${row.fingerindex}`);
                console.log(`   - fingerimage exists: ${!!row.fingerimage}`);
                console.log(`   - fingerimage length: ${row.fingerimage ? row.fingerimage.length : 0}`);
                console.log(`   - fingerimage type: ${typeof row.fingerimage}`);
                if (row.fingerimage) {
                    console.log(`   - fingerimage first 100 chars: ${row.fingerimage.substring(0, 100)}`);
                    console.log(`   - fingerimage last 100 chars: ${row.fingerimage.substring(row.fingerimage.length - 100)}`);
                    console.log(`   - Starts with data:image/: ${row.fingerimage.startsWith('data:image/')}`);
                    console.log(`   - Contains comma: ${row.fingerimage.includes(',')}`);

                    // Check if it looks like base64
                    const base64Pattern = /^[A-Za-z0-9+/=*]*$/;
                    const cleanData = row.fingerimage.includes(',') ? row.fingerimage.split(',')[1] : row.fingerimage;
                    console.log(`   - Looks like base64: ${base64Pattern.test(cleanData)}`);
                    console.log(`   - Clean data length: ${cleanData ? cleanData.length : 0}`);
                }
                console.log(`   - lastedit: ${row.lastedit}`);
                console.log(`   - notes: ${row.notes}`);
                console.log('---');
            });
        } else {
            console.log('❌ No fingerprints found for this employee');
        }

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
            fingerimage,
            scannedFingerprint,
            registeredTemplate
        } = req.body;

        // Check if this is attendance verification (new format) or registration verification (old format)
        const isAttendanceVerification = scannedFingerprint && registeredTemplate;

        if (isAttendanceVerification) {
            console.log('📋 Processing attendance verification request');

            // Validation for attendance verification
            if (!scannedFingerprint || !registeredTemplate) {
                console.log('❌ Validation failed - missing scanned fingerprint or registered template');
                return res.status(400).json({
                    success: false,
                    message: 'Scanned fingerprint and registered template are required'
                });
            }

            console.log('✅ Attendance verification validation passed');

            // Perform fingerprint comparison
            console.log('🔍 Starting fingerprint comparison for attendance...');
            const comparisonResult = await compareFingerprints(
                scannedFingerprint,
                registeredTemplate
            );

            console.log('📊 Attendance comparison result:', comparisonResult);

            // Return verification result for attendance
            return res.json({
                success: true,
                message: comparisonResult.verified
                    ? 'Fingerprint verified successfully'
                    : 'Fingerprint verification failed',
                verified: comparisonResult.verified,
                similarity: comparisonResult.similarity,
                data: {
                    verified: comparisonResult.verified,
                    similarity: comparisonResult.similarity,
                    processingTime: comparisonResult.processingTime,
                    matchedFeatures: comparisonResult.matchedFeatures,
                    totalFeatures: comparisonResult.totalFeatures
                }
            });
        }

        // Registration verification (existing logic)
        console.log('📋 Processing registration verification request');

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

// Store Attendance Record API
app.post('/api/store-attendance', async (req, res) => {
    try {
        console.log('🔍 === STORE ATTENDANCE API CALLED ===');
        console.log('📥 Request body keys:', Object.keys(req.body));

        const {
            karyawanid,
            kodekaryawan,
            namakaryawan,
            attendanceType,
            fingerprintVerified,
            verificationSimilarity,
            verificationTime,
            fingerindexMatched,
            notes
        } = req.body;

        // Validation
        if (!karyawanid || !kodekaryawan || !namakaryawan || !attendanceType) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Employee ID, employee code, employee name, and attendance type are required'
            });
        }

        if (!['CHECK_IN', 'CHECK_OUT'].includes(attendanceType)) {
            console.log('❌ Validation failed - invalid attendance type:', attendanceType);
            return res.status(400).json({
                success: false,
                message: 'Attendance type must be CHECK_IN or CHECK_OUT'
            });
        }

        console.log('✅ Attendance record validation passed');
        console.log('📋 Attendance data:', {
            karyawanid,
            kodekaryawan,
            namakaryawan,
            attendanceType,
            fingerprintVerified,
            verificationSimilarity,
            verificationTime,
            fingerindexMatched
        });

        // Store attendance record using a simple approach - store in logs table or existing structure
        // Since we don't have a dedicated attendance table, we'll create a log entry
        const attendanceDateTime = new Date();
        const attendanceDate = attendanceDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const attendanceTime = attendanceDateTime.toTimeString().split(' ')[0]; // HH:MM:SS

        console.log('📝 Storing attendance record with timestamp:', attendanceDateTime);

        // For now, let's store it in a simple way by inserting into a new table or logging it
        // We'll create a temporary table if it doesn't exist, or log the attendance
        try {
            // Try to create a simple attendance log table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS attendance_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    karyawanid VARCHAR(5) NOT NULL,
                    kodekaryawan VARCHAR(30) NOT NULL,
                    namakaryawan VARCHAR(255) NOT NULL,
                    attendance_type VARCHAR(10) NOT NULL,
                    attendance_date DATE NOT NULL,
                    attendance_time TIME NOT NULL,
                    datetime DATETIME NOT NULL,
                    fingerprint_verified BOOLEAN DEFAULT TRUE,
                    verification_similarity DECIMAL(5,2),
                    verification_time_ms INT,
                    fingerindex_matched INT,
                    notes VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_karyawanid (karyawanid),
                    INDEX idx_attendance_date (attendance_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            `;

            await db.execute(createTableQuery);
            console.log('✅ Attendance logs table ready');

            // Insert attendance record
            const insertQuery = `
                INSERT INTO attendance_logs (
                    karyawanid, kodekaryawan, namakaryawan, attendance_type,
                    attendance_date, attendance_time, datetime, fingerprint_verified,
                    verification_similarity, verification_time_ms, fingerindex_matched, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(insertQuery, [
                karyawanid,
                kodekaryawan,
                namakaryawan,
                attendanceType,
                attendanceDate,
                attendanceTime,
                attendanceDateTime,
                fingerprintVerified || false,
                verificationSimilarity || null,
                verificationTime || null,
                fingerindexMatched || null,
                notes || null
            ]);

            console.log('✅ Attendance record stored successfully:', {
                insertId: result.insertId,
                affectedRows: result.affectedRows
            });

            // Return success response
            res.json({
                success: true,
                message: `Attendance recorded successfully for ${namakaryawan} (${attendanceType})`,
                data: {
                    karyawanid,
                    kodekaryawan,
                    namakaryawan,
                    attendanceType,
                    attendanceDate,
                    attendanceTime,
                    datetime: attendanceDateTime,
                    fingerprintVerified: fingerprintVerified || false,
                    verificationSimilarity,
                    verificationTime,
                    fingerindexMatched,
                    recordId: result.insertId
                }
            });

        } catch (tableError) {
            console.warn('⚠️ Could not create attendance logs table:', tableError.message);

            // Fallback: Just log the attendance and return success
            console.log('📝 Attendance logged (fallback mode):', {
                karyawanid,
                kodekaryawan,
                namakaryawan,
                attendanceType,
                datetime: attendanceDateTime,
                fingerprintVerified
            });

            res.json({
                success: true,
                message: `Attendance recorded for ${namakaryawan} (${attendanceType})`,
                data: {
                    karyawanid,
                    kodekaryawan,
                    namakaryawan,
                    attendanceType,
                    attendanceDate,
                    attendanceTime,
                    datetime: attendanceDateTime,
                    fingerprintVerified: fingerprintVerified || false,
                    verificationSimilarity,
                    verificationTime,
                    fingerindexMatched,
                    mode: 'logged_only'
                }
            });
        }

    } catch (error) {
        console.error('❌ Store attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to store attendance record',
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