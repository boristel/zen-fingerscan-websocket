/**
 * Session Management Composable
 * Handles user session management, timeouts, and warnings
 */

import { ref, computed, watch, readonly } from 'vue'

const sessionStartTime = ref(Date.now())
const lastActivity = ref(Date.now())
const sessionTimeout = ref(30 * 60 * 1000) // 30 minutes
const warningTimeout = ref(5 * 60 * 1000) // 5 minutes before expiry
const showWarning = ref(false)
const sessionTimer = ref(null)
const warningTimer = ref(null)

export function useSession() {

  const remainingSessionTime = computed(() => {
    const elapsed = Date.now() - sessionStartTime.value
    const remaining = sessionTimeout.value - elapsed
    return Math.max(0, Math.floor(remaining / 1000))
  })

  const sessionExpired = computed(() => {
    return remainingSessionTime.value <= 0
  })

  const shouldShowWarning = computed(() => {
    return remainingSessionTime.value > 0 && remainingSessionTime.value <= (warningTimeout.value / 1000)
  })

  const updateActivity = () => {
    lastActivity.value = Date.now()

    // Reset timers
    clearSessionTimers()
    startSessionManagement()
  }

  const extendSession = async () => {
    try {
      // Call backend to extend session
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        sessionStartTime.value = Date.now()
        showWarning.value = false
        clearSessionTimers()
        startSessionManagement()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to extend session:', error)
      return false
    }
  }

  const startSessionManagement = () => {
    // Clear existing timers
    clearSessionTimers()

    // Set warning timer
    warningTimer.value = setTimeout(() => {
      showWarning.value = true
    }, sessionTimeout.value - warningTimeout.value)

    // Set expiry timer
    sessionTimer.value = setTimeout(() => {
      handleSessionExpiry()
    }, sessionTimeout.value)
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
  }

  const handleSessionExpiry = async () => {
    showWarning.value = false

    // Log out user
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Clear local storage and redirect
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    window.location.href = '/auth/login?reason=session_expired'
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Initialize session management
  const initialize = () => {
    sessionStartTime.value = Date.now()
    lastActivity.value = Date.now()
    startSessionManagement()
  }

  // Clean up on unmount
  const cleanup = () => {
    clearSessionTimers()
  }

  // Watch for session expiry
  watch(sessionExpired, (expired) => {
    if (expired) {
      handleSessionExpiry()
    }
  })

  return {
    sessionStartTime: readonly(sessionStartTime),
    lastActivity: readonly(lastActivity),
    remainingSessionTime,
    sessionExpired,
    shouldShowWarning,
    showWarning,
    updateActivity,
    extendSession,
    formatTime,
    initialize,
    cleanup
  }
}

export default useSession