index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:496 🚀 AttendanceModule mounted
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:127 🔍 Searching for employee with ID: 00049
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:131 ✅ Employee search response: {success: true, data: {…}}
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:156 🔍 Fetching fingerprints for employee: 00049
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:159 ✅ Fingerprints response: {success: true, data: Array(1)}
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:163 📊 Found 1 registered fingerprints
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:49 🚀 Initializing real fingerprint service...
fingerprintService.js:20 🚀 Initializing Fingerprint SDK...
fingerprintService.js:443 🔍 Skipping WebSocket pre-check - allowing SDK to auto-detect connection
fingerprintService.js:444 💡 The DigitalPersona SDK will handle WebSocket connections internally
fingerprintService.js:83 🔗 Device connected: t {type: 'DeviceConnected', deviceUid: '00000000-0000-0000-0000-000000000000'}
fingerprintService.js:270 📱 Found devices: ['15B12CB1-3AD7-4656-AC2F-9AF39DBBC527']
fingerprintService.js:42 ✅ Fingerprint SDK initialized successfully
fingerprintService.js:43 📱 Available devices: ['15B12CB1-3AD7-4656-AC2F-9AF39DBBC527']
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:61 ✅ Real fingerprint service initialized successfully
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:202 🔍 Starting fingerprint capture...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:248 🔍 Starting fingerprint capture for attendance...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:251 🔧 Using real fingerprint device for capture
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:343 🔄 Starting attendance with 3 scans for best template match...
fingerprintService.js:270 📱 Found devices: ['15B12CB1-3AD7-4656-AC2F-9AF39DBBC527']
fingerprintService.js:83 🔗 Device connected: t {type: 'DeviceConnected', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527'}
fingerprintService.js:336 🚀 Started fingerprint acquisition: Device=15B12CB1-3AD7-4656-AC2F-9AF39DBBC527, Format=Intermediate, MaxScans=3
fingerprintService.js:108 📊 Quality reported: t {type: 'QualityReported', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527', quality: 0}
fingerprintService.js:102 📸 Samples acquired: t {type: 'SamplesAcquired', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527', sampleFormat: 2, samples: '[{"Data":"AOglAcgp43NcwEE381mKa8dcZ8l29pimDjCKoGRp…"Purpose":0,"Quality":-1,"Type":2},"Version":1}]\n'}
fingerprintService.js:146 🔍 Raw sample data received: t {type: 'SamplesAcquired', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527', sampleFormat: 2, samples: '[{"Data":"AOglAcgp43NcwEE381mKa8dcZ8l29pimDjCKoGRp…"Purpose":0,"Quality":-1,"Type":2},"Version":1}]\n'}
fingerprintService.js:147 🔍 s.samples type: string
fingerprintService.js:148 🔍 s.samples content: [{"Data":"AOglAcgp43NcwEE381mKa8dcZ8l29pimDjCKoGRpKBOMFnuAXYXQKx_teb7ss7cebOKfWyQsi968Pbyv3yGdxgbSEmYkuZLyLho_3Cyi4Rvgd8PQ01gSctIAI7FgmGEcUuq7n6Wlo1J2IKqNWvhVvONAhCcfaUhWYCbKFoE3YDUj6DC2VwrGfA0aMwjjCJ491XbHKVzT3v9Hf6wTDza9pd0W7fvYoxWjDJArfuc3EgNGOCWYbm0q4bltahtFSHFs2m7WGoTtGS6CGap0XIJFR_lAA-rEUmiN4AynvwH2bGuLITHEJya4vxKsjMJ39FRqAP9G4h2o3RZ7GNIDP7tsjlCXsnVb3ETDQdn1aBwofnxwk507J3DpxvVeVle4Ki-5yzsCbjz4Tg4DbwAAAAAAAAAAAAAAAAAAAAAAAAAA","Header":{"Encryption":0,"Factor":8,"Format":{"FormatID":0,"FormatOwner":51},"Purpose":0,"Quality":-1,"Type":2},"Version":1}]

fingerprintService.js:169 📝 Sample 1 acquired: {Data: 'AOglAcgp43NcwEE381mKa8dcZ8l29pimDjCKoGRpKBOMFnuAXY…eVle4Ki-5yzsCbjz4Tg4DbwAAAAAAAAAAAAAAAAAAAAAAAAAA', Header: {…}, Version: 1}
fingerprintService.js:233 🧬 Processing Intermediate format sample for template verification:
fingerprintService.js:234    - Original sample length: undefined
fingerprintService.js:235    - Processed template length: 424
fingerprintService.js:236    - Template first 50 chars: AOglAcgp43NcwEE381mKa8dcZ8l29pimDjCKoGRpKBOMFnuAXY
fingerprintService.js:412 🖐️ === DETAILED FINGERPRINT SAMPLE ANALYSIS (ATTENDANCE) ===
fingerprintService.js:412 📥 Raw sample data: {sample: {…}, scanCount: 1, totalScans: 3, quality: 'Good'}
fingerprintService.js:412 🔍 Sample object structure: {hasSample: true, sampleType: 'feature', hasData: true, dataLength: 424, dataType: 'string'}
fingerprintService.js:412 📸 FINGERPRINT DATA ANALYSIS:
fingerprintService.js:412    - Data type: string
fingerprintService.js:412    - Data length: 424
fingerprintService.js:412    - First 100 chars: AOglAcgp43NcwEE381mKa8dcZ8l29pimDjCKoGRpKBOMFnuAXYXQKx/teb7ss7cebOKfWyQsi968Pbyv3yGdxgbSEmYkuZLyLho/
fingerprintService.js:412    - Last 100 chars: 4h2o3RZ7GNIDP7tsjlCXsnVb3ETDQdn1aBwofnxwk507J3DpxvVeVle4Ki+5yzsCbjz4Tg4DbwAAAAAAAAAAAAAAAAAAAAAAAAAA
fingerprintService.js:412    - Starts with data:image/ false
fingerprintService.js:412    - Contains comma: false
fingerprintService.js:412    - Format matches registration? Check registration logs
fingerprintService.js:412    - Looks like base64: true
fingerprintService.js:412    - Clean data length: 424
fingerprintService.js:412 🧬 Fingerprint template captured (not displayable as image): {type: 'feature', hasData: true, dataLength: 424}
fingerprintService.js:360 ⏹️ Fingerprint acquisition stopped
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:318 ✅ Fingerprint acquisition stopped
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:321 🚀 RESOLVING with sample data length: 424
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:211 ✅ Fingerprint captured, starting verification...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:363 🔍 === SECURE SERVER-SIDE FINGERPRINT VERIFICATION ===
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:364 📊 Sending captured fingerprint to server for verification
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:365 🚫 SECURITY: Client-side verification disabled for security
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:371 🛡️ Sending fingerprint to secure server for verification...
api.js:115 🛡️ API SERVICE: SECURE verifyFingerprint for attendance called
api.js:116 📤 API SERVICE: Sending SECURE verification data: {karyawanid: '00049', hasScannedFingerprint: true, scannedFingerprintLength: 424, verificationType: 'attendance'}
api.js:124 🛡️ API SERVICE: Making SECURE POST request to /verify-fingerprint
api.js:125  POST http://localhost:3001/api/verify-fingerprint 400 (Bad Request)
dispatchXhrRequest @ xhr.js:209
xhr @ xhr.js:26
dispatchRequest @ dispatchRequest.js:61
Promise.then
_request @ Axios.js:172
request @ Axios.js:49
httpMethod @ Axios.js:233
wrap @ bind.js:16
verifyFingerprint @ api.js:125
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:36 API Error: Employee ID, finger index, and fingerprint image are required AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
eval @ api.js:36
Promise.then
_request @ Axios.js:172
request @ Axios.js:49
httpMethod @ Axios.js:233
wrap @ bind.js:16
verifyFingerprint @ api.js:125
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:129 💥 API SERVICE: SECURE verification request failed: AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
verifyFingerprint @ api.js:129
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:130 💥 API SERVICE: Error response: {success: false, message: 'Employee ID, finger index, and fingerprint image are required'}
verifyFingerprint @ api.js:130
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:131 💥 API SERVICE: Error status: 400
verifyFingerprint @ api.js:131
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:132 💥 API SERVICE: Error message: Request failed with status code 400
verifyFingerprint @ api.js:132
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:402 ❌ Server-side verification error: AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:402
await in verifyFingerprint
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:49 🚀 Initializing real fingerprint service...
fingerprintService.js:20 🚀 Initializing Fingerprint SDK...
fingerprintService.js:443 🔍 Skipping WebSocket pre-check - allowing SDK to auto-detect connection
fingerprintService.js:444 💡 The DigitalPersona SDK will handle WebSocket connections internally
fingerprintService.js:83 🔗 Device connected: t {type: 'DeviceConnected', deviceUid: '00000000-0000-0000-0000-000000000000'}
fingerprintService.js:270 📱 Found devices: ['15B12CB1-3AD7-4656-AC2F-9AF39DBBC527']
fingerprintService.js:42 ✅ Fingerprint SDK initialized successfully
fingerprintService.js:43 📱 Available devices: ['15B12CB1-3AD7-4656-AC2F-9AF39DBBC527']
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:61 ✅ Real fingerprint service initialized successfully
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:202 🔍 Starting fingerprint capture...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:248 🔍 Starting fingerprint capture for attendance...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:251 🔧 Using real fingerprint device for capture
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:343 🔄 Starting attendance with 3 scans for best template match...
fingerprintService.js:270 📱 Found devices: ['15B12CB1-3AD7-4656-AC2F-9AF39DBBC527']
fingerprintService.js:83 🔗 Device connected: t {type: 'DeviceConnected', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527'}
fingerprintService.js:336 🚀 Started fingerprint acquisition: Device=15B12CB1-3AD7-4656-AC2F-9AF39DBBC527, Format=Intermediate, MaxScans=3
fingerprintService.js:108 📊 Quality reported: t {type: 'QualityReported', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527', quality: 0}
fingerprintService.js:102 📸 Samples acquired: t {type: 'SamplesAcquired', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527', sampleFormat: 2, samples: '[{"Data":"AOg3Acgp43NcwEE381mKK9hcZ8lN-42YSl9jgudj…"Purpose":0,"Quality":-1,"Type":2},"Version":1}]\n'}
fingerprintService.js:146 🔍 Raw sample data received: t {type: 'SamplesAcquired', deviceUid: '15B12CB1-3AD7-4656-AC2F-9AF39DBBC527', sampleFormat: 2, samples: '[{"Data":"AOg3Acgp43NcwEE381mKK9hcZ8lN-42YSl9jgudj…"Purpose":0,"Quality":-1,"Type":2},"Version":1}]\n'}
fingerprintService.js:147 🔍 s.samples type: string
fingerprintService.js:148 🔍 s.samples content: [{"Data":"AOg3Acgp43NcwEE381mKK9hcZ8lN-42YSl9jgudjQ6xun6HgxZ-KWmpY95WKxVPGV4y-g88-jtMAIRalOkIhvumEnlLDs21RpMFJIdRsKXFmykB8iiOPJCFJ5kou0-3_QKUpBMJNyHvqGtQj9jXaKPQfFj1l6g3KIaA7-8EEfM2LroFXMCJsuUauO1E7YOfUcwyoiR_0Asp4_099HxkNOvpNPg022-0D0s5uabH3UMdCX9MORhPzOtzOjiVsDo8EKtyfBTQP4U4AZ1wojw91tv5XjXRh6BdB_7X34P4N4qMdgEs2-kTRxgrMqVmdNYLfrHBOBA5m0ScSvCl3OpVR70FeSFf8COvgKvW_gRqz_POd-GvJwV1K63OrQeevjAXhVmW-UfFOQ7U4zTYYjKm4wpqWowUhMOhZqv5zbwAA","Header":{"Encryption":0,"Factor":8,"Format":{"FormatID":0,"FormatOwner":51},"Purpose":0,"Quality":-1,"Type":2},"Version":1}]

fingerprintService.js:169 📝 Sample 1 acquired: {Data: 'AOg3Acgp43NcwEE381mKK9hcZ8lN-42YSl9jgudjQ6xun6HgxZ…rQeevjAXhVmW-UfFOQ7U4zTYYjKm4wpqWowUhMOhZqv5zbwAA', Header: {…}, Version: 1}
fingerprintService.js:233 🧬 Processing Intermediate format sample for template verification:
fingerprintService.js:234    - Original sample length: undefined
fingerprintService.js:235    - Processed template length: 424
fingerprintService.js:236    - Template first 50 chars: AOg3Acgp43NcwEE381mKK9hcZ8lN+42YSl9jgudjQ6xun6HgxZ
fingerprintService.js:412 🖐️ === DETAILED FINGERPRINT SAMPLE ANALYSIS (ATTENDANCE) ===
fingerprintService.js:412 📥 Raw sample data: {sample: {…}, scanCount: 1, totalScans: 3, quality: 'Good'}
fingerprintService.js:412 🔍 Sample object structure: {hasSample: true, sampleType: 'feature', hasData: true, dataLength: 424, dataType: 'string'}
fingerprintService.js:412 📸 FINGERPRINT DATA ANALYSIS:
fingerprintService.js:412    - Data type: string
fingerprintService.js:412    - Data length: 424
fingerprintService.js:412    - First 100 chars: AOg3Acgp43NcwEE381mKK9hcZ8lN+42YSl9jgudjQ6xun6HgxZ+KWmpY95WKxVPGV4y+g88+jtMAIRalOkIhvumEnlLDs21RpMFJ
fingerprintService.js:412    - Last 100 chars: BA5m0ScSvCl3OpVR70FeSFf8COvgKvW/gRqz/POd+GvJwV1K63OrQeevjAXhVmW+UfFOQ7U4zTYYjKm4wpqWowUhMOhZqv5zbwAA
fingerprintService.js:412    - Starts with data:image/ false
fingerprintService.js:412    - Contains comma: false
fingerprintService.js:412    - Format matches registration? Check registration logs
fingerprintService.js:412    - Looks like base64: true
fingerprintService.js:412    - Clean data length: 424
fingerprintService.js:412 🧬 Fingerprint template captured (not displayable as image): {type: 'feature', hasData: true, dataLength: 424}
fingerprintService.js:360 ⏹️ Fingerprint acquisition stopped
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:318 ✅ Fingerprint acquisition stopped
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:321 🚀 RESOLVING with sample data length: 424
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:211 ✅ Fingerprint captured, starting verification...
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:363 🔍 === SECURE SERVER-SIDE FINGERPRINT VERIFICATION ===
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:364 📊 Sending captured fingerprint to server for verification
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:365 🚫 SECURITY: Client-side verification disabled for security
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:371 🛡️ Sending fingerprint to secure server for verification...
api.js:115 🛡️ API SERVICE: SECURE verifyFingerprint for attendance called
api.js:116 📤 API SERVICE: Sending SECURE verification data: {karyawanid: '00049', hasScannedFingerprint: true, scannedFingerprintLength: 424, verificationType: 'attendance'}
api.js:124 🛡️ API SERVICE: Making SECURE POST request to /verify-fingerprint
api.js:125  POST http://localhost:3001/api/verify-fingerprint 400 (Bad Request)
dispatchXhrRequest @ xhr.js:209
xhr @ xhr.js:26
dispatchRequest @ dispatchRequest.js:61
Promise.then
_request @ Axios.js:172
request @ Axios.js:49
httpMethod @ Axios.js:233
wrap @ bind.js:16
verifyFingerprint @ api.js:125
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:36 API Error: Employee ID, finger index, and fingerprint image are required AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
eval @ api.js:36
Promise.then
_request @ Axios.js:172
request @ Axios.js:49
httpMethod @ Axios.js:233
wrap @ bind.js:16
verifyFingerprint @ api.js:125
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:129 💥 API SERVICE: SECURE verification request failed: AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
verifyFingerprint @ api.js:129
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:130 💥 API SERVICE: Error response: {success: false, message: 'Employee ID, finger index, and fingerprint image are required'}
verifyFingerprint @ api.js:130
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:131 💥 API SERVICE: Error status: 400
verifyFingerprint @ api.js:131
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
api.js:132 💥 API SERVICE: Error message: Request failed with status code 400
verifyFingerprint @ api.js:132
await in verifyFingerprint
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:373
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:402 ❌ Server-side verification error: AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
verifyFingerprint @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:402
await in verifyFingerprint
startFingerprintScanning @ index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=script&lang=js:214
await in startFingerprintScanning
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/views/AttendanceModule.vue?vue&type=template&id=439b5f22&scoped=true:384
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
