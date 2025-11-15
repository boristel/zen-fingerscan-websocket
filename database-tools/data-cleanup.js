#!/usr/bin/env node

/**
 * Data Cleanup Tool for Fingerprint Attendance Database
 * Provides functions to clean, validate, and maintain database integrity
 */

const DatabaseManager = require('./db-manager');

class DataCleanup {
    constructor(dbManager) {
        this.db = dbManager;
    }

    /**
     * Clean up invalid or duplicate fingerprint registrations
     */
    async cleanupFingerprintRegistrations() {
        console.log('🧹 Cleaning up fingerprint registrations...\n');

        try {
            // Find duplicate registrations (same employee + same finger)
            const [duplicates] = await this.db.connection.execute(`
                SELECT karyawanid, namakaryawan, fingerindex, COUNT(*) as count
                FROM karyawanfpreg
                GROUP BY karyawanid, fingerindex
                HAVING COUNT(*) > 1
            `);

            if (duplicates.length === 0) {
                console.log('✅ No duplicate fingerprint registrations found');
                return;
            }

            console.log(`🔍 Found ${duplicates.length} employee-finger combinations with duplicates:`);

            for (const dup of duplicates) {
                console.log(`\n   Employee: ${dup.karyawanid} - ${dup.namakaryawan}`);
                console.log(`   Finger: ${dup.fingerindex} | Duplicates: ${dup.count}`);

                // Get all records for this employee/finger combination
                const [records] = await this.db.connection.execute(`
                    SELECT autonum, karyawanid, namakaryawan, fingerindex,
                           notes, DATE(autonum) as created_date
                    FROM karyawanfpreg
                    WHERE karyawanid = ? AND fingerindex = ?
                    ORDER BY autonum
                `, [dup.karyawanid, dup.fingerindex]);

                console.log('   Records:');
                records.forEach((record, index) => {
                    console.log(`     ${index + 1}. ID: ${record.autonum} | Notes: ${record.notes || 'None'} | Created: ${record.created_date}`);
                });

                // Keep the latest record, delete the rest
                const recordsToDelete = records.slice(0, -1);
                if (recordsToDelete.length > 0) {
                    console.log(`   🗑️  Deleting ${recordsToDelete.length} older records...`);

                    for (const record of recordsToDelete) {
                        await this.db.connection.execute(
                            'DELETE FROM karyawanfpreg WHERE autonum = ?',
                            [record.autonum]
                        );
                        console.log(`      Deleted record ID: ${record.autonum}`);
                    }
                }
            }

            console.log('\n✅ Cleanup completed successfully');

        } catch (error) {
            console.error('❌ Error during cleanup:', error.message);
            throw error;
        }
    }

    /**
     * Validate fingerprint data integrity
     */
    async validateFingerprintData() {
        console.log('🔍 Validating fingerprint data integrity...\n');

        try {
            // Check for null or empty critical fields
            const [invalidRecords] = await this.db.connection.execute(`
                SELECT COUNT(*) as count
                FROM karyawanfpreg
                WHERE karyawanid IS NULL OR karyawanid = ''
                   OR namakaryawan IS NULL OR namakaryawan = ''
                   OR fingerindex IS NULL
            `);

            if (invalidRecords[0].count > 0) {
                console.log(`❌ Found ${invalidRecords[0].count} records with invalid critical fields`);
            } else {
                console.log('✅ All records have valid critical fields');
            }

            // Check for empty fingerprint images
            const [emptyImages] = await this.db.connection.execute(`
                SELECT COUNT(*) as count
                FROM karyawanfpreg
                WHERE fingerimage IS NULL OR fingerimage = ''
            `);

            if (emptyImages[0].count > 0) {
                console.log(`⚠️  Found ${emptyImages[0].count} records with empty fingerprint images`);

                // Show details of records with empty images
                const [emptyImageDetails] = await this.db.connection.execute(`
                    SELECT autonum, karyawanid, namakaryawan, fingerindex
                    FROM karyawanfpreg
                    WHERE fingerimage IS NULL OR fingerimage = ''
                    LIMIT 5
                `);

                console.log('   Details:');
                emptyImageDetails.forEach((record, index) => {
                    console.log(`     ${index + 1}. Employee: ${record.karyawanid} - ${record.namakaryawan} | Finger: ${record.fingerindex}`);
                });
            } else {
                console.log('✅ All records have fingerprint images');
            }

            // Check for orphaned records (employees that don't exist in main table)
            const [orphanedRecords] = await this.db.connection.execute(`
                SELECT COUNT(*) as count
                FROM karyawanfpreg kfp
                LEFT JOIN ben_hrd_karyawan_info emp ON kfp.karyawanid = emp.idkaryawan
                WHERE emp.idkaryawan IS NULL
            `);

            if (orphanedRecords[0].count > 0) {
                console.log(`⚠️  Found ${orphanedRecords[0].count} fingerprint records for non-existent employees`);

                // Show some examples
                const [orphanedDetails] = await this.db.connection.execute(`
                    SELECT kfp.karyawanid, kfp.namakaryawan, kfp.fingerindex
                    FROM karyawanfpreg kfp
                    LEFT JOIN ben_hrd_karyawan_info emp ON kfp.karyawanid = emp.idkaryawan
                    WHERE emp.idkaryawan IS NULL
                    LIMIT 5
                `);

                console.log('   Examples:');
                orphanedDetails.forEach((record, index) => {
                    console.log(`     ${index + 1}. Employee: ${record.karyawanid} - ${record.namakaryawan} | Finger: ${record.fingerindex}`);
                });
            } else {
                console.log('✅ All fingerprint records reference existing employees');
            }

            // Check finger index validity (should be 0-9)
            const [invalidFingers] = await this.db.connection.execute(`
                SELECT COUNT(*) as count
                FROM karyawanfpreg
                WHERE fingerindex < 0 OR fingerindex > 9
            `);

            if (invalidFingers[0].count > 0) {
                console.log(`⚠️  Found ${invalidFingers[0].count} records with invalid finger indices (should be 0-9)`);
            } else {
                console.log('✅ All finger indices are valid (0-9)');
            }

        } catch (error) {
            console.error('❌ Error during validation:', error.message);
            throw error;
        }
    }

    /**
     * Fix data integrity issues
     */
    async fixDataIssues() {
        console.log('🔧 Fixing data integrity issues...\n');

        try {
            // Fix empty fingerprint images
            await this.db.connection.execute(`
                DELETE FROM karyawanfpreg
                WHERE fingerimage IS NULL OR fingerimage = ''
            `);
            console.log('🗑️  Deleted records with empty fingerprint images');

            // Fix invalid finger indices (set to 0 for invalid ones)
            await this.db.connection.execute(`
                UPDATE karyawanfpreg
                SET fingerindex = 0
                WHERE fingerindex < 0 OR fingerindex > 9
            `);
            console.log('🔧 Fixed invalid finger indices (set to 0)');

            // Add missing notes
            await this.db.connection.execute(`
                UPDATE karyawanfpreg
                SET notes = CONCAT('Finger ', fingerindex, ' registration')
                WHERE notes IS NULL OR notes = ''
            `);
            console.log('📝 Added missing notes for fingerprint records');

            console.log('✅ Data issues fixed successfully');

        } catch (error) {
            console.error('❌ Error fixing data issues:', error);
            throw error;
        }
    }

    /**
     * Analyze employee-fingerprint relationships
     */
    async analyzeEmployeeRelationships() {
        console.log('📊 Analyzing employee-fingerprint relationships...\n');

        try {
            // Get employees with fingerprint registrations
            const [employeesWithFp] = await this.db.connection.execute(`
                SELECT
                    emp.idkaryawan,
                    emp.namakaryawan,
                    emp.active,
                    COUNT(kfp.autonum) as fingerprint_count,
                    GROUP_CONCAT(DISTINCT kfp.fingerindex ORDER BY kfp.fingerindex) as registered_fingers
                FROM ben_hrd_karyawan_info emp
                LEFT JOIN karyawanfpreg kfp ON emp.idkaryawan = kfp.karyawanid
                GROUP BY emp.idkaryawan, emp.namakaryawan, emp.active
                ORDER BY fingerprint_count DESC, emp.namakaryawan
            `);

            console.log(`📈 Total employees: ${employeesWithFp.length}`);

            // Statistics
            const withFingerprints = employeesWithFp.filter(e => e.fingerprint_count > 0);
            const withoutFingerprints = employeesWithFp.filter(e => e.fingerprint_count === 0);
            const activeWithFp = withFingerprints.filter(e => e.active === 'Y');

            console.log(`👥 Employees with fingerprints: ${withFingerprints.length}`);
            console.log(`✅ Active employees with fingerprints: ${activeWithFp.length}`);
            console.log(`❌ Employees without fingerprints: ${withoutFingerprints.length}`);

            // Finger distribution
            const fingerCounts = {};
            for (let i = 0; i < 10; i++) {
                fingerCounts[i] = 0;
            }

            for (const emp of employeesWithFp) {
                if (emp.registered_fingers) {
                    const fingers = emp.registered_fingers.split(',');
                    for (const finger of fingers) {
                        const fingerIndex = parseInt(finger);
                        if (!isNaN(fingerIndex) && fingerIndex >= 0 && fingerIndex <= 9) {
                            fingerCounts[fingerIndex]++;
                        }
                    }
                }
            }

            console.log('\n👆 Finger Distribution:');
            const fingerNames = ['Left Thumb', 'Left Index', 'Left Middle', 'Left Ring', 'Left Little', 'Right Thumb', 'Right Index', 'Right Middle', 'Right Ring', 'Right Little'];

            for (let i = 0; i < 10; i++) {
                console.log(`   Finger ${i} (${fingerNames[i]}): ${fingerCounts[i]} registrations`);
            }

            // Show top employees with most fingerprints
            console.log('\n🏆 Top Employees by Fingerprint Count:');
            const topEmployees = employeesWithFp.slice(0, 5);
            topEmployees.forEach((emp, index) => {
                console.log(`   ${index + 1}. ${emp.namakaryawan} (${emp.idkaryawan}) - ${emp.fingerprint_count} fingers`);
                console.log(`      Status: ${emp.active === 'Y' ? 'Active' : 'Inactive'} | Fingers: ${emp.registered_fingers || 'None'}`);
            });

        } catch (error) {
            console.error('❌ Error analyzing relationships:', error.message);
            throw error;
        }
    }

    /**
     * Generate data quality report
     */
    async generateQualityReport() {
        console.log('📄 Generating Data Quality Report...\n');

        const report = {
            timestamp: new Date().toISOString(),
            database: 'bc_zen',
            sections: []
        };

        try {
            // Fingerprint registration summary
            const [fpSummary] = await this.db.connection.execute(`
                SELECT
                    COUNT(*) as total_registrations,
                    COUNT(DISTINCT karyawanid) as unique_employees,
                    COUNT(DISTINCT fingerindex) as unique_fingers,
                    SUM(CASE WHEN fingerimage IS NOT NULL AND fingerimage != '' THEN 1 ELSE 0 END) as with_images,
                    SUM(CASE WHEN notes IS NOT NULL AND notes != '' THEN 1 ELSE 0 END) as with_notes
                FROM karyawanfpreg
            `);

            report.sections.push({
                title: 'Fingerprint Registration Summary',
                data: fpSummary[0]
            });

            // Employee relationship summary
            const [empSummary] = await this.db.connection.execute(`
                SELECT
                    COUNT(*) as total_employees,
                    COUNT(CASE WHEN active = 'Y' THEN 1 END) as active_employees,
                    COUNT(DISTINCT kfp.karyawanid) as employees_with_fingerprints
                FROM ben_hrd_karyawan_info emp
                LEFT JOIN karyawanfpreg kfp ON emp.idkaryawan = kfp.karyawanid
            `);

            report.sections.push({
                title: 'Employee Relationship Summary',
                data: empSummary[0]
            });

            // Data quality metrics
            const [qualityMetrics] = await this.db.connection.execute(`
                SELECT
                    COUNT(*) as total_records,
                    SUM(CASE WHEN karyawanid IS NOT NULL AND karyawanid != '' THEN 1 ELSE 0 END) as valid_karyawanid,
                    SUM(CASE WHEN namakaryawan IS NOT NULL AND namakaryawan != '' THEN 1 ELSE 0 END) as valid_namakaryawan,
                    SUM(CASE WHEN fingerimage IS NOT NULL AND fingerimage != '' THEN 1 ELSE 0 END) as valid_fingerimage,
                    SUM(CASE WHEN fingerindex BETWEEN 0 AND 9 THEN 1 ELSE 0 END) as valid_fingerindex
                FROM karyawanfpreg
            `);

            report.sections.push({
                title: 'Data Quality Metrics',
                data: qualityMetrics[0]
            });

            // Save report to file
            const fs = require('fs');
            const path = require('path');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = path.join(__dirname, 'reports', `quality-report_${timestamp}.json`);

            // Create reports directory if it doesn't exist
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }

            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

            console.log('📄 Data Quality Report:');
            console.log('   ✅ Fingerprint Registration Summary:');
            Object.entries(fpSummary[0]).forEach(([key, value]) => {
                console.log(`      ${key}: ${value}`);
            });

            console.log('\n   👥 Employee Relationship Summary:');
            Object.entries(empSummary[0]).forEach(([key, value]) => {
                console.log(`      ${key}: ${value}`);
            });

            console.log('\n   🔍 Data Quality Metrics:');
            Object.entries(qualityMetrics[0]).forEach(([key, value]) => {
                const percentage = ((value / qualityMetrics[0].total_records) * 100).toFixed(2);
                console.log(`      ${key}: ${value} (${percentage}%)`);
            });

            console.log(`\n💾 Report saved to: ${reportPath}`);

        } catch (error) {
            console.error('❌ Error generating report:', error.message);
            throw error;
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dbManager = new DatabaseManager();
    const cleanup = new DataCleanup(dbManager);

    // Show help
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
🧹 Data Cleanup Tool for Fingerprint Database

Usage: node data-cleanup.js [command]

Commands:
  --help, -h                    Show this help message
  --cleanup                    Clean duplicate fingerprint registrations
  --validate                   Validate data integrity
  --fix                        Fix common data issues
  --analyze                    Analyze employee-fingerprint relationships
  --report                     Generate data quality report
  --all                        Run all operations

Examples:
  node data-cleanup.js --cleanup
  node data-cleanup.js --validate
  node data-cleanup.js --all
        `);
        process.exit(0);
    }

    try {
        await dbManager.connect();

        if (args.includes('--cleanup')) {
            await cleanup.cleanupFingerprintRegistrations();
        }

        if (args.includes('--validate')) {
            await cleanup.validateFingerprintData();
        }

        if (args.includes('--fix')) {
            await cleanup.fixDataIssues();
        }

        if (args.includes('--analyze')) {
            await cleanup.analyzeEmployeeRelationships();
        }

        if (args.includes('--report')) {
            await cleanup.generateQualityReport();
        }

        if (args.includes('--all')) {
            console.log('🔄 Running all cleanup operations...\n');
            await cleanup.validateFingerprintData();
            await cleanup.cleanupFingerprintRegistrations();
            await cleanup.fixDataIssues();
            await cleanup.analyzeEmployeeRelationships();
            await cleanup.generateQualityReport();
            console.log('\n✅ All operations completed successfully!');
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
        process.exit(1);
    } finally {
        await dbManager.disconnect();
    }
}

if (require.main === module) {
    main();
}

module.exports = DataCleanup;