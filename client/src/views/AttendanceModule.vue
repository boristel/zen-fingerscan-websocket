<template>
  <div class="attendance-module">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">
          <i class="bi bi-clock-history"></i>
          Attendance Module
        </h1>
      </div>
    </div>

    <!-- Employee ID Input Section -->
    <div class="row mb-4">
      <div class="col-md-6 mx-auto">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-person-badge"></i>
              Enter Employee ID
            </h5>
          </div>
          <div class="card-body">
            <!-- Employee ID Display -->
            <div class="mb-3">
              <label class="form-label">Employee ID:</label>
              <div class="input-group">
                <input
                  ref="employeeIdInputRef"
                  v-model="employeeId"
                  type="text"
                  class="form-control form-control-lg text-center fw-bold"
                  placeholder="Enter ID"
                  :disabled="loading.search || fingerprintScanning"
                  readonly
                  style="letter-spacing: 2px; font-size: 1.5rem;"
                >
                <button
                  @click="toggleNumpad"
                  class="btn btn-outline-secondary"
                  type="button"
                  title="Hide/Show Numpad"
                  :disabled="fingerprintScanning"
                >
                  <i :class="showNumpad ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  {{ showNumpad ? 'Hide' : 'Show' }} Numpad
                </button>
              </div>
              <div class="mt-2">
                <small class="text-muted">Formatted ID:
                  <span class="badge bg-primary">{{ formattedEmployeeId }}</span>
                </small>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
              <button
                @click="searchEmployee"
                class="btn btn-primary btn-lg"
                :disabled="!employeeId.trim() || loading.search || fingerprintScanning"
              >
                <span v-if="loading.search" class="loading-spinner"></span>
                <i v-else class="bi bi-search"></i>
                Search Employee
              </button>
              <button
                @click="clearData"
                class="btn btn-outline-secondary btn-lg"
                :disabled="fingerprintScanning"
              >
                <i class="bi bi-x-circle"></i>
                Clear
              </button>
            </div>

            <!-- On-Screen Numpad -->
            <div v-if="showNumpad" class="mt-3 numpad-container">
              <div class="numpad">
                <div class="numpad-row">
                  <button @click="addToEmployeeId('1')" class="numpad-btn">1</button>
                  <button @click="addToEmployeeId('2')" class="numpad-btn">2</button>
                  <button @click="addToEmployeeId('3')" class="numpad-btn">3</button>
                </div>
                <div class="numpad-row">
                  <button @click="addToEmployeeId('4')" class="numpad-btn">4</button>
                  <button @click="addToEmployeeId('5')" class="numpad-btn">5</button>
                  <button @click="addToEmployeeId('6')" class="numpad-btn">6</button>
                </div>
                <div class="numpad-row">
                  <button @click="addToEmployeeId('7')" class="numpad-btn">7</button>
                  <button @click="addToEmployeeId('8')" class="numpad-btn">8</button>
                  <button @click="addToEmployeeId('9')" class="numpad-btn">9</button>
                </div>
                <div class="numpad-row">
                  <button @click="clearEmployeeId" class="numpad-btn numpad-btn-clear">Clear</button>
                  <button @click="addToEmployeeId('0')" class="numpad-btn">0</button>
                  <button @click="removeLastDigit" class="numpad-btn numpad-btn-backspace">
                    <i class="bi bi-backspace"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Information Section -->
    <div v-if="employeeInfo" class="row mb-4">
      <div class="col-md-8 mx-auto">
        <div class="card border-success">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-person-check"></i>
              Employee Information
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <strong>Employee Code:</strong><br>
                <span class="badge bg-primary">{{ employeeInfo.kodekaryawan }}</span>
              </div>
              <div class="col-md-4">
                <strong>Employee ID:</strong><br>
                <span class="badge bg-info">{{ employeeInfo.idkaryawan }}</span>
              </div>
              <div class="col-md-4">
                <strong>Employee Name:</strong><br>
                <span class="badge bg-success">{{ employeeInfo.namakaryawan }}</span>
              </div>
            </div>

            <!-- Attendance Type Selection -->
            <div class="row mt-3">
              <div class="col-12">
                <label class="form-label">
                  <i class="bi bi-clock"></i>
                  Select Attendance Type:
                </label>
                <div class="btn-group w-100" role="group">
                  <input
                    type="radio"
                    class="btn-check"
                    id="checkIn"
                    name="attendanceType"
                    value="CHECK_IN"
                    v-model="attendanceType"
                    :disabled="fingerprintScanning"
                  >
                  <label class="btn btn-outline-success" for="checkIn">
                    <i class="bi bi-box-arrow-in-right"></i>
                    Check In
                  </label>

                  <input
                    type="radio"
                    class="btn-check"
                    id="checkOut"
                    name="attendanceType"
                    value="CHECK_OUT"
                    v-model="attendanceType"
                    :disabled="fingerprintScanning"
                  >
                  <label class="btn btn-outline-danger" for="checkOut">
                    <i class="bi bi-box-arrow-right"></i>
                    Check Out
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fingerprint Scanning Section -->
    <div v-if="employeeInfo" class="row mb-4">
      <div class="col-md-8 mx-auto">
        <div class="card" :class="fingerprintScanning ? 'border-primary' : ''">
          <div class="card-header" :class="fingerprintScanning ? 'bg-primary text-white' : ''">
            <h5 class="mb-0">
              <i class="bi bi-fingerprint"></i>
              Fingerprint Verification
              <span v-if="fingerprintScanning" class="loading-spinner ms-2"></span>
            </h5>
            <div v-if="usingMockService" class="badge bg-warning text-dark mt-2">
              <i class="bi bi-cpu"></i> Using Mock Service (Demo Mode)
            </div>
            <div v-else class="badge bg-success mt-2">
              <i class="bi bi-usb-symbol"></i> Real Device Connected
            </div>
          </div>
          <div class="card-body text-center">
            <div v-if="!fingerprintScanning && !verificationResult">
              <p class="mb-3">Place your finger on the scanner to verify attendance</p>
              <button
                @click="startFingerprintScanning"
                class="btn btn-primary btn-lg"
                :disabled="loading.scanner"
              >
                <i class="bi bi-fingerprint"></i>
                Start Scanning
              </button>
            </div>

            <div v-if="fingerprintScanning" class="scanning-animation">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Scanning...</span>
              </div>
              <h5 class="mt-3">Scanning fingerprint...</h5>
              <p class="text-muted">Please keep your finger on the scanner</p>
              <div v-if="scanProgress" class="progress mt-3">
                <div class="progress-bar" role="progressbar" :style="{width: scanProgress + '%'}">
                  {{ scanProgress }}%
                </div>
              </div>
            </div>

            <div v-if="verificationResult" class="verification-result mt-3">
              <!-- Fingerprint Image Display -->
              <div v-if="scannedFingerprintImage" class="mb-3 text-center">
                <h6><i class="bi bi-fingerprint"></i> Scanned Fingerprint:</h6>
                <div class="d-inline-block border rounded p-2 bg-light">
                  <img
                    :src="scannedFingerprintImage"
                    alt="Scanned Fingerprint"
                    class="fingerprint-preview"
                    style="max-width: 200px; max-height: 200px;"
                  >
                </div>
              </div>

              <div :class="['alert', verificationResult.verified ? 'alert-success' : 'alert-danger']">
                <h5>
                  <i :class="verificationResult.verified ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                  {{ verificationResult.verified ? 'Verification Successful' : 'Verification Failed' }}
                </h5>
                <p v-if="verificationResult.message">{{ verificationResult.message }}</p>
                <div v-if="verificationResult.similarity" class="mt-2">
                  <strong>Similarity Score: </strong>
                  <span :class="verificationResult.similarity >= 80 ? 'text-success' : 'text-danger'">
                    {{ verificationResult.similarity }}%
                  </span>
                  <div class="progress mt-1" style="height: 20px;">
                    <div
                      class="progress-bar"
                      :class="verificationResult.similarity >= 80 ? 'bg-success' : 'bg-danger'"
                      role="progressbar"
                      :style="{width: verificationResult.similarity + '%'}"
                    >
                      {{ verificationResult.similarity }}%
                    </div>
                  </div>
                  <small class="text-muted">Threshold: 80% for verification</small>
                </div>
                <div v-if="verificationResult.processingTime" class="small text-muted mt-2">
                  Processing time: {{ verificationResult.processingTime }}ms
                </div>
              </div>

              <button
                @click="resetScanning"
                class="btn btn-outline-primary me-2"
              >
                <i class="bi bi-arrow-clockwise"></i>
                Scan Again
              </button>

              <button
                v-if="attendanceStored"
                @click="clearData"
                class="btn btn-outline-success"
              >
                <i class="bi bi-person-plus"></i>
                Next Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="row">
      <div class="col-md-8 mx-auto">
        <div :class="['alert', 'alert-' + statusMessage.type, 'd-flex', 'align-items-center']" role="alert">
          <i :class="['bi', statusMessage.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle', 'me-2']"></i>
          {{ statusMessage.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import apiService from '../services/api'
import fingerprintService from '../services/fingerprintService'
import mockFingerprintService from '../services/mockFingerprintService'

export default {
  name: 'AttendanceModule',
  setup() {
    // State variables
    const employeeId = ref('')
    const employeeInfo = ref(null)
    const registeredFingerprints = ref([])
    const fingerprintScanning = ref(false)
    const verificationResult = ref(null)
    const showNumpad = ref(true) // Always show by default
    const scanProgress = ref(0)
    const scanInterval = ref(null)
    const attendanceType = ref('CHECK_IN') // Default to check in
    const attendanceStored = ref(false)
    const usingMockService = ref(false) // Track if using mock service
    const scannedFingerprintImage = ref(null) // Store scanned fingerprint image for display

    // Loading states
    const loading = reactive({
      search: false,
      scanner: false
    })

    // Status message
    const statusMessage = ref(null)

    // References
    const employeeIdInputRef = ref(null)

    // Computed properties
    const formattedEmployeeId = computed(() => {
      const id = employeeId.value.trim()
      if (!id) return ''
      return id.padStart(5, '0')
    })

    // Initialize fingerprint service with progress feedback
    const initializeFingerprintService = async () => {
      try {
        console.log('🚀 Initializing fingerprint service...')

        // Update progress during initialization (10% -> 40%)
        scanProgress.value = 20
        await fingerprintService.initialize()
        scanProgress.value = 40

        // Device ready phase (40% -> 50%)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Device warmup
        scanProgress.value = 50

        usingMockService.value = false
        console.log('✅ Real fingerprint service initialized successfully')
        showStatus('Fingerprint device ready for scanning', 'success')
        return fingerprintService
      } catch (error) {
        console.warn('⚠️ Real fingerprint service failed, falling back to mock service:', error)
        usingMockService.value = true
        scanProgress.value = 50 // Still proceed to scanning phase
        showStatus('Using mock fingerprint service for demonstration', 'warning')
        return mockFingerprintService
      }
    }

    // Methods
    const toggleNumpad = () => {
      showNumpad.value = !showNumpad.value
    }

    const addToEmployeeId = (digit) => {
      if (fingerprintScanning.value) return
      if (employeeId.value.length < 5) {
        employeeId.value += digit
      }
    }

    const clearEmployeeId = () => {
      if (fingerprintScanning.value) return
      employeeId.value = ''
      verificationResult.value = null
    }

    const removeLastDigit = () => {
      if (fingerprintScanning.value) return
      employeeId.value = employeeId.value.slice(0, -1)
      verificationResult.value = null
    }

    const clearData = () => {
      employeeId.value = ''
      employeeInfo.value = null
      registeredFingerprints.value = []
      verificationResult.value = null
      statusMessage.value = null
      showNumpad.value = true // Always visible
      attendanceType.value = 'CHECK_IN'
      attendanceStored.value = false
      usingMockService.value = false // Reset to try real service first
      scannedFingerprintImage.value = null // Clear scanned image
    }

    const showStatus = (text, type = 'info') => {
      statusMessage.value = { text, type }
      setTimeout(() => {
        statusMessage.value = null
      }, 5000)
    }

    const searchEmployee = async () => {
      if (!employeeId.value.trim()) {
        showStatus('Please enter employee ID', 'warning')
        return
      }

      loading.search = true
      statusMessage.value = null
      verificationResult.value = null

      try {
        console.log('🔍 Searching for employee with ID:', formattedEmployeeId.value)

        // Search employee details
        const response = await apiService.getEmployeeById(formattedEmployeeId.value)
        console.log('✅ Employee search response:', response)

        if (response.success) {
          employeeInfo.value = response.data
          showStatus(`Employee found: ${response.data.namakaryawan}`, 'success')

          // Fetch registered fingerprints
          await fetchEmployeeFingerprints()
        } else {
          employeeInfo.value = null
          registeredFingerprints.value = []
          showStatus(response.message || 'Employee not found', 'danger')
        }
      } catch (error) {
        console.error('❌ Error searching employee:', error)
        employeeInfo.value = null
        registeredFingerprints.value = []
        showStatus('Failed to search employee. Please try again.', 'danger')
      } finally {
        loading.search = false
      }
    }

    const fetchEmployeeFingerprints = async () => {
      try {
        console.log('🔍 Fetching fingerprints for employee:', formattedEmployeeId.value)

        const response = await apiService.getEmployeeFingerprints(formattedEmployeeId.value)
        console.log('✅ Fingerprints response:', response)

        if (response.success) {
          registeredFingerprints.value = response.data
          console.log(`📊 Found ${response.data.length} registered fingerprints`)
        } else {
          registeredFingerprints.value = []
          showStatus(response.message || 'No fingerprints registered for this employee', 'warning')
        }
      } catch (error) {
        console.error('❌ Error fetching fingerprints:', error)
        registeredFingerprints.value = []
        showStatus('Failed to fetch fingerprint data', 'danger')
      }
    }

    const startFingerprintScanning = async () => {
      if (!employeeInfo.value) {
        showStatus('Please select an employee first', 'warning')
        return
      }

      if (registeredFingerprints.value.length === 0) {
        showStatus('No registered fingerprints found for this employee', 'warning')
        return
      }

      try {
        fingerprintScanning.value = true
        verificationResult.value = null
        scanProgress.value = 0

        // Initialize fingerprint service
        await initializeFingerprintService()

        // Start progress animation after device is ready (50% -> 90%)
        scanInterval.value = setInterval(() => {
          if (scanProgress.value < 90) {
            // Scanning phase (50-90%)
            scanProgress.value += Math.random() * 8
          }
        }, 300)

        console.log('🔍 Starting fingerprint capture...')

        // Capture fingerprint
        const capturedFingerprint = await captureFingerprint()

        clearInterval(scanInterval.value)
        scanProgress.value = 95

        if (capturedFingerprint) {
          console.log('✅ Fingerprint captured, starting verification...')

          // Verify against all registered fingerprints
          const result = await verifyFingerprint(capturedFingerprint, registeredFingerprints.value)

          scanProgress.value = 100
          verificationResult.value = result

          if (result.verified) {
            showStatus('Fingerprint verified successfully! Storing attendance...', 'success')

            // Store attendance record
            await storeAttendanceRecord(result)

            if (attendanceStored.value) {
              showStatus(`${attendanceType.value} recorded successfully for ${employeeInfo.value.namakaryawan}!`, 'success')
            }
          } else {
            showStatus('Fingerprint verification failed', 'danger')
          }
        } else {
          showStatus('Failed to capture fingerprint', 'danger')
        }
      } catch (error) {
        console.error('❌ Error during fingerprint scanning:', error)
        showStatus('Error during fingerprint scanning: ' + error.message, 'danger')
      } finally {
        clearInterval(scanInterval.value)
        fingerprintScanning.value = false
        setTimeout(() => {
          scanProgress.value = 0
        }, 2000)
      }
    }

    const captureFingerprint = async () => {
      try {
        console.log('🔍 Starting fingerprint capture for attendance...')

        // Use proper fingerprint service
        const serviceToUse = usingMockService.value ? mockFingerprintService : fingerprintService

        // Set up event listener for sample capture
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            serviceToUse.off('sampleAcquired', onSampleAcquired)
            serviceToUse.off('acquisitionError', onError)
            serviceToUse.stopAcquisition()
            reject(new Error('Fingerprint capture timeout after 30 seconds'))
          }, 30000)

          const onSampleAcquired = (data) => {
            console.log('🖐️ === DETAILED FINGERPRINT SAMPLE ANALYSIS (ATTENDANCE) ===')
            console.log('📥 Raw sample data:', data)
            console.log('🔍 Sample object structure:', {
              hasSample: !!data.sample,
              sampleType: data.sample ? data.sample.type : 'N/A',
              hasData: data.sample ? !!data.sample.data : false,
              dataLength: data.sample ? (data.sample.data ? data.sample.data.length : 0) : 0,
              dataType: data.sample && data.sample.data ? typeof data.sample.data : 'N/A'
            });

            if (data.sample && data.sample.data) {
              console.log('📸 FINGERPRINT DATA ANALYSIS:')
              console.log('   - Data type:', typeof data.sample.data)
              console.log('   - Data length:', data.sample.data.length)
              console.log('   - First 100 chars:', data.sample.data.substring(0, 100))
              console.log('   - Last 100 chars:', data.sample.data.substring(data.sample.data.length - 100))
              console.log('   - Starts with data:image/', data.sample.data.startsWith('data:image/'))
              console.log('   - Contains comma:', data.sample.data.includes(','))
              console.log('   - Format matches registration?', 'Check registration logs')

              // Check if it looks like base64
              const base64Pattern = /^[A-Za-z0-9+/=*]*$/;
              const cleanData = data.sample.data.includes(',') ? data.sample.data.split(',')[1] : data.sample.data;
              console.log('   - Looks like base64:', base64Pattern.test(cleanData))
              console.log('   - Clean data length:', cleanData ? cleanData.length : 0)
            }

            clearTimeout(timeoutId)
            serviceToUse.off('sampleAcquired', onSampleAcquired)
            serviceToUse.off('acquisitionError', onError)

            // Store the fingerprint template for display (only if it's an image)
            if (data.sample && data.sample.data) {
              if (data.sample.type === 'image') {
                // Only store as image if it's actually an image format
                scannedFingerprintImage.value = data.sample.data
                console.log('📸 Stored fingerprint image for display:', {
                  type: data.sample.type,
                  hasData: !!data.sample.data,
                  dataLength: data.sample.data.length
                })
              } else {
                // For feature templates, don't try to display as image
                scannedFingerprintImage.value = null
                console.log('🧬 Fingerprint template captured (not displayable as image):', {
                  type: data.sample.type,
                  hasData: !!data.sample.data,
                  dataLength: data.sample.data.length
                })
              }
            }

            // Stop acquisition after getting first sample
            serviceToUse.stopAcquisition()
              .then(() => {
                console.log('✅ Fingerprint acquisition stopped')
                // Return the base64 data from the sample
                if (data.sample && data.sample.data) {
                  console.log('🚀 RESOLVING with sample data length:', data.sample.data.length)
                  resolve(data.sample.data)
                } else {
                  reject(new Error('Invalid fingerprint sample format'))
                }
              })
              .catch(reject)
          }

          const onError = (error) => {
            console.error('❌ Fingerprint capture error:', error)
            clearTimeout(timeoutId)
            serviceToUse.off('sampleAcquired', onSampleAcquired)
            serviceToUse.off('acquisitionError', onError)
            reject(error)
          }

          // Register event listeners
          serviceToUse.on('sampleAcquired', onSampleAcquired)
          serviceToUse.on('acquisitionError', onError)

          // Start acquisition for multiple scans to get best match (3 scans for better accuracy)
          console.log('🔄 Starting attendance with 3 scans for best template match...')
          serviceToUse.startAcquisition(
            null, // Use default device
            'Intermediate', // Use Intermediate format for template verification
            3 // Use 3 scans to get best quality template
          ).catch(error => {
            clearTimeout(timeoutId)
            serviceToUse.off('sampleAcquired', onSampleAcquired)
            serviceToUse.off('acquisitionError', onError)
            reject(error)
          })
        })

      } catch (error) {
        console.error('❌ Error during fingerprint capture setup:', error)
        throw error
      }
    }

    const verifyFingerprint = async (capturedFingerprint, registeredTemplates) => {
      console.log(`🔍 === NEW SDK TEMPLATE VERIFICATION ===`)
      console.log(`📊 Verifying against ${registeredTemplates.length} templates using SDK method`)

      const startTime = Date.now()

      try {
        // Use the new SDK template verification method
        const serviceToUse = usingMockService.value ? mockFingerprintService : fingerprintService

        console.log('🧪 Calling SDK template verification...')
        const verificationResult = await serviceToUse.verifyFingerprint(
          capturedFingerprint,
          registeredTemplates
        )

        console.log('📊 SDK Verification Result:', verificationResult)

        if (verificationResult.success) {
          return {
            verified: verificationResult.verified,
            similarity: verificationResult.similarity,
            bestMatch: verificationResult.bestMatch,
            processingTime: Date.now() - startTime,
            verificationMethod: 'SDK Template Verification',
            verificationResults: verificationResult.verificationResults
          }
        } else {
          return {
            verified: false,
            similarity: 0,
            bestMatch: null,
            processingTime: Date.now() - startTime,
            verificationMethod: 'SDK Template Verification',
            error: verificationResult.error
          }
        }
      } catch (error) {
        console.error('❌ SDK template verification error:', error)
        return {
          verified: false,
          similarity: 0,
          bestMatch: null,
          processingTime: Date.now() - startTime,
          verificationMethod: 'SDK Template Verification',
          error: error.message
        }
      }
    }

    const storeAttendanceRecord = async (verificationResult) => {
      try {
        if (!employeeInfo.value) {
          showStatus('Cannot store attendance: No employee information', 'danger')
          return
        }

        if (!attendanceType.value) {
          showStatus('Cannot store attendance: Please select attendance type', 'danger')
          return
        }

        console.log('📝 Storing attendance record...')

        const attendanceData = {
          karyawanid: employeeInfo.value.idkaryawan,
          kodekaryawan: employeeInfo.value.kodekaryawan,
          namakaryawan: employeeInfo.value.namakaryawan,
          attendanceType: attendanceType.value,
          fingerprintVerified: verificationResult.verified,
          verificationSimilarity: verificationResult.similarity,
          verificationTime: verificationResult.processingTime,
          fingerindexMatched: verificationResult.matchedTemplate?.fingerindex || null,
          notes: `Verified with ${verificationResult.similarity}% similarity in ${verificationResult.processingTime}ms`
        }

        const response = await apiService.storeAttendance(attendanceData)

        if (response.success) {
          attendanceStored.value = true
          showStatus(`${attendanceType.value} recorded successfully for ${employeeInfo.value.namakaryawan}!`, 'success')
          console.log('✅ Attendance record stored:', response.data)
        } else {
          showStatus('Failed to store attendance record', 'warning')
          console.error('❌ Store attendance failed:', response.message)
        }
      } catch (error) {
        console.error('❌ Error storing attendance record:', error)
        showStatus('Error storing attendance: ' + error.message, 'danger')
      }
    }

    const resetScanning = () => {
      fingerprintScanning.value = false
      verificationResult.value = null
      scanProgress.value = 0
      attendanceStored.value = false
      scannedFingerprintImage.value = null // Clear scanned fingerprint image
      clearInterval(scanInterval.value)
    }

    // Lifecycle
    onMounted(() => {
      console.log('🚀 AttendanceModule mounted')
    })

    onUnmounted(() => {
      if (scanInterval.value) {
        clearInterval(scanInterval.value)
      }
    })

    return {
      // State
      employeeId,
      employeeInfo,
      fingerprintScanning,
      verificationResult,
      showNumpad,
      scanProgress,
      loading,
      statusMessage,
      employeeIdInputRef,
      attendanceType,
      attendanceStored,
      usingMockService,
      scannedFingerprintImage,

      // Computed
      formattedEmployeeId,

      // Methods
      toggleNumpad,
      addToEmployeeId,
      clearEmployeeId,
      removeLastDigit,
      clearData,
      searchEmployee,
      startFingerprintScanning,
      resetScanning,
      storeAttendanceRecord,
      initializeFingerprintService
    }
  }
}
</script>

<style scoped>
.attendance-module {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.numpad-container {
  max-width: 300px;
  margin: 0 auto;
}

.numpad {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.numpad-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.numpad-btn {
  width: 80px;
  height: 60px;
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.numpad-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-2px);
}

.numpad-btn:active {
  transform: translateY(0);
  background: #dee2e6;
}

.numpad-btn-clear {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.numpad-btn-clear:hover {
  background: #f5c6cb;
}

.numpad-btn-backspace {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeaa7;
}

.numpad-btn-backspace:hover {
  background: #ffeaa7;
}

.scanning-animation {
  padding: 40px 20px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.verification-result {
  margin-top: 20px;
}

.progress {
  height: 25px;
  background-color: #e9ecef;
}

.progress-bar {
  font-weight: bold;
  transition: width 0.3s ease;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.border-primary {
  border-color: #0d6efd !important;
}

.bg-primary {
  background-color: #0d6efd !important;
}

.alert {
  border-radius: 0.375rem;
  margin-bottom: 0;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5em 0.75em;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
}

.form-control-lg {
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .numpad-btn {
    width: 60px;
    height: 50px;
    font-size: 1rem;
  }

  .d-md-flex {
    flex-direction: column;
  }
}
</style>