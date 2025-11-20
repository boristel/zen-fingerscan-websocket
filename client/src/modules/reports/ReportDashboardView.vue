<template>
  <div class="report-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Reports Dashboard</h2>
        <p class="text-muted mb-0">Generate and view attendance reports</p>
      </div>
      <div>
        <button class="btn btn-primary me-2" @click="createReport">
          <i class="bi bi-plus-circle me-2"></i>Create Report
        </button>
        <button class="btn btn-success" @click="exportAllReports">
          <i class="bi bi-download me-2"></i>Export All
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ reportStats.total }}</h4>
                <p class="mb-0">Total Reports</p>
              </div>
              <i class="bi bi-file-earmark-text fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ reportStats.thisMonth }}</h4>
                <p class="mb-0">This Month</p>
              </div>
              <i class="bi bi-calendar-month fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ reportStats.scheduled }}</h4>
                <p class="mb-0">Scheduled</p>
              </div>
              <i class="bi bi-clock-history fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ reportStats.pending }}</h4>
                <p class="mb-0">Pending Review</p>
              </div>
              <i class="bi bi-hourglass-split fs-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Types -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Quick Report Generation</h5>
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="report-type-card" @click="generateAttendanceReport">
                  <div class="report-icon bg-primary">
                    <i class="bi bi-calendar-check"></i>
                  </div>
                  <div class="report-content">
                    <h6>Attendance Report</h6>
                    <p class="text-muted small mb-0">Employee attendance summary</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="report-type-card" @click="generateEmployeeReport">
                  <div class="report-icon bg-success">
                    <i class="bi bi-people"></i>
                  </div>
                  <div class="report-content">
                    <h6>Employee Report</h6>
                    <p class="text-muted small mb-0">Individual employee details</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="report-type-card" @click="generateDepartmentReport">
                  <div class="report-icon bg-info">
                    <i class="bi bi-building"></i>
                  </div>
                  <div class="report-content">
                    <h6>Department Report</h6>
                    <p class="text-muted small mb-0">Department-wise analytics</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="report-type-card" @click="generatePayrollReport">
                  <div class="report-icon bg-warning">
                    <i class="bi bi-currency-dollar"></i>
                  </div>
                  <div class="report-content">
                    <h6>Payroll Report</h6>
                    <p class="text-muted small mb-0">Salary and compensation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Recent Reports</h5>
              <button class="btn btn-sm btn-outline-primary" @click="viewAllReports">
                View All <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
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
                        @click="viewReport(report)"
                        title="View Report"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-success me-1"
                        @click="downloadReport(report)"
                        title="Download"
                      >
                        <i class="bi bi-download"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteReport(report)"
                        title="Delete"
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
      <div class="col-md-4">
        <!-- Scheduled Reports -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title mb-3">Scheduled Reports</h5>
            <div v-for="schedule in scheduledReports" :key="schedule.id" class="mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ schedule.title }}</h6>
                  <small class="text-muted">{{ schedule.frequency }} • {{ schedule.nextRun }}</small>
                </div>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :checked="schedule.active"
                    @change="toggleSchedule(schedule)"
                  >
                </div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-primary w-100" @click="addSchedule">
              <i class="bi bi-plus-circle me-2"></i>Add Schedule
            </button>
          </div>
        </div>

        <!-- Report Templates -->
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Report Templates</h5>
            <div class="list-group list-group-flush">
              <div v-for="template in reportTemplates" :key="template.id" class="list-group-item px-0">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ template.name }}</h6>
                    <small class="text-muted">{{ template.description }}</small>
                  </div>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="useTemplate(template)"
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Report Modal -->
    <div class="modal fade" id="createReportModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Report</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Report Type</label>
                  <select class="form-select" v-model="newReport.type">
                    <option value="">Select Report Type</option>
                    <option value="attendance">Attendance Report</option>
                    <option value="employee">Employee Report</option>
                    <option value="department">Department Report</option>
                    <option value="payroll">Payroll Report</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Format</label>
                  <select class="form-select" v-model="newReport.format">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">From Date</label>
                  <input type="date" class="form-control" v-model="newReport.fromDate">
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">To Date</label>
                  <input type="date" class="form-control" v-model="newReport.toDate">
                </div>
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Report Title</label>
              <input type="text" class="form-control" v-model="newReport.title" placeholder="Enter report title">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" v-model="newReport.description" rows="3" placeholder="Enter report description"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="generateReport">
              <i class="bi bi-file-earmark-text me-2"></i>Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ReportDashboardView',
  setup() {
    // Data
    const reportStats = ref({
      total: 0,
      thisMonth: 0,
      scheduled: 0,
      pending: 0
    })
    const recentReports = ref([])
    const scheduledReports = ref([])
    const reportTemplates = ref([])

    const newReport = ref({
      type: '',
      format: 'pdf',
      fromDate: '',
      toDate: '',
      title: '',
      description: ''
    })

    // Methods
    const loadDashboardData = async () => {
      try {
        // Load stats
        reportStats.value = {
          total: 156,
          thisMonth: 23,
          scheduled: 8,
          pending: 4
        }

        // Load recent reports
        recentReports.value = [
          {
            id: 1,
            title: 'Monthly Attendance Report - January 2024',
            description: 'Complete attendance summary for all departments',
            createdBy: 'Admin User',
            createdAt: '2024-01-19T10:30:00Z',
            status: 'Completed'
          },
          {
            id: 2,
            title: 'Employee Performance Report',
            description: 'Individual performance metrics for Q1 2024',
            createdBy: 'HR Manager',
            createdAt: '2024-01-18T14:15:00Z',
            status: 'Processing'
          },
          {
            id: 3,
            title: 'Department Wise Analytics',
            description: 'Analytics breakdown by department',
            createdBy: 'System Admin',
            createdAt: '2024-01-17T09:45:00Z',
            status: 'Completed'
          }
        ]

        // Load scheduled reports
        scheduledReports.value = [
          {
            id: 1,
            title: 'Weekly Attendance Summary',
            frequency: 'Weekly',
            nextRun: '2024-01-22',
            active: true
          },
          {
            id: 2,
            title: 'Monthly Payroll Report',
            frequency: 'Monthly',
            nextRun: '2024-02-01',
            active: true
          },
          {
            id: 3,
            title: 'Quarterly Performance Review',
            frequency: 'Quarterly',
            nextRun: '2024-03-31',
            active: false
          }
        ]

        // Load report templates
        reportTemplates.value = [
          {
            id: 1,
            name: 'Standard Attendance',
            description: 'Basic attendance report template'
          },
          {
            id: 2,
            name: 'Performance Review',
            description: 'Employee performance evaluation'
          },
          {
            id: 3,
            name: 'Payroll Summary',
            description: 'Monthly payroll breakdown'
          }
        ]
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const createReport = () => {
      // Show create report modal
      console.log('Opening create report modal')
    }

    const generateReport = () => {
      console.log('Generating report:', newReport.value)
      // Close modal and reset form
    }

    const generateAttendanceReport = () => {
      $router.push('/reports/attendance')
    }

    const generateEmployeeReport = () => {
      $router.push('/reports/employee')
    }

    const generateDepartmentReport = () => {
      console.log('Generating department report...')
    }

    const generatePayrollReport = () => {
      console.log('Generating payroll report...')
    }

    const viewAllReports = () => {
      console.log('Viewing all reports...')
    }

    const viewReport = (report) => {
      console.log('Viewing report:', report)
    }

    const downloadReport = (report) => {
      console.log('Downloading report:', report)
    }

    const deleteReport = (report) => {
      if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
        console.log('Deleting report:', report)
      }
    }

    const exportAllReports = () => {
      console.log('Exporting all reports...')
    }

    const toggleSchedule = (schedule) => {
      schedule.active = !schedule.active
      console.log('Toggling schedule:', schedule.id, schedule.active)
    }

    const addSchedule = () => {
      console.log('Adding new schedule...')
    }

    const useTemplate = (template) => {
      newReport.value.title = template.name
      newReport.value.description = template.description
      createReport()
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

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadDashboardData()
    })

    return {
      reportStats,
      recentReports,
      scheduledReports,
      reportTemplates,
      newReport,
      createReport,
      generateReport,
      generateAttendanceReport,
      generateEmployeeReport,
      generateDepartmentReport,
      generatePayrollReport,
      viewAllReports,
      viewReport,
      downloadReport,
      deleteReport,
      exportAllReports,
      toggleSchedule,
      addSchedule,
      useTemplate,
      getStatusBadgeClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.report-dashboard {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.report-type-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
}

.report-type-card:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  margin-right: 1rem;
}

.report-content h6 {
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.list-group-item {
  border: none;
  padding: 1rem 0;
}

.btn {
  border-radius: 0.375rem;
}

.badge {
  font-size: 0.75rem;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}
</style>