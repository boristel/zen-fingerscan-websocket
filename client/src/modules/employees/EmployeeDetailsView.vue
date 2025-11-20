<template>
  <div class="employee-details-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading employee details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <h3>Error Loading Employee</h3>
      <p>{{ error }}</p>
      <button @click="loadEmployee" class="btn btn-primary">
        <i class="bi bi-arrow-clockwise"></i>
        Retry
      </button>
    </div>

    <!-- Employee Details -->
    <div v-else-if="employee" class="employee-content">
      <!-- Header Section -->
      <div class="employee-header">
        <div class="header-content">
          <div class="employee-avatar">
            <div class="avatar-circle">
              {{ getInitials(employee.fullName) }}
            </div>
            <div class="status-indicator" :class="employee.status">
              <i :class="getStatusIcon(employee.status)"></i>
            </div>
          </div>
          <div class="employee-info">
            <h1>{{ employee.fullName }}</h1>
            <p class="job-title">{{ employee.position || 'No position specified' }}</p>
            <div class="employee-meta">
              <span class="employee-id">ID: {{ employee.employeeId }}</span>
              <span class="department">{{ employee.department || 'No department' }}</span>
              <span class="join-date">Joined {{ formatDate(employee.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <router-link :to="`/employees/${employee.id}/edit`" class="btn btn-primary">
            <i class="bi bi-pencil"></i>
            Edit Employee
          </router-link>
          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" @click="showDropdown = !showDropdown">
              <i class="bi bi-three-dots"></i>
              More Actions
            </button>
            <div v-if="showDropdown" class="dropdown-menu show">
              <router-link :to="`/employees/${employee.id}/biometrics`" class="dropdown-item">
                <i class="bi bi-fingerprint"></i>
                Manage Biometrics
              </router-link>
              <a @click="resetPassword" class="dropdown-item">
                <i class="bi bi-key"></i>
                Reset Password
              </a>
              <a @click="exportData" class="dropdown-item">
                <i class="bi bi-download"></i>
                Export Data
              </a>
              <div class="dropdown-divider"></div>
              <a @click="deleteEmployee" class="dropdown-item text-danger">
                <i class="bi bi-trash"></i>
                Delete Employee
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <nav class="nav-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="nav-tab"
            :class="{ active: activeTab === tab.key }"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Personal Information Tab -->
        <div v-if="activeTab === 'personal'" class="tab-pane active">
          <div class="info-grid">
            <div class="info-section">
              <h3>Personal Information</h3>
              <div class="info-items">
                <div class="info-item">
                  <label>Full Name</label>
                  <span>{{ employee.fullName }}</span>
                </div>
                <div class="info-item">
                  <label>Email Address</label>
                  <span>{{ employee.email }}</span>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <span>{{ employee.phone || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <span>{{ formatDate(employee.dateOfBirth) || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <span>{{ employee.gender || 'Not specified' }}</span>
                </div>
                <div class="info-item">
                  <label>Address</label>
                  <span>{{ employee.address || 'Not provided' }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3>Work Information</h3>
              <div class="info-items">
                <div class="info-item">
                  <label>Employee ID</label>
                  <span>{{ employee.employeeId }}</span>
                </div>
                <div class="info-item">
                  <label>Department</label>
                  <span>{{ employee.department || 'Not assigned' }}</span>
                </div>
                <div class="info-item">
                  <label>Position</label>
                  <span>{{ employee.position || 'Not specified' }}</span>
                </div>
                <div class="info-item">
                  <label>Manager</label>
                  <span>{{ employee.manager || 'Not assigned' }}</span>
                </div>
                <div class="info-item">
                  <label>Work Location</label>
                  <span>{{ employee.location || 'Main Office' }}</span>
                </div>
                <div class="info-item">
                  <label>Employment Type</label>
                  <span>{{ employee.employmentType || 'Full-time' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Biometrics Tab -->
        <div v-if="activeTab === 'biometrics'" class="tab-pane active">
          <div class="biometrics-section">
            <div class="biometrics-header">
              <h3>Biometric Information</h3>
              <div class="biometric-status">
                <span class="status-indicator" :class="{ registered: employee.hasBiometric }">
                  <i :class="employee.hasBiometric ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                  {{ employee.hasBiometric ? 'Biometrics Registered' : 'No Biometrics' }}
                </span>
              </div>
            </div>

            <div v-if="employee.hasBiometric" class="registered-fingers">
              <h4>Registered Fingers</h4>
              <div class="finger-map">
                <div class="hand">
                  <div
                    v-for="finger in fingers"
                    :key="finger.id"
                    class="finger"
                    :class="{ registered: finger.registered }"
                    :title="finger.name"
                  >
                    <i :class="finger.icon"></i>
                    <span class="finger-label">{{ finger.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="no-biometrics">
              <div class="no-biometrics-icon">
                <i class="bi bi-fingerprint"></i>
              </div>
              <h4>No Biometrics Registered</h4>
              <p>This employee hasn't registered any fingerprints yet.</p>
              <router-link :to="`/biometrics/enroll?employee=${employee.id}`" class="btn btn-primary">
                <i class="bi bi-plus-circle"></i>
                Register Biometrics
              </router-link>
            </div>
          </div>
        </div>

        <!-- Attendance Tab -->
        <div v-if="activeTab === 'attendance'" class="tab-pane active">
          <div class="attendance-section">
            <div class="attendance-header">
              <h3>Attendance Overview</h3>
              <div class="period-selector">
                <select v-model="attendancePeriod" class="form-select">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            <div class="attendance-stats">
              <div class="stat-card">
                <div class="stat-icon present">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="stat-content">
                  <h4>{{ attendanceStats.present }}</h4>
                  <p>Present Days</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon late">
                  <i class="bi bi-clock-fill"></i>
                </div>
                <div class="stat-content">
                  <h4>{{ attendanceStats.late }}</h4>
                  <p>Late Arrivals</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon absent">
                  <i class="bi bi-x-circle-fill"></i>
                </div>
                <div class="stat-content">
                  <h4>{{ attendanceStats.absent }}</h4>
                  <p>Absent Days</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon overtime">
                  <i class="bi bi-clock-history"></i>
                </div>
                <div class="stat-content">
                  <h4>{{ attendanceStats.overtimeHours }}h</h4>
                  <p>Overtime Hours</p>
                </div>
              </div>
            </div>

            <div class="recent-attendance">
              <h4>Recent Attendance</h4>
              <div class="attendance-list">
                <div
                  v-for="record in recentAttendance"
                  :key="record.id"
                  class="attendance-record"
                >
                  <div class="record-date">
                    <div class="date">{{ formatDate(record.date) }}</div>
                    <div class="day">{{ getDayName(record.date) }}</div>
                  </div>
                  <div class="record-times">
                    <div class="time-pair">
                      <span class="label">Check In:</span>
                      <span class="time">{{ formatTime(record.checkIn) }}</span>
                    </div>
                    <div class="time-pair">
                      <span class="label">Check Out:</span>
                      <span class="time">{{ formatTime(record.checkOut) || '--:--' }}</span>
                    </div>
                  </div>
                  <div class="record-status">
                    <span class="status-badge" :class="record.status">
                      {{ formatStatus(record.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Tab -->
        <div v-if="activeTab === 'documents'" class="tab-pane active">
          <div class="documents-section">
            <div class="documents-header">
              <h3>Employee Documents</h3>
              <button @click="uploadDocument" class="btn btn-primary">
                <i class="bi bi-cloud-upload"></i>
                Upload Document
              </button>
            </div>

            <div class="documents-list">
              <div
                v-for="document in documents"
                :key="document.id"
                class="document-item"
              >
                <div class="document-icon">
                  <i :class="getDocumentIcon(document.type)"></i>
                </div>
                <div class="document-info">
                  <div class="document-name">{{ document.name }}</div>
                  <div class="document-meta">
                    <span>Uploaded {{ formatDate(document.uploadedAt) }}</span>
                    <span>{{ formatFileSize(document.size) }}</span>
                  </div>
                </div>
                <div class="document-actions">
                  <button @click="downloadDocument(document)" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-download"></i>
                  </button>
                  <button @click="deleteDocument(document)" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="documents.length === 0" class="no-documents">
              <div class="no-documents-icon">
                <i class="bi bi-file-earmark"></i>
              </div>
              <h4>No Documents</h4>
              <p>No documents have been uploaded for this employee.</p>
            </div>
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
  name: 'EmployeeDetailsView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { addNotification } = useNotifications()

    const loading = ref(true)
    const error = ref(null)
    const employee = ref(null)
    const activeTab = ref('personal')
    const showDropdown = ref(false)
    const attendancePeriod = ref('month')

    const tabs = [
      { key: 'personal', label: 'Personal Info', icon: 'bi bi-person' },
      { key: 'biometrics', label: 'Biometrics', icon: 'bi bi-fingerprint' },
      { key: 'attendance', label: 'Attendance', icon: 'bi bi-calendar-check' },
      { key: 'documents', label: 'Documents', icon: 'bi bi-file-earmark' }
    ]

    const fingers = [
      { id: 1, name: 'Left Thumb', icon: 'bi bi-hand-index', registered: true },
      { id: 2, name: 'Left Index', icon: 'bi bi-hand-index', registered: true },
      { id: 3, name: 'Left Middle', icon: 'bi bi-hand-index', registered: false },
      { id: 4, name: 'Left Ring', icon: 'bi bi-hand-index', registered: false },
      { id: 5, name: 'Left Little', icon: 'bi bi-hand-index', registered: false },
      { id: 6, name: 'Right Little', icon: 'bi bi-hand-index', registered: false },
      { id: 7, name: 'Right Ring', icon: 'bi bi-hand-index', registered: false },
      { id: 8, name: 'Right Middle', icon: 'bi bi-hand-index', registered: true },
      { id: 9, name: 'Right Index', icon: 'bi bi-hand-index', registered: true },
      { id: 10, name: 'Right Thumb', icon: 'bi bi-hand-index', registered: true }
    ]

    const attendanceStats = ref({
      present: 22,
      late: 3,
      absent: 1,
      overtimeHours: 8.5
    })

    const recentAttendance = ref([
      {
        id: 1,
        date: new Date('2024-01-15'),
        checkIn: new Date('2024-01-15T09:05:00'),
        checkOut: new Date('2024-01-15T18:30:00'),
        status: 'present'
      },
      {
        id: 2,
        date: new Date('2024-01-16'),
        checkIn: new Date('2024-01-16T09:15:00'),
        checkOut: new Date('2024-01-16T18:45:00'),
        status: 'late'
      },
      {
        id: 3,
        date: new Date('2024-01-17'),
        checkIn: null,
        checkOut: null,
        status: 'absent'
      }
    ])

    const documents = ref([
      {
        id: 1,
        name: 'Employment Contract.pdf',
        type: 'pdf',
        size: 245760,
        uploadedAt: new Date('2023-01-15')
      },
      {
        id: 2,
        name: 'ID Card.jpg',
        type: 'image',
        size: 524288,
        uploadedAt: new Date('2023-01-16')
      }
    ])

    const loadEmployee = async () => {
      try {
        loading.value = true
        error.value = null

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock employee data
        employee.value = {
          id: parseInt(route.params.id),
          fullName: 'John Doe',
          email: 'john.doe@company.com',
          phone: '+1 (555) 123-4567',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'Male',
          address: '123 Main St, City, State 12345',
          employeeId: 'EMP001',
          department: 'Engineering',
          position: 'Senior Developer',
          manager: 'Jane Smith',
          location: 'Main Office',
          employmentType: 'Full-time',
          status: 'active',
          hasBiometric: true,
          createdAt: new Date('2023-01-15')
        }

      } catch (err) {
        error.value = 'Failed to load employee details. Please try again.'
        console.error('Error loading employee:', err)
      } finally {
        loading.value = false
      }
    }

    const getInitials = (name) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const getStatusIcon = (status) => {
      const icons = {
        active: 'bi bi-check-circle-fill text-success',
        inactive: 'bi bi-x-circle-fill text-danger',
        onLeave: 'bi bi-clock-fill text-warning'
      }
      return icons[status] || icons.active
    }

    const formatDate = (date) => {
      if (!date) return 'Not specified'
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date))
    }

    const formatTime = (date) => {
      if (!date) return null
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    }

    const getDayName = (date) => {
      return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date))
    }

    const formatStatus = (status) => {
      return status
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const getDocumentIcon = (type) => {
      const icons = {
        pdf: 'bi bi-file-earmark-pdf text-danger',
        image: 'bi bi-file-earmark-image text-success',
        doc: 'bi bi-file-earmark-word text-primary'
      }
      return icons[type] || 'bi bi-file-earmark text-secondary'
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const resetPassword = () => {
      if (confirm('Are you sure you want to reset this employee\'s password?')) {
        // Simulate password reset
        addNotification({
          type: 'success',
          message: 'Password reset instructions have been sent to the employee\'s email.',
          duration: 5000
        })
      }
    }

    const exportData = () => {
      // Simulate data export
      addNotification({
        type: 'info',
        message: 'Employee data export will begin shortly.',
        duration: 3000
      })
    }

    const deleteEmployee = () => {
      if (confirm(`Are you sure you want to delete ${employee.value.fullName}? This action cannot be undone.`)) {
        // Simulate deletion
        addNotification({
          type: 'success',
          message: 'Employee has been deleted successfully.',
          duration: 3000
        })
        router.push('/employees')
      }
    }

    const uploadDocument = () => {
      // Simulate document upload
      addNotification({
        type: 'info',
        message: 'Document upload functionality would open here.',
        duration: 3000
      })
    }

    const downloadDocument = (document) => {
      // Simulate document download
      addNotification({
        type: 'info',
        message: `Downloading ${document.name}...`,
        duration: 3000
      })
    }

    const deleteDocument = (document) => {
      if (confirm(`Are you sure you want to delete ${document.name}?`)) {
        const index = documents.value.findIndex(doc => doc.id === document.id)
        if (index > -1) {
          documents.value.splice(index, 1)
          addNotification({
            type: 'success',
            message: 'Document has been deleted successfully.',
            duration: 3000
          })
        }
      }
    }

    onMounted(() => {
      loadEmployee()
    })

    return {
      loading,
      error,
      employee,
      activeTab,
      showDropdown,
      attendancePeriod,
      tabs,
      fingers,
      attendanceStats,
      recentAttendance,
      documents,
      loadEmployee,
      getInitials,
      getStatusIcon,
      formatDate,
      formatTime,
      getDayName,
      formatStatus,
      getDocumentIcon,
      formatFileSize,
      resetPassword,
      exportData,
      deleteEmployee,
      uploadDocument,
      downloadDocument,
      deleteDocument
    }
  }
}
</script>

<style scoped>
.employee-details-view {
  padding: 24px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.employee-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex: 1;
}

.employee-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
}

.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e9ecef;
}

.status-indicator.active {
  color: #28a745;
}

.status-indicator.inactive {
  color: #dc3545;
}

.status-indicator.on-leave {
  color: #ffc107;
}

.employee-info {
  flex: 1;
}

.employee-info h1 {
  color: #495057;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.job-title {
  color: #6c757d;
  font-size: 1.125rem;
  margin-bottom: 16px;
}

.employee-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.employee-meta span {
  color: #6c757d;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  display: block;
  min-width: 200px;
  padding: 8px 0;
  margin: 4px 0 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: #495057;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.dropdown-item.text-danger:hover {
  background: #f8d7da;
  color: #721c24;
}

.dropdown-divider {
  height: 0;
  margin: 8px 0;
  overflow: hidden;
  border-top: 1px solid #e9ecef;
}

.tab-navigation {
  background: white;
  border-radius: 12px;
  padding: 0 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 0;
}

.nav-tab {
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-tab:hover {
  background: #f8f9fa;
  color: #495057;
}

.nav-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
}

.info-section h3 {
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.info-items {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #495057;
  font-size: 0.875rem;
}

.biometrics-section {
  display: grid;
  gap: 24px;
}

.biometrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.biometric-status .status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.registered {
  background: #d4edda;
  color: #155724;
}

.finger-map {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.hand {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.finger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.finger.registered {
  background: #d4edda;
  color: #155724;
}

.finger:not(.registered) {
  background: #f8d7da;
  color: #721c24;
}

.finger i {
  font-size: 1.25rem;
}

.finger-label {
  text-align: center;
  line-height: 1.2;
}

.no-biometrics {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.no-biometrics-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.attendance-section {
  display: grid;
  gap: 24px;
}

.attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.attendance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-icon.present {
  background: #28a745;
}

.stat-icon.late {
  background: #ffc107;
  color: #212529;
}

.stat-icon.absent {
  background: #dc3545;
}

.stat-icon.overtime {
  background: #667eea;
}

.stat-content h4 {
  color: #495057;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-content p {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.recent-attendance h4 {
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.attendance-list {
  display: grid;
  gap: 12px;
}

.attendance-record {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.record-date {
  min-width: 100px;
  text-align: center;
}

.record-date .date {
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
}

.record-date .day {
  color: #6c757d;
  font-size: 0.75rem;
}

.record-times {
  flex: 1;
  display: flex;
  gap: 24px;
}

.time-pair {
  display: flex;
  gap: 8px;
}

.time-pair .label {
  color: #6c757d;
  font-size: 0.75rem;
}

.time-pair .time {
  color: #495057;
  font-weight: 500;
  font-size: 0.875rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.present {
  background: #d4edda;
  color: #155724;
}

.status-badge.late {
  background: #fff3cd;
  color: #856404;
}

.status-badge.absent {
  background: #f8d7da;
  color: #721c24;
}

.documents-section {
  display: grid;
  gap: 24px;
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.documents-list {
  display: grid;
  gap: 12px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.document-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: white;
  font-size: 1.25rem;
}

.document-info {
  flex: 1;
}

.document-name {
  color: #495057;
  font-weight: 500;
  margin-bottom: 4px;
}

.document-meta {
  display: flex;
  gap: 12px;
  color: #6c757d;
  font-size: 0.75rem;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.no-documents {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.no-documents-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.btn {
  padding: 8px 16px;
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
}

.btn-primary {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-primary:hover {
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

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #667eea;
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

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .employee-details-view {
    padding: 16px;
  }

  .employee-header {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .employee-meta {
    justify-content: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .attendance-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .attendance-record {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .record-times {
    flex-direction: column;
    gap: 8px;
  }

  .document-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .biometrics-header,
  .attendance-header,
  .documents-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>