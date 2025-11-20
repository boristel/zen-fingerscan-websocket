<template>
  <div class="attendance-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Attendance Dashboard</h2>
        <p class="text-muted mb-0">Overview of attendance tracking and monitoring</p>
      </div>
      <div>
        <button class="btn btn-primary me-2" @click="$router.push('/attendance/clock')">
          <i class="bi bi-clock-fill me-2"></i>Clock In/Out
        </button>
        <button class="btn btn-success" @click="exportReport">
          <i class="bi bi-download me-2"></i>Export Report
        </button>
      </div>
    </div>

    <!-- Today's Summary -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ todaysStats.present }}</h4>
                <p class="mb-0">Present Today</p>
              </div>
              <i class="bi bi-check-circle-fill fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ todaysStats.absent }}</h4>
                <p class="mb-0">Absent Today</p>
              </div>
              <i class="bi bi-x-circle-fill fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ todaysStats.late }}</h4>
                <p class="mb-0">Late Today</p>
              </div>
              <i class="bi bi-clock-history fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ todaysStats.ontime }}%</h4>
                <p class="mb-0">On Time Rate</p>
              </div>
              <i class="bi bi-graph-up-arrow fs-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Date Filter -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Quick Actions</h5>
            <div class="row">
              <div class="col-md-6 mb-2">
                <button class="btn btn-outline-primary w-100" @click="clockIn">
                  <i class="bi bi-clock me-2"></i>Clock In
                </button>
              </div>
              <div class="col-md-6 mb-2">
                <button class="btn btn-outline-danger w-100" @click="clockOut">
                  <i class="bi bi-clock-fill me-2"></i>Clock Out
                </button>
              </div>
              <div class="col-md-6 mb-2">
                <button class="btn btn-outline-info w-100" @click="viewHistory">
                  <i class="bi bi-clock-history me-2"></i>View History
                </button>
              </div>
              <div class="col-md-6 mb-2">
                <button class="btn btn-outline-success w-100" @click="generateReport">
                  <i class="bi bi-file-earmark-text me-2"></i>Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Date Filter</h5>
            <div class="row">
              <div class="col-md-6">
                <label class="form-label">From Date</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="dateFilter.from"
                  @change="filterData"
                >
              </div>
              <div class="col-md-6">
                <label class="form-label">To Date</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="dateFilter.to"
                  @change="filterData"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Overview Chart -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Weekly Attendance Trend</h5>
            <canvas ref="attendanceChart" height="100"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Department Summary -->
    <div class="row">
      <div class="col-md-7">
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
      <div class="col-md-5">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Department Summary</h5>
            <div v-for="dept in departmentSummary" :key="dept.name" class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-medium">{{ dept.name }}</span>
                <span class="text-muted">{{ dept.present }}/{{ dept.total }}</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div
                  class="progress-bar"
                  :class="getProgressClass((dept.present / dept.total) * 100)"
                  :style="`width: ${(dept.present / dept.total) * 100}%`"
                ></div>
              </div>
              <small class="text-muted">{{ Math.round((dept.present / dept.total) * 100) }}% present</small>
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
  name: 'AttendanceDashboardView',
  setup() {
    // Data
    const attendanceChart = ref(null)
    const todaysStats = ref({
      present: 0,
      absent: 0,
      late: 0,
      ontime: 0
    })
    const dateFilter = ref({
      from: new Date().toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    })
    const recentActivities = ref([])
    const departmentSummary = ref([])

    // Methods
    const loadDashboardData = async () => {
      try {
        // Load today's statistics
        todaysStats.value = {
          present: 98,
          absent: 12,
          late: 8,
          ontime: 85
        }

        // Load recent activities
        recentActivities.value = [
          {
            id: 1,
            employeeName: 'John Doe',
            action: 'Clocked in at 8:45 AM',
            time: '5 minutes ago',
            type: 'Clock In'
          },
          {
            id: 2,
            employeeName: 'Jane Smith',
            action: 'Clocked out at 5:30 PM',
            time: '10 minutes ago',
            type: 'Clock Out'
          },
          {
            id: 3,
            employeeName: 'Bob Johnson',
            action: 'Clocked in at 9:15 AM',
            time: '30 minutes ago',
            type: 'Late'
          },
          {
            id: 4,
            employeeName: 'Alice Brown',
            action: 'Clocked in at 8:30 AM',
            time: '1 hour ago',
            type: 'Clock In'
          }
        ]

        // Load department summary
        departmentSummary.value = [
          { name: 'Information Technology', present: 25, total: 28 },
          { name: 'Human Resources', present: 8, total: 10 },
          { name: 'Finance', present: 15, total: 18 },
          { name: 'Operations', present: 22, total: 25 },
          { name: 'Sales', present: 28, total: 32 }
        ]

        // Initialize chart after data is loaded
        setTimeout(() => {
          initializeChart()
        }, 100)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const initializeChart = () => {
      if (!attendanceChart.value) return

      const ctx = attendanceChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          datasets: [
            {
              label: 'Present',
              data: [110, 108, 115, 112, 98],
              borderColor: '#198754',
              backgroundColor: 'rgba(25, 135, 84, 0.1)',
              tension: 0.4
            },
            {
              label: 'Late',
              data: [8, 12, 6, 10, 8],
              borderColor: '#ffc107',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              tension: 0.4
            },
            {
              label: 'Absent',
              data: [15, 10, 8, 12, 12],
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
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
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Employees'
              }
            }
          }
        }
      })
    }

    const filterData = () => {
      console.log('Filtering data by date range:', dateFilter.value)
      // Implement date filtering logic
    }

    const clockIn = () => {
      $router.push('/attendance/clock?action=clockin')
    }

    const clockOut = () => {
      $router.push('/attendance/clock?action=timeout')
    }

    const viewHistory = () => {
      $router.push('/attendance/history')
    }

    const generateReport = () => {
      $router.push('/reports/attendance')
    }

    const exportReport = () => {
      console.log('Exporting attendance report...')
    }

    const getActivityBadgeClass = (type) => {
      switch (type.toLowerCase()) {
        case 'clock in':
          return 'bg-success'
        case 'clock out':
          return 'bg-info'
        case 'late':
          return 'bg-warning'
        case 'absent':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }

    const getProgressClass = (percentage) => {
      if (percentage >= 90) return 'bg-success'
      if (percentage >= 75) return 'bg-warning'
      return 'bg-danger'
    }

    // Lifecycle
    onMounted(() => {
      loadDashboardData()
    })

    return {
      attendanceChart,
      todaysStats,
      dateFilter,
      recentActivities,
      departmentSummary,
      filterData,
      clockIn,
      clockOut,
      viewHistory,
      generateReport,
      exportReport,
      getActivityBadgeClass,
      getProgressClass
    }
  }
}
</script>

<style scoped>
.attendance-dashboard {
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

canvas {
  max-height: 300px;
}
</style>