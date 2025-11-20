<template>
  <div class="audit-logs">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Audit Logs</h2>
        <p class="text-muted mb-0">System activity and security audit logs</p>
      </div>
      <div>
        <button class="btn btn-success me-2" @click="exportLogs">
          <i class="bi bi-download me-2"></i>Export Logs
        </button>
        <button class="btn btn-warning" @click="clearLogs">
          <i class="bi bi-trash me-2"></i>Clear Old Logs
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ auditStats.total }}</h4>
                <p class="mb-0">Total Logs</p>
              </div>
              <i class="bi bi-journal-text fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ auditStats.securityEvents }}</h4>
                <p class="mb-0">Security Events</p>
              </div>
              <i class="bi bi-shield-exclamation fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ auditStats.failedLogins }}</h4>
                <p class="mb-0">Failed Logins</p>
              </div>
              <i class="bi bi-x-circle fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ auditStats.today }}</h4>
                <p class="mb-0">Today's Logs</p>
              </div>
              <i class="bi bi-calendar-day fs-2"></i>
            </div>
          </div>
        </div>
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
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <div class="col-md-3" v-if="dateRange === 'custom'">
            <div class="form-group">
              <label class="form-label">From Date</label>
              <input type="date" class="form-control" v-model="customDateFrom" @change="filterLogs">
            </div>
          </div>
          <div class="col-md-3" v-if="dateRange === 'custom'">
            <div class="form-group">
              <label class="form-label">To Date</label>
              <input type="date" class="form-control" v-model="customDateTo" @change="filterLogs">
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Event Type</label>
              <select class="form-select" v-model="selectedEventType" @change="filterLogs">
                <option value="">All Events</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="user_management">User Management</option>
                <option value="security">Security</option>
                <option value="system">System</option>
                <option value="data_access">Data Access</option>
                <option value="configuration">Configuration</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">Severity</label>
              <select class="form-select" v-model="selectedSeverity" @change="filterLogs">
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">User</label>
              <input
                type="text"
                class="form-control"
                placeholder="Search user..."
                v-model="userSearch"
                @input="filterLogs"
              >
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="form-label">IP Address</label>
              <input
                type="text"
                class="form-control"
                placeholder="IP address..."
                v-model="ipSearch"
                @input="filterLogs"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Monitoring -->
    <div class="card mb-4" v-if="realTimeMonitoring">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Live Monitoring</h5>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="realTimeMonitoring"
              id="realTimeSwitch"
            >
            <label class="form-check-label" for="realTimeSwitch">
              Real-time Updates
            </label>
          </div>
        </div>
        <div class="live-logs">
          <div v-for="log in recentLogs" :key="log.id" class="live-log-item mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="live-indicator me-2"></div>
                <div>
                  <strong>{{ log.user }}</strong> {{ log.action }}
                  <span class="text-muted ms-2">{{ log.resource }}</span>
                </div>
              </div>
              <div class="text-end">
                <span :class="getSeverityBadgeClass(log.severity)" class="badge me-2">
                  {{ log.severity }}
                </span>
                <small class="text-muted">{{ formatTime(log.timestamp) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Audit Log Entries</h5>
          <span class="badge bg-info">{{ filteredLogs.length }} records</span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th @click="sortBy('timestamp')" style="cursor: pointer;">
                  Timestamp
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('user')" style="cursor: pointer;">
                  User
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th @click="sortBy('eventType')" style="cursor: pointer;">
                  Event Type
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th @click="sortBy('severity')" style="cursor: pointer;">
                  Severity
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginatedLogs" :key="log.id" :class="getRowClass(log.severity)">
                <td>
                  <div>
                    {{ formatDate(log.timestamp) }}
                  </div>
                  <small class="text-muted">{{ formatTime(log.timestamp) }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                      {{ getInitials(log.user) }}
                    </div>
                    {{ log.user }}
                  </div>
                </td>
                <td>
                  <span :class="getEventTypeBadgeClass(log.eventType)" class="badge">
                    {{ getEventTypeName(log.eventType) }}
                  </span>
                </td>
                <td>{{ log.action }}</td>
                <td>{{ log.resource }}</td>
                <td>
                  <code class="small">{{ log.ipAddress }}</code>
                </td>
                <td>
                  <span :class="getSeverityBadgeClass(log.severity)" class="badge">
                    {{ log.severity }}
                  </span>
                </td>
                <td>
                  <span :class="log.success ? 'text-success' : 'text-danger'">
                    <i :class="log.success ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                    {{ log.success ? 'Success' : 'Failed' }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-info"
                    @click="viewLogDetails(log)"
                    title="View Details"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
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

    <!-- Log Details Modal -->
    <div class="modal fade" id="logModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Audit Log Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLog">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Timestamp:</strong> {{ formatDateTime(selectedLog.timestamp) }}
              </div>
              <div class="col-md-6">
                <strong>User:</strong> {{ selectedLog.user }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Event Type:</strong>
                <span :class="getEventTypeBadgeClass(selectedLog.eventType)" class="badge ms-2">
                  {{ getEventTypeName(selectedLog.eventType) }}
                </span>
              </div>
              <div class="col-md-6">
                <strong>Severity:</strong>
                <span :class="getSeverityBadgeClass(selectedLog.severity)" class="badge ms-2">
                  {{ selectedLog.severity }}
                </span>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Action:</strong> {{ selectedLog.action }}
              </div>
              <div class="col-md-6">
                <strong>Resource:</strong> {{ selectedLog.resource }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>IP Address:</strong> {{ selectedLog.ipAddress }}
              </div>
              <div class="col-md-6">
                <strong>User Agent:</strong> {{ selectedLog.userAgent }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Status:</strong>
                <span :class="selectedLog.success ? 'text-success' : 'text-danger'">
                  {{ selectedLog.success ? 'Success' : 'Failed' }}
                </span>
              </div>
              <div class="col-md-6">
                <strong>Session ID:</strong> {{ selectedLog.sessionId }}
              </div>
            </div>
            <div class="row mb-3" v-if="selectedLog.details">
              <div class="col-12">
                <strong>Additional Details:</strong>
                <pre class="mt-2 p-3 bg-light rounded">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'AuditLogsView',
  setup() {
    // Data
    const dateRange = ref('week')
    const customDateFrom = ref('')
    const customDateTo = ref('')
    const selectedEventType = ref('')
    const selectedSeverity = ref('')
    const userSearch = ref('')
    const ipSearch = ref('')
    const currentPage = ref(1)
    const perPage = ref(25)
    const sortField = ref('timestamp')
    const sortDirection = ref('desc')
    const realTimeMonitoring = ref(false)
    const logs = ref([])
    const recentLogs = ref([])
    const selectedLog = ref(null)
    const auditStats = ref({
      total: 0,
      securityEvents: 0,
      failedLogins: 0,
      today: 0
    })

    let refreshInterval = null

    // Computed
    const filteredLogs = computed(() => {
      let filtered = logs.value

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
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp)
          return logDate >= filterDateFrom && logDate <= filterDateTo
        })
      }

      // Apply other filters
      if (selectedEventType.value) {
        filtered = filtered.filter(log => log.eventType === selectedEventType.value)
      }

      if (selectedSeverity.value) {
        filtered = filtered.filter(log => log.severity === selectedSeverity.value)
      }

      if (userSearch.value) {
        filtered = filtered.filter(log =>
          log.user.toLowerCase().includes(userSearch.value.toLowerCase())
        )
      }

      if (ipSearch.value) {
        filtered = filtered.filter(log =>
          log.ipAddress.includes(ipSearch.value)
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
      return Math.ceil(filteredLogs.value.length / perPage.value)
    })

    const visiblePages = computed(() => {
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    const paginatedLogs = computed(() => {
      const start = (currentPage.value - 1) * perPage.value
      const end = start + perPage.value
      return filteredLogs.value.slice(start, end)
    })

    // Methods
    const loadAuditLogs = async () => {
      try {
        // Sample data - replace with actual API call
        logs.value = [
          {
            id: 1,
            timestamp: '2024-01-19T10:30:00Z',
            user: 'Admin User',
            eventType: 'login',
            action: 'Successful login',
            resource: 'Authentication System',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            severity: 'info',
            success: true,
            sessionId: 'sess_12345',
            details: { loginMethod: 'password', mfaVerified: true }
          },
          {
            id: 2,
            timestamp: '2024-01-19T10:25:00Z',
            user: 'Unknown User',
            eventType: 'login',
            action: 'Failed login attempt',
            resource: 'Authentication System',
            ipAddress: '192.168.1.200',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            severity: 'medium',
            success: false,
            sessionId: null,
            details: { reason: 'invalid_credentials', attempts: 3 }
          },
          {
            id: 3,
            timestamp: '2024-01-19T10:20:00Z',
            user: 'HR Manager',
            eventType: 'user_management',
            action: 'Created new user',
            resource: 'Employee: Jane Smith',
            ipAddress: '192.168.1.50',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            severity: 'low',
            success: true,
            sessionId: 'sess_67890',
            details: { userId: 'USR001', role: 'employee' }
          }
        ]

        recentLogs.value = logs.value.slice(0, 3)
        updateStats()
      } catch (error) {
        console.error('Error loading audit logs:', error)
      }
    }

    const updateStats = () => {
      const stats = {
        total: logs.value.length,
        securityEvents: 0,
        failedLogins: 0,
        today: 0
      }

      const today = new Date().toDateString()

      logs.value.forEach(log => {
        if (log.eventType === 'security') stats.securityEvents++
        if (log.eventType === 'login' && !log.success) stats.failedLogins++
        if (new Date(log.timestamp).toDateString() === today) stats.today++
      })

      auditStats.value = stats
    }

    const updateDateRange = () => {
      if (dateRange.value !== 'custom') {
        customDateFrom.value = ''
        customDateTo.value = ''
      }
      filterLogs()
    }

    const filterLogs = () => {
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

    const viewLogDetails = (log) => {
      selectedLog.value = log
      // Show modal
    }

    const exportLogs = () => {
      console.log('Exporting audit logs...')
    }

    const clearLogs = () => {
      if (confirm('Are you sure you want to clear audit logs older than 90 days? This action cannot be undone.')) {
        console.log('Clearing old audit logs...')
      }
    }

    const refreshLogs = () => {
      if (realTimeMonitoring.value) {
        loadAuditLogs()
      }
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getEventTypeName = (eventType) => {
      const eventNames = {
        login: 'Login',
        logout: 'Logout',
        user_management: 'User Management',
        security: 'Security',
        system: 'System',
        data_access: 'Data Access',
        configuration: 'Configuration'
      }
      return eventNames[eventType] || eventType
    }

    const getEventTypeBadgeClass = (eventType) => {
      switch (eventType) {
        case 'login':
        case 'logout':
          return 'bg-primary'
        case 'user_management':
          return 'bg-info'
        case 'security':
          return 'bg-danger'
        case 'system':
          return 'bg-warning'
        case 'data_access':
          return 'bg-success'
        case 'configuration':
          return 'bg-secondary'
        default:
          return 'bg-secondary'
      }
    }

    const getSeverityBadgeClass = (severity) => {
      switch (severity.toLowerCase()) {
        case 'critical':
          return 'bg-danger'
        case 'high':
          return 'bg-warning'
        case 'medium':
          return 'bg-info'
        case 'low':
          return 'bg-primary'
        case 'info':
          return 'bg-secondary'
        default:
          return 'bg-secondary'
      }
    }

    const getRowClass = (severity) => {
      switch (severity.toLowerCase()) {
        case 'critical':
          return 'table-danger'
        case 'high':
          return 'table-warning'
        default:
          return ''
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadAuditLogs()
      if (realTimeMonitoring.value) {
        refreshInterval = setInterval(refreshLogs, 30000) // Refresh every 30 seconds
      }
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      dateRange,
      customDateFrom,
      customDateTo,
      selectedEventType,
      selectedSeverity,
      userSearch,
      ipSearch,
      currentPage,
      perPage,
      logs,
      recentLogs,
      selectedLog,
      auditStats,
      realTimeMonitoring,
      filteredLogs,
      totalPages,
      visiblePages,
      paginatedLogs,
      updateDateRange,
      filterLogs,
      sortBy,
      viewLogDetails,
      exportLogs,
      clearLogs,
      getInitials,
      getEventTypeName,
      getEventTypeBadgeClass,
      getSeverityBadgeClass,
      getRowClass,
      formatDate,
      formatTime,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.audit-logs {
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

.live-logs {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.live-log-item {
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.25rem;
  border-left: 3px solid #198754;
}

.live-indicator {
  width: 8px;
  height: 8px;
  background-color: #198754;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.badge {
  font-size: 0.75rem;
}

.pagination {
  margin-top: 1rem;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.table-danger {
  background-color: rgba(220, 53, 69, 0.05);
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.05);
}

pre {
  font-size: 0.875rem;
  max-height: 200px;
  overflow-y: auto;
}
</style>