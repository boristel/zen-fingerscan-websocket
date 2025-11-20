<template>
  <div class="employee-list-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Employee Management</h1>
        <p class="subtitle">Manage employee records and information</p>
      </div>
      <div class="header-actions">
        <router-link to="/employees/create" class="btn btn-primary">
          <i class="bi bi-person-plus"></i>
          Add Employee
        </router-link>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-section">
      <div class="search-controls">
        <div class="search-input-group">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search employees by name, ID, or department..."
              @input="handleSearch"
            />
          </div>
        </div>
        <div class="filter-controls">
          <select v-model="selectedDepartment" class="form-select" @change="handleFilter">
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">Human Resources</option>
            <option value="Operations">Operations</option>
          </select>
          <select v-model="selectedStatus" class="form-select" @change="handleFilter">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="employee-table-section">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="sortable">
                Employee
                <i :class="getSortIcon('name')"></i>
              </th>
              <th @click="sortBy('employeeId')" class="sortable">
                Employee ID
                <i :class="getSortIcon('employeeId')"></i>
              </th>
              <th @click="sortBy('department')" class="sortable">
                Department
                <i :class="getSortIcon('department')"></i>
              </th>
              <th @click="sortBy('position')" class="sortable">
                Position
                <i :class="getSortIcon('position')"></i>
              </th>
              <th @click="sortBy('status')" class="sortable">
                Status
                <i :class="getSortIcon('status')"></i>
              </th>
              <th @click="sortBy('createdAt')" class="sortable">
                Join Date
                <i :class="getSortIcon('createdAt')"></i>
              </th>
              <th>Biometric Status</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in filteredEmployees" :key="employee.id">
              <td>
                <div class="employee-info">
                  <div class="avatar">
                    {{ getInitials(employee.fullName) }}
                  </div>
                  <div class="employee-details">
                    <div class="name">{{ employee.fullName }}</div>
                    <div class="email">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              <td class="employee-id">{{ employee.employeeId }}</td>
              <td class="department">{{ employee.department || 'N/A' }}</td>
              <td class="position">{{ employee.position || 'N/A' }}</td>
              <td>
                <span class="status-badge" :class="employee.status">
                  {{ formatStatus(employee.status) }}
                </span>
              </td>
              <td>{{ formatDate(employee.createdAt) }}</td>
              <td>
                <div class="biometric-status">
                  <i :class="getBiometricIcon(employee.hasBiometric)"></i>
                  <span>{{ employee.hasBiometric ? 'Registered' : 'Not Registered' }}</span>
                </div>
              </td>
              <td class="actions">
                <div class="action-buttons">
                  <router-link
                    :to="`/employees/${employee.id}`"
                    class="btn btn-sm btn-outline-primary"
                    title="View Details"
                  >
                    <i class="bi bi-eye"></i>
                  </router-link>
                  <router-link
                    :to="`/employees/${employee.id}/edit`"
                    class="btn btn-sm btn-outline-secondary"
                    title="Edit Employee"
                  >
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button
                    @click="deleteEmployee(employee)"
                    class="btn btn-sm btn-outline-danger"
                    title="Delete Employee"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredEmployees.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-people"></i>
        </div>
        <h3>No employees found</h3>
        <p>
          {{ searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first employee' }}
        </p>
        <router-link
          v-if="!searchQuery"
          to="/employees/create"
          class="btn btn-primary"
        >
          <i class="bi bi-person-plus"></i>
          Add Your First Employee
        </router-link>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredEmployees.length > 0" class="pagination-section">
      <div class="pagination-info">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
        {{ Math.min(currentPage * itemsPerPage, filteredEmployees.length) }}
        of {{ filteredEmployees.length }} employees
      </div>
      <div class="pagination-controls">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn btn-outline-secondary"
        >
          <i class="bi bi-chevron-left"></i>
          Previous
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            class="btn"
            :class="page === currentPage ? 'btn-primary' : 'btn-outline-secondary'"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn btn-outline-secondary"
        >
          Next
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'EmployeeListView',
  setup() {
    const router = useRouter()
    const { addNotification } = useNotifications()

    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const selectedStatus = ref('')
    const sortField = ref('name')
    const sortDirection = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(25)

    const employees = ref([
      {
        id: 1,
        fullName: 'John Doe',
        email: 'john.doe@company.com',
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'active',
        hasBiometric: true,
        createdAt: new Date('2023-01-15')
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        email: 'jane.smith@company.com',
        employeeId: 'EMP002',
        department: 'Sales',
        position: 'Sales Manager',
        status: 'active',
        hasBiometric: true,
        createdAt: new Date('2023-02-20')
      },
      {
        id: 3,
        fullName: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        employeeId: 'EMP003',
        department: 'Marketing',
        position: 'Marketing Specialist',
        status: 'on-leave',
        hasBiometric: false,
        createdAt: new Date('2023-03-10')
      },
      {
        id: 4,
        fullName: 'Sarah Williams',
        email: 'sarah.williams@company.com',
        employeeId: 'EMP004',
        department: 'HR',
        position: 'HR Manager',
        status: 'active',
        hasBiometric: true,
        createdAt: new Date('2023-04-05')
      },
      {
        id: 5,
        fullName: 'Tom Brown',
        email: 'tom.brown@company.com',
        employeeId: 'EMP005',
        department: 'Operations',
        position: 'Operations Coordinator',
        status: 'inactive',
        hasBiometric: false,
        createdAt: new Date('2023-05-12')
      }
    ])

    const filteredEmployees = computed(() => {
      let filtered = employees.value

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(employee =>
          employee.fullName.toLowerCase().includes(query) ||
          employee.employeeId.toLowerCase().includes(query) ||
          employee.department?.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query)
        )
      }

      // Apply department filter
      if (selectedDepartment.value) {
        filtered = filtered.filter(employee =>
          employee.department === selectedDepartment.value
        )
      }

      // Apply status filter
      if (selectedStatus.value) {
        filtered = filtered.filter(employee =>
          employee.status === selectedStatus.value
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue = a[sortField.value]
        let bValue = b[sortField.value]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        return sortDirection.value === 'asc' ? result : -result
      })

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredEmployees.value.length / itemsPerPage.value)
    })

    const visiblePages = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      const delta = 2
      const range = []

      const rangeWithDots = []
      let l

      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
          range.push(i)
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots.filter(page => page !== '...')
    })

    const paginatedEmployees = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredEmployees.value.slice(start, end)
    })

    const getInitials = (name) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const formatStatus = (status) => {
      return status
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date))
    }

    const getBiometricIcon = (hasBiometric) => {
      return hasBiometric
        ? 'bi bi-check-circle-fill text-success'
        : 'bi bi-x-circle-fill text-danger'
    }

    const getSortIcon = (field) => {
      if (sortField.value !== field) {
        return 'bi bi-arrow-down-up text-muted'
      }
      return sortDirection.value === 'asc'
        ? 'bi bi-arrow-up text-primary'
        : 'bi bi-arrow-down text-primary'
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const handleFilter = () => {
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

    const deleteEmployee = (employee) => {
      if (confirm(`Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`)) {
        const index = employees.value.findIndex(emp => emp.id === employee.id)
        if (index > -1) {
          employees.value.splice(index, 1)
          addNotification({
            type: 'success',
            message: `${employee.fullName} has been deleted successfully.`,
            duration: 3000
          })
        }
      }
    }

    onMounted(() => {
      // Load employees data
      // This would typically be an API call
    })

    return {
      searchQuery,
      selectedDepartment,
      selectedStatus,
      currentPage,
      itemsPerPage,
      employees,
      filteredEmployees,
      paginatedEmployees,
      totalPages,
      visiblePages,
      getInitials,
      formatStatus,
      formatDate,
      getBiometricIcon,
      getSortIcon,
      handleSearch,
      handleFilter,
      sortBy,
      deleteEmployee
    }
  }
}
</script>

<style scoped>
.employee-list-view {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
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

.search-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.search-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-group {
  flex: 1;
  min-width: 300px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
}

.input-group-text {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem;
}

.form-control {
  border: 1px solid #ced4da;
  border-left: none;
  border-radius: 0 0.375rem 0.375rem 0;
  flex: 1;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.form-select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  background-color: white;
  min-width: 150px;
}

.employee-table-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  margin-bottom: 0;
}

.table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding: 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.sortable:hover {
  color: #667eea;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.employee-details {
  flex: 1;
  min-width: 0;
}

.name {
  color: #495057;
  font-weight: 600;
  margin-bottom: 2px;
}

.email {
  color: #6c757d;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.on-leave {
  background: #fff3cd;
  color: #856404;
}

.biometric-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: auto;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1.4;
}

.btn-primary {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
  color: white;
}

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #ced4da;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  background: transparent;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  gap: 16px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .employee-list-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-controls {
    flex-direction: column;
    gap: 12px;
  }

  .search-input-group {
    min-width: auto;
  }

  .filter-controls {
    flex-direction: column;
    width: 100%;
  }

  .form-select {
    min-width: auto;
  }

  .table-responsive {
    font-size: 0.75rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }

  .pagination-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>