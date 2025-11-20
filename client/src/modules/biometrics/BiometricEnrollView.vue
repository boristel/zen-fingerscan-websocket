<template>
  <div class="biometric-enroll-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Biometric Enrollment</h1>
        <p class="subtitle">Register employee fingerprints for secure attendance tracking</p>
      </div>
      <div class="header-actions">
        <router-link to="/employees" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i>
          Back to Employees
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Preparing biometric enrollment...</p>
    </div>

    <!-- Enrollment Process -->
    <div v-else-if="!loading" class="enrollment-container">
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">Employee Selection</div>
        </div>
        <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">Finger Selection</div>
        </div>
        <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-label">Fingerprint Capture</div>
        </div>
        <div class="step" :class="{ active: currentStep === 4, completed: currentStep > 4 }">
          <div class="step-number">4</div>
          <div class="step-label">Verification</div>
        </div>
        <div class="step" :class="{ active: currentStep === 5, completed: currentStep > 5 }">
          <div class="step-number">5</div>
          <div class="step-label">Completion</div>
        </div>
      </div>

      <!-- Step 1: Employee Selection -->
      <div v-if="currentStep === 1" class="enrollment-step">
        <div class="step-content">
          <h3>Select Employee</h3>
          <p class="step-description">Choose the employee you want to register biometrics for</p>

          <div class="employee-selection">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="employeeSearch"
                  type="text"
                  class="form-control"
                  placeholder="Search employees..."
                  @input="searchEmployees"
                />
              </div>
            </div>

            <div class="employee-list">
              <div
                v-for="employee in filteredEmployees"
                :key="employee.id"
                @click="selectEmployee(employee)"
                class="employee-item"
                :class="{ selected: selectedEmployee?.id === employee.id }"
              >
                <div class="employee-avatar">
                  {{ getInitials(employee.fullName) }}
                </div>
                <div class="employee-info">
                  <div class="employee-name">{{ employee.fullName }}</div>
                  <div class="employee-details">
                    {{ employee.employeeId }} • {{ employee.department }}
                  </div>
                </div>
                <div class="employee-biometric-status">
                  <span class="status-badge" :class="employee.hasBiometric ? 'registered' : 'not-registered'">
                    {{ employee.hasBiometric ? 'Biometrics Registered' : 'No Biometrics' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button
              @click="nextStep"
              class="btn btn-primary"
              :disabled="!selectedEmployee"
            >
              Next Step
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Finger Selection -->
      <div v-if="currentStep === 2" class="enrollment-step">
        <div class="step-content">
          <h3>Select Fingers</h3>
          <p class="step-description">
            Choose which fingers to register for {{ selectedEmployee?.fullName }}
          </p>

          <div class="finger-selection">
            <div class="hand-illustration">
              <div class="hand">
                <div
                  v-for="finger in fingers"
                  :key="finger.id"
                  @click="toggleFinger(finger)"
                  class="finger"
                  :class="{
                    selected: selectedFingers.includes(finger.id),
                    disabled: finger.disabled
                  }"
                  :title="finger.name"
                >
                  <div class="finger-icon">
                    <i :class="finger.icon"></i>
                  </div>
                  <div class="finger-label">{{ finger.name }}</div>
                </div>
              </div>
            </div>

            <div class="finger-list">
              <div
                v-for="finger in fingers"
                :key="finger.id"
                @click="toggleFinger(finger)"
                class="finger-list-item"
                :class="{
                  selected: selectedFingers.includes(finger.id),
                  disabled: finger.disabled
                }"
              >
                <div class="finger-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedFingers.includes(finger.id)"
                    :disabled="finger.disabled"
                    @change.stop
                  />
                </div>
                <div class="finger-info">
                  <div class="finger-name">{{ finger.name }}</div>
                  <div class="finger-status">
                    {{ finger.disabled ? 'Already registered' : 'Available for registration' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button @click="previousStep" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left"></i>
              Previous
            </button>
            <button
              @click="nextStep"
              class="btn btn-primary"
              :disabled="selectedFingers.length === 0"
            >
              Next Step
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Fingerprint Capture -->
      <div v-if="currentStep === 3" class="enrollment-step">
        <div class="step-content">
          <h3>Capture Fingerprints</h3>
          <p class="step-description">
            Follow the instructions to capture high-quality fingerprint images
          </p>

          <div class="capture-interface">
            <!-- Fingerprint Scanner Visualization -->
            <div class="scanner-visual">
              <div class="scanner-frame">
                <div class="scanner-screen">
                  <div v-if="captureStatus === 'ready'" class="scanner-message">
                    <i class="bi bi-fingerprint scanner-icon"></i>
                    <p>Place finger on the scanner</p>
                  </div>
                  <div v-else-if="captureStatus === 'scanning'" class="scanner-message scanning">
                    <div class="scan-animation"></div>
                    <p>Scanning... Keep finger steady</p>
                  </div>
                  <div v-else-if="captureStatus === 'success'" class="scanner-message success">
                    <i class="bi bi-check-circle-fill scanner-icon"></i>
                    <p>Fingerprint captured successfully!</p>
                  </div>
                  <div v-else-if="captureStatus === 'error'" class="scanner-message error">
                    <i class="bi bi-x-circle-fill scanner-icon"></i>
                    <p>Capture failed. Please try again.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Capture Progress -->
            <div class="capture-progress">
              <div class="current-finger">
                <h4>Currently Capturing: {{ getCurrentFinger()?.name }}</h4>
                <div class="progress">
                  <div
                    class="progress-bar"
                    :style="{ width: `${captureProgress}%` }"
                    :class="captureStatus"
                  ></div>
                </div>
              </div>

              <div class="quality-indicator">
                <div class="quality-meter">
                  <div class="quality-label">Image Quality</div>
                  <div class="quality-bar">
                    <div
                      class="quality-fill"
                      :style="{ width: `${imageQuality}%` }"
                      :class="getQualityClass()"
                    ></div>
                  </div>
                  <div class="quality-value">{{ imageQuality }}%</div>
                </div>
              </div>

              <!-- Capture Instructions -->
              <div class="capture-instructions">
                <h5>Instructions:</h5>
                <ul>
                  <li>Place your finger flat on the scanner surface</li>
                  <li>Apply gentle, even pressure</li>
                  <li>Keep your finger steady during scanning</li>
                  <li>Ensure finger is clean and dry</li>
                  <li>Wait for the capture to complete before removing your finger</li>
                </ul>
              </div>
            </div>

            <!-- Capture Controls -->
            <div class="capture-controls">
              <button
                @click="startCapture"
                class="btn btn-primary"
                :disabled="captureStatus === 'scanning'"
              >
                <i class="bi bi-camera"></i>
                {{ captureStatus === 'scanning' ? 'Scanning...' : 'Start Capture' }}
              </button>
              <button
                @click="cancelCapture"
                class="btn btn-outline-danger"
                :disabled="captureStatus === 'scanning'"
              >
                <i class="bi bi-x-circle"></i>
                Cancel
              </button>
            </div>

            <!-- Captured Fingers List -->
            <div class="captured-fingers">
              <h5>Captured Fingers ({{ capturedFingers.length }}/{{ selectedFingers.length }})</h5>
              <div class="captured-list">
                <div
                  v-for="fingerId in selectedFingers"
                  :key="fingerId"
                  class="captured-finger"
                  :class="{ captured: capturedFingers.includes(fingerId) }"
                >
                  <div class="finger-icon">
                    <i :class="getFingerIcon(fingerId)"></i>
                  </div>
                  <div class="finger-name">{{ getFingerName(fingerId) }}</div>
                  <div class="capture-status">
                    <i
                      :class="capturedFingers.includes(fingerId)
                        ? 'bi bi-check-circle-fill text-success'
                        : 'bi bi-clock text-warning'"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button @click="previousStep" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left"></i>
              Previous
            </button>
            <button
              @click="nextStep"
              class="btn btn-primary"
              :disabled="capturedFingers.length !== selectedFingers.length"
            >
              Next Step
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 4: Verification -->
      <div v-if="currentStep === 4" class="enrollment-step">
        <div class="step-content">
          <h3>Verify Fingerprints</h3>
          <p class="step-description">
            Test the registered fingerprints to ensure they work correctly
          </p>

          <div class="verification-interface">
            <div class="verification-instructions">
              <div class="instruction-card">
                <i class="bi bi-fingerprint instruction-icon"></i>
                <h4>Verification Process</h4>
                <p>Place each registered finger on the scanner to verify that it was captured correctly and can be recognized.</p>
              </div>
            </div>

            <div class="verification-progress">
              <div
                v-for="fingerId in selectedFingers"
                :key="fingerId"
                class="verification-item"
                :class="getVerificationClass(fingerId)"
              >
                <div class="finger-info">
                  <div class="finger-icon">
                    <i :class="getFingerIcon(fingerId)"></i>
                  </div>
                  <div class="finger-name">{{ getFingerName(fingerId) }}</div>
                </div>
                <div class="verification-status">
                  <div class="status-icon">
                    <i :class="getVerificationIcon(fingerId)"></i>
                  </div>
                  <div class="status-text">{{ getVerificationText(fingerId) }}</div>
                </div>
              </div>
            </div>

            <div class="verification-controls">
              <button
                @click="startVerification"
                class="btn btn-primary"
                :disabled="verifying"
              >
                <i class="bi bi-shield-check"></i>
                {{ verifying ? 'Verifying...' : 'Start Verification' }}
              </button>
              <button
                @click="reCaptureFinger"
                class="btn btn-outline-warning"
                :disabled="verifying || !failedFinger"
              >
                <i class="bi bi-arrow-clockwise"></i>
                Recapture Failed Finger
              </button>
            </div>
          </div>

          <div class="step-actions">
            <button @click="previousStep" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left"></i>
              Previous
            </button>
            <button
              @click="nextStep"
              class="btn btn-primary"
              :disabled="!allVerified"
            >
              Complete Enrollment
              <i class="bi bi-check-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 5: Completion -->
      <div v-if="currentStep === 5" class="enrollment-step">
        <div class="step-content">
          <div class="completion-message">
            <div class="success-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Biometric Enrollment Complete!</h3>
            <p>
              Fingerprint registration has been successfully completed for
              <strong>{{ selectedEmployee?.fullName }}</strong>
            </p>
            <div class="completion-summary">
              <div class="summary-item">
                <div class="summary-label">Employee:</div>
                <div class="summary-value">{{ selectedEmployee?.fullName }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Employee ID:</div>
                <div class="summary-value">{{ selectedEmployee?.employeeId }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Fingers Registered:</div>
                <div class="summary-value">{{ selectedFingers.length }} fingers</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Enrollment Date:</div>
                <div class="summary-value">{{ formatDate(new Date()) }}</div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button @click="goToEmployee" class="btn btn-outline-secondary">
              <i class="bi bi-person"></i>
              View Employee Profile
            </button>
            <button @click="enrollAnother" class="btn btn-primary">
              <i class="bi bi-plus-circle"></i>
              Enroll Another Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'BiometricEnrollView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { addNotification } = useNotifications()

    const loading = ref(true)
    const currentStep = ref(1)
    const employeeSearch = ref('')
    const selectedEmployee = ref(null)
    const selectedFingers = ref([])
    const capturedFingers = ref([])
    const captureStatus = ref('ready')
    const captureProgress = ref(0)
    const imageQuality = ref(0)
    const verifying = ref(false)
    const verificationResults = ref({})
    const failedFinger = ref(null)

    const employees = ref([
      {
        id: 1,
        fullName: 'John Doe',
        employeeId: 'EMP001',
        department: 'Engineering',
        hasBiometric: false
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        employeeId: 'EMP002',
        department: 'Sales',
        hasBiometric: false
      },
      {
        id: 3,
        fullName: 'Mike Johnson',
        employeeId: 'EMP003',
        department: 'Marketing',
        hasBiometric: true
      },
      {
        id: 4,
        fullName: 'Sarah Williams',
        employeeId: 'EMP004',
        department: 'HR',
        hasBiometric: false
      }
    ])

    const fingers = ref([
      { id: 1, name: 'Left Thumb', icon: 'bi bi-hand-index', disabled: false },
      { id: 2, name: 'Left Index', icon: 'bi bi-hand-index', disabled: false },
      { id: 3, name: 'Left Middle', icon: 'bi bi-hand-index', disabled: false },
      { id: 4, name: 'Left Ring', icon: 'bi bi-hand-index', disabled: false },
      { id: 5, name: 'Left Little', icon: 'bi bi-hand-index', disabled: false },
      { id: 6, name: 'Right Little', icon: 'bi bi-hand-index', disabled: false },
      { id: 7, name: 'Right Ring', icon: 'bi bi-hand-index', disabled: false },
      { id: 8, name: 'Right Middle', icon: 'bi bi-hand-index', disabled: false },
      { id: 9, name: 'Right Index', icon: 'bi bi-hand-index', disabled: false },
      { id: 10, name: 'Right Thumb', icon: 'bi bi-hand-index', disabled: false }
    ])

    const filteredEmployees = computed(() => {
      if (!employeeSearch.value) return employees.value

      const query = employeeSearch.value.toLowerCase()
      return employees.value.filter(employee =>
        employee.fullName.toLowerCase().includes(query) ||
        employee.employeeId.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query)
      )
    })

    const allVerified = computed(() => {
      return selectedFingers.value.every(fingerId =>
        verificationResults.value[fingerId] === true
      )
    })

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const searchEmployees = () => {
      // Employees are filtered via computed property
    }

    const selectEmployee = (employee) => {
      selectedEmployee.value = employee

      // Mark already registered fingers as disabled
      fingers.value.forEach(finger => {
        finger.disabled = employee.hasBiometric
      })
    }

    const toggleFinger = (finger) => {
      if (finger.disabled) return

      const index = selectedFingers.value.indexOf(finger.id)
      if (index > -1) {
        selectedFingers.value.splice(index, 1)
      } else {
        selectedFingers.value.push(finger.id)
      }
    }

    const getCurrentFinger = () => {
      const nextFinger = selectedFingers.value.find(
        fingerId => !capturedFingers.value.includes(fingerId)
      )
      return fingers.value.find(f => f.id === nextFinger)
    }

    const getFingerIcon = (fingerId) => {
      const finger = fingers.value.find(f => f.id === fingerId)
      return finger?.icon || 'bi bi-hand-index'
    }

    const getFingerName = (fingerId) => {
      const finger = fingers.value.find(f => f.id === fingerId)
      return finger?.name || 'Unknown Finger'
    }

    const getQualityClass = () => {
      if (imageQuality.value >= 80) return 'excellent'
      if (imageQuality.value >= 60) return 'good'
      if (imageQuality.value >= 40) return 'fair'
      return 'poor'
    }

    const getVerificationClass = (fingerId) => {
      const result = verificationResults.value[fingerId]
      if (result === true) return 'verified'
      if (result === false) return 'failed'
      return 'pending'
    }

    const getVerificationIcon = (fingerId) => {
      const result = verificationResults.value[fingerId]
      if (result === true) return 'bi bi-check-circle-fill'
      if (result === false) return 'bi bi-x-circle-fill'
      return 'bi bi-clock'
    }

    const getVerificationText = (fingerId) => {
      const result = verificationResults.value[fingerId]
      if (result === true) return 'Verified'
      if (result === false) return 'Failed'
      return 'Pending'
    }

    const startCapture = async () => {
      captureStatus.value = 'scanning'
      captureProgress.value = 0

      // Simulate fingerprint capture process
      const progressInterval = setInterval(() => {
        captureProgress.value += 10
        imageQuality.value = Math.floor(Math.random() * 30) + 70 // 70-100 quality

        if (captureProgress.value >= 100) {
          clearInterval(progressInterval)
          captureStatus.value = 'success'

          const currentFinger = getCurrentFinger()
          if (currentFinger) {
            capturedFingers.value.push(currentFinger.id)
          }

          setTimeout(() => {
            if (capturedFingers.value.length < selectedFingers.value.length) {
              captureStatus.value = 'ready'
              captureProgress.value = 0
              imageQuality.value = 0
            }
          }, 1500)
        }
      }, 200)
    }

    const cancelCapture = () => {
      captureStatus.value = 'ready'
      captureProgress.value = 0
      imageQuality.value = 0
    }

    const startVerification = async () => {
      verifying.value = true

      // Simulate verification process for each finger
      for (const fingerId of selectedFingers.value) {
        verificationResults.value[fingerId] = null

        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Random verification result (90% success rate for demo)
        verificationResults.value[fingerId] = Math.random() > 0.1

        if (!verificationResults.value[fingerId]) {
          failedFinger.value = fingerId
        }
      }

      verifying.value = false
    }

    const reCaptureFinger = () => {
      if (failedFinger.value) {
        // Remove from captured fingers to recapture
        const index = capturedFingers.value.indexOf(failedFinger.value)
        if (index > -1) {
          capturedFingers.value.splice(index, 1)
        }

        // Go back to capture step
        currentStep.value = 3
        captureStatus.value = 'ready'
        captureProgress.value = 0
        imageQuality.value = 0
        verificationResults.value = {}
        failedFinger.value = null
      }
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }

    const nextStep = () => {
      if (currentStep.value < 5) {
        currentStep.value++
      }
    }

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const goToEmployee = () => {
      if (selectedEmployee.value) {
        router.push(`/employees/${selectedEmployee.value.id}`)
      } else {
        router.push('/employees')
      }
    }

    const enrollAnother = () => {
      // Reset form for next enrollment
      currentStep.value = 1
      selectedEmployee.value = null
      selectedFingers.value = []
      capturedFingers.value = []
      captureStatus.value = 'ready'
      captureProgress.value = 0
      imageQuality.value = 0
      verificationResults.value = {}
      failedFinger.value = null

      addNotification({
        type: 'success',
        message: 'Ready to enroll another employee',
        duration: 3000
      })
    }

    onMounted(() => {
      // Check if employee ID is provided in query params
      const employeeId = route.query.employee
      if (employeeId) {
        const employee = employees.value.find(emp => emp.id === parseInt(employeeId))
        if (employee) {
          selectEmployee(employee)
        }
      }

      // Simulate loading time
      setTimeout(() => {
        loading.value = false
      }, 1000)
    })

    return {
      loading,
      currentStep,
      employeeSearch,
      selectedEmployee,
      selectedFingers,
      capturedFingers,
      captureStatus,
      captureProgress,
      imageQuality,
      verifying,
      verificationResults,
      failedFinger,
      employees,
      fingers,
      filteredEmployees,
      allVerified,
      getInitials,
      searchEmployees,
      selectEmployee,
      toggleFinger,
      getCurrentFinger,
      getFingerIcon,
      getFingerName,
      getQualityClass,
      getVerificationClass,
      getVerificationIcon,
      getVerificationText,
      startCapture,
      cancelCapture,
      startVerification,
      reCaptureFinger,
      formatDate,
      nextStep,
      previousStep,
      goToEmployee,
      enrollAnother
    }
  }
}
</script>

<style scoped>
.biometric-enroll-view {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
  color: #495057;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.enrollment-container {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 48px;
  position: relative;
}

.step-indicator::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e9ecef;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #667eea;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
  font-weight: 500;
}

.step.active .step-label {
  color: #667eea;
}

.step.completed .step-label {
  color: #28a745;
}

.enrollment-step {
  display: grid;
  gap: 32px;
}

.step-content h3 {
  color: #495057;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.step-description {
  color: #6c757d;
  margin-bottom: 24px;
}

/* Employee Selection Styles */
.employee-selection {
  display: grid;
  gap: 20px;
}

.search-box {
  max-width: 400px;
}

.employee-list {
  display: grid;
  gap: 12px;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.employee-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.employee-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.employee-info {
  flex: 1;
}

.employee-name {
  color: #495057;
  font-weight: 600;
  margin-bottom: 4px;
}

.employee-details {
  color: #6c757d;
  font-size: 0.875rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.registered {
  background: #d4edda;
  color: #155724;
}

.status-badge.not-registered {
  background: #f8d7da;
  color: #721c24;
}

/* Finger Selection Styles */
.finger-selection {
  display: grid;
  gap: 32px;
}

.hand-illustration {
  display: flex;
  justify-content: center;
}

.hand {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  max-width: 400px;
}

.finger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.finger:hover:not(.disabled) {
  border-color: #667eea;
  background: #f0f4ff;
}

.finger.selected {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.finger.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8d7da;
  border-color: #f5c6cb;
}

.finger-icon {
  font-size: 1.25rem;
}

.finger-list {
  display: grid;
  gap: 8px;
}

.finger-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.finger-list-item:hover:not(.disabled) {
  border-color: #667eea;
  background: #f8f9fa;
}

.finger-list-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.finger-list-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8d7da;
  border-color: #f5c6cb;
}

.finger-checkbox input {
  width: 16px;
  height: 16px;
}

.finger-info {
  flex: 1;
}

.finger-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.finger-status {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Capture Interface Styles */
.capture-interface {
  display: grid;
  gap: 24px;
}

.scanner-visual {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.scanner-frame {
  border: 4px solid #495057;
  border-radius: 12px;
  padding: 8px;
  background: #212529;
}

.scanner-screen {
  width: 300px;
  height: 200px;
  background: #1a1d21;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.scanner-message {
  text-align: center;
  color: #6c757d;
  z-index: 2;
}

.scanner-message.success {
  color: #28a745;
}

.scanner-message.error {
  color: #dc3545;
}

.scanner-message.scanning {
  color: #667eea;
}

.scanner-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  display: block;
}

.scan-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, transparent 50%);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.capture-progress {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.current-finger h4 {
  color: #495057;
  margin-bottom: 12px;
}

.progress {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #667eea;
  transition: width 0.3s ease;
}

.progress-bar.success {
  background: #28a745;
}

.progress-bar.error {
  background: #dc3545;
}

.quality-indicator {
  margin-top: 16px;
}

.quality-meter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quality-label {
  font-size: 0.875rem;
  color: #495057;
  font-weight: 500;
  min-width: 100px;
}

.quality-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.quality-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.quality-fill.excellent {
  background: #28a745;
}

.quality-fill.good {
  background: #ffc107;
}

.quality-fill.fair {
  background: #fd7e14;
}

.quality-fill.poor {
  background: #dc3545;
}

.quality-value {
  font-weight: 600;
  color: #495057;
  min-width: 40px;
  text-align: right;
}

.capture-instructions {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.capture-instructions h5 {
  color: #495057;
  margin-bottom: 12px;
}

.capture-instructions ul {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
  font-size: 0.875rem;
}

.capture-instructions li {
  margin-bottom: 4px;
}

.capture-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 24px 0;
}

.captured-fingers {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.captured-fingers h5 {
  color: #495057;
  margin-bottom: 12px;
}

.captured-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.captured-finger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.75rem;
}

.captured-finger.captured {
  background: #d4edda;
  border-color: #28a745;
}

/* Verification Styles */
.verification-interface {
  display: grid;
  gap: 24px;
}

.verification-instructions {
  text-align: center;
  margin-bottom: 24px;
}

.instruction-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  max-width: 400px;
  margin: 0 auto;
}

.instruction-icon {
  font-size: 3rem;
  color: #667eea;
}

.verification-progress {
  display: grid;
  gap: 12px;
}

.verification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.verification-item.verified {
  border-color: #28a745;
  background: #d4edda;
}

.verification-item.failed {
  border-color: #dc3545;
  background: #f8d7da;
}

.verification-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Completion Styles */
.completion-message {
  text-align: center;
  padding: 40px;
}

.success-icon {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 24px;
}

.completion-message h3 {
  color: #495057;
  margin-bottom: 16px;
}

.completion-message p {
  color: #6c757d;
  margin-bottom: 32px;
}

.completion-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  margin: 0 auto 32px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: #6c757d;
  font-weight: 500;
}

.summary-value {
  color: #495057;
  font-weight: 600;
}

/* Actions Styles */
.step-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  border-color: #5a6fd8;
  color: white;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #ced4da;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-outline-warning {
  color: #fd7e14;
  border-color: #fd7e14;
  background: transparent;
}

.btn-outline-warning:hover:not(:disabled) {
  background: #fd7e14;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  background: transparent;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .biometric-enroll-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .enrollment-container {
    padding: 24px;
  }

  .step-indicator {
    flex-wrap: wrap;
    gap: 16px;
  }

  .step {
    flex: 1;
    min-width: 100px;
  }

  .hand {
    grid-template-columns: repeat(2, 1fr);
    max-width: 250px;
  }

  .scanner-screen {
    width: 250px;
    height: 150px;
  }

  .step-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>