<template>
  <div class="attendance-history">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Attendance History</h2>
        <p class="text-muted mb-0">View and filter attendance records</p>
      </div>
      <div>
        <button class="btn btn-success me-2" @click="exportData">
          <i class="bi bi-download me-2"></i>Export
        </button>
        <button class="btn btn-primary" @click="printRecords">
          <i class="bi bi-printer me-2"></i>Print
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Date Range</label>
              <select class="form-select" v-model="dateRange" @change="updateDateRange">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <div class="col-md-3" v-if="dateRange === 'custom'">
            <div class="form-group">
              <label class="form-label">From Date</label>
              <input type="date" class="form-control" v-model="customDateFrom" @change="filterRecords">
            </div>
          </div>
          <div class="col-md-3" v-if="dateRange === 'custom'">
            <div class="form-group">
              <label class="form-label">To Date</label>
              <input type="date" class="form-control" v-model="customDateTo" @change="filterRecords">
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" v-model="selectedStatus" @change="filterRecords">
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="early">Early Out</option>
                <option value="holiday">Holiday</option>
                <option value="leave">Leave</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Department</label>
              <select class="form-select" v-model="selectedDepartment" @change="filterRecords">
                <option value="">All Departments</option>
                <option value="IT">Information Technology</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Search Employee</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Name or ID..."
                  v-model="searchQuery"
                  @input="filterRecords"
                >
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="row mb-4">
      <div class="col-md-2">
        <div class="card bg-primary text-white">
          <div class="card-body text-center">
            <h4 class="mb-0">{{ summaryStats.total }}</h4>
            <p class="mb-0">Total Records</p>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-success text-white">
          <div class="card-body text-center">
            <h4 class="mb-0">{{ summaryStats.present }}</h4>
            <p class="mb-0">Present</p>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-warning text-white">
          <div class="card-body text-center">
            <h4 class="mb-0">{{ summaryStats.late }}</h4>
            <p class="mb-0">Late</p>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-danger text-white">
          <div class="card-body text-center">
            <h4 class="mb-0">{{ summaryStats.absent }}</h4>
            <p class="mb-0">Absent</p>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-info text-white">
          <div class="card-body text-center">
            <h4 class="mb-0">{{ summaryStats.leave }}</h4>
            <p class="mb-0">On Leave</p>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-secondary text-white">
          <div class="card-body text-center">
            <h4 class="mb-0">{{ summaryStats.holiday }}</h4>
            <p class="mb-0">Holiday</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Records Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th @click="sortBy('date')" style="cursor: pointer;">
                  Date
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('employeeName')" style="cursor: pointer;">
                  Employee
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('department')" style="cursor: pointer;">
                  Department
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Break Time</th>
                <th @click="sortBy('totalHours')" style="cursor: pointer;">
                  Total Hours
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('status')" style="cursor: pointer;">
                  Status
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in paginatedRecords" :key="record.id">
                <td>{{ formatDate(record.date) }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                      {{ getInitials(record.employeeName) }}
                    </div>
                    <div>
                      <div class="fw-medium">{{ record.employeeName }}</div>
                      <small class="text-muted">{{ record.employeeId }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ record.department }}</td>
                <td>{{ record.clockIn || '--:--' }}</td>
                <td>{{ record.clockOut || '--:--' }}</td>
                <td>{{ record.breakTime || '0h 0m' }}</td>
                <td>{{ record.totalHours || '0h 0m' }}</td>
                <td>
                  <span :class="getStatusBadgeClass(record.status)" class="badge">
                    {{ record.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewDetails(record)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-warning"
                      @click="editRecord(record)"
                      title="Edit"
                      v-if="canEdit(record)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteRecord(record)"
                      title="Delete"
                      v-if="canDelete(record)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="currentPage = 1">First</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="currentPage = totalPages">Last</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Details Modal -->
    <div class="modal fade" id="detailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Attendance Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedRecord">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Date:</strong> {{ formatDate(selectedRecord.date) }}
              </div>
              <div class="col-md-6">
                <strong>Status:</strong>
                <span :class="getStatusBadgeClass(selectedRecord.status)" class="badge ms-2">
                  {{ selectedRecord.status }}
                </span>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Employee:</strong> {{ selectedRecord.employeeName }}
              </div>
              <div class="col-md-6">
                <strong>Employee ID:</strong> {{ selectedRecord.employeeId }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Department:</strong> {{ selectedRecord.department }}
              </div>
              <div class="col-md-6">
                <strong>Shift:</strong> {{ selectedRecord.shift || 'Regular' }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-3">
                <strong>Clock In:</strong> {{ selectedRecord.clockIn || '--:--' }}
              </div>
              <div class="col-md-3">
                <strong>Clock Out:</strong> {{ selectedRecord.clockOut || '--:--' }}
              </div>
              <div class="col-md-3">
                <strong>Break Time:</strong> {{ selectedRecord.breakTime || '0h 0m' }}
              </div>
              <div class="col-md-3">
                <strong>Total Hours:</strong> {{ selectedRecord.totalHours || '0h 0m' }}
              </div>
            </div>
            <div class="row mb-3" v-if="selectedRecord.notes">
              <div class="col-12">
                <strong>Notes:</strong> {{ selectedRecord.notes }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button
              type="button"
              class="btn btn-warning"
              @click="editRecord(selectedRecord)"
              v-if="canEdit(selectedRecord)"
            >
              <i class="bi bi-pencil me-2"></i>Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'AttendanceHistoryView',
  setup() {
    // Data
    const dateRange = ref('month')
    const customDateFrom = ref('')
    const customDateTo = ref('')
    const selectedStatus = ref('')
    const selectedDepartment = ref('')
    const searchQuery = ref('')
    const sortField = ref('date')
    const sortDirection = ref('desc')
    const currentPage = ref(1)
    const perPage = ref(25)

    const records = ref([])
    const selectedRecord = ref(null)
    const summaryStats = ref({
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      holiday: 0
    })

    // Computed
    const filteredRecords = computed(() => {
      let filtered = records.value

      // Apply date filter
      const today = new Date()
      let filterDateFrom, filterDateTo

      switch (dateRange.value) {
        case 'today':
          filterDateFrom = filterDateTo = today
          break
        case 'week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
          const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
          filterDateFrom = weekStart
          filterDateTo = weekEnd
          break
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          filterDateFrom = monthStart
          filterDateTo = monthEnd
          break
        case 'custom':
          filterDateFrom = customDateFrom.value ? new Date(customDateFrom.value) : null
          filterDateTo = customDateTo.value ? new Date(customDateTo.value) : null
          break
        default:
          filterDateFrom = new Date(today.getFullYear(), 0, 1)
          filterDateTo = today
      }

      if (filterDateFrom && filterDateTo) {
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= filterDateFrom && recordDate <= filterDateTo
        })
      }

      // Apply other filters
      if (selectedStatus.value) {
        filtered = filtered.filter(record => record.status === selectedStatus.value)
      }

      if (selectedDepartment.value) {
        filtered = filtered.filter(record => record.department === selectedDepartment.value)
      }

      if (searchQuery.value) {
        filtered = filtered.filter(record =>
          record.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          record.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aVal = a[sortField.value]
        let bVal = b[sortField.value]

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        if (sortDirection.value === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredRecords.value.length / perPage.value)
    })

    const visiblePages = computed(() => {
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    const paginatedRecords = computed(() => {
      const start = (currentPage.value - 1) * perPage.value
      const end = start + perPage.value
      return filteredRecords.value.slice(start, end)
    })

    // Methods
    const loadRecords = async () => {
      try {
        // Sample data - replace with actual API call
        records.value = [
          {
            id: 1,
            date: '2024-01-19',
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            department: 'IT',
            clockIn: '08:30',
            clockOut: '17:45',
            breakTime: '1h 0m',
            totalHours: '8h 15m',
            status: 'Present',
            shift: 'Regular'
          },
          {
            id: 2,
            date: '2024-01-19',
            employeeId: 'EMP002',
            employeeName: 'Jane Smith',
            department: 'HR',
            clockIn: '09:15',
            clockOut: '17:30',
            breakTime: '0h 45m',
            totalHours: '7h 30m',
            status: 'Late',
            shift: 'Regular'
          },
          {
            id: 3,
            date: '2024-01-19',
            employeeId: 'EMP003',
            employeeName: 'Bob Johnson',
            department: 'Finance',
            clockIn: null,
            clockOut: null,
            breakTime: '0h 0m',
            totalHours: '0h 0m',
            status: 'Absent',
            shift: 'Regular'
          }
        ]

        updateSummaryStats()
      } catch (error) {
        console.error('Error loading records:', error)
      }
    }

    const updateSummaryStats = () => {
      const stats = {
        total: records.value.length,
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        holiday: 0
      }

      records.value.forEach(record => {
        switch (record.status.toLowerCase()) {
          case 'present':
            stats.present++
            break
          case 'late':
            stats.late++
            break
          case 'absent':
            stats.absent++
            break
          case 'leave':
            stats.leave++
            break
          case 'holiday':
            stats.holiday++
            break
        }
      })

      summaryStats.value = stats
    }

    const updateDateRange = () => {
      if (dateRange.value !== 'custom') {
        customDateFrom.value = ''
        customDateTo.value = ''
      }
      filterRecords()
    }

    const filterRecords = () => {
      currentPage.value = 1
    }

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    const viewDetails = (record) => {
      selectedRecord.value = record
      // Show modal
    }

    const editRecord = (record) => {
      console.log('Editing record:', record)
    }

    const deleteRecord = (record) => {
      if (confirm(`Are you sure you want to delete this record for ${record.employeeName}?`)) {
        console.log('Deleting record:', record)
      }
    }

    const canEdit = (record) => {
      const recordDate = new Date(record.date)
      const today = new Date()
      const diffTime = Math.abs(today - recordDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 // Allow editing for 7 days
    }

    const canDelete = (record) => {
      return canEdit(record) // Same edit permissions
    }

    const exportData = () => {
      console.log('Exporting attendance data...')
    }

    const printRecords = () => {
      window.print()
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
        case 'present':
          return 'bg-success'
        case 'late':
          return 'bg-warning'
        case 'absent':
          return 'bg-danger'
        case 'early':
        case 'early out':
          return 'bg-info'
        case 'leave':
          return 'bg-primary'
        case 'holiday':
          return 'bg-secondary'
        default:
          return 'bg-secondary'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadRecords()
    })

    return {
      dateRange,
      customDateFrom,
      customDateTo,
      selectedStatus,
      selectedDepartment,
      searchQuery,
      currentPage,
      perPage,
      records,
      selectedRecord,
      summaryStats,
      filteredRecords,
      totalPages,
      visiblePages,
      paginatedRecords,
      updateDateRange,
      filterRecords,
      sortBy,
      viewDetails,
      editRecord,
      deleteRecord,
      canEdit,
      canDelete,
      exportData,
      printRecords,
      formatDate,
      getInitials,
      getStatusBadgeClass
    }
  }
}
</script>

<style scoped>
.attendance-history {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.table {
  margin-bottom: 0;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 12px;
  font-weight: 600;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.pagination {
  margin-top: 1rem;
}

.badge {
  font-size: 0.75rem;
}

@media print {
  .btn-group,
  .d-flex.justify-content-between {
    display: none !important;
  }
}
</style>