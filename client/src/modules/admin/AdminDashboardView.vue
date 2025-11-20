<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Admin Dashboard</h2>
        <p class="text-muted mb-0">System administration and management</p>
      </div>
      <div>
        <button class="btn btn-primary me-2" @click="$router.push('/admin/users')">
          <i class="bi bi-people me-2"></i>User Management
        </button>
        <button class="btn btn-success" @click="$router.push('/admin/settings')">
          <i class="bi bi-gear me-2"></i>System Settings
        </button>
      </div>
    </div>

    <!-- System Overview -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ systemStats.totalUsers }}</h4>
                <p class="mb-0">Total Users</p>
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
                <h4 class="mb-0">{{ systemStats.activeUsers }}</h4>
                <p class="mb-0">Active Users</p>
              </div>
              <i class="bi bi-person-check fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ systemStats.systemHealth }}%</h4>
                <p class="mb-0">System Health</p>
              </div>
              <i class="bi bi-heart-pulse fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ systemStats.pendingTasks }}</h4>
                <p class="mb-0">Pending Tasks</p>
              </div>
              <i class="bi bi-clock-history fs-2"></i>
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
                <button class="btn btn-outline-primary w-100" @click="manageUsers">
                  <i class="bi bi-people me-2"></i>Manage Users
                </button>
              </div>
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-info w-100" @click="viewAuditLogs">
                  <i class="bi bi-journal-text me-2"></i>Audit Logs
                </button>
              </div>
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-warning w-100" @click="systemBackup">
                  <i class="bi bi-cloud-upload me-2"></i>System Backup
                </button>
              </div>
              <div class="col-md-3 mb-3">
                <button class="btn btn-outline-success w-100" @click="generateReport">
                  <i class="bi bi-file-earmark-text me-2"></i>System Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">System Status</h5>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Database Connection</span>
                <span class="badge bg-success">Connected</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success" style="width: 100%"></div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>API Server</span>
                <span class="badge bg-success">Running</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success" style="width: 100%"></div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Fingerprint Service</span>
                <span class="badge bg-success">Active</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success" style="width: 100%"></div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Storage Usage</span>
                <span class="badge bg-warning">65%</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-warning" style="width: 65%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Recent Activity</h5>
            <div class="list-group list-group-flush">
              <div v-for="activity in recentActivity" :key="activity.id" class="list-group-item px-0">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ activity.user }}</h6>
                    <p class="mb-0 text-muted">{{ activity.action }}</p>
                  </div>
                  <div class="text-end">
                    <small class="text-muted">{{ activity.time }}</small>
                    <div>
                      <span :class="getActivityBadgeClass(activity.type)" class="badge">
                        {{ activity.type }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Performance -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">System Performance</h5>
            <canvas ref="performanceChart" height="100"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">System Information</h5>
            <div class="mb-3">
              <strong>Version:</strong> v2.1.0
            </div>
            <div class="mb-3">
              <strong>Last Backup:</strong> {{ systemInfo.lastBackup }}
            </div>
            <div class="mb-3">
              <strong>Uptime:</strong> {{ systemInfo.uptime }}
            </div>
            <div class="mb-3">
              <strong>License:</strong> {{ systemInfo.license }}
            </div>
            <div class="mb-3">
              <strong>Support:</strong> {{ systemInfo.support }}
            </div>
            <button class="btn btn-sm btn-outline-primary w-100" @click="viewSystemInfo">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts & Notifications -->
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">System Alerts</h5>
            <div v-for="alert in systemAlerts" :key="alert.id" class="alert" :class="getAlertClass(alert.level)" role="alert">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <i :class="getAlertIcon(alert.level)" class="me-2"></i>
                  <strong>{{ alert.title }}</strong>
                  <p class="mb-0">{{ alert.message }}</p>
                </div>
                <button type="button" class="btn-close" @click="dismissAlert(alert.id)"></button>
              </div>
            </div>
            <div v-if="systemAlerts.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-check-circle fs-1 mb-2"></i>
              <p>No system alerts</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Scheduled Tasks</h5>
            <div class="list-group list-group-flush">
              <div v-for="task in scheduledTasks" :key="task.id" class="list-group-item px-0">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ task.name }}</h6>
                    <small class="text-muted">{{ task.description }}</small>
                  </div>
                  <div class="text-end">
                    <span :class="getTaskStatusClass(task.status)" class="badge mb-1">
                      {{ task.status }}
                    </span>
                    <div>
                      <small class="text-muted">{{ task.nextRun }}</small>
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
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'AdminDashboardView',
  setup() {
    // Data
    const performanceChart = ref(null)
    const systemStats = ref({
      totalUsers: 0,
      activeUsers: 0,
      systemHealth: 0,
      pendingTasks: 0
    })
    const systemInfo = ref({
      lastBackup: '',
      uptime: '',
      license: '',
      support: ''
    })
    const recentActivity = ref([])
    const systemAlerts = ref([])
    const scheduledTasks = ref([])

    // Methods
    const loadDashboardData = async () => {
      try {
        // Load system statistics
        systemStats.value = {
          totalUsers: 156,
          activeUsers: 142,
          systemHealth: 95,
          pendingTasks: 8
        }

        // Load system information
        systemInfo.value = {
          lastBackup: '2024-01-19 02:00 AM',
          uptime: '15 days, 7 hours',
          license: 'Enterprise Edition',
          support: 'Premium Support'
        }

        // Load recent activity
        recentActivity.value = [
          {
            id: 1,
            user: 'Admin User',
            action: 'Created new user account',
            time: '5 minutes ago',
            type: 'User Management'
          },
          {
            id: 2,
            user: 'HR Manager',
            action: 'Generated attendance report',
            time: '15 minutes ago',
            type: 'Report'
          },
          {
            id: 3,
            user: 'System',
            action: 'Automatic backup completed',
            time: '1 hour ago',
            type: 'System'
          },
          {
            id: 4,
            user: 'Security Admin',
            action: 'Updated security settings',
            time: '2 hours ago',
            type: 'Security'
          }
        ]

        // Load system alerts
        systemAlerts.value = [
          {
            id: 1,
            level: 'warning',
            title: 'Storage Usage',
            message: 'Storage usage is at 65%. Consider cleaning up old data.',
          },
          {
            id: 2,
            level: 'info',
            title: 'System Update',
            message: 'A new system update is available (v2.1.1).',
          }
        ]

        // Load scheduled tasks
        scheduledTasks.value = [
          {
            id: 1,
            name: 'Daily Backup',
            description: 'Automatic system backup',
            status: 'Active',
            nextRun: '2024-01-20 02:00 AM'
          },
          {
            id: 2,
            name: 'Log Cleanup',
            description: 'Remove old system logs',
            status: 'Scheduled',
            nextRun: '2024-01-21 03:00 AM'
          },
          {
            id: 3,
            name: 'Report Generation',
            description: 'Weekly performance reports',
            status: 'Active',
            nextRun: '2024-01-22 09:00 AM'
          }
        ]

        // Initialize performance chart
        setTimeout(() => {
          initializePerformanceChart()
        }, 100)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const initializePerformanceChart = () => {
      if (!performanceChart.value) return

      const ctx = performanceChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          datasets: [
            {
              label: 'CPU Usage (%)',
              data: [25, 22, 35, 42, 38, 30, 28],
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              tension: 0.4
            },
            {
              label: 'Memory Usage (%)',
              data: [60, 58, 65, 70, 68, 62, 61],
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              tension: 0.4
            },
            {
              label: 'Disk I/O (MB/s)',
              data: [15, 12, 25, 30, 28, 20, 18],
              borderColor: '#ffc107',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Usage'
              }
            }
          }
        }
      })
    }

    const manageUsers = () => {
      $router.push('/admin/users')
    }

    const viewAuditLogs = () => {
      $router.push('/admin/audit-logs')
    }

    const systemBackup = async () => {
      try {
        console.log('Starting system backup...')
        alert('System backup initiated successfully!')
      } catch (error) {
        console.error('Error starting backup:', error)
        alert('Failed to start backup. Please try again.')
      }
    }

    const generateReport = () => {
      $router.push('/reports/dashboard')
    }

    const viewSystemInfo = () => {
      console.log('Viewing detailed system information...')
    }

    const dismissAlert = (alertId) => {
      const index = systemAlerts.value.findIndex(alert => alert.id === alertId)
      if (index > -1) {
        systemAlerts.value.splice(index, 1)
      }
    }

    const getActivityBadgeClass = (type) => {
      switch (type.toLowerCase()) {
        case 'user management':
          return 'bg-primary'
        case 'system':
          return 'bg-success'
        case 'security':
          return 'bg-danger'
        case 'report':
          return 'bg-info'
        default:
          return 'bg-secondary'
      }
    }

    const getAlertClass = (level) => {
      switch (level) {
        case 'danger':
          return 'alert-danger'
        case 'warning':
          return 'alert-warning'
        case 'info':
          return 'alert-info'
        case 'success':
          return 'alert-success'
        default:
          return 'alert-secondary'
      }
    }

    const getAlertIcon = (level) => {
      switch (level) {
        case 'danger':
          return 'bi bi-exclamation-triangle-fill'
        case 'warning':
          return 'bi bi-exclamation-triangle'
        case 'info':
          return 'bi bi-info-circle-fill'
        case 'success':
          return 'bi bi-check-circle-fill'
        default:
          return 'bi bi-info-circle'
      }
    }

    const getTaskStatusClass = (status) => {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-success'
        case 'scheduled':
          return 'bg-warning'
        case 'completed':
          return 'bg-info'
        case 'failed':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadDashboardData()
    })

    return {
      performanceChart,
      systemStats,
      systemInfo,
      recentActivity,
      systemAlerts,
      scheduledTasks,
      manageUsers,
      viewAuditLogs,
      systemBackup,
      generateReport,
      viewSystemInfo,
      dismissAlert,
      getActivityBadgeClass,
      getAlertClass,
      getAlertIcon,
      getTaskStatusClass
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.badge {
  font-size: 0.75rem;
}

.progress {
  background-color: #e9ecef;
}

canvas {
  max-height: 300px;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.btn-close {
  font-size: 0.75rem;
}
</style>