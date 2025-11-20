<template>
  <div class="attendance-clock">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body text-center">
            <!-- Clock Display -->
            <div class="mb-4">
              <h2 class="mb-1">{{ currentTime }}</h2>
              <p class="text-muted mb-0">{{ currentDate }}</p>
            </div>

            <!-- User Information -->
            <div class="user-info mb-4">
              <div class="d-flex align-items-center justify-content-center mb-3">
                <div class="avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                  {{ getInitials(user.name) }}
                </div>
                <div class="text-start">
                  <h4 class="mb-1">{{ user.name }}</h4>
                  <p class="text-muted mb-0">{{ user.employeeId }} • {{ user.department }}</p>
                </div>
              </div>
            </div>

            <!-- Clock Status -->
            <div class="clock-status mb-4">
              <div :class="['alert', clockStatus.class]" class="mb-0">
                <i :class="clockStatus.icon" class="me-2"></i>
                {{ clockStatus.message }}
              </div>
            </div>

            <!-- Clock Buttons -->
            <div class="clock-buttons mb-4">
              <div class="row justify-content-center">
                <div class="col-md-4 mb-2">
                  <button
                    class="btn btn-success btn-lg w-100"
                    @click="clockIn"
                    :disabled="isClockedIn || loading"
                  >
                    <i class="bi bi-clock me-2"></i>
                    Clock In
                  </button>
                </div>
                <div class="col-md-4 mb-2">
                  <button
                    class="btn btn-danger btn-lg w-100"
                    @click="clockOut"
                    :disabled="!isClockedIn || loading"
                  >
                    <i class="bi bi-clock-fill me-2"></i>
                    Clock Out
                  </button>
                </div>
                <div class="col-md-4 mb-2">
                  <button
                    class="btn btn-warning btn-lg w-100"
                    @click="breakInOut"
                    :disabled="!isClockedIn || loading"
                  >
                    <i class="bi bi-cup-hot me-2"></i>
                    {{ isOnBreak ? 'End Break' : 'Start Break' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Fingerprint Scanner -->
            <div class="fingerprint-scanner mb-4" v-if="useFingerprint">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title mb-3">
                    <i class="bi bi-fingerprint me-2"></i>
                    Fingerprint Verification
                  </h5>
                  <div class="scanner-animation" :class="{ 'scanning': isScanning }">
                    <div class="scanner-circle">
                      <i class="bi bi-fingerprint"></i>
                    </div>
                  </div>
                  <p class="text-muted mt-3">Place your finger on the scanner to verify identity</p>
                  <div class="mt-3">
                    <button
                      class="btn btn-primary"
                      @click="startScanning"
                      :disabled="isScanning"
                    >
                      <i class="bi bi-scanner me-2"></i>
                      {{ isScanning ? 'Scanning...' : 'Start Scanning' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Today's Summary -->
            <div class="today-summary" v-if="todayAttendance">
              <div class="row">
                <div class="col-md-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="text-muted">Clock In</h6>
                      <h5 class="mb-0">{{ todayAttendance.clockIn || '--:--' }}</h5>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="text-muted">Clock Out</h6>
                      <h5 class="mb-0">{{ todayAttendance.clockOut || '--:--' }}</h5>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="text-muted">Break Time</h6>
                      <h5 class="mb-0">{{ totalBreakTime || '0h 0m' }}</h5>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="text-muted">Total Hours</h6>
                      <h5 class="mb-0">{{ totalHours || '0h 0m' }}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card mt-4">
          <div class="card-body">
            <h5 class="card-title mb-3">Recent Attendance</h5>
            <div class="list-group list-group-flush">
              <div
                v-for="record in recentRecords"
                :key="record.id"
                class="list-group-item"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ formatDate(record.date) }}</h6>
                    <p class="mb-0 text-muted">
                      Clock In: {{ record.clockIn || '--:--' }} |
                      Clock Out: {{ record.clockOut || '--:--' }}
                    </p>
                  </div>
                  <div class="text-end">
                    <span :class="getStatusBadgeClass(record.status)" class="badge">
                      {{ record.status }}
                    </span>
                    <div class="text-muted small mt-1">
                      {{ record.totalHours || '0h 0m' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'AttendanceClockView',
  setup() {
    // Data
    const currentTime = ref('')
    const currentDate = ref('')
    const loading = ref(false)
    const isScanning = ref(false)
    const useFingerprint = ref(true)

    const user = ref({
      name: 'John Doe',
      employeeId: 'EMP001',
      department: 'Information Technology'
    })

    const attendanceStatus = ref({
      isClockedIn: false,
      isOnBreak: false,
      lastClockIn: null,
      lastClockOut: null,
      breakStart: null,
      breakEnd: null
    })

    const todayAttendance = ref(null)
    const recentRecords = ref([])

    // Computed
    const isClockedIn = computed(() => attendanceStatus.value.isClockedIn)
    const isOnBreak = computed(() => attendanceStatus.value.isOnBreak)

    const clockStatus = computed(() => {
      if (attendanceStatus.value.isClockedIn) {
        if (attendanceStatus.value.isOnBreak) {
          return {
            class: 'alert-warning',
            icon: 'bi bi-cup-hot',
            message: 'You are currently on break'
          }
        }
        return {
          class: 'alert-success',
          icon: 'bi bi-check-circle',
          message: 'You are currently clocked in'
        }
      }
      return {
        class: 'alert-info',
        icon: 'bi bi-info-circle',
        message: 'You are currently clocked out'
      }
    })

    const totalBreakTime = computed(() => {
      if (!todayAttendance.value?.breaks) return '0h 0m'
      const totalMinutes = todayAttendance.value.breaks.reduce((total, break_) => {
        if (break_.start && break_.end) {
          const start = new Date(`2024-01-01 ${break_.start}`)
          const end = new Date(`2024-01-01 ${break_.end}`)
          return total + Math.round((end - start) / 60000)
        }
        return total
      }, 0)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}h ${minutes}m`
    })

    const totalHours = computed(() => {
      if (!todayAttendance.value?.clockIn || !todayAttendance.value?.clockOut) return '0h 0m'
      const start = new Date(`2024-01-01 ${todayAttendance.value.clockIn}`)
      const end = new Date(`2024-01-01 ${todayAttendance.value.clockOut}`)
      const totalMinutes = Math.round((end - start) / 60000)
      const breakMinutes = todayAttendance.value.breaks?.reduce((total, break_) => {
        if (break_.start && break_.end) {
          const breakStart = new Date(`2024-01-01 ${break_.start}`)
          const breakEnd = new Date(`2024-01-01 ${break_.end}`)
          return total + Math.round((breakEnd - breakStart) / 60000)
        }
        return total
      }, 0) || 0
      const workMinutes = totalMinutes - breakMinutes
      const hours = Math.floor(workMinutes / 60)
      const minutes = workMinutes % 60
      return `${hours}h ${minutes}m`
    })

    // Methods
    let timeInterval = null

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      currentDate.value = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const loadAttendanceStatus = async () => {
      try {
        // Simulate API call
        attendanceStatus.value = {
          isClockedIn: false,
          isOnBreak: false,
          lastClockIn: null,
          lastClockOut: null,
          breakStart: null,
          breakEnd: null
        }

        // Load today's attendance
        todayAttendance.value = {
          clockIn: null,
          clockOut: null,
          breaks: []
        }

        // Load recent records
        recentRecords.value = [
          {
            id: 1,
            date: '2024-01-18',
            clockIn: '08:30',
            clockOut: '17:45',
            status: 'Present',
            totalHours: '8h 45m'
          },
          {
            id: 2,
            date: '2024-01-17',
            clockIn: '08:45',
            clockOut: '17:30',
            status: 'Present',
            totalHours: '8h 15m'
          },
          {
            id: 3,
            date: '2024-01-16',
            clockIn: '09:15',
            clockOut: '17:30',
            status: 'Late',
            totalHours: '7h 45m'
          }
        ]
      } catch (error) {
        console.error('Error loading attendance status:', error)
      }
    }

    const clockIn = async () => {
      loading.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        attendanceStatus.value.isClockedIn = true
        attendanceStatus.value.lastClockIn = new Date().toISOString()

        if (!todayAttendance.value) {
          todayAttendance.value = { breaks: [] }
        }
        todayAttendance.value.clockIn = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })

        alert('Successfully clocked in!')
      } catch (error) {
        console.error('Error clocking in:', error)
        alert('Failed to clock in. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const clockOut = async () => {
      loading.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        attendanceStatus.value.isClockedIn = false
        attendanceStatus.value.isOnBreak = false
        attendanceStatus.value.lastClockOut = new Date().toISOString()

        if (todayAttendance.value) {
          todayAttendance.value.clockOut = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }

        alert('Successfully clocked out!')
      } catch (error) {
        console.error('Error clocking out:', error)
        alert('Failed to clock out. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const breakInOut = async () => {
      loading.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (attendanceStatus.value.isOnBreak) {
          // End break
          attendanceStatus.value.isOnBreak = false
          attendanceStatus.value.breakEnd = new Date().toISOString()

          if (todayAttendance.value?.breaks?.length > 0) {
            const currentBreak = todayAttendance.value.breaks[todayAttendance.value.breaks.length - 1]
            if (currentBreak && !currentBreak.end) {
              currentBreak.end = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          }

          alert('Break ended successfully!')
        } else {
          // Start break
          attendanceStatus.value.isOnBreak = true
          attendanceStatus.value.breakStart = new Date().toISOString()

          if (!todayAttendance.value) {
            todayAttendance.value = { breaks: [] }
          }
          if (!todayAttendance.value.breaks) {
            todayAttendance.value.breaks = []
          }

          todayAttendance.value.breaks.push({
            start: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            end: null
          })

          alert('Break started successfully!')
        }
      } catch (error) {
        console.error('Error with break:', error)
        alert('Failed to process break. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const startScanning = async () => {
      isScanning.value = true
      try {
        // Simulate fingerprint scanning
        await new Promise(resolve => setTimeout(resolve, 3000))
        alert('Fingerprint verified successfully!')
      } catch (error) {
        console.error('Error scanning fingerprint:', error)
        alert('Fingerprint verification failed. Please try again.')
      } finally {
        isScanning.value = false
      }
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusBadgeClass = (status) => {
      switch (status.toLowerCase()) {
        case 'present':
          return 'bg-success'
        case 'late':
          return 'bg-warning'
        case 'absent':
          return 'bg-danger'
        case 'early':
          return 'bg-info'
        default:
          return 'bg-secondary'
      }
    }

    // Lifecycle
    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      loadAttendanceStatus()
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      currentTime,
      currentDate,
      loading,
      isScanning,
      useFingerprint,
      user,
      isClockedIn,
      isOnBreak,
      clockStatus,
      todayAttendance,
      recentRecords,
      totalBreakTime,
      totalHours,
      clockIn,
      clockOut,
      breakInOut,
      startScanning,
      getInitials,
      formatDate,
      getStatusBadgeClass
    }
  }
}
</script>

<style scoped>
.attendance-clock {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.avatar-lg {
  width: 60px;
  height: 60px;
  font-size: 20px;
  font-weight: 600;
}

.fingerprint-scanner .scanner-circle {
  width: 80px;
  height: 80px;
  border: 3px solid #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2rem;
  color: #007bff;
  transition: all 0.3s ease;
}

.fingerprint-scanner .scanner-animation.scanning .scanner-circle {
  animation: pulse 1.5s infinite;
  border-color: #28a745;
  color: #28a745;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.list-group-item {
  border: none;
  padding: 1rem 0;
}

.badge {
  font-size: 0.75rem;
}
</style>