<template>
  <div class="biometric-manage">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Manage Biometrics</h2>
        <p class="text-muted mb-0">View, edit, and manage employee fingerprint data</p>
      </div>
      <div>
        <button class="btn btn-primary me-2" @click="$router.push('/biometrics/enroll')">
          <i class="bi bi-plus-circle me-2"></i>Enroll New
        </button>
        <button class="btn btn-success" @click="exportData">
          <i class="bi bi-download me-2"></i>Export
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label class="form-label">Search Employee</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search by name or ID..."
                  v-model="searchQuery"
                  @input="filterEmployees"
                >
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Department</label>
              <select class="form-select" v-model="selectedDepartment" @change="filterEmployees">
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
              <label class="form-label">Status</label>
              <select class="form-select" v-model="selectedStatus" @change="filterEmployees">
                <option value="">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="partial">Partial</option>
                <option value="none">Not Enrolled</option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label class="form-label">Per Page</label>
              <select class="form-select" v-model="perPage" @change="filterEmployees">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th @click="sortBy('employeeId')" style="cursor: pointer;">
                  Employee ID
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('name')" style="cursor: pointer;">
                  Name
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('department')" style="cursor: pointer;">
                  Department
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('fingerprints')" style="cursor: pointer;">
                  Fingerprints
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('status')" style="cursor: pointer;">
                  Status
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('lastEnrolled')" style="cursor: pointer;">
                  Last Enrolled
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in filteredEmployees" :key="employee.id">
                <td>{{ employee.employeeId }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                      {{ getInitials(employee.name) }}
                    </div>
                    {{ employee.name }}
                  </div>
                </td>
                <td>{{ employee.department }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="progress" style="width: 60px; height: 8px;">
                      <div
                        class="progress-bar"
                        :class="getProgressClass(employee.fingerprintCount)"
                        :style="`width: ${(employee.fingerprintCount / 10) * 100}%`"
                      ></div>
                    </div>
                    <span class="ms-2">{{ employee.fingerprintCount }}/10</span>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(employee.status)" class="badge">
                    {{ employee.status }}
                  </span>
                </td>
                <td>{{ formatDate(employee.lastEnrolled) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewEmployee(employee)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="enrollFinger(employee)"
                      title="Enroll Fingerprint"
                    >
                      <i class="bi bi-fingerprint"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-warning"
                      @click="editEmployee(employee)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteEmployee(employee)"
                      title="Delete"
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

    <!-- Employee Details Modal -->
    <div class="modal fade" id="employeeModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Employee Biometric Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedEmployee">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Employee ID:</strong> {{ selectedEmployee.employeeId }}
              </div>
              <div class="col-md-6">
                <strong>Name:</strong> {{ selectedEmployee.name }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Department:</strong> {{ selectedEmployee.department }}
              </div>
              <div class="col-md-6">
                <strong>Status:</strong>
                <span :class="getStatusBadgeClass(selectedEmployee.status)" class="badge ms-2">
                  {{ selectedEmployee.status }}
                </span>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-12">
                <strong>Registered Fingerprints:</strong>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="finger-grid">
                  <div
                    v-for="finger in allFingers"
                    :key="finger.id"
                    class="finger-item"
                    :class="{ 'registered': isFingerRegistered(finger.id) }"
                  >
                    <i :class="finger.icon" class="fs-4"></i>
                    <div class="finger-name">{{ finger.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="enrollFinger(selectedEmployee)">
              <i class="bi bi-fingerprint me-2"></i>Enroll Fingerprint
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
  name: 'BiometricManageView',
  setup() {
    // Data
    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const selectedStatus = ref('')
    const perPage = ref(10)
    const currentPage = ref(1)
    const sortField = ref('name')
    const sortDirection = ref('asc')
    const employees = ref([])
    const selectedEmployee = ref(null)

    // Finger mapping
    const allFingers = ref([
      { id: 0, name: 'Left Thumb', icon: 'bi bi-fingerprint' },
      { id: 1, name: 'Left Index', icon: 'bi bi-fingerprint' },
      { id: 2, name: 'Left Middle', icon: 'bi bi-fingerprint' },
      { id: 3, name: 'Left Ring', icon: 'bi bi-fingerprint' },
      { id: 4, name: 'Left Little', icon: 'bi bi-fingerprint' },
      { id: 5, name: 'Right Thumb', icon: 'bi bi-fingerprint' },
      { id: 6, name: 'Right Index', icon: 'bi bi-fingerprint' },
      { id: 7, name: 'Right Middle', icon: 'bi bi-fingerprint' },
      { id: 8, name: 'Right Ring', icon: 'bi bi-fingerprint' },
      { id: 9, name: 'Right Little', icon: 'bi bi-fingerprint' }
    ])

    // Computed
    const filteredEmployees = computed(() => {
      let filtered = employees.value

      // Apply search filter
      if (searchQuery.value) {
        filtered = filtered.filter(emp =>
          emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Apply department filter
      if (selectedDepartment.value) {
        filtered = filtered.filter(emp => emp.department === selectedDepartment.value)
      }

      // Apply status filter
      if (selectedStatus.value) {
        filtered = filtered.filter(emp => emp.status === selectedStatus.value)
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
      return Math.ceil(filteredEmployees.value.length / perPage.value)
    })

    const visiblePages = computed(() => {
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    // Methods
    const loadEmployees = async () => {
      try {
        // Sample data - replace with actual API call
        employees.value = [
          {
            id: 1,
            employeeId: 'EMP001',
            name: 'John Doe',
            department: 'IT',
            fingerprintCount: 8,
            status: 'enrolled',
            lastEnrolled: '2024-01-15',
            registeredFingers: [0, 1, 2, 3, 5, 6, 7, 8]
          },
          {
            id: 2,
            employeeId: 'EMP002',
            name: 'Jane Smith',
            department: 'HR',
            fingerprintCount: 5,
            status: 'partial',
            lastEnrolled: '2024-01-10',
            registeredFingers: [0, 1, 5, 6, 7]
          },
          {
            id: 3,
            employeeId: 'EMP003',
            name: 'Bob Johnson',
            department: 'Finance',
            fingerprintCount: 0,
            status: 'none',
            lastEnrolled: null,
            registeredFingers: []
          }
        ]
      } catch (error) {
        console.error('Error loading employees:', error)
      }
    }

    const filterEmployees = () => {
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

    const viewEmployee = (employee) => {
      selectedEmployee.value = employee
      // Show modal (you'd need to import and use Bootstrap modal)
      console.log('Viewing employee:', employee)
    }

    const enrollFinger = (employee) => {
      $router.push(`/biometrics/enroll?employee=${employee.id}`)
    }

    const editEmployee = (employee) => {
      $router.push(`/employees/${employee.id}/edit`)
    }

    const deleteEmployee = (employee) => {
      if (confirm(`Are you sure you want to delete ${employee.name}'s biometric data?`)) {
        console.log('Deleting employee:', employee)
      }
    }

    const exportData = () => {
      console.log('Exporting biometric data...')
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getProgressClass = (count) => {
      if (count >= 8) return 'bg-success'
      if (count >= 4) return 'bg-warning'
      return 'bg-danger'
    }

    const getStatusBadgeClass = (status) => {
      switch (status.toLowerCase()) {
        case 'enrolled':
          return 'bg-success'
        case 'partial':
          return 'bg-warning'
        case 'none':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }

    const formatDate = (date) => {
      if (!date) return 'Never'
      return new Date(date).toLocaleDateString()
    }

    const isFingerRegistered = (fingerId) => {
      if (!selectedEmployee.value) return false
      return selectedEmployee.value.registeredFingers.includes(fingerId)
    }

    // Lifecycle
    onMounted(() => {
      loadEmployees()
    })

    return {
      searchQuery,
      selectedDepartment,
      selectedStatus,
      perPage,
      currentPage,
      employees,
      selectedEmployee,
      allFingers,
      filteredEmployees,
      totalPages,
      visiblePages,
      filterEmployees,
      sortBy,
      viewEmployee,
      enrollFinger,
      editEmployee,
      deleteEmployee,
      exportData,
      getInitials,
      getProgressClass,
      getStatusBadgeClass,
      formatDate,
      isFingerRegistered
    }
  }
}
</script>

<style scoped>
.biometric-manage {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
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

.finger-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.finger-item {
  text-align: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.finger-item.registered {
  border-color: #198754;
  background-color: #f8fff9;
}

.finger-item:hover {
  border-color: #198754;
  background-color: #f8fff9;
}

.finger-name {
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.pagination {
  margin-top: 1rem;
}
</style>