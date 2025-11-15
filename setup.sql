-- Fingerprint Attendance System Database Setup
-- Run this script to create the required database tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bc_zen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE bc_zen;

-- Employee Information Table
CREATE TABLE IF NOT EXISTS `ben_hrd_karyawan_info` (
  `kodekaryawan` varchar(30) NOT NULL DEFAULT '',
  `idkaryawan` varchar(5) DEFAULT NULL,
  `namakaryawan` varchar(255) DEFAULT NULL,
  `idoutlet` char(3) DEFAULT NULL,
  `departemen` char(10) DEFAULT NULL,
  `jadwaltetap` char(1) NOT NULL DEFAULT 'N',
  `kodejadwal` int(2) DEFAULT NULL,
  `kodekontrak` char(30) DEFAULT NULL,
  `tglmasukkerja` date NOT NULL DEFAULT '1900-01-01',
  `tglhabiskontrak` date DEFAULT NULL,
  `namabank` char(30) DEFAULT NULL,
  `norek` char(30) DEFAULT NULL,
  `namarek` varchar(255) DEFAULT NULL,
  `tagedit` char(1) DEFAULT 'I',
  `lastedituser` varchar(30) DEFAULT NULL,
  `lasteditdate` datetime DEFAULT NULL,
  `isadmin` char(1) DEFAULT NULL,
  `active` char(1) DEFAULT 'Y',
  PRIMARY KEY (`kodekaryawan`),
  INDEX `idx_idkaryawan` (`idkaryawan`),
  INDEX `idx_namakaryawan` (`namakaryawan`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fingerprint Registration Table
CREATE TABLE IF NOT EXISTS `karyawanfpreg` (
  `autonum` int(11) NOT NULL AUTO_INCREMENT,
  `karyawanid` varchar(5) DEFAULT NULL,
  `namakaryawan` varchar(255) DEFAULT NULL,
  `fingerindex` int(2) DEFAULT NULL,
  `fingerimage` mediumtext DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `lasteditdate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`autonum`),
  INDEX `idx_karyawanid` (`karyawanid`),
  INDEX `idx_fingerindex` (`fingerindex`),
  UNIQUE KEY `unique_employee_finger` (`karyawanid`, `fingerindex`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample employee data for testing (optional)
INSERT IGNORE INTO `ben_hrd_karyawan_info`
(`kodekaryawan`, `idkaryawan`, `namakaryawan`, `idoutlet`, `departemen`, `active`)
VALUES
('EMP001', '00001', 'John Doe', '001', 'IT', 'Y'),
('EMP002', '00002', 'Jane Smith', '001', 'HR', 'Y'),
('EMP003', '00003', 'Bob Johnson', '002', 'Finance', 'Y'),
('EMP004', '00004', 'Alice Williams', '002', 'IT', 'Y'),
('EMP005', '00005', 'Charlie Brown', '003', 'Operations', 'Y');

-- Display success message
SELECT 'Fingerprint Attendance System database setup completed successfully!' AS message;