/**
 * Notifications Composable
 * Centralized notification management system
 */

import { ref, readonly } from 'vue'

const notifications = ref([])
const notificationId = ref(0)

export function useNotifications() {

  const showNotification = (message, type = 'info', options = {}) => {
    const id = ++notificationId.value

    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timeout: options.timeout || 5000,
      persistent: options.persistent || false,
      action: options.action || null,
      timestamp: Date.now()
    }

    notifications.value.unshift(notification)

    if (!notification.persistent && notification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.timeout)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const showError = (message, options = {}) => {
    return showNotification(message, 'error', { ...options, timeout: 8000 })
  }

  const showSuccess = (message, options = {}) => {
    return showNotification(message, 'success', options)
  }

  const showWarning = (message, options = {}) => {
    return showNotification(message, 'warning', { ...options, timeout: 7000 })
  }

  const showInfo = (message, options = {}) => {
    return showNotification(message, 'info', options)
  }

  return {
    notifications: readonly(notifications),
    showNotification,
    removeNotification,
    clearNotifications,
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}

export default useNotifications