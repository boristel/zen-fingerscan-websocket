 🔍 Testing API connection on component mount...
 🔍 Testing simple API connection...
 ✅ Simple API test successful: Object
 ✅ API connection test result: Object
 🚀 AttendanceModule mounted
 🔍 Searching for employee with ID: 00049
 ✅ Employee search response: Object
 🔍 Fetching fingerprints for employee: 00049
 ✅ Fingerprints response: Object
 📊 Found 1 registered fingerprints
 🚀 Initializing fingerprint service...
fingerprintService.js:20 🚀 Initializing Fingerprint SDK...
fingerprintService.js:443 🔍 Skipping WebSocket pre-check - allowing SDK to auto-detect connection
fingerprintService.js:444 💡 The DigitalPersona SDK will handle WebSocket connections internally
fingerprintService.js:83 🔗 Device connected: t
fingerprintService.js:270 📱 Found devices: Array(1)
fingerprintService.js:42 ✅ Fingerprint SDK initialized successfully
fingerprintService.js:43 📱 Available devices: Array(1)
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:63 ✅ Real fingerprint service initialized successfully
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:205 🔍 Starting fingerprint capture...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:251 🔍 Starting fingerprint capture for attendance...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:346 🔄 Starting attendance with 3 scans for best template match...
fingerprintService.js:270 📱 Found devices: Array(1)
fingerprintService.js:83 🔗 Device connected: t
fingerprintService.js:336 🚀 Started fingerprint acquisition: Device=1CD0A0CE-5458-47C6-A394-891F35B1CBCE, Format=Intermediate, MaxScans=3
fingerprintService.js:108 📊 Quality reported: t
fingerprintService.js:102 📸 Samples acquired: t
fingerprintService.js:146 🔍 Raw sample data received: t
fingerprintService.js:147 🔍 s.samples type: string
fingerprintService.js:148 🔍 s.samples content: [{"Data":"AOg3Acgp43NcwEE381mKKyldZ8lIrHA0ovfqYbpqgz7_1fmWrv7GeSgapV9l2s0MoDdPlLe7AXSR_OTWnR1Z0TzDDpz8MVg4h96q9AfB2eSYBNN0ZKpMXXa1T0DdKgfKVeveqKWju9-9A3498WOn35KzDXAR5r6YRWJqJ92eO8evachtzX4grfvUNWHCl3YKUNRg0ZZ5QHZ033h0OOCUenQH-itO0O74bTkOnGnNvq1jC-EYNvOYdo0Npfvm4Mxdiw9Zo_T0tu7mbSGseB6w3Tu4-WpqP6MR6Jt_RQgOm7Srdlk5XauUAy0nzmxifpp-vkMJt2FM4L8PAmgFUlbpD0-ud-khZ3uVhJnQv8MH4UgDGP4zjpFySDq4RKk6DPm-7-u-9J1TVUla4Ss0oBTFQ9CFdGSSv-1almUsbwAA","Header":{"Encryption":0,"Factor":8,"Format":{"FormatID":0,"FormatOwner":51},"Purpose":0,"Quality":-1,"Type":2},"Version":1}]

fingerprintService.js:169 📝 Sample 1 acquired: Object
fingerprintService.js:233 🧬 Processing Intermediate format sample for template verification:
fingerprintService.js:234    - Original sample length: undefined
fingerprintService.js:235    - Processed template length: 424
fingerprintService.js:236    - Template first 50 chars: AOg3Acgp43NcwEE381mKKyldZ8lIrHA0ovfqYbpqgz7/1fmWrv
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:266 🖐️ === DETAILED FINGERPRINT SAMPLE ANALYSIS (ATTENDANCE) ===
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:267 📥 Raw sample data: Object
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:268 🔍 Sample object structure: Object
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:277 📸 FINGERPRINT DATA ANALYSIS:
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:278    - Data type: string
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:279    - Data length: 424
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:280    - First 100 chars: AOg3Acgp43NcwEE381mKKyldZ8lIrHA0ovfqYbpqgz7/1fmWrv7GeSgapV9l2s0MoDdPlLe7AXSR/OTWnR1Z0TzDDpz8MVg4h96q
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:281    - Last 100 chars: t2FM4L8PAmgFUlbpD0+ud+khZ3uVhJnQv8MH4UgDGP4zjpFySDq4RKk6DPm+7+u+9J1TVUla4Ss0oBTFQ9CFdGSSv+1almUsbwAA
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:282    - Starts with data:image/ false
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:283    - Contains comma: false
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:284    - Format matches registration? Check registration logs
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:289    - Looks like base64: true
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:290    - Clean data length: 424
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:310 🧬 Fingerprint template captured (not displayable as image): Object
fingerprintService.js:360 ⏹️ Fingerprint acquisition stopped
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:321 ✅ Fingerprint acquisition stopped
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:324 🚀 RESOLVING with sample data length: 424
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214 ✅ Fingerprint captured, starting verification...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:366 🔍 === NEW SDK TEMPLATE VERIFICATION ===
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:367 📊 Verifying against 1 templates using SDK method
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:375 🧪 Calling SDK template verification...
fingerprintService.js:455 🔍 === PROPER FINGERPRINT VERIFICATION ===
fingerprintService.js:456 📥 Scanned template: Object
fingerprintService.js:462 📊 Registered templates: Array(1)
fingerprintService.js:794 🧬 === FINGERPRINT FEATURE EXTRACTION ===
fingerprintService.js:811 📊 Template data for feature extraction: Object
fingerprintService.js:824 📦 Binary data converted: Object
fingerprintService.js:885 🔍 Feature analysis results: Object
fingerprintService.js:832 ✅ Feature extraction completed: Object
fingerprintService.js:481 🧬 Extracted features from scanned fingerprint: Object
fingerprintService.js:499 🔍 Comparing with registered template 0 (fingerindex: 0)...
fingerprintService.js:794 🧬 === FINGERPRINT FEATURE EXTRACTION ===
fingerprintService.js:811 📊 Template data for feature extraction: Object
fingerprintService.js:824 📦 Binary data converted: Object
fingerprintService.js:885 🔍 Feature analysis results: Object
fingerprintService.js:832 ✅ Feature extraction completed: Object
fingerprintService.js:510 🧬 Extracted features from registered template 0: Object
fingerprintService.js:1119 🎯 === FINGERPRINT FEATURE MATCHING ===
fingerprintService.js:1128 📊 Feature vectors for matching: Object
fingerprintService.js:1179 ✅ Feature matching completed: Object
fingerprintService.js:530 📊 Template 0 result: Object
fingerprintService.js:563 ✅ FINGERPRINT VERIFICATION COMPLETED: Object
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:381 📊 SDK Verification Result: Object
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:427 📝 Storing attendance record...
api.js:176 🔍 API SERVICE: storeAttendance called
api.js:177 📤 API SERVICE: Sending attendance data: Object
api.js:189 🌐 API SERVICE: Making POST request to /store-attendance
api.js:201 ✅ API SERVICE: Attendance storage successful, response: Object
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:446 ✅ Attendance record stored: Object
