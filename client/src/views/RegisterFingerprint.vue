<template>
  <div class="register-fingerprint">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">
          <i class="bi bi-fingerprint"></i>
          Register Employee Fingerprint
        </h1>
      </div>
    </div>

    <!-- Employee Search Section -->
    <div class="row mb-4">
      <div class="col-md-8 mx-auto">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-search"></i>
              Search Employee
            </h5>
          </div>
          <div class="card-body">
            <div class="input-group mb-3">
              <input
                ref="searchInputRef"
                v-model="searchTerm"
                @keyup.enter="searchEmployees"
                @focus="onSearchInputFocus"
                type="text"
                class="form-control"
                placeholder="Enter Employee Name or ID..."
                :disabled="loading.search"
              >
              <button
                @click="searchEmployees"
                class="btn btn-primary"
                :disabled="loading.search || !searchTerm.trim()"
              >
                <span v-if="loading.search" class="loading-spinner"></span>
                <i v-else class="bi bi-search"></i>
                Search
              </button>
              <button
                @click="toggleKeyboard"
                class="btn btn-outline-secondary"
                type="button"
                title="Toggle On-Screen Keyboard"
              >
                <i class="bi bi-keyboard"></i>
              </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="search-results">
              <h6>Found {{ searchResults.length }} employees:</h6>
              <div
                v-for="employee in searchResults"
                :key="employee.kodekaryawan"
                class="employee-card card mb-2 p-3"
                :class="{ selected: selectedEmployee?.kodekaryawan === employee.kodekaryawan }"
                @click="selectEmployee(employee)"
              >
                <div class="row align-items-center">
                  <div class="col-md-8">
                    <strong>{{ employee.namakaryawan }}</strong><br>
                    <small class="text-muted">
                      ID: {{ employee.idkaryawan }} |
                      Department: {{ employee.departemen || 'N/A' }} |
                      Status:
                      <span :class="employee.active === 'Y' ? 'text-success' : 'text-danger'">
                        {{ employee.active === 'Y' ? 'Active' : 'Inactive' }}
                      </span>
                    </small>
                  </div>
                  <div class="col-md-4 text-end">
                    <button
                      v-if="selectedEmployee?.kodekaryawan === employee.kodekaryawan"
                      class="btn btn-success btn-sm"
                    >
                      <i class="bi bi-check-circle"></i>
                      Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="searched && searchResults.length === 0" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle"></i>
              No employees found matching "{{ searchTerm }}"
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Selected Section -->
    <div v-if="selectedEmployee" class="row mb-4">
      <div class="col-md-10 mx-auto">
        <div class="card border-success">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-person-check"></i>
              Selected Employee: {{ selectedEmployee.namakaryawan }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <strong>Employee ID:</strong> {{ selectedEmployee.idkaryawan }}<br>
                <strong>Name:</strong> {{ selectedEmployee.namakaryawan }}<br>
                <strong>Department:</strong> {{ selectedEmployee.departemen || 'N/A' }}
              </div>
              <div class="col-md-6">
                <strong>Outlet:</strong> {{ selectedEmployee.idoutlet || 'N/A' }}<br>
                <strong>Join Date:</strong> {{ formatDate(selectedEmployee.tglmasukkerja) }}<br>
                <strong>Status:</strong>
                <span :class="selectedEmployee.active === 'Y' ? 'text-success' : 'text-danger'">
                  {{ selectedEmployee.active === 'Y' ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <!-- Show Registered Fingerprints -->
            <div v-if="registeredFingerprints.length > 0" class="mt-3">
              <h6>Registered Fingerprints ({{ registeredFingerprints.length }}/10):</h6>
              <div class="finger-selector">
                <div
                  v-for="finger in fingerNames"
                  :key="finger.index"
                  class="finger-button"
                  :class="{
                    registered: isFingerRegistered(finger.index),
                    disabled: fingerprintRegistrationInProgress
                  }"
                >
                  <i :class="getFingerIcon(finger.index)" class="finger-icon"></i>
                  <div>{{ finger.name }}</div>
                  <small v-if="isFingerRegistered(finger.index)" class="text-success">
                    <i class="bi bi-check-circle"></i>
                  </small>
                </div>
              </div>
            </div>

            <!-- Start Registration Button -->
            <div v-if="!fingerprintRegistrationInProgress" class="mt-3 text-center">
              <button
                @click="startFingerprintRegistration"
                class="btn btn-primary btn-lg"
                :disabled="registeredFingerprints.length >= 10"
              >
                <i class="bi bi-fingerprint"></i>
                Start Fingerprint Registration
              </button>
              <p v-if="registeredFingerprints.length >= 10" class="text-warning mt-2">
                <i class="bi bi-info-circle"></i>
                All 10 fingers are already registered for this employee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fingerprint Registration Section -->
    <div v-if="fingerprintRegistrationInProgress" class="row mb-4">
      <div class="col-md-10 mx-auto">
        <div class="card" :class="usingMockService ? 'border-warning' : 'border-primary'">
          <div class="card-header" :class="usingMockService ? 'bg-warning text-dark' : 'bg-primary text-white'">
            <h5 class="mb-0">
              <i class="bi" :class="usingMockService ? 'bi-cpu' : 'bi-fingerprint'"></i>
              Fingerprint Registration in Progress
              <span v-if="usingMockService" class="badge bg-secondary ms-2">Demo Mode</span>
            </h5>
          </div>
          <div class="card-body">
            <!-- Finger Selection -->
            <div v-if="!selectedFingerIndex && registrationStep === 'selectFinger'">
              <h6>Select Finger to Register:</h6>
              <div class="finger-selector">
                <div
                  v-for="finger in fingerNames"
                  :key="finger.index"
                  class="finger-button"
                  :class="{
                    selected: tempSelectedFingerIndex === finger.index,
                    disabled: isFingerRegistered(finger.index) || acquisitionInProgress
                  }"
                  @click="selectFingerForRegistration(finger.index)"
                >
                  <i :class="getFingerIcon(finger.index)" class="finger-icon"></i>
                  <div>{{ finger.name }}</div>
                </div>
              </div>

              <div v-if="tempSelectedFingerIndex !== null" class="mt-3 text-center">
                <button
                  @click="confirmFingerSelection"
                  class="btn btn-success btn-lg me-2"
                >
                  <i class="bi bi-check-circle"></i>
                  Register {{ getFingerName(tempSelectedFingerIndex) }}
                </button>
                <button
                  @click="cancelFingerSelection"
                  class="btn btn-secondary"
                >
                  <i class="bi bi-x-circle"></i>
                  Cancel
                </button>
              </div>
            </div>

            <!-- Scanning Progress -->
            <div v-if="registrationStep === 'scanning'">
              <div class="text-center mb-4">
                <h5>
                  <i class="bi" :class="usingMockService ? 'bi-cpu' : 'bi-fingerprint'"></i>
                  {{ usingMockService ? 'Simulating' : 'Scanning' }} {{ getFingerName(selectedFingerIndex) }}
                </h5>
                <p class="text-muted">
                  {{ usingMockService ? 'Simulating fingerprint scans for demonstration' : `Please place your finger on the scanner. We need ${maxScans} scans for the best quality.` }}
                </p>
                <div v-if="usingMockService" class="alert alert-info">
                  <i class="bi bi-info-circle"></i>
                  <strong>Demo Mode:</strong> This is a simulation for testing purposes. No real fingerprint scanner is connected.
                </div>
              </div>

              <!-- Scan Progress -->
              <div class="scan-progress">
                <div
                  v-for="scan in maxScans"
                  :key="scan"
                  class="scan-step"
                  :class="{
                    completed: scan <= currentScanCount,
                    active: scan === currentScanCount + 1
                  }"
                >
                  <span class="scan-icon">
                    <i v-if="scan <= currentScanCount" class="bi bi-check-circle-fill text-success"></i>
                    <i v-else-if="scan === currentScanCount + 1" class="bi bi-arrow-repeat text-primary"></i>
                    <i v-else class="bi bi-circle text-muted"></i>
                  </span>
                  <span>
                    Scan {{ scan }}
                    <span v-if="scan <= currentScanCount" class="text-success"> - Completed</span>
                    <span v-else-if="scan === currentScanCount + 1" class="text-primary"> - In Progress</span>
                    <span v-else class="text-muted"> - Pending</span>
                  </span>
                </div>
              </div>

              <!-- Control Buttons -->
              <div class="text-center mt-4">
                <button
                  @click="startScanning"
                  v-if="!acquisitionInProgress && currentScanCount < maxScans"
                  class="btn btn-success btn-lg me-2"
                >
                  <i class="bi bi-play-circle"></i>
                  Start Scan {{ currentScanCount + 1 }}
                </button>

                <button
                  @click="stopScanning"
                  v-if="acquisitionInProgress"
                  class="btn btn-danger btn-lg"
                >
                  <i class="bi bi-stop-circle"></i>
                  Stop Scanning
                </button>

                <button
                  @click="cancelRegistration"
                  class="btn btn-secondary ms-2"
                >
                  <i class="bi bi-x-circle"></i>
                  Cancel Registration
                </button>
              </div>

              <!-- Quality Indicator -->
              <div v-if="currentQuality" class="mt-4">
                <div
                  class="quality-indicator"
                  :class="getQualityClass(currentQuality.quality)"
                >
                  <i class="bi bi-speedometer2"></i>
                  Quality: {{ currentQuality.qualityText }} (Score: {{ currentQuality.quality }})
                </div>
              </div>

              <!-- Fingerprint Preview -->
              <div v-if="latestSample" class="mt-4">
                <h6>Latest Scan Preview:</h6>
                <div class="text-center">
                  <img
                    v-if="latestSample.type === 'image'"
                    :src="latestSample.data"
                    class="fingerprint-preview"
                    alt="Fingerprint Scan"
                  >
                  <div v-else class="alert alert-info">
                    <strong>Raw Data Captured</strong><br>
                    <small>Length: {{ latestSample.data?.length || 0 }} characters</small><br>
                    <small v-if="latestSample.analysis">
                      Estimated Size: {{ latestSample.analysis.estimatedSize }} bytes
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Registration Complete -->
            <div v-if="registrationStep === 'complete'" class="text-center">
              <div class="alert alert-success">
                <h4><i class="bi bi-check-circle-fill"></i> Registration Complete!</h4>
                <p>
                  Successfully registered {{ getFingerName(selectedFingerIndex) }} with {{ capturedSamples.length }} quality scans.
                </p>
              </div>

              <div class="mt-4">
                <button
                  @click="registerAnotherFinger"
                  class="btn btn-primary btn-lg me-2"
                >
                  <i class="bi bi-plus-circle"></i>
                  Register Another Finger
                </button>
                <button
                  @click="finishRegistration"
                  class="btn btn-success btn-lg"
                  :disabled="loading.register || isSubmitting"
                >
                  <i class="bi bi-check-circle"></i>
                  <span v-if="loading.register || isSubmitting">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Registering...
                  </span>
                  <span v-else>
                    Finish Registration
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- On-Screen Keyboard -->
    <OnScreenKeyboard
      v-model="searchTerm"
      :targetInput="searchInputRef"
      :auto-show="false"
      @enter-pressed="searchEmployees"
    />

    <!-- Employee Status Notification -->
    <EmployeeStatusNotification
      ref="notificationRef"
      @proceed-anyway="proceedWithInactiveEmployee"
      @select-another="resetSelection"
      @close-notification="closeNotification"
    />

    <!-- Status Messages -->
    <div v-if="statusMessage" class="row">
      <div class="col-md-8 mx-auto">
        <div :class="['alert', statusMessage.type]" class="alert-dismissible">
          {{ statusMessage.text }}
          <button type="button" class="btn-close" @click="clearStatusMessage"></button>
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
import OnScreenKeyboard from '../components/OnScreenKeyboard.vue'
import EmployeeStatusNotification from '../components/EmployeeStatusNotification.vue'

export default {
  name: 'RegisterFingerprint',
  components: {
    OnScreenKeyboard,
    EmployeeStatusNotification
  },
  setup() {
    // Reactive state
    const searchTerm = ref('')
    const searchResults = ref([])
    const selectedEmployee = ref(null)
    const registeredFingerprints = ref([])
    const searched = ref(false)
    const usingMockService = ref(false)

    // Fingerprint registration state
    const fingerprintRegistrationInProgress = ref(false)
    const registrationStep = ref('selectFinger') // selectFinger, scanning, complete
    const selectedFingerIndex = ref(null)
    const tempSelectedFingerIndex = ref(null)
    const acquisitionInProgress = ref(false)
    const currentScanCount = ref(0)
    const maxScans = ref(4)
    const capturedSamples = ref([])
    const currentQuality = ref(null)
    const latestSample = ref(null)
    const compositeReferenceTemplate = ref(null)

    // Loading states
    const loading = reactive({
      search: false,
      register: false,
      device: false
    })

    // Submitting state to prevent duplicate submissions
    const isSubmitting = ref(false)

    // Status messages
    const statusMessage = ref(null)

    // Keyboard and notification refs
    const searchInputRef = ref(null)
    const notificationRef = ref(null)
    const keyboardRef = ref(null)
    const proceedWithInactiveFlag = ref(false)

    // Finger names
    const fingerNames = [
      { index: 0, name: 'Left Thumb', icon: 'bi-hand-index' },
      { index: 1, name: 'Left Index', icon: 'bi-hand-index' },
      { index: 2, name: 'Left Middle', icon: 'bi-hand-index' },
      { index: 3, name: 'Left Ring', icon: 'bi-hand-index' },
      { index: 4, name: 'Left Little', icon: 'bi-hand-index' },
      { index: 5, name: 'Right Thumb', icon: 'bi-hand-index' },
      { index: 6, name: 'Right Index', icon: 'bi-hand-index' },
      { index: 7, name: 'Right Middle', icon: 'bi-hand-index' },
      { index: 8, name: 'Right Ring', icon: 'bi-hand-index' },
      { index: 9, name: 'Right Little', icon: 'bi-hand-index' }
    ]

    // Computed properties
    const isFingerRegistered = computed(() => {
      return (fingerIndex) => {
        return registeredFingerprints.value.some(fp => fp.fingerindex === fingerIndex)
      }
    })

    // Methods
    const searchEmployees = async () => {
      if (!searchTerm.value.trim()) return

      loading.search = true
      try {
        console.log('🔍 Starting search for term:', searchTerm.value.trim())
        const response = await apiService.searchEmployees(searchTerm.value.trim())
        console.log('✅ Search response:', response)
        if (response.success) {
          searchResults.value = response.data
          searched.value = true
          console.log('📊 Search results loaded:', response.data.length, 'employees found')
        } else {
          console.error('❌ Search API returned error:', response.message)
          showStatus('Error searching employees: ' + response.message, 'danger')
        }
      } catch (error) {
        console.error('❌ Search error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          config: error.config
        })
        showStatus('Failed to search employees. Please try again.', 'danger')
        searchResults.value = []
      } finally {
        loading.search = false
      }
    }

    const selectEmployee = async (employee) => {
      // Check if employee is inactive and show notification
      if (employee.active === 'N' && !proceedWithInactiveFlag.value) {
        if (notificationRef.value) {
          notificationRef.value.showNotification(employee, 'N')
        }
        return
      }

      // Proceed with employee selection
      selectedEmployee.value = employee
      searchResults.value = []
      searchTerm.value = ''
      proceedWithInactiveFlag.value = false

      // Load registered fingerprints for this employee
      await loadEmployeeFingerprints(employee.idkaryawan)

      // Show success notification for active employees
      if (employee.active === 'Y' && notificationRef.value) {
        notificationRef.value.showCustomNotification(
          '✅ Employee Selected Successfully',
          `${employee.namakaryawan} is now ready for fingerprint registration.`,
          'success',
          true
        )
      }
    }

    const loadEmployeeFingerprints = async (employeeId) => {
      try {
        console.log('🔍 Loading fingerprints for employeeId:', employeeId)
        const response = await apiService.getEmployeeFingerprints(employeeId)
        console.log('🔍 Load fingerprints response:', response)
        if (response.success) {
          registeredFingerprints.value = response.data
          console.log('🔍 registeredFingerprints.value set to:', response.data)
          console.log('🔍 Finger indices found:', response.data.map(fp => fp.fingerindex))
        } else {
          console.error('❌ Failed to load fingerprints:', response.message)
        }
      } catch (error) {
        console.error('Error loading fingerprints:', error)
      }
    }

    const startFingerprintRegistration = () => {
      fingerprintRegistrationInProgress.value = true
      registrationStep.value = 'selectFinger'
      initializeFingerprintService()
    }

    const initializeFingerprintService = async () => {
      try {
        loading.device = true
        showStatus('Initializing fingerprint scanner...', 'info')

        let devices = []
        let serviceToUse = fingerprintService

        try {
          // Try to initialize the real fingerprint service first
          devices = await fingerprintService.initialize()
          showStatus('Real fingerprint scanner initialized successfully', 'success')
        } catch (realSdkError) {
          console.warn('Real fingerprint SDK failed, falling back to mock service:', realSdkError.message)

          // Fall back to mock service for testing
          showStatus('Fingerprint scanner not available, using demo mode', 'warning')
          devices = await mockFingerprintService.initialize()
          serviceToUse = mockFingerprintService
          usingMockService.value = true
        }

        if (devices.length === 0) {
          throw new Error('No fingerprint devices found')
        }

        showStatus(`Fingerprint scanner ready (${usingMockService.value ? 'Demo Mode' : 'Real Device'})`, 'success')
        setupFingerprintListeners(serviceToUse)

      } catch (error) {
        console.error('Fingerprint initialization error:', error)
        showStatus('Failed to initialize fingerprint scanner: ' + error.message, 'danger')
        cancelRegistration()
      } finally {
        loading.device = false
      }
    }

    const setupFingerprintListeners = (serviceToUse = fingerprintService) => {
      serviceToUse.on('sampleAcquired', handleSampleAcquired)
      serviceToUse.on('qualityReported', handleQualityReported)
      serviceToUse.on('allScansCompleted', handleAllScansCompleted)
      serviceToUse.on('error', handleFingerprintError)
      serviceToUse.on('sdkError', handleSDKError)
    }

    const handleSampleAcquired = (data) => {
      console.log('🖐️ === DETAILED FINGERPRINT SAMPLE ANALYSIS (REGISTRATION) ===')
      console.log('📥 Raw sample data:', data)
      console.log('🔍 Sample object structure:', {
        hasSample: !!data.sample,
        sampleType: data.sample ? data.sample.type : 'N/A',
        hasData: data.sample ? !!data.sample.data : false,
        dataLength: data.sample ? (data.sample.data ? data.sample.data.length : 0) : 0,
        dataType: data.sample && data.sample.data ? typeof data.sample.data : 'N/A',
        scanCount: data.scanCount
      });

      if (data.sample && data.sample.data) {
        console.log('📸 REGISTRATION FINGERPRINT DATA ANALYSIS:')
        console.log('   - Data type:', typeof data.sample.data)
        console.log('   - Data length:', data.sample.data.length)
        console.log('   - First 100 chars:', data.sample.data.substring(0, 100))
        console.log('   - Last 100 chars:', data.sample.data.substring(data.sample.data.length - 100))
        console.log('   - Starts with data:image/', data.sample.data.startsWith('data:image/'))
        console.log('   - Contains comma:', data.sample.data.includes(','))

        // Check if it looks like base64
        const base64Pattern = /^[A-Za-z0-9+/=*]*$/;
        const cleanData = data.sample.data.includes(',') ? data.sample.data.split(',')[1] : data.sample.data;
        console.log('   - Looks like base64:', base64Pattern.test(cleanData))
        console.log('   - Clean data length:', cleanData ? cleanData.length : 0)
      }

      latestSample.value = data.sample
      capturedSamples.value.push(data.sample)
      currentScanCount.value = data.scanCount

      showStatus(`Scan ${data.scanCount} captured successfully!`, 'success')
    }

    const handleQualityReported = (data) => {
      currentQuality.value = data
    }

    const handleAllScansCompleted = (data) => {
      acquisitionInProgress.value = false
      registrationStep.value = 'complete'

      console.log('🎯 === ALL SCANS COMPLETED - COMPOSITE TEMPLATE CREATION ===')
      console.log('📊 Captured samples:', capturedSamples.value.length)

      // Create a composite template from all samples
      if (capturedSamples.value.length === 0) {
        console.error('❌ No samples captured for template creation')
        showStatus('No fingerprint samples captured', 'danger')
        return
      }

      // For fingerprint verification, we need to create a reference template
      // The most reliable approach is to use the first good scan as the reference template
      let referenceTemplate = null

      capturedSamples.value.forEach((sample, index) => {
        console.log(`🔍 Sample ${index + 1}:`, {
          format: sample.format,
          type: sample.type,
          hasData: !!sample.data,
          dataLength: sample.data ? sample.data.length : 0,
          quality: sample.quality || 'Unknown',
          first50: sample.data ? sample.data.substring(0, 50) : 'NONE'
        })

        // Use the first valid sample as reference template
        if (!referenceTemplate && sample.data && sample.data.length > 0) {
          referenceTemplate = sample
          console.log(`✅ Selected Sample ${index + 1} as reference template`)
        }
      })

      if (referenceTemplate) {
        console.log('🏆 Reference template selected:', {
          format: referenceTemplate.format,
          type: referenceTemplate.type,
          dataLength: referenceTemplate.data.length,
          first50: referenceTemplate.data.substring(0, 50)
        })

        // Store the reference template for later comparison
        compositeReferenceTemplate.value = referenceTemplate.data
        console.log('💾 Composite reference template stored for verification')
      } else {
        console.error('❌ No valid reference template found')
        showStatus('Failed to create reference template', 'danger')
        return
      }

      showStatus('All scans completed successfully! Template created.', 'success')
    }

    const handleFingerprintError = (error) => {
      console.error('Fingerprint error:', error)
      showStatus('Fingerprint scanning error: ' + error.message, 'danger')
      acquisitionInProgress.value = false
    }

    const handleSDKError = (error) => {
      console.error('Fingerprint SDK error:', error)

      // Show user-friendly message and allow continuation
      showStatus(error.message + ' You may continue scanning.', 'warning')

      // Don't stop the acquisition - let the user continue
      console.log('SDK Error occurred but allowing continuation...')
    }

    const selectFingerForRegistration = (fingerIndex) => {
      console.log('🔍 selectFingerForRegistration called with fingerIndex:', fingerIndex)
      console.log('🔍 registeredFingerprints.value:', registeredFingerprints.value)
      console.log('🔍 isFingerRegistered.value(fingerIndex):', isFingerRegistered.value(fingerIndex))
      console.log('🔍 acquisitionInProgress.value:', acquisitionInProgress.value)

      if (isFingerRegistered.value(fingerIndex) || acquisitionInProgress.value) {
        console.log('🔍 Finger selection blocked - already registered or in progress')
        return
      }

      console.log('🔍 Finger selection allowed')
      tempSelectedFingerIndex.value = fingerIndex
    }

    const confirmFingerSelection = () => {
      selectedFingerIndex.value = tempSelectedFingerIndex.value
      tempSelectedFingerIndex.value = null
      registrationStep.value = 'scanning'
      currentScanCount.value = 0
      capturedSamples.value = []
    }

    const cancelFingerSelection = () => {
      tempSelectedFingerIndex.value = null
    }

    const startScanning = async () => {
      try {
        acquisitionInProgress.value = true
        currentQuality.value = null

        const serviceToUse = usingMockService.value ? mockFingerprintService : fingerprintService

        console.log('🔄 Starting registration with Intermediate format for template extraction...')
        await serviceToUse.startAcquisition(
          null, // Use default device
          'Intermediate', // Use Intermediate format for template verification
          maxScans.value
        )

        showStatus('Place your finger on the scanner...', 'info')

      } catch (error) {
        console.error('Start scanning error:', error)
        showStatus('Failed to start scanning: ' + error.message, 'danger')
        acquisitionInProgress.value = false
      }
    }

    const stopScanning = async () => {
      try {
        const serviceToUse = usingMockService.value ? mockFingerprintService : fingerprintService
        await serviceToUse.stopAcquisition()
        acquisitionInProgress.value = false
        showStatus('Scanning stopped', 'warning')
      } catch (error) {
        console.error('Stop scanning error:', error)
      }
    }

    const saveFingerprintToDatabase = async () => {
      console.log('🚀 === STARTING saveFingerprintToDatabase WORKFLOW ===')
      console.log('🔍 capturedSamples.value.length:', capturedSamples.value.length)
      console.log('🔍 selectedEmployee.value:', selectedEmployee.value)
      console.log('🔍 selectedFingerIndex.value:', selectedFingerIndex.value)
      console.log('🔍 capturedSamples.value:', capturedSamples.value)

      if (capturedSamples.value.length === 0) {
        console.error('❌ VALIDATION ERROR: No fingerprint data to save')
        throw new Error('No fingerprint data to save')
      }

      console.log('✅ Validation passed - we have fingerprint data')

      // Use the composite reference template created from all scans
      const referenceTemplate = compositeReferenceTemplate.value
      if (!referenceTemplate) {
        console.error('❌ No reference template available')
        showStatus('No fingerprint reference template available', 'danger')
        return
      }

      console.log('🏆 Using composite reference template:', {
        dataLength: referenceTemplate ? referenceTemplate.length : 0,
        dataType: typeof referenceTemplate,
        dataPreview: referenceTemplate ? referenceTemplate.substring(0, 100) + '...' : 'No data'
      })

      const fingerprintData = {
        karyawanid: selectedEmployee.value.idkaryawan,
        namakaryawan: selectedEmployee.value.namakaryawan,
        fingerindex: selectedFingerIndex.value,
        fingerimage: referenceTemplate,
        notes: `${getFingerName(selectedFingerIndex.value)} - ${capturedSamples.value.length} scans`
      }

      console.log('📤 PREPARING TO SEND FINGERPRINT DATA:', {
        karyawanid: fingerprintData.karyawanid,
        namakaryawan: fingerprintData.namakaryawan,
        fingerindex: fingerprintData.fingerindex,
        fingerimageLength: fingerprintData.fingerimage ? fingerprintData.fingerimage.length : 0,
        fingerimageType: typeof fingerprintData.fingerimage,
        fingerimagePreview: fingerprintData.fingerimage ? fingerprintData.fingerimage.substring(0, 50) + '...' : 'No data',
        notes: fingerprintData.notes
      })

      loading.register = true
      try {
        console.log('🌐 CALLING API SERVICE NOW...')
        console.log('🔗 About to call apiService.registerFingerprint with data:', fingerprintData)

        const response = await apiService.registerFingerprint(fingerprintData)

        console.log('📥 API RESPONSE RECEIVED:', response)
        console.log('📊 Response success status:', response.success)
        console.log('📊 Response message:', response.message)

        if (response.success) {
          console.log('✅ SUCCESS: Fingerprint saved to database!')
          showStatus('Fingerprint saved to database successfully!', 'success')

          console.log('🔄 Loading employee fingerprints to refresh the list...')
          // Update registered fingerprints list
          await loadEmployeeFingerprints(selectedEmployee.value.idkaryawan)
          console.log('✅ Workflow completed successfully')
        } else {
          console.error('❌ API RESPONSE ERROR:', response.message)
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('💥 SAVE FINGERPRINT ERROR:', error)
        console.error('💥 Error name:', error.name)
        console.error('💥 Error message:', error.message)
        console.error('💥 Error stack:', error.stack)
        throw new Error('Failed to save fingerprint: ' + error.message)
      } finally {
        loading.register = false
        console.log('🏁 === ENDING saveFingerprintToDatabase WORKFLOW ===')
      }
    }

    const registerAnotherFinger = () => {
      registrationStep.value = 'selectFinger'
      selectedFingerIndex.value = null
      currentScanCount.value = 0
      capturedSamples.value = []
      currentQuality.value = null
      latestSample.value = null
    }

    const finishRegistration = async () => {
      // Prevent multiple submissions
      if (isSubmitting.value) {
        console.log('🔍 Registration already in progress, ignoring duplicate call')
        return
      }

      isSubmitting.value = true
      console.log('🔍 Starting finishRegistration - preventing duplicate calls')

      try {
        await saveFingerprintToDatabase()

        // Show success notification
        if (notificationRef.value && selectedEmployee.value) {
          notificationRef.value.showCustomNotification(
            '🎉 Fingerprint Registration Complete!',
            `${getFingerName(selectedFingerIndex.value)} has been successfully registered for ${selectedEmployee.value.namakaryawan}.`,
            'success',
            true
          )
        }

        // Reset everything to show only search container
        resetToSearchOnly()
      } catch (error) {
        console.error('Finish registration error:', error)
        showStatus(error.message, 'danger')
      } finally {
        isSubmitting.value = false
        console.log('🔍 Registration submission completed')
      }
    }

    const cancelRegistration = () => {
      fingerprintRegistrationInProgress.value = false
      registrationStep.value = 'selectFinger'
      selectedFingerIndex.value = null
      tempSelectedFingerIndex.value = null
      currentScanCount.value = 0
      capturedSamples.value = []
      currentQuality.value = null
      latestSample.value = null
      acquisitionInProgress.value = false

      // Stop any ongoing acquisition
      if (fingerprintService.getStatus().acquisitionInProgress) {
        fingerprintService.stopAcquisition()
      }
      if (mockFingerprintService.getStatus().acquisitionInProgress) {
        mockFingerprintService.stopAcquisition()
      }
    }

    const getFingerIcon = (fingerIndex) => {
      const finger = fingerNames.find(f => f.index === fingerIndex)
      return finger ? finger.icon : 'bi-hand-index'
    }

    const getFingerName = (fingerIndex) => {
      const finger = fingerNames.find(f => f.index === fingerIndex)
      return finger ? finger.name : `Finger ${fingerIndex}`
    }

    const getQualityClass = (quality) => {
      if (quality === 0) return 'quality-good'
      if (quality >= 1 && quality <= 10) return 'quality-fair'
      return 'quality-poor'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    const showStatus = (message, type = 'info') => {
      statusMessage.value = { text: message, type: `alert-${type}` }
      setTimeout(() => {
        clearStatusMessage()
      }, 5000)
    }

    const clearStatusMessage = () => {
      statusMessage.value = null
    }

    // Keyboard and notification methods
    const toggleKeyboard = () => {
      if (keyboardRef.value) {
        keyboardRef.value.toggleKeyboard()
      }
    }

    const onSearchInputFocus = () => {
      // Optionally show keyboard when input is focused on touch devices
      if ('ontouchstart' in window && keyboardRef.value) {
        keyboardRef.value.showKeyboard()
      }
    }

    const proceedWithInactiveEmployee = (employee) => {
      proceedWithInactiveFlag.value = true
      if (employee) {
        selectEmployee(employee)
      }
    }

    const resetSelection = () => {
      selectedEmployee.value = null
      registeredFingerprints.value = []
      proceedWithInactiveFlag.value = false
      if (searchInputRef.value) {
        searchInputRef.value.focus()
      }
    }

    const closeNotification = () => {
      // Notification component handles this automatically
    }

    const resetToSearchOnly = () => {
      // Reset all state to show only search container
      selectedEmployee.value = null
      registeredFingerprints.value = []
      searchResults.value = []
      searchTerm.value = ''
      searched.value = false
      fingerprintRegistrationInProgress.value = false
      registrationStep.value = 'selectFinger'
      selectedFingerIndex.value = null
      tempSelectedFingerIndex.value = null
      acquisitionInProgress.value = false
      currentScanCount.value = 0
      capturedSamples.value = []
      currentQuality.value = null
      latestSample.value = null
      proceedWithInactiveFlag.value = false

      // Focus on search input for next operation
      if (searchInputRef.value) {
        searchInputRef.value.focus()
      }

      console.log('🔄 Reset to search-only mode')
    }

    // Lifecycle hooks
    onMounted(async () => {
      // Test API connection on mount
      try {
        console.log('🔍 Testing API connection on component mount...')
        const testResult = await apiService.testSimple()
        console.log('✅ API connection test result:', testResult)
      } catch (error) {
        console.error('❌ API connection test failed on mount:', error)
        showStatus('Failed to connect to the server. Please check if the backend is running.', 'danger')
      }

      // Auto-clear any existing fingerprint service state
      if (fingerprintService.getStatus().isInitialized) {
        fingerprintService.destroy()
      }
      if (mockFingerprintService.getStatus().isInitialized) {
        mockFingerprintService.destroy()
      }
    })

    onUnmounted(() => {
      // Clean up fingerprint services
      if (fingerprintService.getStatus().isInitialized) {
        fingerprintService.destroy()
      }
      if (mockFingerprintService.getStatus().isInitialized) {
        mockFingerprintService.destroy()
      }
    })

    return {
      // State
      searchTerm,
      searchResults,
      selectedEmployee,
      registeredFingerprints,
      searched,
      usingMockService,
      fingerprintRegistrationInProgress,
      registrationStep,
      selectedFingerIndex,
      tempSelectedFingerIndex,
      acquisitionInProgress,
      currentScanCount,
      maxScans,
      capturedSamples,
      currentQuality,
      latestSample,
      loading,
      isSubmitting,
      statusMessage,
      fingerNames,

      // Keyboard and notification refs
      searchInputRef,
      notificationRef,
      keyboardRef,

      // Computed
      isFingerRegistered,

      // Methods
      searchEmployees,
      selectEmployee,
      startFingerprintRegistration,
      selectFingerForRegistration,
      confirmFingerSelection,
      cancelFingerSelection,
      startScanning,
      stopScanning,
      registerAnotherFinger,
      finishRegistration,
      cancelRegistration,
      getFingerIcon,
      getFingerName,
      getQualityClass,
      formatDate,
      clearStatusMessage,
      toggleKeyboard,
      onSearchInputFocus,
      proceedWithInactiveEmployee,
      resetSelection,
      closeNotification,
      resetToSearchOnly
    }
  }
}
</script>

<style scoped>
.employee-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.employee-card.selected {
  border: 3px solid #007bff;
  background: #e3f2fd;
}

.finger-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.finger-button {
  padding: 15px;
  text-align: center;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.finger-button:hover:not(.disabled) {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,123,255,0.2);
}

.finger-button.selected {
  border-color: #28a745;
  background: #d4edda;
  transform: scale(1.05);
}

.finger-button.registered {
  border-color: #ffc107;
  background: #fff3cd;
  cursor: not-allowed;
}

.finger-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.finger-icon {
  font-size: 2em;
  margin-bottom: 5px;
  display: block;
}

.scan-progress {
  margin: 20px 0;
}

.scan-step {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
  border-left: 4px solid #dee2e6;
}

.scan-step.completed {
  background: #d4edda;
  border-left-color: #28a745;
  color: #155724;
}

.scan-step.active {
  background: #cce7ff;
  border-left-color: #007bff;
  border: 2px solid #007bff;
  padding: 13px;
}

.scan-icon {
  font-size: 1.5em;
  margin-right: 15px;
  min-width: 30px;
  text-align: center;
}

.fingerprint-preview {
  max-width: 300px;
  max-height: 300px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.quality-indicator {
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
}

.quality-good {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.quality-fair {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.quality-poor {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Keyboard button styling */
.input-group .btn-outline-secondary {
  border-color: #6c757d;
}

.input-group .btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #5a6268;
  color: white;
}

/* Improved keyboard visibility */
.on-screen-keyboard .keyboard-toggle-btn {
  z-index: 1001;
}

/* Notification positioning adjustments */
.employee-status-notification {
  z-index: 9998;
}

/* Responsive improvements for mobile */
@media (max-width: 576px) {
  .input-group .btn-outline-secondary {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>