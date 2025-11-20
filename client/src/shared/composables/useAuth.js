/**
 * Authentication Composables
 * Industry-standard authentication with JWT tokens, role-based access, and security features
 */

import { ref, computed, watch, readonly } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

// Global authentication state
const token = ref(localStorage.getItem('auth_token'))
const user = ref(null)
const loading = ref(false)
const loginAttempts = ref(0)
const lockoutUntil = ref(null)

// Session management
const sessionTimeout = ref(30 * 60 * 1000) // 30 minutes
const warningTimeout = ref(5 * 60 * 1000) // 5 minutes before expiry
const sessionTimer = ref(null)
const warningTimer = ref(null)
const lastActivity = ref(Date.now())

export function useAuth() {
  const router = useRouter()

  // Computed properties
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isLocked = computed(() => {
    return lockoutUntil.value && Date.now() < lockoutUntil.value
  })
  const remainingLockoutTime = computed(() => {
    if (!lockoutUntil.value) return 0
    const remaining = Math.max(0, lockoutUntil.value - Date.now())
    return Math.ceil(remaining / 1000) // seconds
  })

  const userRole = computed(() => user.value?.role || 'GUEST')
  const userPermissions = computed(() => {
    const permissions = ROLE_PERMISSIONS[userRole.value] || []
    return new Set(permissions)
  })

  const hasPermission = computed(() => {
    return (permission) => userPermissions.value.has(permission)
  })

  const hasAnyPermission = computed(() => {
    return (permissions) => permissions.some(p => userPermissions.value.has(p))
  })

  const hasAllPermissions = computed(() => {
    return (permissions) => permissions.every(p => userPermissions.value.has(p))
  })

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      if (token.value) {
        // Verify token is still valid
        const response = await api.get('/auth/verify')

        if (response.success) {
          user.value = response.data.user
          startSessionManagement()
          updateLastActivity()
          return true
        } else {
          // Token invalid, clear authentication
          await logout()
          return false
        }
      }
      return false
    } catch (error) {
      console.error('Authentication initialization failed:', error)
      await logout()
      return false
    }
  }

  // Login with enhanced security
  const login = async (credentials) => {
    try {
      loading.value = true

      // Check if account is locked
      if (isLocked.value) {
        throw new Error(`Account locked. Try again in ${remainingLockoutTime.value} seconds`)
      }

      // Prepare login request
      const loginData = {
        username: credentials.username,
        password: credentials.password,
        deviceInfo: getDeviceInfo(),
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent
      }

      const response = await api.post('/auth/login', loginData)

      if (response.success) {
        // Store authentication data
        token.value = response.data.token
        user.value = response.data.user

        // Store in localStorage
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('user_data', JSON.stringify(user.value))

        // Reset login attempts
        loginAttempts.value = 0
        lockoutUntil.value = null

        // Start session management
        startSessionManagement()
        updateLastActivity()

        // Log successful login
        logSecurityEvent('LOGIN_SUCCESS', {
          userId: user.value.id,
          role: user.value.role,
          deviceInfo: loginData.deviceInfo
        })

        return { success: true, user: user.value }
      } else {
        // Handle failed login
        await handleFailedLogin(credentials.username)
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      logSecurityEvent('LOGIN_FAILED', {
        username: credentials.username,
        error: error.message,
        deviceInfo: getDeviceInfo()
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  // Logout with security cleanup
  const logout = async () => {
    try {
      if (token.value) {
        // Notify server of logout
        await api.post('/auth/logout').catch(() => {
          // Continue with local cleanup even if server call fails
        })

        logSecurityEvent('LOGOUT', {
          userId: user.value?.id,
          sessionDuration: Date.now() - lastActivity.value
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear authentication state
      token.value = null
      user.value = null

      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')

      // Clear session timers
      clearSessionTimers()

      // Redirect to login
      router.push('/auth/login')
    }
  }

  // Handle failed login with lockout mechanism
  const handleFailedLogin = async (username) => {
    loginAttempts.value++

    if (loginAttempts.value >= 5) {
      // Lock account for 30 minutes
      lockoutUntil.value = Date.now() + (30 * 60 * 1000)

      logSecurityEvent('ACCOUNT_LOCKED', {
        username,
        attempts: loginAttempts.value,
        lockoutDuration: 30 * 60 * 1000
      })

      throw new Error('Account locked due to too many failed attempts. Try again in 30 minutes.')
    }

    logSecurityEvent('LOGIN_ATTEMPT_FAILED', {
      username,
      attempt: loginAttempts.value,
      remainingAttempts: 5 - loginAttempts.value
    })
  }

  // Session management
  const startSessionManagement = () => {
    clearSessionTimers()

    // Set warning timer (5 minutes before expiry)
    warningTimer.value = setTimeout(() => {
      showSessionWarning()
    }, sessionTimeout.value - warningTimeout.value)

    // Set session expiry timer
    sessionTimer.value = setTimeout(() => {
      handleSessionExpiry()
    }, sessionTimeout.value)

    // Activity monitoring
    setupActivityMonitoring()
  }

  const clearSessionTimers = () => {
    if (sessionTimer.value) {
      clearTimeout(sessionTimer.value)
      sessionTimer.value = null
    }
    if (warningTimer.value) {
      clearTimeout(warningTimer.value)
      warningTimer.value = null
    }
    removeActivityMonitoring()
  }

  const setupActivityMonitoring = () => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'click', 'touchstart']

    const updateActivity = () => {
      updateLastActivity()
      // Reset session timer on activity
      resetSessionTimer()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })
  }

  const removeActivityMonitoring = () => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'click', 'touchstart']

    activityEvents.forEach(event => {
      document.removeEventListener(event, updateLastActivity, true)
    })
  }

  const updateLastActivity = () => {
    lastActivity.value = Date.now()
  }

  const resetSessionTimer = () => {
    clearSessionTimers()
    startSessionManagement()
  }

  const showSessionWarning = () => {
    // Show session expiry warning
    const warning = confirm('Your session will expire in 5 minutes. Click OK to extend your session.')

    if (warning) {
      resetSessionTimer()
    } else {
      // Log out user
      logout()
    }
  }

  const handleSessionExpiry = async () => {
    logSecurityEvent('SESSION_EXPIRED', {
      userId: user.value?.id,
      lastActivity: lastActivity.value,
      sessionDuration: Date.now() - lastActivity.value
    })

    await logout()
  }

  // Security utilities
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return 'unknown'
    }
  }

  const logSecurityEvent = (eventType, details) => {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      details,
      userId: user.value?.id,
      sessionId: getSessionId()
    }

    console.log('SECURITY EVENT:', event)

    // Send to server for audit logging
    api.post('/audit/log', event).catch(() => {
      // Log locally if server logging fails
      localStorage.setItem(`security_event_${Date.now()}`, JSON.stringify(event))
    })
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = generateSessionId()
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  // Password management
  const changePassword = async (oldPassword, newPassword) => {
    try {
      loading.value = true

      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword: newPassword
      })

      if (response.success) {
        logSecurityEvent('PASSWORD_CHANGED', {
          userId: user.value.id,
          timestamp: Date.now()
        })
        return { success: true }
      } else {
        throw new Error(response.message || 'Password change failed')
      }
    } catch (error) {
      logSecurityEvent('PASSWORD_CHANGE_FAILED', {
        userId: user.value?.id,
        error: error.message
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post('/auth/request-password-reset', { email })

      if (response.success) {
        logSecurityEvent('PASSWORD_RESET_REQUESTED', { email })
        return { success: true }
      } else {
        throw new Error(response.message || 'Password reset request failed')
      }
    } catch (error) {
      logSecurityEvent('PASSWORD_RESET_REQUEST_FAILED', {
        email,
        error: error.message
      })
      throw error
    }
  }

  // Token refresh
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token')

      if (response.success) {
        token.value = response.data.token
        localStorage.setItem('auth_token', token.value)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      return false
    }
  }

  return {
    // State
    token: readonly(token),
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    isLocked,
    remainingLockoutTime,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Methods
    initializeAuth,
    login,
    logout,
    changePassword,
    requestPasswordReset,
    refreshToken,
    updateLastActivity,
    resetSessionTimer
  }
}

// Role-based permissions
const GUEST_PERMISSIONS = [
  'VIEW_LOGIN',
  'VIEW_PUBLIC_PAGES'
]

const EMPLOYEE_PERMISSIONS = [
  'VIEW_ATTENDANCE',
  'CLOCK_IN',
  'CLOCK_OUT',
  'VIEW_OWN_ATTENDANCE',
  'MANAGE_OWN_PROFILE',
  'VIEW_DASHBOARD'
]

const MANAGER_PERMISSIONS = [
  ...EMPLOYEE_PERMISSIONS,
  'VIEW_TEAM_ATTENDANCE',
  'APPROVE_ATTENDANCE',
  'VIEW_TEAM_DASHBOARD',
  'GENERATE_TEAM_REPORTS',
  'MANAGE_TEAM_MEMBERS'
]

const HR_PERMISSIONS = [
  ...MANAGER_PERMISSIONS,
  'MANAGE_EMPLOYEES',
  'VIEW_ALL_ATTENDANCE',
  'GENERATE_REPORTS',
  'MANAGE_BIOMETRICS',
  'VIEW_SYSTEM_LOGS',
  'MANAGE_USER_ROLES'
]

const ADMIN_PERMISSIONS = [
  ...HR_PERMISSIONS,
  'MANAGE_SYSTEM',
  'VIEW_ADMIN_PANEL',
  'MANAGE_SECURITY',
  'SYSTEM_BACKUP',
  'SYSTEM_CONFIGURATION',
  'VIEW_AUDIT_LOGS',
  'MANAGE_DATABASE'
]

export const ROLE_PERMISSIONS = {
  GUEST: GUEST_PERMISSIONS,
  EMPLOYEE: EMPLOYEE_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  HR: HR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS
}

export default useAuth