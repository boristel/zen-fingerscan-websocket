<template>
  <div class="user-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">User Management</h2>
        <p class="text-muted mb-0">Manage system users and permissions</p>
      </div>
      <div>
        <button class="btn btn-primary me-2" @click="createUser">
          <i class="bi bi-person-plus me-2"></i>Add User
        </button>
        <button class="btn btn-success" @click="exportUsers">
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
              <label class="form-label">Search User</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search by name, email, or ID..."
                  v-model="searchQuery"
                  @input="filterUsers"
                >
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label class="form-label">Role</label>
              <select class="form-select" v-model="selectedRole" @change="filterUsers">
                <option value="">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="hr">HR Manager</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="readonly">Read Only</option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" v-model="selectedStatus" @change="filterUsers">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label class="form-label">Department</label>
              <select class="form-select" v-model="selectedDepartment" @change="filterUsers">
                <option value="">All Departments</option>
                <option value="IT">Information Technology</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label class="form-label">Per Page</label>
              <select class="form-select" v-model="perPage" @change="filterUsers">
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

    <!-- User Statistics -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ userStats.total }}</h4>
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
                <h4 class="mb-0">{{ userStats.active }}</h4>
                <p class="mb-0">Active Users</p>
              </div>
              <i class="bi bi-person-check fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ userStats.pending }}</h4>
                <p class="mb-0">Pending</p>
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
                <h4 class="mb-0">{{ userStats.admins }}</h4>
                <p class="mb-0">Administrators</p>
              </div>
              <i class="bi bi-shield-check fs-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th @click="sortBy('name')" style="cursor: pointer;">
                  User
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('email')" style="cursor: pointer;">
                  Email
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('role')" style="cursor: pointer;">
                  Role
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('department')" style="cursor: pointer;">
                  Department
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('lastLogin')" style="cursor: pointer;">
                  Last Login
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
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                      {{ getInitials(user.name) }}
                    </div>
                    <div>
                      <div class="fw-medium">{{ user.name }}</div>
                      <small class="text-muted">ID: {{ user.id }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="getRoleBadgeClass(user.role)" class="badge">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td>{{ user.department }}</td>
                <td>
                  <div>
                    {{ formatDate(user.lastLogin) }}
                  </div>
                  <small class="text-muted">{{ formatTime(user.lastLogin) }}</small>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(user.status)" class="badge">
                    {{ user.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewUser(user)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-warning"
                      @click="editUser(user)"
                      title="Edit User"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="resetPassword(user)"
                      title="Reset Password"
                    >
                      <i class="bi bi-key"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      @click="toggleStatus(user)"
                      :title="user.status === 'active' ? 'Deactivate' : 'Activate'"
                    >
                      <i :class="user.status === 'active' ? 'bi bi-pause' : 'bi bi-play'"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteUser(user)"
                      title="Delete User"
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

    <!-- User Details Modal -->
    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">User Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="text-center">
                  <div class="avatar-xl bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    {{ getInitials(selectedUser.name) }}
                  </div>
                  <h6>{{ selectedUser.name }}</h6>
                  <p class="text-muted mb-0">{{ selectedUser.email }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <strong>User ID:</strong> {{ selectedUser.id }}
                </div>
                <div class="mb-3">
                  <strong>Role:</strong>
                  <span :class="getRoleBadgeClass(selectedUser.role)" class="badge ms-2">
                    {{ getRoleName(selectedUser.role) }}
                  </span>
                </div>
                <div class="mb-3">
                  <strong>Department:</strong> {{ selectedUser.department }}
                </div>
                <div class="mb-3">
                  <strong>Status:</strong>
                  <span :class="getStatusBadgeClass(selectedUser.status)" class="badge ms-2">
                    {{ selectedUser.status }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <strong>Phone:</strong> {{ selectedUser.phone || 'Not provided' }}
                </div>
                <div class="mb-3">
                  <strong>Join Date:</strong> {{ formatDate(selectedUser.joinDate) }}
                </div>
                <div class="mb-3">
                  <strong>Created By:</strong> {{ selectedUser.createdBy }}
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <strong>Last Login:</strong> {{ formatDate(selectedUser.lastLogin) }} {{ formatTime(selectedUser.lastLogin) }}
                </div>
                <div class="mb-3">
                  <strong>Login Count:</strong> {{ selectedUser.loginCount }}
                </div>
                <div class="mb-3">
                  <strong>Failed Attempts:</strong> {{ selectedUser.failedAttempts }}
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div class="row mt-4">
              <div class="col-12">
                <h6 class="mb-3">Permissions</h6>
                <div class="row">
                  <div v-for="permission in selectedUser.permissions" :key="permission" class="col-md-4 mb-2">
                    <span class="badge bg-light text-dark">{{ permission }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-warning" @click="editUser(selectedUser)">
              <i class="bi bi-pencil me-2"></i>Edit User
            </button>
            <button type="button" class="btn btn-primary" @click="resetPassword(selectedUser)">
              <i class="bi bi-key me-2"></i>Reset Password
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
  name: 'UserManagementView',
  setup() {
    // Data
    const searchQuery = ref('')
    const selectedRole = ref('')
    const selectedStatus = ref('')
    const selectedDepartment = ref('')
    const perPage = ref(25)
    const currentPage = ref(1)
    const sortField = ref('name')
    const sortDirection = ref('asc')
    const users = ref([])
    const selectedUser = ref(null)
    const userStats = ref({
      total: 0,
      active: 0,
      pending: 0,
      admins: 0
    })

    // Computed
    const filteredUsers = computed(() => {
      let filtered = users.value

      // Apply search filter
      if (searchQuery.value) {
        filtered = filtered.filter(user =>
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.id.toString().includes(searchQuery.value)
        )
      }

      // Apply role filter
      if (selectedRole.value) {
        filtered = filtered.filter(user => user.role === selectedRole.value)
      }

      // Apply status filter
      if (selectedStatus.value) {
        filtered = filtered.filter(user => user.status === selectedStatus.value)
      }

      // Apply department filter
      if (selectedDepartment.value) {
        filtered = filtered.filter(user => user.department === selectedDepartment.value)
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
      return Math.ceil(filteredUsers.value.length / perPage.value)
    })

    const visiblePages = computed(() => {
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * perPage.value
      const end = start + perPage.value
      return filteredUsers.value.slice(start, end)
    })

    // Methods
    const loadUsers = async () => {
      try {
        // Sample data - replace with actual API call
        users.value = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'admin',
            department: 'IT',
            status: 'active',
            phone: '+1 234 567 8900',
            joinDate: '2022-01-15',
            lastLogin: '2024-01-19T08:30:00Z',
            loginCount: 342,
            failedAttempts: 0,
            createdBy: 'System',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports']
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'hr',
            department: 'HR',
            status: 'active',
            phone: '+1 234 567 8901',
            joinDate: '2022-02-20',
            lastLogin: '2024-01-19T09:15:00Z',
            loginCount: 256,
            failedAttempts: 1,
            createdBy: 'Admin',
            permissions: ['Employee Management', 'Attendance Reports', 'Leave Management']
          },
          {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@company.com',
            role: 'employee',
            department: 'Finance',
            status: 'inactive',
            phone: '+1 234 567 8902',
            joinDate: '2022-03-10',
            lastLogin: '2024-01-15T17:30:00Z',
            loginCount: 189,
            failedAttempts: 3,
            createdBy: 'HR Manager',
            permissions: ['View Attendance', 'Clock In/Out']
          }
        ]

        updateStats()
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    const updateStats = () => {
      const stats = {
        total: users.value.length,
        active: 0,
        pending: 0,
        admins: 0
      }

      users.value.forEach(user => {
        if (user.status === 'active') stats.active++
        if (user.status === 'pending') stats.pending++
        if (user.role === 'admin') stats.admins++
      })

      userStats.value = stats
    }

    const filterUsers = () => {
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

    const createUser = () => {
      console.log('Opening create user form...')
    }

    const viewUser = (user) => {
      selectedUser.value = user
      // Show modal
    }

    const editUser = (user) => {
      console.log('Editing user:', user)
    }

    const resetPassword = (user) => {
      if (confirm(`Are you sure you want to reset password for ${user.name}?`)) {
        console.log('Resetting password for user:', user)
        alert('Password reset link sent to user email!')
      }
    }

    const toggleStatus = (user) => {
      const action = user.status === 'active' ? 'deactivate' : 'activate'
      if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
        user.status = user.status === 'active' ? 'inactive' : 'active'
        updateStats()
      }
    }

    const deleteUser = (user) => {
      if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index > -1) {
          users.value.splice(index, 1)
          updateStats()
        }
      }
    }

    const exportUsers = () => {
      console.log('Exporting user data...')
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getRoleName = (role) => {
      const roleNames = {
        admin: 'Administrator',
        hr: 'HR Manager',
        manager: 'Manager',
        employee: 'Employee',
        readonly: 'Read Only'
      }
      return roleNames[role] || role
    }

    const getRoleBadgeClass = (role) => {
      switch (role) {
        case 'admin':
          return 'bg-danger'
        case 'hr':
          return 'bg-warning'
        case 'manager':
          return 'bg-info'
        case 'employee':
          return 'bg-primary'
        case 'readonly':
          return 'bg-secondary'
        default:
          return 'bg-secondary'
      }
    }

    const getStatusBadgeClass = (status) => {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-success'
        case 'inactive':
          return 'bg-secondary'
        case 'suspended':
          return 'bg-danger'
        case 'pending':
          return 'bg-warning'
        default:
          return 'bg-secondary'
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Never'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadUsers()
    })

    return {
      searchQuery,
      selectedRole,
      selectedStatus,
      selectedDepartment,
      perPage,
      currentPage,
      users,
      selectedUser,
      userStats,
      filteredUsers,
      totalPages,
      visiblePages,
      paginatedUsers,
      filterUsers,
      sortBy,
      createUser,
      viewUser,
      editUser,
      resetPassword,
      toggleStatus,
      deleteUser,
      exportUsers,
      getInitials,
      getRoleName,
      getRoleBadgeClass,
      getStatusBadgeClass,
      formatDate,
      formatTime
    }
  }
}
</script>

<style scoped>
.user-management {
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

.avatar-xl {
  width: 80px;
  height: 80px;
  font-size: 28px;
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

.form-control:focus,
.form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
</style>