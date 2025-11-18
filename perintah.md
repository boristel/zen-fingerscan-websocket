The application still not compared registered finger scan capture with actual scan finger. i try to scan using un-registered finger / wrong finger, but the application still treat as Fingerprint Verified and Fingerprint successfully verified. 
* Try to find registered finger data from new_karyawan_fp_reg.fingerimage filter with new_karyawan_fp_reg.karyawanid using formattedEmployeeId so the application compared only 1 to 1 imamge finger data thus facilitating the comparison finger image data. 
focus to fix that error/issue systematically, correctly, accurately, precisely, and accordingly!. 
Avoid assuming or making assumption or mismatch/incorrect hallucinating. 
Always check facts directly with current and actual code implementations and workflows. 


3. Key Verification Process:
    - Fetches all registered fingerprints for the employee from new_karyawan_fp_reg table
    - Generates verification template from captured fingerprint
    - Compares against each registered fingerprint using advanced algorithms
    - Returns success only if fingerprint matches with ≥80% similarity
    - Logs detailed comparison results including similarity percentages

    formattedEmployeeId

//--------------------------------------------
change finger reg to new table
To do : 

* change the registration table from karyawanfpreg to new_karyawan_fp_reg with structure below 
`new_karyawan_fp_reg` (
  `autonum` bigint(1) NOT NULL AUTO_INCREMENT,
  `kodekaryawan` varchar(30) NOT NULL DEFAULT '',
  `karyawanid` varchar(5) DEFAULT NULL,
  `namakaryawan` varchar(255) DEFAULT NULL,
  `fingerindex` int(2) DEFAULT NULL,
  `fingerimage` mediumtext DEFAULT NULL,
  `lastedit` datetime NOT NULL DEFAULT '2025-01-01 01:01:01',
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`autonum`),
  KEY `idkodekaryawan` (`kodekaryawan`),
  KEY `idxkaryawanid` (`karyawanid`)
)

the difference only "new_karyawan_fp_reg.kodekaryawan" get data from "ben_hrd_karyawan_info.kodekaryawan"  and "new_karyawan_fp_reg.lastedit" set date time NOW

No need to create table "new_karyawan_fp_reg", i'm already done created the table new_karyawan_fp_reg

**REMEMBER BEHAVIOR BELOW WHILE WORK OR THINKING!** 
1. Think carefully!. 
2. Do or implement correctly, accurately, and precisely!. 
3. Investigates with proper examinations!. 
4. Analyse with proper evaluations and comparison accordingly!. 

/------------------------------------
let we finalize the layout and create notif for in-active employee

* create 2 kind on screen keyboard
  - numpad keyboard 
  - normal keyboard 
  so admin can used mouse or if the screen touchable  
* add notification if "ben_hrd_karyawan_info.active" value "N"
* after finish registration, close all display and left search container only

 