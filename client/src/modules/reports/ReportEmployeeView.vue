<template>
  <div class="report-employee">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Employee Reports</h2>
        <p class="text-muted mb-0">Generate detailed employee reports</p>
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
                <option value="individual">Individual Employee</option>
                <option value="department">Department Wise</option>
                <option value="all">All Employees</option>
                <option value="new">New Joinees</option>
                <option value="resigned">Resigned Employees</option>
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
              </select>
            </div>
          </div>
        </div>

        <!-- Employee Selection -->
        <div class="row" v-if="reportConfig.type === 'individual'">
          <div class="col-md-12">
            <div class="form-group mb-3">
              <label class="form-label">Select Employee</label>
              <div class="row">
                <div class="col-md-6">
                  <select class="form-select" v-model="reportConfig.selectedEmployee" @change="loadEmployeeDetails">
                    <option value="">Select an employee</option>
                    <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                      {{ employee.name }} ({{ employee.employeeId }})
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Or search employee..."
                    v-model="employeeSearch"
                    @input="searchEmployees"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Selection -->
        <div class="row" v-if="reportConfig.type === 'department'">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Department</label>
              <select class="form-select" v-model="reportConfig.department">
                <option value="">Select Department</option>
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
              <label class="form-label">Report Template</label>
              <select class="form-select" v-model="reportConfig.template">
                <option value="standard">Standard Template</option>
                <option value="detailed">Detailed Template</option>
                <option value="summary">Summary Template</option>
                <option value="performance">Performance Template</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Report Sections -->
        <div class="mt-4">
          <h6 class="mb-3">Include Sections</h6>
          <div class="row">
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includePersonal" id="includePersonal">
                <label class="form-check-label" for="includePersonal">
                  Personal Information
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeAttendance" id="includeAttendance">
                <label class="form-check-label" for="includeAttendance">
                  Attendance Records
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includePerformance" id="includePerformance">
                <label class="form-check-label" for="includePerformance">
                  Performance Metrics
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeBiometrics" id="includeBiometrics">
                <label class="form-check-label" for="includeBiometrics">
                  Biometric Status
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeLeaves" id="includeLeaves">
                <label class="form-check-label" for="includeLeaves">
                  Leave History
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeSalary" id="includeSalary">
                <label class="form-check-label" for="includeSalary">
                  Salary Information
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeDocuments" id="includeDocuments">
                <label class="form-check-label" for="includeDocuments">
                  Documents
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="reportConfig.includeCharts" id="includeCharts">
                <label class="form-check-label" for="includeCharts">
                  Charts & Graphs
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Preview -->
    <div class="card mb-4" v-if="selectedEmployeeData && reportConfig.type === 'individual'">
      <div class="card-body">
        <h5 class="card-title mb-3">Employee Preview</h5>
        <div class="row">
          <div class="col-md-3">
            <div class="text-center">
              <div class="avatar-xl bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                {{ getInitials(selectedEmployeeData.name) }}
              </div>
              <h6>{{ selectedEmployeeData.name }}</h6>
              <p class="text-muted mb-0">{{ selectedEmployeeData.employeeId }}</p>
            </div>
          </div>
          <div class="col-md-9">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Department:</strong> {{ selectedEmployeeData.department }}</p>
                <p><strong>Position:</strong> {{ selectedEmployeeData.position }}</p>
                <p><strong>Email:</strong> {{ selectedEmployeeData.email }}</p>
                <p><strong>Phone:</strong> {{ selectedEmployeeData.phone }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Join Date:</strong> {{ formatDate(selectedEmployeeData.joinDate) }}</p>
                <p><strong>Status:</strong>
                  <span :class="getStatusBadgeClass(selectedEmployeeData.status)" class="badge ms-2">
                    {{ selectedEmployeeData.status }}
                  </span>
                </p>
                <p><strong>Biometric Status:</strong>
                  <span :class="selectedEmployeeData.biometricRegistered ? 'bg-success' : 'bg-danger'" class="badge ms-2">
                    {{ selectedEmployeeData.biometricRegistered ? 'Registered' : 'Not Registered' }}
                  </span>
                </p>
                <p><strong>Total Attendance:</strong> {{ selectedEmployeeData.totalAttendance || 0 }} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sample Report Preview -->
    <div class="card mb-4" v-if="previewData">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Report Preview</h5>
          <span class="badge bg-info">{{ previewData.totalRecords }} records</span>
        </div>

        <!-- Summary Statistics -->
        <div class="row mb-4" v-if="reportConfig.includeAttendance">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.totalDays }}</h5>
                <p class="mb-0">Total Days</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.present }}</h5>
                <p class="mb-0">Present</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.late }}</h5>
                <p class="mb-0">Late</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-danger text-white">
              <div class="card-body text-center">
                <h5 class="mb-0">{{ previewData.summary.absent }}</h5>
                <p class="mb-0">Absent</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sample Data Table -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th v-if="reportConfig.type !== 'individual'">Employee</th>
                <th v-if="reportConfig.includePersonal">ID</th>
                <th v-if="reportConfig.includeAttendance">Date</th>
                <th v-if="reportConfig.includeAttendance">Clock In</th>
                <th v-if="reportConfig.includeAttendance">Clock Out</th>
                <th v-if="reportConfig.includePerformance">Performance</th>
                <th v-if="reportConfig.includeBiometrics">Biometric</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in previewData.sampleData" :key="record.id">
                <td v-if="reportConfig.type !== 'individual'">{{ record.employeeName }}</td>
                <td v-if="reportConfig.includePersonal">{{ record.employeeId }}</td>
                <td v-if="reportConfig.includeAttendance">{{ formatDate(record.date) }}</td>
                <td v-if="reportConfig.includeAttendance">{{ record.clockIn || '--:--' }}</td>
                <td v-if="reportConfig.includeAttendance">{{ record.clockOut || '--:--' }}</td>
                <td v-if="reportConfig.includePerformance">
                  <span :class="getPerformanceBadgeClass(record.performance)" class="badge">
                    {{ record.performance }}
                  </span>
                </td>
                <td v-if="reportConfig.includeBiometrics">
                  <i :class="record.biometric ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                </td>
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

    <!-- Recent Reports -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Recent Employee Reports</h5>
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
                  <button class="btn btn-sm btn-outline-primary me-1" @click="downloadReport(report)">
                    <i class="bi bi-download"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteReport(report)">
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
  name: 'ReportEmployeeView',
  setup() {
    // Data
    const reportConfig = ref({
      type: 'individual',
      format: 'pdf',
      selectedEmployee: '',
      department: '',
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      template: 'standard',
      includePersonal: true,
      includeAttendance: true,
      includePerformance: false,
      includeBiometrics: false,
      includeLeaves: false,
      includeSalary: false,
      includeDocuments: false,
      includeCharts: false
    })

    const employees = ref([])
    const employeeSearch = ref('')
    const selectedEmployeeData = ref(null)
    const previewData = ref(null)
    const recentReports = ref([])

    // Computed
    const isFormValid = computed(() => {
      const baseValid = reportConfig.value.fromDate && reportConfig.value.toDate &&
                      new Date(reportConfig.value.fromDate) <= new Date(reportConfig.value.toDate)

      if (reportConfig.value.type === 'individual') {
        return baseValid && reportConfig.value.selectedEmployee
      } else if (reportConfig.value.type === 'department') {
        return baseValid && reportConfig.value.department
      }

      return baseValid
    })

    // Methods
    const loadEmployees = async () => {
      try {
        // Sample data - replace with actual API call
        employees.value = [
          { id: 1, name: 'John Doe', employeeId: 'EMP001', department: 'IT' },
          { id: 2, name: 'Jane Smith', employeeId: 'EMP002', department: 'HR' },
          { id: 3, name: 'Bob Johnson', employeeId: 'EMP003', department: 'Finance' },
          { id: 4, name: 'Alice Brown', employeeId: 'EMP004', department: 'Operations' },
          { id: 5, name: 'Charlie Wilson', employeeId: 'EMP005', department: 'Sales' }
        ]
      } catch (error) {
        console.error('Error loading employees:', error)
      }
    }

    const loadEmployeeDetails = async () => {
      if (!reportConfig.value.selectedEmployee) {
        selectedEmployeeData.value = null
        return
      }

      try {
        const employee = employees.value.find(emp => emp.id === parseInt(reportConfig.value.selectedEmployee))
        if (employee) {
          selectedEmployeeData.value = {
            ...employee,
            position: 'Senior Developer',
            email: `${employee.name.toLowerCase().replace(' ', '.')}@company.com`,
            phone: '+1 234 567 8900',
            joinDate: '2022-01-15',
            status: 'Active',
            biometricRegistered: Math.random() > 0.3,
            totalAttendance: Math.floor(Math.random() * 200) + 100
          }
        }
      } catch (error) {
        console.error('Error loading employee details:', error)
      }
    }

    const searchEmployees = () => {
      if (!employeeSearch.value) return

      console.log('Searching employees:', employeeSearch.value)
    }

    const generatePreview = async () => {
      if (!isFormValid.value) {
        previewData.value = null
        return
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        previewData.value = {
          totalRecords: 45,
          summary: {
            totalDays: 22,
            present: 20,
            late: 2,
            absent: 0
          },
          sampleData: [
            {
              id: 1,
              employeeName: 'John Doe',
              employeeId: 'EMP001',
              date: '2024-01-19',
              clockIn: '08:30',
              clockOut: '17:45',
              performance: 'Excellent',
              biometric: true,
              status: 'Present'
            },
            {
              id: 2,
              employeeName: 'Jane Smith',
              employeeId: 'EMP002',
              date: '2024-01-18',
              clockIn: '09:15',
              clockOut: '17:30',
              performance: 'Good',
              biometric: true,
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
        console.log('Generating employee report with config:', reportConfig.value)

        const newReport = {
          id: Date.now(),
          title: `Employee Report - ${selectedEmployeeData.value?.name || 'Multiple Employees'}`,
          description: `${reportConfig.value.type.charAt(0).toUpperCase() + reportConfig.value.type.slice(1)} report`,
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

    const loadRecentReports = async () => {
      try {
        recentReports.value = [
          {
            id: 1,
            title: 'John Doe - Performance Report',
            description: 'Annual performance evaluation for 2024',
            createdBy: 'HR Manager',
            createdAt: '2024-01-18T14:30:00Z',
            status: 'Completed'
          },
          {
            id: 2,
            title: 'IT Department - Employee Summary',
            description: 'Complete employee summary for IT department',
            createdBy: 'Department Head',
            createdAt: '2024-01-17T10:15:00Z',
            status: 'Completed'
          }
        ]
      } catch (error) {
        console.error('Error loading recent reports:', error)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getStatusBadgeClass = (status) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-success'
        case 'processing':
          return 'bg-warning'
        case 'failed':
          return 'bg-danger'
        case 'active':
          return 'bg-success'
        case 'inactive':
          return 'bg-secondary'
        default:
          return 'bg-secondary'
      }
    }

    const getPerformanceBadgeClass = (performance) => {
      switch (performance.toLowerCase()) {
        case 'excellent':
          return 'bg-success'
        case 'good':
          return 'bg-info'
        case 'average':
          return 'bg-warning'
        case 'poor':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }

    // Watchers
    watch([() => reportConfig.value.fromDate, () => reportConfig.value.toDate, () => reportConfig.value.type, () => reportConfig.value.selectedEmployee], () => {
      generatePreview()
    })

    // Lifecycle
    onMounted(() => {
      loadEmployees()
      loadRecentReports()
    })

    return {
      reportConfig,
      employees,
      employeeSearch,
      selectedEmployeeData,
      previewData,
      recentReports,
      isFormValid,
      loadEmployeeDetails,
      searchEmployees,
      generateReport,
      downloadReport,
      deleteReport,
      formatDate,
      getInitials,
      getStatusBadgeClass,
      getPerformanceBadgeClass
    }
  }
}
</script>

<style scoped>
.report-employee {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.avatar-xl {
  width: 80px;
  height: 80px;
  font-size: 28px;
  font-weight: 600;
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