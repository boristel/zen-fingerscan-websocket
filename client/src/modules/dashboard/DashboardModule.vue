<template>
  <div class="dashboard-module">
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
            <i class="bi bi-grid-1x2"></i>
            Dashboard
          </h1>
          <p class="page-subtitle">
            Attendance analytics and system overview
          </p>
        </div>
        <div class="header-actions">
          <div class="date-filter">
            <select v-model="selectedDateRange" class="form-select" @change="refreshDashboard">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button
            class="btn btn-primary"
            @click="refreshDashboard"
            :disabled="loading.refresh"
          >
            <i v-if="loading.refresh" class="bi bi-arrow-clockwise animate-spin"></i>
            <i v-else class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats-section">
      <div class="stats-grid">
        <div
          v-for="stat in quickStats"
          :key="stat.key"
          class="stat-card"
          :class="`stat-${stat.type}`"
        >
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ formatNumber(stat.value) }}</h3>
            <p class="stat-label">{{ stat.label }}</p>
            <div class="stat-change" :class="getChangeClass(stat.change)">
              <i :class="getChangeIcon(stat.change)"></i>
              {{ stat.change }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- Attendance Overview Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h4>Attendance Overview</h4>
            <div class="chart-actions">
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="exportChart('attendance')"
                title="Export Chart"
              >
                <i class="bi bi-download"></i>
              </button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="attendanceChart" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Department Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h4>Department Distribution</h4>
            <div class="chart-actions">
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="exportChart('department')"
                title="Export Chart"
              >
                <i class="bi bi-download"></i>
              </button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="departmentChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>

      <!-- Trend Analysis -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h4>Attendance Trends</h4>
          <div class="chart-controls">
            <div class="btn-group" role="group">
              <button
                v-for="period in trendPeriods"
                :key="period.value"
                class="btn btn-sm"
                :class="trendPeriod === period.value ? 'btn-primary' : 'btn-outline-secondary'"
                @click="changeTrendPeriod(period.value)"
              >
                {{ period.label }}
              </button>
            </div>
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="exportChart('trends')"
              title="Export Chart"
            >
              <i class="bi bi-download"></i>
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="trendsChart" width="800" height="300"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Alerts -->
    <div class="activity-section">
      <div class="activity-grid">
        <!-- Recent Activity -->
        <div class="activity-card">
          <div class="activity-header">
            <h4><i class="bi bi-activity"></i> Recent Activity</h4>
            <router-link to="/activity" class="btn btn-sm btn-outline-primary">
              View All
            </router-link>
          </div>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
              :class="`activity-${activity.type}`"
            >
              <div class="activity-icon">
                <i :class="getActivityIcon(activity.type)"></i>
              </div>
              <div class="activity-content">
                <p class="activity-description">{{ activity.description }}</p>
                <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
              </div>
              <div class="activity-status">
                <i :class="getStatusIcon(activity.status)" :title="activity.status"></i>
              </div>
            </div>

            <div v-if="recentActivities.length === 0" class="no-activity">
              <i class="bi bi-inbox"></i>
              <p>No recent activity</p>
            </div>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="activity-card">
          <div class="activity-header">
            <h4><i class="bi bi-exclamation-triangle"></i> System Alerts</h4>
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="clearAllAlerts"
              v-if="systemAlerts.length > 0"
            >
              Clear All
            </button>
          </div>
          <div class="alerts-list">
            <div
              v-for="alert in systemAlerts"
              :key="alert.id"
              class="alert-item"
              :class="`alert-${alert.severity}`"
            >
              <div class="alert-icon">
                <i :class="getAlertIcon(alert.severity)"></i>
              </div>
              <div class="alert-content">
                <p class="alert-message">{{ alert.message }}</p>
                <span class="alert-time">{{ formatRelativeTime(alert.timestamp) }}</span>
              </div>
              <button
                class="alert-dismiss"
                @click="dismissAlert(alert.id)"
                title="Dismiss Alert"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>

            <div v-if="systemAlerts.length === 0" class="no-alerts">
              <i class="bi bi-check-circle"></i>
              <p>No active alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <div class="actions-header">
        <h4><i class="bi bi-lightning"></i> Quick Actions</h4>
      </div>
      <div class="actions-grid">
        <button
          v-for="action in quickActions"
          :key="action.key"
          class="action-btn"
          :class="`action-${action.type}`"
          @click="handleQuickAction(action)"
          :disabled="action.disabled"
        >
          <i :class="action.icon"></i>
          <span>{{ action.label }}</span>
          <small>{{ action.description }}</small>
        </button>
      </div>
    </div>

    <!-- Export Modal -->
    <div
      v-if="showExportModal"
      class="export-modal"
      @click="closeExportModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Export Dashboard</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeExportModal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <div class="form-group">
              <label>Export Format</label>
              <select v-model="exportFormat" class="form-select">
                <option value="pdf">PDF Report</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV Data</option>
                <option value="json">JSON Data</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date Range</label>
              <select v-model="exportDateRange" class="form-select">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div class="form-group">
              <label>Include Charts</label>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="includeCharts"
                  id="includeCharts"
                >
                <label class="form-check-label" for="includeCharts">
                  Include visual charts in export
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeExportModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="performExport"
            :disabled="loading.export"
          >
            <i v-if="loading.export" class="bi bi-hourglass-split"></i>
            <i v-else class="bi bi-download"></i>
            Export
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
import api from '@/services/api'

// Chart.js for data visualization
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

export default {
  name: 'DashboardModule',
  setup() {
    const { user, userRole, hasPermission } = useAuth()
    const { showNotification } = useNotifications()

    // State
    const loading = ref({
      refresh: false,
      export: false
    })
    const selectedDateRange = ref('today')
    const trendPeriod = ref('week')
    const quickStats = ref([])
    const recentActivities = ref([])
    const systemAlerts = ref([])
    const showExportModal = ref(false)
    const exportFormat = ref('pdf')
    const exportDateRange = ref('month')
    const includeCharts = ref(true)

    // Chart refs
    const attendanceChart = ref(null)
    const departmentChart = ref(null)
    const trendsChart = ref(null)

    // Chart instances
    let attendanceChartInstance = null
    let departmentChartInstance = null
    let trendsChartInstance = null

    // Trend periods
    const trendPeriods = ref([
      { label: '7 Days', value: 'week' },
      { label: '30 Days', value: 'month' },
      { label: '90 Days', value: 'quarter' }
    ])

    // Quick actions based on user role
    const quickActions = computed(() => {
      const actions = [
        {
          key: 'clock-in',
          label: 'Clock In',
          description: 'Record attendance',
          icon: 'bi bi-play-circle',
          type: 'primary',
          action: 'clockIn',
          permission: 'CLOCK_IN'
        },
        {
          key: 'clock-out',
          label: 'Clock Out',
          description: 'Complete shift',
          icon: 'bi bi-stop-circle',
          type: 'secondary',
          action: 'clockOut',
          permission: 'CLOCK_OUT'
        }
      ]

      // Add role-specific actions
      if (hasPermission.value('VIEW_TEAM_ATTENDANCE')) {
        actions.push({
          key: 'team-report',
          label: 'Team Report',
          description: 'View team attendance',
          icon: 'bi bi-people',
          type: 'info',
          action: 'teamReport',
          permission: 'VIEW_TEAM_ATTENDANCE'
        })
      }

      if (hasPermission.value('GENERATE_REPORTS')) {
        actions.push({
          key: 'generate-report',
          label: 'Generate Report',
          description: 'Create attendance report',
          icon: 'bi bi-file-earmark-text',
          type: 'warning',
          action: 'generateReport',
          permission: 'GENERATE_REPORTS'
        })
      }

      if (hasPermission.value('MANAGE_BIOMETRICS')) {
        actions.push({
          key: 'manage-biometrics',
          label: 'Biometrics',
          description: 'Manage fingerprint data',
          icon: 'bi bi-fingerprint',
          type: 'success',
          action: 'manageBiometrics',
          permission: 'MANAGE_BIOMETRICS'
        })
      }

      return actions.filter(action => hasPermission.value(action.permission))
    })

    // Methods
    const refreshDashboard = async () => {
      try {
        loading.value.refresh = true
        console.log('🔄 Refreshing dashboard...')

        // Fetch dashboard data in parallel
        const [statsResponse, activitiesResponse, alertsResponse] = await Promise.all([
          fetchQuickStats(),
          fetchRecentActivities(),
          fetchSystemAlerts()
        ])

        // Update charts
        await updateCharts()

        showNotification('Dashboard refreshed successfully', 'success')

      } catch (error) {
        console.error('❌ Failed to refresh dashboard:', error)
        showNotification('Failed to refresh dashboard', 'danger')
      } finally {
        loading.value.refresh = false
      }
    }

    const fetchQuickStats = async () => {
      try {
        const response = await api.get(`/dashboard/stats?range=${selectedDateRange.value}`)

        if (response.success) {
          quickStats.value = response.data.stats || [
            {
              key: 'total-employees',
              label: 'Total Employees',
              value: 0,
              change: 0,
              icon: 'bi bi-people',
              type: 'primary'
            },
            {
              key: 'present-today',
              label: 'Present Today',
              value: 0,
              change: 0,
              icon: 'bi bi-check-circle',
              type: 'success'
            },
            {
              key: 'absent-today',
              label: 'Absent Today',
              value: 0,
              change: 0,
              icon: 'bi bi-x-circle',
              type: 'danger'
            },
            {
              key: 'late-today',
              label: 'Late Today',
              value: 0,
              change: 0,
              icon: 'bi bi-clock',
              type: 'warning'
            }
          ]
        }
      } catch (error) {
        console.error('Failed to fetch quick stats:', error)
      }
    }

    const fetchRecentActivities = async () => {
      try {
        const response = await api.get('/dashboard/activities?limit=10')

        if (response.success) {
          recentActivities.value = response.data.activities || []
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error)
        recentActivities.value = []
      }
    }

    const fetchSystemAlerts = async () => {
      try {
        const response = await api.get('/dashboard/alerts')

        if (response.success) {
          systemAlerts.value = response.data.alerts || []
        }
      } catch (error) {
        console.error('Failed to fetch system alerts:', error)
        systemAlerts.value = []
      }
    }

    const updateCharts = async () => {
      await nextTick()

      try {
        // Initialize charts if canvas elements are available
        if (attendanceChart.value) {
          await updateAttendanceChart()
        }
        if (departmentChart.value) {
          await updateDepartmentChart()
        }
        if (trendsChart.value) {
          await updateTrendsChart()
        }
      } catch (error) {
        console.error('Failed to update charts:', error)
      }
    }

    const updateAttendanceChart = async () => {
      try {
        const response = await api.get(`/dashboard/charts/attendance?range=${selectedDateRange.value}`)

        if (response.success && attendanceChart.value) {
          const data = response.data

          // Destroy existing chart
          if (attendanceChartInstance) {
            attendanceChartInstance.destroy()
          }

          // Create new chart
          attendanceChartInstance = new Chart(attendanceChart.value, {
            type: 'bar',
            data: {
              labels: data.labels || [],
              datasets: [
                {
                  label: 'Present',
                  data: data.present || [],
                  backgroundColor: 'rgba(40, 167, 69, 0.8)',
                  borderColor: 'rgba(40, 167, 69, 1)',
                  borderWidth: 1
                },
                {
                  label: 'Absent',
                  data: data.absent || [],
                  backgroundColor: 'rgba(220, 53, 69, 0.8)',
                  borderColor: 'rgba(220, 53, 69, 1)',
                  borderWidth: 1
                },
                {
                  label: 'Late',
                  data: data.late || [],
                  backgroundColor: 'rgba(255, 193, 7, 0.8)',
                  borderColor: 'rgba(255, 193, 7, 1)',
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          })
        }
      } catch (error) {
        console.error('Failed to update attendance chart:', error)
      }
    }

    const updateDepartmentChart = async () => {
      try {
        const response = await api.get(`/dashboard/charts/departments?range=${selectedDateRange.value}`)

        if (response.success && departmentChart.value) {
          const data = response.data

          // Destroy existing chart
          if (departmentChartInstance) {
            departmentChartInstance.destroy()
          }

          // Create new chart
          departmentChartInstance = new Chart(departmentChart.value, {
            type: 'doughnut',
            data: {
              labels: data.labels || [],
              datasets: [{
                data: data.values || [],
                backgroundColor: [
                  '#667eea',
                  '#764ba2',
                  '#f093fb',
                  '#f5576c',
                  '#4facfe',
                  '#43e97b',
                  '#fa709a',
                  '#fee140'
                ],
                borderWidth: 2,
                borderColor: '#fff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                },
                title: {
                  display: false
                }
              }
            }
          })
        }
      } catch (error) {
        console.error('Failed to update department chart:', error)
      }
    }

    const updateTrendsChart = async () => {
      try {
        const response = await api.get(`/dashboard/charts/trends?period=${trendPeriod.value}`)

        if (response.success && trendsChart.value) {
          const data = response.data

          // Destroy existing chart
          if (trendsChartInstance) {
            trendsChartInstance.destroy()
          }

          // Create new chart
          trendsChartInstance = new Chart(trendsChart.value, {
            type: 'line',
            data: {
              labels: data.labels || [],
              datasets: [
                {
                  label: 'Attendance Rate',
                  data: data.attendanceRate || [],
                  borderColor: 'rgba(102, 126, 234, 1)',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  fill: true,
                  tension: 0.4
                },
                {
                  label: 'Punctuality Rate',
                  data: data.punctualityRate || [],
                  borderColor: 'rgba(40, 167, 69, 1)',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  fill: true,
                  tension: 0.4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%'
                    }
                  }
                }
              }
            }
          })
        }
      } catch (error) {
        console.error('Failed to update trends chart:', error)
      }
    }

    const changeTrendPeriod = (period) => {
      trendPeriod.value = period
      updateTrendsChart()
    }

    const handleQuickAction = (action) => {
      console.log('Quick action:', action.action)

      switch (action.action) {
        case 'clockIn':
          // Navigate to attendance/clock-in
          window.location.href = '/attendance/clock-in'
          break
        case 'clockOut':
          // Navigate to attendance/clock-out
          window.location.href = '/attendance/clock-out'
          break
        case 'teamReport':
          // Navigate to team reports
          window.location.href = '/reports/team'
          break
        case 'generateReport':
          showExportModal.value = true
          break
        case 'manageBiometrics':
          // Navigate to biometric management
          window.location.href = '/biometrics'
          break
        default:
          console.warn('Unknown quick action:', action.action)
      }
    }

    const dismissAlert = async (alertId) => {
      try {
        await api.post(`/dashboard/alerts/${alertId}/dismiss`)
        systemAlerts.value = systemAlerts.value.filter(alert => alert.id !== alertId)
        showNotification('Alert dismissed', 'success')
      } catch (error) {
        console.error('Failed to dismiss alert:', error)
        showNotification('Failed to dismiss alert', 'danger')
      }
    }

    const clearAllAlerts = async () => {
      try {
        await api.post('/dashboard/alerts/clear-all')
        systemAlerts.value = []
        showNotification('All alerts cleared', 'success')
      } catch (error) {
        console.error('Failed to clear alerts:', error)
        showNotification('Failed to clear alerts', 'danger')
      }
    }

    const exportChart = (chartType) => {
      // Show export modal with pre-selected chart
      showExportModal.value = true
    }

    const closeExportModal = () => {
      showExportModal.value = false
    }

    const performExport = async () => {
      try {
        loading.value.export = true

        const exportData = {
          format: exportFormat.value,
          dateRange: exportDateRange.value,
          includeCharts: includeCharts.value,
          chartType: 'dashboard'
        }

        const response = await api.post('/dashboard/export', exportData)

        if (response.success) {
          // Download the file
          const link = document.createElement('a')
          link.href = response.data.downloadUrl
          link.download = response.data.filename
          link.click()

          showNotification('Dashboard exported successfully', 'success')
          closeExportModal()
        } else {
          throw new Error(response.message || 'Export failed')
        }

      } catch (error) {
        console.error('Export failed:', error)
        showNotification('Failed to export dashboard', 'danger')
      } finally {
        loading.value.export = false
      }
    }

    // Utility methods
    const formatNumber = (num) => {
      if (typeof num !== 'number') return '0'
      return new Intl.NumberFormat().format(num)
    }

    const getChangeClass = (change) => {
      if (change > 0) return 'text-success'
      if (change < 0) return 'text-danger'
      return 'text-secondary'
    }

    const getChangeIcon = (change) => {
      if (change > 0) return 'bi bi-arrow-up'
      if (change < 0) return 'bi bi-arrow-down'
      return 'bi bi-dash'
    }

    const getActivityIcon = (type) => {
      const icons = {
        'clock-in': 'bi bi-play-circle',
        'clock-out': 'bi bi-stop-circle',
        'break': 'bi bi-cup-hot',
        'overtime': 'bi bi-clock-history',
        'error': 'bi bi-exclamation-triangle',
        'system': 'bi bi-gear'
      }
      return icons[type] || 'bi bi-circle'
    }

    const getStatusIcon = (status) => {
      const icons = {
        'success': 'bi bi-check-circle-fill text-success',
        'warning': 'bi bi-exclamation-triangle-fill text-warning',
        'error': 'bi bi-x-circle-fill text-danger',
        'info': 'bi bi-info-circle-fill text-info'
      }
      return icons[status] || 'bi bi-circle'
    }

    const getAlertIcon = (severity) => {
      const icons = {
        'critical': 'bi bi-exclamation-triangle-fill',
        'warning': 'bi bi-exclamation-circle-fill',
        'info': 'bi bi-info-circle-fill'
      }
      return icons[severity] || 'bi bi-info-circle-fill'
    }

    const formatRelativeTime = (timestamp) => {
      if (!timestamp) return 'Unknown'

      const now = Date.now()
      const time = new Date(timestamp).getTime()
      const diff = now - time

      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

      return new Date(timestamp).toLocaleDateString()
    }

    // Auto-refresh
    let autoRefreshInterval = null

    const startAutoRefresh = () => {
      autoRefreshInterval = setInterval(() => {
        if (!loading.value.refresh) {
          refreshDashboard()
        }
      }, 5 * 60 * 1000) // Refresh every 5 minutes
    }

    const stopAutoRefresh = () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
        autoRefreshInterval = null
      }
    }

    // Lifecycle
    onMounted(async () => {
      console.log('📊 Dashboard module mounted')

      // Load initial data
      await refreshDashboard()

      // Start auto-refresh
      startAutoRefresh()

      // Handle window resize for charts
      const handleResize = () => {
        if (attendanceChartInstance) attendanceChartInstance.resize()
        if (departmentChartInstance) departmentChartInstance.resize()
        if (trendsChartInstance) trendsChartInstance.resize()
      }

      window.addEventListener('resize', handleResize)

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize)

        // Cleanup charts
        if (attendanceChartInstance) {
          attendanceChartInstance.destroy()
        }
        if (departmentChartInstance) {
          departmentChartInstance.destroy()
        }
        if (trendsChartInstance) {
          trendsChartInstance.destroy()
        }

        // Stop auto-refresh
        stopAutoRefresh()
      })
    })

    return {
      // State
      loading,
      selectedDateRange,
      trendPeriod,
      quickStats,
      recentActivities,
      systemAlerts,
      showExportModal,
      exportFormat,
      exportDateRange,
      includeCharts,
      trendPeriods,
      quickActions,

      // Refs
      attendanceChart,
      departmentChart,
      trendsChart,

      // Methods
      refreshDashboard,
      changeTrendPeriod,
      handleQuickAction,
      dismissAlert,
      clearAllAlerts,
      exportChart,
      closeExportModal,
      performExport,
      formatNumber,
      getChangeClass,
      getChangeIcon,
      getActivityIcon,
      getStatusIcon,
      getAlertIcon,
      formatRelativeTime
    }
  }
}
</script>

<style scoped>
.dashboard-module {
  max-width: 1400px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-filter .form-select {
  min-width: 150px;
}

/* Quick Stats */
.quick-stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  border-left: 4px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-primary {
  border-left-color: #667eea;
}

.stat-success {
  border-left-color: #28a745;
}

.stat-danger {
  border-left-color: #dc3545;
}

.stat-warning {
  border-left-color: #ffc107;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-danger .stat-icon {
  background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
}

.stat-warning .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  margin: 0 0 4px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #495057;
}

.stat-label {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Charts Section */
.charts-section {
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  padding: 20px;
  height: 300px;
  position: relative;
}

.chart-card.full-width .chart-container {
  height: 400px;
}

/* Activity Section */
.activity-section {
  margin-bottom: 30px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.activity-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: white;
  flex-shrink: 0;
}

.activity-clock-in .activity-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.activity-clock-out .activity-icon {
  background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
}

.activity-break .activity-icon {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.activity-overtime .activity-icon {
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
}

.activity-error .activity-icon {
  background: linear-gradient(135deg, #dc3545 0%, #dc3545 100%);
}

.activity-system .activity-icon {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.activity-content {
  flex: 1;
}

.activity-description {
  margin: 0 0 4px 0;
  color: #495057;
  font-size: 0.875rem;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.75rem;
  color: #6c757d;
}

.activity-status {
  flex-shrink: 0;
}

.no-activity {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-activity i {
  font-size: 2rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-activity p {
  margin: 0;
}

/* Alerts */
.alerts-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
}

.alert-item:hover {
  background-color: #f8f9fa;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.alert-critical .alert-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.alert-warning .alert-icon {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.alert-info .alert-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.alert-content {
  flex: 1;
}

.alert-message {
  margin: 0 0 4px 0;
  color: #495057;
  font-size: 0.875rem;
  line-height: 1.4;
}

.alert-time {
  font-size: 0.75rem;
  color: #6c757d;
}

.alert-dismiss {
  background: none;
  border: none;
  color: #6c757d;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alert-dismiss:hover {
  background-color: #e9ecef;
  color: #495057;
}

.no-alerts {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-alerts i {
  font-size: 2rem;
  margin-bottom: 12px;
  color: #28a745;
}

.no-alerts p {
  margin: 0;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 30px;
}

.actions-header {
  margin-bottom: 20px;
}

.actions-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-primary {
  border-color: #667eea;
  color: #667eea;
}

.action-primary:hover {
  background: #667eea;
  color: white;
}

.action-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.action-secondary:hover {
  background: #6c757d;
  color: white;
}

.action-info {
  border-color: #17a2b8;
  color: #17a2b8;
}

.action-info:hover {
  background: #17a2b8;
  color: white;
}

.action-warning {
  border-color: #ffc107;
  color: #ffc107;
}

.action-warning:hover {
  background: #ffc107;
  color: #212529;
}

.action-success {
  border-color: #28a745;
  color: #28a745;
}

.action-success:hover {
  background: #28a745;
  color: white;
}

.action-btn i {
  font-size: 2rem;
}

.action-btn span {
  font-weight: 600;
  font-size: 1rem;
}

.action-btn small {
  color: #6c757d;
  font-size: 0.75rem;
  line-height: 1.3;
}

/* Export Modal */
.export-modal {
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

.export-modal.show {
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

.export-modal.show .modal-content {
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
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  margin: 0;
}

.form-check-label {
  margin: 0;
  font-size: 0.875rem;
  color: #495057;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 2s linear infinite;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-module {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .chart-container {
    height: 250px;
  }

  .chart-card.full-width .chart-container {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .date-filter .form-select {
    min-width: 120px;
  }

  .activity-item,
  .alert-item {
    padding: 12px 16px;
  }

  .chart-container {
    padding: 15px;
  }
}
</style>