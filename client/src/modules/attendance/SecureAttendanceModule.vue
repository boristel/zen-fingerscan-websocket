<template>
  <div class="secure-attendance-module">
    <!-- Security Headers -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
    />

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1 class="page-title">
            <i class="bi bi-fingerprint"></i>
            Secure Attendance Verification
          </h1>
          <p class="page-subtitle">
            Industry-standard biometric authentication with server-side verification
          </p>
        </div>
        <div class="header-status">
          <div class="security-indicator">
            <i class="bi bi-shield-check text-success"></i>
            <span>Secure Connection</span>
          </div>
          <div class="session-info">
            <i class="bi bi-clock"></i>
            <span>Session: {{ formatTime(remainingSessionTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Selection Section -->
    <div class="employee-section" v-if="!selectedEmployee">
      <div class="section-card">
        <div class="card-header">
          <h3><i class="bi bi-person-search"></i> Employee Selection</h3>
          <p>Select your employee profile to continue with attendance verification</p>
        </div>

        <div class="employee-search">
          <div class="search-input-group">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control form-control-lg"
                placeholder="Enter employee ID or name..."
                @keyup.enter="searchEmployee"
                :disabled="loading.search"
                ref="searchInput"
              />
              <button
                class="btn btn-primary btn-lg"
                @click="searchEmployee"
                :disabled="loading.search || !searchQuery.trim()"
              >
                <span v-if="loading.search">
                  <i class="bi bi-hourglass-split"></i>
                  Searching...
                </span>
                <span v-else>
                  <i class="bi bi-search"></i>
                  Search
                </span>
              </button>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div class="results-header">
              <h6>Found {{ searchResults.length }} employee(s)</h6>
            </div>
            <div class="employee-list">
              <div
                v-for="employee in searchResults"
                :key="employee.id"
                class="employee-card"
                :class="{ 'selected': selectedEmployee?.id === employee.id }"
                @click="selectEmployee(employee)"
              >
                <div class="employee-avatar">
                  <div class="avatar-placeholder">
                    {{ employee.fullName?.charAt(0) || 'E' }}
                  </div>
                </div>
                <div class="employee-info">
                  <h6 class="employee-name">{{ employee.fullName }}</h6>
                  <p class="employee-details">
                    ID: {{ employee.employeeCode }} | {{ employee.departmentName }}
                  </p>
                  <div class="employee-status">
                    <span
                      class="status-badge"
                      :class="getStatusClass(employee.status)"
                    >
                      {{ employee.status }}
                    </span>
                    <span
                      v-if="employee.biometricEnrolled"
                      class="biometric-status"
                    >
                      <i class="bi bi-fingerprint text-success"></i>
                      Biometric Enrolled
                    </span>
                    <span
                      v-else
                      class="biometric-status"
                    >
                      <i class="bi bi-exclamation-triangle text-warning"></i>
                      No Biometric Data
                    </span>
                  </div>
                </div>
                <div class="employee-action">
                  <button class="btn btn-outline-primary">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery && !loading.search" class="no-results">
            <i class="bi bi-search"></i>
            <h6>No employees found</h6>
            <p>Try adjusting your search criteria</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Verification Section -->
    <div class="verification-section" v-if="selectedEmployee">
      <div class="section-card">
        <!-- Employee Info Bar -->
        <div class="employee-info-bar">
          <div class="selected-employee">
            <div class="employee-avatar">
              <div class="avatar-placeholder">
                {{ selectedEmployee.fullName?.charAt(0) || 'E' }}
              </div>
            </div>
            <div class="employee-details">
              <h5>{{ selectedEmployee.fullName }}</h5>
              <p>ID: {{ selectedEmployee.employeeCode }} | {{ selectedEmployee.departmentName }}</p>
            </div>
          </div>
          <button
            class="btn btn-outline-secondary"
            @click="clearEmployee"
            title="Change Employee"
          >
            <i class="bi bi-arrow-left"></i>
            Change
          </button>
        </div>

        <!-- Biometric Status -->
        <div class="biometric-status-card">
          <div class="status-header">
            <h4><i class="bi bi-shield-check"></i> Biometric Verification Status</h4>
          </div>

          <div class="status-content">
            <div class="status-item">
              <i class="bi bi-person-check"></i>
              <div>
                <h6>Employee Status</h6>
                <span
                  class="status-badge"
                  :class="getStatusClass(selectedEmployee.status)"
                >
                  {{ selectedEmployee.status }}
                </span>
              </div>
            </div>

            <div class="status-item">
              <i class="bi bi-fingerprint"></i>
              <div>
                <h6>Biometric Enrollment</h6>
                <span v-if="selectedEmployee.biometricEnrolled" class="text-success">
                  <i class="bi bi-check-circle-fill"></i>
                  {{ selectedEmployee.biometricCount || 0 }} finger(s) registered
                </span>
                <span v-else class="text-warning">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  No biometric data found
                </span>
              </div>
            </div>

            <div class="status-item">
              <i class="bi bi-clock-history"></i>
              <div>
                <h6>Last Attendance</h6>
                <span>{{ lastAttendanceRecord ? formatDate(lastAttendanceRecord.timestamp) : 'No records' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Controls -->
        <div class="verification-controls" v-if="selectedEmployee.biometricEnrolled">
          <div class="control-header">
            <h4><i class="bi bi-fingerprint"></i> Secure Fingerprint Verification</h4>
            <p>Place your finger on the scanner for attendance verification</p>
          </div>

          <div class="verification-actions">
            <button
              class="btn btn-primary btn-lg verification-btn"
              @click="startVerification"
              :disabled="loading.verification || verificationInProgress"
            >
              <i v-if="loading.verification" class="bi bi-hourglass-split animate-spin"></i>
              <i v-else-if="verificationInProgress" class="bi bi-fingerprint animate-pulse"></i>
              <i v-else class="bi bi-fingerprint"></i>
              <span v-if="loading.verification">Initializing...</span>
              <span v-else-if="verificationInProgress">Scanning Finger...</span>
              <span v-else>Start Verification</span>
            </button>

            <button
              v-if="verificationInProgress"
              class="btn btn-outline-danger"
              @click="cancelVerification"
            >
              <i class="bi bi-x-circle"></i>
              Cancel
            </button>
          </div>

          <!-- Scanning Progress -->
          <div v-if="verificationInProgress" class="scanning-progress">
            <div class="progress-container">
              <div class="progress-info">
                <h6><i class="bi bi-activity"></i> Scanning Progress</h6>
                <p>Please keep your finger steady on the scanner</p>
              </div>
              <div class="progress">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  :style="{ width: scanProgress + '%' }"
                  :aria-valuenow="scanProgress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {{ scanProgress }}%
                </div>
              </div>
              <div class="progress-details">
                <span>Quality: {{ scanQuality || 'Assessing...' }}</span>
                <span>Device: {{ deviceStatus || 'Connecting...' }}</span>
              </div>
            </div>
          </div>

          <!-- Security Information -->
          <div class="security-info">
            <div class="info-header">
              <i class="bi bi-shield-check text-success"></i>
              <h6>Security Information</h6>
            </div>
            <div class="info-content">
              <p class="security-notice">
                <strong>Enterprise-Grade Security:</strong> Your fingerprint data is processed securely on our servers with end-to-end encryption. No biometric data is stored or processed on your device.
              </p>
              <div class="security-features">
                <div class="feature-item">
                  <i class="bi bi-shield-lock"></i>
                  <span>Server-side verification</span>
                </div>
                <div class="feature-item">
                  <i class="bi bi-lock-fill"></i>
                  <span>AES-256 encryption</span>
                </div>
                <div class="feature-item">
                  <i class="bi bi-clock-history"></i>
                  <span>Audit trail logging</span>
                </div>
                <div class="feature-item">
                  <i class="bi bi-activity"></i>
                  <span>Real-time monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Biometric Data Message -->
        <div v-else class="no-biometric-message">
          <div class="message-content">
            <i class="bi bi-exclamation-triangle text-warning"></i>
            <h5>Biometric Data Required</h5>
            <p>This employee has no biometric data registered. Please register fingerprints first before attempting attendance verification.</p>
            <router-link to="/biometrics/register" class="btn btn-primary">
              <i class="bi bi-fingerprint"></i>
              Register Fingerprint
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Verification Result Modal -->
    <div
      v-if="verificationResult"
      class="verification-result-modal"
      :class="{ 'show': verificationResult }"
      @click="closeVerificationResult"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">
            <i v-if="verificationResult.verified" class="bi bi-check-circle-fill text-success"></i>
            <i v-else class="bi bi-x-circle-fill text-danger"></i>
            Verification {{ verificationResult.verified ? 'Successful' : 'Failed' }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeVerificationResult"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="verificationResult.verified" class="success-message">
            <div class="success-icon">
              <i class="bi bi-check-circle-fill text-success"></i>
            </div>
            <h6>Attendance Recorded Successfully!</h6>
            <p>{{ selectedEmployee.fullName }} has been checked in at {{ formatTime(Date.now()) }}</p>
          </div>

          <div v-else class="failure-message">
            <div class="failure-icon">
              <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <h6>Verification Failed</h6>
            <p>{{ verificationResult.message || 'Fingerprint verification failed. Please try again.' }}</p>
          </div>

          <!-- Security Details -->
          <div class="verification-details">
            <h6>Verification Details</h6>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Method:</span>
                <span class="detail-value">{{ verificationResult.verificationMethod || 'Secure Server Verification' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Security Level:</span>
                <span class="detail-value">{{ verificationResult.securityLevel || 'HIGH' }}</span>
              </div>
              <div class="detail-item" v-if="verificationResult.processingTime">
                <span class="detail-label">Processing Time:</span>
                <span class="detail-value">{{ verificationResult.processingTime }}ms</span>
              </div>
              <div class="detail-item" v-if="verificationResult.similarity">
                <span class="detail-label">Similarity Score:</span>
                <span class="detail-value">{{ verificationResult.similarity }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Session ID:</span>
                <span class="detail-value">{{ verificationResult.sessionId || 'Secure' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeVerificationResult"
          >
            Close
          </button>
          <button
            v-if="!verificationResult.verified"
            type="button"
            class="btn btn-primary"
            @click="retryVerification"
          >
            <i class="bi bi-arrow-clockwise"></i>
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useSession } from '@/shared/composables/useSession'
import SecureBiometricService from '@/shared/services/secureBiometricService'
import api from '@/services/api'

export default {
  name: 'SecureAttendanceModule',
  setup() {
    const { user } = useAuth()
    const { showNotification } = useNotifications()
    const { remainingSessionTime } = useSession()

    // State
    const searchQuery = ref('')
    const searchResults = ref([])
    const selectedEmployee = ref(null)
    const loading = ref({
      search: false,
      verification: false
    })
    const verificationInProgress = ref(false)
    const verificationResult = ref(null)
    const scanProgress = ref(0)
    const scanQuality = ref('')
    const deviceStatus = ref('')
    const lastAttendanceRecord = ref(null)

    // Refs
    const searchInput = ref(null)

    // Biometric service
    const biometricService = new SecureBiometricService()
    let progressInterval = null

    // Computed
    const canVerify = computed(() => {
      return selectedEmployee.value &&
             selectedEmployee.value.biometricEnrolled &&
             selectedEmployee.value.status === 'ACTIVE' &&
             !loading.value.verification &&
             !verificationInProgress.value
    })

    // Methods
    const searchEmployee = async () => {
      if (!searchQuery.value.trim()) {
        showNotification('Please enter an employee ID or name', 'warning')
        return
      }

      try {
        loading.value.search = true
        searchResults.value = []

        console.log('🔍 Searching for employee:', searchQuery.value)

        const response = await api.post('/employees/search', {
          query: searchQuery.value.trim(),
          limit: 10,
          includeBiometricStatus: true
        })

        if (response.success) {
          searchResults.value = response.data.employees || []
          console.log('✅ Search results:', searchResults.value.length, 'employees found')

          if (searchResults.value.length === 0) {
            showNotification('No employees found matching your search', 'info')
          }
        } else {
          throw new Error(response.message || 'Search failed')
        }

      } catch (error) {
        console.error('❌ Employee search failed:', error)
        showNotification('Failed to search employees. Please try again.', 'danger')
        searchResults.value = []
      } finally {
        loading.value.search = false
      }
    }

    const selectEmployee = async (employee) => {
      try {
        console.log('👤 Selecting employee:', employee.fullName)

        selectedEmployee.value = employee
        searchResults.value = []
        searchQuery.value = ''

        // Fetch employee's detailed information
        const response = await api.get(`/employees/${employee.id}`)

        if (response.success) {
          selectedEmployee.value = {
            ...employee,
            ...response.data.employee
          }

          // Fetch last attendance record
          await fetchLastAttendance()

          console.log('✅ Employee selected and details loaded:', {
            name: selectedEmployee.value.fullName,
            biometricEnrolled: selectedEmployee.value.biometricEnrolled,
            status: selectedEmployee.value.status
          })

          showNotification(`Employee selected: ${selectedEmployee.value.fullName}`, 'success')
        } else {
          throw new Error(response.message || 'Failed to load employee details')
        }

      } catch (error) {
        console.error('❌ Failed to select employee:', error)
        showNotification('Failed to load employee details', 'danger')
        selectedEmployee.value = null
      }
    }

    const clearEmployee = () => {
      selectedEmployee.value = null
      verificationResult.value = null
      lastAttendanceRecord.value = null
      nextTick(() => {
        if (searchInput.value) {
          searchInput.value.focus()
        }
      })
    }

    const fetchLastAttendance = async () => {
      if (!selectedEmployee.value) return

      try {
        const response = await api.get(`/attendance/employee/${selectedEmployee.value.id}/last`)

        if (response.success && response.data.attendance) {
          lastAttendanceRecord.value = response.data.attendance
        }
      } catch (error) {
        console.error('Failed to fetch last attendance:', error)
      }
    }

    const startVerification = async () => {
      if (!canVerify.value) {
        showNotification('Cannot start verification. Please check employee status and biometric enrollment.', 'warning')
        return
      }

      try {
        console.log('🔒 Starting SECURE fingerprint verification:', {
          employeeId: selectedEmployee.value.id,
          employeeName: selectedEmployee.value.fullName
        })

        verificationInProgress.value = true
        verificationResult.value = null
        scanProgress.value = 0
        scanQuality.value = 'Initializing...'
        deviceStatus.value = 'Connecting to device...'

        // Initialize biometric service
        loading.value.verification = true
        await biometricService.initialize()
        loading.value.verification = false

        deviceStatus.value = 'Device connected. Ready for scanning...'

        // Start progress animation
        startProgressAnimation()

        // Capture fingerprint and verify on server
        const result = await biometricService.captureForAttendance(selectedEmployee.value.id)

        console.log('✅ Verification completed:', result)

        verificationResult.value = result.verificationResult
        deviceStatus.value = 'Verification completed'

        // Show result
        showVerificationResult()

        if (result.verificationResult.verified) {
          showNotification('Attendance recorded successfully!', 'success')
          // Refresh last attendance record
          await fetchLastAttendance()
        }

      } catch (error) {
        console.error('❌ Verification failed:', error)

        verificationResult.value = {
          verified: false,
          message: error.message || 'Verification failed. Please try again.',
          verificationMethod: 'Secure Server Verification',
          securityLevel: 'HIGH'
        }

        showVerificationResult()
        showNotification('Fingerprint verification failed. Please try again.', 'danger')

      } finally {
        verificationInProgress.value = false
        loading.value.verification = false
        stopProgressAnimation()

        // Cleanup biometric service
        try {
          await biometricService.destroy()
        } catch (error) {
          console.error('Failed to cleanup biometric service:', error)
        }
      }
    }

    const cancelVerification = async () => {
      try {
        console.log('🛑 Cancelling verification...')
        verificationInProgress.value = false
        loading.value.verification = false
        stopProgressAnimation()

        await biometricService.destroy()
        showNotification('Verification cancelled', 'info')

      } catch (error) {
        console.error('Failed to cancel verification:', error)
      }
    }

    const retryVerification = () => {
      closeVerificationResult()
      setTimeout(() => {
        startVerification()
      }, 500)
    }

    const startProgressAnimation = () => {
      let progress = 0
      progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += Math.random() * 10
          scanProgress.value = Math.min(progress, 90)

          // Update quality indicator
          if (progress < 30) {
            scanQuality.value = 'Initializing...'
          } else if (progress < 60) {
            scanQuality.value = 'Scanning...'
          } else {
            scanQuality.value = 'Processing...'
          }
        }
      }, 200)
    }

    const stopProgressAnimation = () => {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      scanProgress.value = 0
      scanQuality.value = ''
      deviceStatus.value = ''
    }

    const showVerificationResult = () => {
      // Stop progress animation
      stopProgressAnimation()

      // Set final progress
      if (verificationResult.value.verified) {
        scanProgress.value = 100
        scanQuality.value = 'Verification Successful'
      } else {
        scanProgress.value = 0
        scanQuality.value = 'Verification Failed'
      }
    }

    const closeVerificationResult = () => {
      verificationResult.value = null
    }

    const getStatusClass = (status) => {
      switch (status?.toUpperCase()) {
        case 'ACTIVE':
          return 'status-success'
        case 'INACTIVE':
          return 'status-warning'
        case 'SUSPENDED':
          return 'status-danger'
        case 'TERMINATED':
          return 'status-secondary'
        default:
          return 'status-info'
      }
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return '--:--'
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'No record'
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      // Focus on search input
      nextTick(() => {
        if (searchInput.value) {
          searchInput.value.focus()
        }
      })

      // Add keyboard shortcuts
      const handleKeydown = (event) => {
        // Ctrl/Cmd + K: Focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault()
          if (searchInput.value) {
            searchInput.value.focus()
          }
        }

        // Escape: Clear selection
        if (event.key === 'Escape' && selectedEmployee.value) {
          clearEmployee()
        }

        // Enter: Start verification if employee selected
        if (event.key === 'Enter' && canVerify.value && !verificationInProgress.value) {
          startVerification()
        }
      }

      document.addEventListener('keydown', handleKeydown)

      onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)

        // Cleanup biometric service
        if (biometricService) {
          biometricService.destroy().catch(console.error)
        }

        stopProgressAnimation()
      })
    })

    return {
      // State
      searchQuery,
      searchResults,
      selectedEmployee,
      loading,
      verificationInProgress,
      verificationResult,
      scanProgress,
      scanQuality,
      deviceStatus,
      lastAttendanceRecord,
      remainingSessionTime,

      // Computed
      canVerify,

      // Refs
      searchInput,

      // Methods
      searchEmployee,
      selectEmployee,
      clearEmployee,
      startVerification,
      cancelVerification,
      retryVerification,
      closeVerificationResult,
      getStatusClass,
      formatTime,
      formatDate
    }
  }
}
</script>

<style scoped>
.secure-attendance-module {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-title p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.security-indicator,
.session-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 30px;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.card-header h3 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 1.5rem;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #6c757d;
}

/* Employee Search */
.employee-search {
  padding: 24px;
}

.search-input-group {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: stretch;
}

.input-group-text {
  background: #667eea;
  color: white;
  border: none;
  padding: 0 16px;
}

.form-control-lg {
  font-size: 1.125rem;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-left: none;
}

.form-control-lg:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-lg {
  font-size: 1.125rem;
  padding: 12px 24px;
  font-weight: 600;
}

/* Search Results */
.search-results {
  margin-top: 20px;
}

.results-header h6 {
  margin: 0 0 16px 0;
  color: #495057;
  font-weight: 600;
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.employee-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.employee-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.employee-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
}

.employee-info {
  flex: 1;
}

.employee-name {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #495057;
}

.employee-details {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.employee-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-danger {
  background: #f8d7da;
  color: #721c24;
}

.status-secondary {
  background: #e9ecef;
  color: #6c757d;
}

.status-info {
  background: #d1ecf1;
  color: #0c5460;
}

.biometric-status {
  font-size: 0.875rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results h6 {
  margin: 0 0 8px 0;
  color: #495057;
}

.no-results p {
  margin: 0;
}

/* Verification Section */
.employee-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.selected-employee {
  display: flex;
  align-items: center;
}

/* Biometric Status Card */
.biometric-status-card {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
}

.status-header h4 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
}

.status-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-item i {
  font-size: 1.5rem;
  color: #667eea;
  width: 24px;
  text-align: center;
}

.status-item h6 {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

/* Verification Controls */
.verification-controls {
  padding: 24px;
}

.control-header {
  text-align: center;
  margin-bottom: 24px;
}

.control-header h4 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
}

.control-header p {
  margin: 0;
  color: #6c757d;
}

.verification-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.verification-btn {
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 16px 32px;
  font-size: 1.125rem;
}

/* Scanning Progress */
.scanning-progress {
  margin-bottom: 24px;
}

.progress-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e9ecef;
}

.progress-info h6 {
  margin: 0 0 8px 0;
  color: #495057;
  font-weight: 600;
}

.progress-info p {
  margin: 0 0 16px 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.progress {
  height: 12px;
  border-radius: 6px;
  background: #e9ecef;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6c757d;
}

/* Security Info */
.security-info {
  background: rgba(102, 126, 234, 0.05);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.info-header h6 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.security-notice {
  margin: 0 0 16px 0;
  color: #495057;
  line-height: 1.5;
}

.security-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 500;
}

/* No Biometric Message */
.no-biometric-message {
  padding: 40px 24px;
  text-align: center;
}

.message-content {
  max-width: 400px;
  margin: 0 auto;
}

.message-content i {
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 16px;
}

.message-content h5 {
  margin: 0 0 12px 0;
  color: #495057;
}

.message-content p {
  margin: 0 0 20px 0;
  color: #6c757d;
  line-height: 1.5;
}

/* Verification Result Modal */
.verification-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.verification-result-modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.verification-result-modal.show .modal-content {
  transform: scale(1);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-body {
  padding: 24px;
}

.success-message,
.failure-message {
  text-align: center;
  margin-bottom: 24px;
}

.success-icon,
.failure-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.success-message h6,
.failure-message h6 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.success-message p {
  margin: 0;
  color: #6c757d;
}

.failure-message p {
  margin: 0;
  color: #6c757d;
}

.verification-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.verification-details h6 {
  margin: 0 0 12px 0;
  color: #495057;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
  color: #495057;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-spin {
  animation: spin 2s linear infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .secure-attendance-module {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-status {
    align-items: center;
  }

  .employee-info-bar {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .status-content {
    grid-template-columns: 1fr;
  }

  .verification-actions {
    flex-direction: column;
    align-items: center;
  }

  .verification-btn {
    width: 100%;
    max-width: 300px;
  }

  .security-features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 1.5rem;
  }

  .card-header h3 {
    font-size: 1.25rem;
  }

  .status-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .detail-item {
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>