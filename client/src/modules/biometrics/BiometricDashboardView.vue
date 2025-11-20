<template>
  <div class="biometric-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Biometric Dashboard</h2>
        <p class="text-muted mb-0">Fingerprint enrollment and biometric system overview</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="$router.push('/biometrics/enroll')">
          <i class="bi bi-fingerprint me-2"></i>Enroll New Fingerprint
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ totalEmployees }}</h4>
                <p class="mb-0">Total Employees</p>
              </div>
              <i class="bi bi-people fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ enrolledCount }}</h4>
                <p class="mb-0">Enrolled</p>
              </div>
              <i class="bi bi-check-circle fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ pendingCount }}</h4>
                <p class="mb-0">Pending</p>
              </div>
              <i class="bi bi-clock fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ enrollmentRate }}%</h4>
                <p class="mb-0">Enrollment Rate</p>
              </div>
              <i class="bi bi-graph-up fs-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Quick Actions</h5>
            <div class="row">
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-primary w-100" @click="enrollNewFingerprint">
                  <i class="bi bi-plus-circle me-2"></i>Enroll Fingerprint
                </button>
              </div>
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-info w-100" @click="manageBiometrics">
                  <i class="bi bi-gear me-2"></i>Manage Biometrics
                </button>
              </div>
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-warning w-100" @click="scanFingerprint">
                  <i class="bi bi-scanner me-2"></i>Test Scanner
                </button>
              </div>
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-success w-100" @click="exportData">
                  <i class="bi bi-download me-2"></i>Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Recent Activity</h5>
            <div class="list-group list-group-flush">
              <div v-for="activity in recentActivities" :key="activity.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ activity.employeeName }}</h6>
                    <p class="mb-0 text-muted">{{ activity.action }}</p>
                  </div>
                  <div class="text-end">
                    <small class="text-muted">{{ activity.time }}</small>
                    <div>
                      <span :class="getStatusBadgeClass(activity.status)" class="badge">
                        {{ activity.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">System Status</h5>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Fingerprint Scanner</span>
                <span class="badge bg-success">Connected</span>
              </div>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-success" style="width: 100%"></div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Database Connection</span>
                <span class="badge bg-success">Active</span>
              </div>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-success" style="width: 100%"></div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Storage Used</span>
                <span class="badge bg-info">{{ storageUsed }}%</span>
              </div>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-info" :style="`width: ${storageUsed}%`"></div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>System Health</span>
                <span class="badge bg-success">Good</span>
              </div>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-success" style="width: 95%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'BiometricDashboardView',
  setup() {
    // Data
    const totalEmployees = ref(0)
    const enrolledCount = ref(0)
    const pendingCount = ref(0)
    const storageUsed = ref(0)
    const recentActivities = ref([])

    // Computed
    const enrollmentRate = computed(() => {
      if (totalEmployees.value === 0) return 0
      return Math.round((enrolledCount.value / totalEmployees.value) * 100)
    })

    // Methods
    const loadDashboardData = async () => {
      try {
        // Simulate API calls
        totalEmployees.value = 125
        enrolledCount.value = 98
        pendingCount.value = 27
        storageUsed.value = 45

        // Generate sample recent activities
        recentActivities.value = [
          {
            id: 1,
            employeeName: 'John Doe',
            action: 'Right index fingerprint enrolled',
            time: '5 minutes ago',
            status: 'Success'
          },
          {
            id: 2,
            employeeName: 'Jane Smith',
            action: 'Left thumb fingerprint updated',
            time: '15 minutes ago',
            status: 'Success'
          },
          {
            id: 3,
            employeeName: 'Bob Johnson',
            action: 'Enrollment attempt failed',
            time: '30 minutes ago',
            status: 'Failed'
          },
          {
            id: 4,
            employeeName: 'Alice Brown',
            action: 'Right thumb fingerprint enrolled',
            time: '1 hour ago',
            status: 'Success'
          }
        ]
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const enrollNewFingerprint = () => {
      $router.push('/biometrics/enroll')
    }

    const manageBiometrics = () => {
      $router.push('/biometrics/manage')
    }

    const scanFingerprint = () => {
      // Test fingerprint scanner functionality
      console.log('Testing fingerprint scanner...')
    }

    const exportData = () => {
      // Export biometric data
      console.log('Exporting biometric data...')
    }

    const getStatusBadgeClass = (status) => {
      switch (status.toLowerCase()) {
        case 'success':
          return 'bg-success'
        case 'failed':
          return 'bg-danger'
        case 'pending':
          return 'bg-warning'
        default:
          return 'bg-secondary'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadDashboardData()
    })

    return {
      totalEmployees,
      enrolledCount,
      pendingCount,
      storageUsed,
      enrollmentRate,
      recentActivities,
      enrollNewFingerprint,
      manageBiometrics,
      scanFingerprint,
      exportData,
      getStatusBadgeClass
    }
  }
}
</script>

<style scoped>
.biometric-dashboard {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.btn {
  border-radius: 0.375rem;
}

.list-group-item {
  border: none;
  padding: 1rem 0;
}

.progress {
  background-color: #e9ecef;
}

.badge {
  font-size: 0.75rem;
}
</style>