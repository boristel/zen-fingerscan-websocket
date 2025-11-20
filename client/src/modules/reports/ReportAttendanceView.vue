<template>
  <div class="report-attendance">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Attendance Reports</h2>
        <p class="text-muted mb-0">Generate detailed attendance reports</p>
      </div>
      <div>
        <button class="btn btn-success" @click="generateReport" :disabled="!isFormValid">
          <i class="bi bi-file-earmark-text me-2"></i>Generate Report
        </button>
      </div>
    </div>

    <!-- Report Configuration -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-4">Report Configuration</h5>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Report Type</label>
              <select class="form-select" v-model="reportConfig.type">
                <option value="summary">Attendance Summary</option>
                <option value="detailed">Detailed Attendance</option>
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Report Format</label>
              <select class="form-select" v-model="reportConfig.format">
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
                <option value="html">HTML Report</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label class="form-label">From Date</label>
              <input type="date" class="form-control" v-model="reportConfig.fromDate">
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label class="form-label">To Date</label>
              <input type="date" class="form-control" v-model="reportConfig.toDate">
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label class="form-label">Department</label>
              <select class="form-select" v-model="reportConfig.department">
                <option value="">All Departments</option>
                <option value="IT">Information Technology</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Employee Filter</label>
              <input
                type="text"
                class="form-control"
                placeholder="Search employee name or ID..."
                v-model="reportConfig.employeeFilter"
              >
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Group By</label>
              <select class="form-select" v-model="reportConfig.groupBy">
                <option value="employee">Employee</option>
                <option value="department">Department</option>
                <option value="date">Date</option>
                <option value="none">No Grouping</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Report Options -->
        <div class="mt-4">
          <h6 class="mb-3">Report Options</h6>
          <div class="row">
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeSummary" id="includeSummary">
                <label class="form-check-label" for="includeSummary">
                  Include Summary
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeCharts" id="includeCharts">
                <label class="form-check-label" for="includeCharts">
                  Include Charts
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeDetails" id="includeDetails">
                <label class="form-check-label" for="includeDetails">
                  Include Details
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeBreakdown" id="includeBreakdown">
                <label class="form-check-label" for="includeBreakdown">
                  Include Breakdown
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="card mb-4" v-if="previewData">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Report Preview</h5>
          <span class="badge bg-info">{{ previewData.totalRecords }} records</span>
        </div>

        <!-- Summary Cards -->
        <div class="row mb-4" v-if="reportConfig.includeSummary">
          <div class="col-md-2">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.totalDays }}</h5>
                <p class="mb-0">Total Days</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.present }}</h5>
                <p class="mb-0">Present</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.late }}</h5>
                <p class="mb-0">Late</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card bg-danger text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.absent }}</h5>
                <p class="mb-0">Absent</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.leave }}</h5>
                <p class="mb-0">On Leave</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card bg-secondary text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.attendanceRate }}%</h5>
                <p class="mb-0">Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sample Data Table -->
        <div class="table-responsive" v-if="reportConfig.includeDetails">
          <table class="table table-hover">
            <thead>
              <tr>
                <th v-if="reportConfig.groupBy === 'department'">Department</th>
                <th v-if="reportConfig.groupBy === 'employee' || reportConfig.groupBy === 'none'">Employee</th>
                <th v-if="reportConfig.groupBy === 'date'">Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Break Time</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in previewData.sampleData" :key="record.id">
                <td v-if="reportConfig.groupBy === 'department'">{{ record.department }}</td>
                <td v-if="reportConfig.groupBy === 'employee' || reportConfig.groupBy === 'none'">
                  {{ record.employeeName }}
                </td>
                <td v-if="reportConfig.groupBy === 'date'">{{ formatDate(record.date) }}</td>
                <td>{{ record.clockIn || '--:--' }}</td>
                <td>{{ record.clockOut || '--:--' }}</td>
                <td>{{ record.breakTime || '0h 0m' }}</td>
                <td>{{ record.totalHours || '0h 0m' }}</td>
                <td>
                  <span :class="getStatusBadgeClass(record.status)" class="badge">
                    {{ record.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Schedule Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Schedule Report</h5>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="scheduleReport"
              id="scheduleSwitch"
            >
            <label class="form-check-label" for="scheduleSwitch">
              Enable Scheduling
            </label>
          </div>
        </div>

        <div class="row" v-if="scheduleReport">
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label class="form-label">Frequency</label>
              <select class="form-select" v-model="scheduleConfig.frequency">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label class="form-label">Time</label>
              <input type="time" class="form-control" v-model="scheduleConfig.time">
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label class="form-label">Recipients</label>
              <input
                type="email"
                class="form-control"
                placeholder="email@example.com"
                v-model="scheduleConfig.recipients"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Recent Attendance Reports</h5>
        <div class="list-group list-group-flush">
          <div v-for="report in recentReports" :key="report.id" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">{{ report.title }}</h6>
                <p class="mb-0 text-muted">{{ report.description }}</p>
                <small class="text-muted">
                  <i class="bi bi-person me-1"></i>{{ report.createdBy }} •
                  <i class="bi bi-calendar me-1"></i>{{ formatDate(report.createdAt) }}
                </small>
              </div>
              <div class="text-end">
                <span :class="getStatusBadgeClass(report.status)" class="badge mb-2">
                  {{ report.status }}
                </span>
                <div>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="downloadReport(report)"
                  >
                    <i class="bi bi-download"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteReport(report)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
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
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'ReportAttendanceView',
  setup() {
    // Data
    const reportConfig = ref({
      type: 'summary',
      format: 'pdf',
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      department: '',
      employeeFilter: '',
      groupBy: 'employee',
      includeSummary: true,
      includeCharts: false,
      includeDetails: true,
      includeBreakdown: false
    })

    const scheduleReport = ref(false)
    const scheduleConfig = ref({
      frequency: 'monthly',
      time: '09:00',
      recipients: ''
    })

    const previewData = ref(null)
    const recentReports = ref([])

    // Computed
    const isFormValid = computed(() => {
      return reportConfig.value.fromDate && reportConfig.value.toDate &&
             new Date(reportConfig.value.fromDate) <= new Date(reportConfig.value.toDate)
    })

    // Methods
    const loadRecentReports = async () => {
      try {
        recentReports.value = [
          {
            id: 1,
            title: 'Monthly Attendance Report - January 2024',
            description: 'Complete attendance summary for January 2024',
            createdBy: 'HR Manager',
            createdAt: '2024-01-19T10:30:00Z',
            status: 'Completed'
          },
          {
            id: 2,
            title: 'Weekly Attendance Summary',
            description: 'Attendance summary for week of Jan 15-19',
            createdBy: 'System Admin',
            createdAt: '2024-01-18T14:15:00Z',
            status: 'Completed'
          }
        ]
      } catch (error) {
        console.error('Error loading recent reports:', error)
      }
    }

    const generatePreview = async () => {
      if (!isFormValid.value) {
        previewData.value = null
        return
      }

      try {
        // Simulate API call to generate preview
        await new Promise(resolve => setTimeout(resolve, 500))

        previewData.value = {
          totalRecords: 247,
          summary: {
            totalDays: 22,
            present: 215,
            late: 18,
            absent: 12,
            leave: 8,
            attendanceRate: 87.2
          },
          sampleData: [
            {
              id: 1,
              employeeName: 'John Doe',
              department: 'IT',
              date: '2024-01-19',
              clockIn: '08:30',
              clockOut: '17:45',
              breakTime: '1h 0m',
              totalHours: '8h 15m',
              status: 'Present'
            },
            {
              id: 2,
              employeeName: 'Jane Smith',
              department: 'HR',
              date: '2024-01-19',
              clockIn: '09:15',
              clockOut: '17:30',
              breakTime: '0h 45m',
              totalHours: '7h 30m',
              status: 'Late'
            }
          ]
        }
      } catch (error) {
        console.error('Error generating preview:', error)
      }
    }

    const generateReport = async () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields correctly.')
        return
      }

      try {
        console.log('Generating report with config:', reportConfig.value)

        // Add to recent reports
        const newReport = {
          id: Date.now(),
          title: `${reportConfig.value.type.charAt(0).toUpperCase() + reportConfig.value.type.slice(1)} Report`,
          description: `${formatDate(reportConfig.value.fromDate)} to ${formatDate(reportConfig.value.toDate)}`,
          createdBy: 'Current User',
          createdAt: new Date().toISOString(),
          status: 'Processing'
        }

        recentReports.value.unshift(newReport)

        alert('Report generation started! You will be notified when it\'s ready.')
      } catch (error) {
        console.error('Error generating report:', error)
        alert('Failed to generate report. Please try again.')
      }
    }

    const downloadReport = (report) => {
      console.log('Downloading report:', report)
    }

    const deleteReport = (report) => {
      if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
        const index = recentReports.value.findIndex(r => r.id === report.id)
        if (index > -1) {
          recentReports.value.splice(index, 1)
        }
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusBadgeClass = (status) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-success'
        case 'processing':
          return 'bg-warning'
        case 'failed':
          return 'bg-danger'
        case 'pending':
          return 'bg-info'
        default:
          return 'bg-secondary'
      }
    }

    // Watchers
    watch([() => reportConfig.value.fromDate, () => reportConfig.value.toDate, () => reportConfig.value.department, () => reportConfig.value.employeeFilter], () => {
      generatePreview()
    })

    // Lifecycle
    onMounted(() => {
      loadRecentReports()
      generatePreview()
    })

    return {
      reportConfig,
      scheduleReport,
      scheduleConfig,
      previewData,
      recentReports,
      isFormValid,
      generateReport,
      downloadReport,
      deleteReport,
      formatDate,
      getStatusBadgeClass
    }
  }
}
</script>

<style scoped>
.report-attendance {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.table {
  margin-bottom: 0;
}

.list-group-item {
  border: none;
  padding: 1rem 0;
}

.badge {
  font-size: 0.75rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>