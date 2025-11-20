<template>
  <div class="analytics-view">
    <div class="analytics-header">
      <h2>Analytics Dashboard</h2>
      <p class="subtitle">Comprehensive insights and metrics</p>
    </div>

    <!-- Key Metrics Cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon primary">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="metric-content">
          <h3>{{ totalEmployees }}</h3>
          <p>Total Employees</p>
          <span class="metric-change positive">+5% from last month</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon success">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <div class="metric-content">
          <h3>{{ attendanceRate }}%</h3>
          <p>Attendance Rate</p>
          <span class="metric-change positive">+2% improvement</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon warning">
          <i class="bi bi-clock-fill"></i>
        </div>
        <div class="metric-content">
          <h3>{{ avgWorkHours }}</h3>
          <p>Avg. Work Hours</p>
          <span class="metric-change neutral">No change</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon danger">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div class="metric-content">
          <h3>{{ lateArrivals }}</h3>
          <p>Late Arrivals</p>
          <span class="metric-change negative">-3% this week</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-container">
      <!-- Attendance Trends Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Attendance Trends</h3>
          <div class="chart-controls">
            <select v-model="attendancePeriod" class="form-select">
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
        <div class="chart-content">
          <canvas ref="attendanceChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Department Distribution Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Department Distribution</h3>
        </div>
        <div class="chart-content">
          <canvas ref="departmentChart" width="400" height="200"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activity Table -->
    <div class="activity-section">
      <div class="section-header">
        <h3>Recent Activity</h3>
        <button class="btn btn-sm btn-outline-primary" @click="refreshActivity">
          <i class="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
      </div>
      <div class="table-container">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Action</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in recentActivity" :key="activity.id">
              <td>
                <div class="employee-info">
                  <div class="avatar">{{ getInitials(activity.employee) }}</div>
                  <span>{{ activity.employee }}</span>
                </div>
              </td>
              <td>
                <span class="action-badge" :class="activity.action">
                  {{ formatAction(activity.action) }}
                </span>
              </td>
              <td>{{ formatTime(activity.timestamp) }}</td>
              <td>
                <span class="status-indicator" :class="activity.status">
                  <i :class="getStatusIcon(activity.status)"></i>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  DoughnutController,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'AnalyticsView',
  setup() {
    const { user } = useAuth()
    const { addNotification } = useNotifications()

    const attendancePeriod = ref('month')
    const attendanceChart = ref(null)
    const departmentChart = ref(null)

    const totalEmployees = ref(247)
    const attendanceRate = ref(94.5)
    const avgWorkHours = ref(8.2)
    const lateArrivals = ref(12)

    const recentActivity = ref([
      { id: 1, employee: 'John Doe', action: 'check-in', timestamp: new Date(Date.now() - 1000 * 60 * 5), status: 'success' },
      { id: 2, employee: 'Jane Smith', action: 'check-out', timestamp: new Date(Date.now() - 1000 * 60 * 15), status: 'success' },
      { id: 3, employee: 'Mike Johnson', action: 'check-in', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'warning' },
      { id: 4, employee: 'Sarah Williams', action: 'check-in', timestamp: new Date(Date.now() - 1000 * 60 * 45), status: 'success' },
      { id: 5, employee: 'Tom Brown', action: 'check-out', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'error' }
    ])

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatAction = (action) => {
      const formatted = action.replace('-', ' ')
      return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes} min ago`

      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

      return timestamp.toLocaleDateString()
    }

    const getStatusIcon = (status) => {
      const icons = {
        success: 'bi bi-check-circle-fill text-success',
        warning: 'bi bi-exclamation-triangle-fill text-warning',
        error: 'bi bi-x-circle-fill text-danger'
      }
      return icons[status] || icons.success
    }

    const refreshActivity = () => {
      // Simulate refreshing activity data
      addNotification({
        type: 'info',
        message: 'Activity data refreshed',
        duration: 3000
      })
    }

    const initAttendanceChart = () => {
      if (!attendanceChart.value) return

      const ctx = attendanceChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Check-ins',
            data: [45, 52, 48, 58, 56, 35, 28],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
          }, {
            label: 'Check-outs',
            data: [43, 50, 47, 55, 54, 33, 26],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
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

    const initDepartmentChart = () => {
      if (!departmentChart.value) return

      const ctx = departmentChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'],
          datasets: [{
            data: [85, 65, 45, 25, 27],
            backgroundColor: [
              '#667eea',
              '#28a745',
              '#ffc107',
              '#17a2b8',
              '#dc3545'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      })
    }

    onMounted(async () => {
      await nextTick()
      initAttendanceChart()
      initDepartmentChart()
    })

    return {
      user,
      attendancePeriod,
      attendanceChart,
      departmentChart,
      totalEmployees,
      attendanceRate,
      avgWorkHours,
      lateArrivals,
      recentActivity,
      getInitials,
      formatAction,
      formatTime,
      getStatusIcon,
      refreshActivity
    }
  }
}
</script>

<style scoped>
.analytics-view {
  padding: 24px;
}

.analytics-header {
  margin-bottom: 32px;
}

.analytics-header h2 {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e9ecef;
}

.metric-icon {
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

.metric-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.metric-icon.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.metric-icon.warning {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.metric-icon.danger {
  background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
}

.metric-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 4px 0;
}

.metric-content p {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0 8px 0;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric-change.positive {
  color: #28a745;
}

.metric-change.negative {
  color: #dc3545;
}

.metric-change.neutral {
  color: #6c757d;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.form-select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.chart-content {
  height: 300px;
  position: relative;
}

.activity-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background: white;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.table-striped tbody tr:nth-of-type(odd) {
  background: rgba(0, 0, 0, 0.02);
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.action-badge.check-in {
  background: #d4edda;
  color: #155724;
}

.action-badge.check-out {
  background: #d1ecf1;
  color: #0c5460;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator i {
  font-size: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .analytics-view {
    padding: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .metric-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>