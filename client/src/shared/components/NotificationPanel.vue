<template>
  <div class="notification-panel" :class="{ 'is-open': isOpen }">
    <div class="panel-header">
      <h5>
        <i class="bi bi-bell"></i>
        Notifications
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </h5>
      <div class="panel-actions">
        <button
          v-if="notifications.length > 0"
          class="btn btn-sm btn-outline-secondary"
          @click="markAllAsRead"
          title="Mark all as read"
        >
          <i class="bi bi-check2"></i>
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="closePanel"
          title="Close notifications"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <div class="panel-content">
      <div v-if="notifications.length === 0" class="empty-state">
        <i class="bi bi-bell-slash"></i>
        <p>No notifications</p>
      </div>

      <div v-else class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="[`notification-${notification.type}`, { 'is-read': notification.read }]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <p class="notification-message">{{ notification.message }}</p>
            <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
          </div>
          <div class="notification-actions">
            <button
              v-if="!notification.read"
              class="btn btn-sm btn-link"
              @click.stop="markAsRead(notification.id)"
              title="Mark as read"
            >
              <i class="bi bi-check"></i>
            </button>
            <button
              class="btn btn-sm btn-link"
              @click.stop="removeNotification(notification.id)"
              title="Remove notification"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'NotificationPanel',
  props: {
    notifications: {
      type: Array,
      default: () => []
    }
  },
  emits: ['mark-read', 'mark-all-read', 'remove'],
  setup(props, { emit }) {
    const isOpen = ref(false)

    const unreadCount = computed(() => {
      return props.notifications.filter(n => !n.read).length
    })

    const toggle = () => {
      isOpen.value = !isOpen.value
    }

    const closePanel = () => {
      isOpen.value = false
    }

    const show = () => {
      isOpen.value = true
    }

    const hide = () => {
      isOpen.value = false
    }

    const markAsRead = (id) => {
      emit('mark-read', id)
    }

    const markAllAsRead = () => {
      emit('mark-all-read')
    }

    const removeNotification = (id) => {
      emit('remove', id)
    }

    const handleNotificationClick = (notification) => {
      if (!notification.read) {
        markAsRead(notification.id)
      }

      // Handle notification action if present
      if (notification.action) {
        notification.action()
      }
    }

    const getNotificationIcon = (type) => {
      const icons = {
        success: 'bi bi-check-circle-fill',
        error: 'bi bi-x-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        info: 'bi bi-info-circle-fill'
      }
      return icons[type] || icons.info
    }

    const formatTime = (timestamp) => {
      const now = Date.now()
      const diff = now - timestamp

      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (seconds < 60) {
        return 'Just now'
      } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else {
        return `${days} day${days > 1 ? 's' : ''} ago`
      }
    }

    return {
      isOpen,
      unreadCount,
      toggle,
      closePanel,
      show,
      hide,
      markAsRead,
      markAllAsRead,
      removeNotification,
      handleNotificationClick,
      getNotificationIcon,
      formatTime
    }
  }
}
</script>

<style scoped>
.notification-panel {
  position: fixed;
  top: 0;
  right: -400px;
  bottom: 0;
  width: 400px;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1040;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.notification-panel.is-open {
  right: 0;
}

.panel-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.panel-header h5 {
  margin: 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: #dc3545;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  font-weight: 600;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.notification-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f8f9fa;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.is-read {
  opacity: 0.6;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-top: 2px;
}

.notification-success .notification-icon {
  background: #d4edda;
  color: #28a745;
}

.notification-error .notification-icon {
  background: #f8d7da;
  color: #dc3545;
}

.notification-warning .notification-icon {
  background: #fff3cd;
  color: #ffc107;
}

.notification-info .notification-icon {
  background: #d1ecf1;
  color: #17a2b8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0 0 4px 0;
  color: #495057;
  font-size: 0.875rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #6c757d;
}

.notification-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.btn {
  background: none;
  border: none;
  padding: 2px;
  font-size: 0.75rem;
  cursor: pointer;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
}

.btn:hover {
  color: #495057;
}

.btn-link {
  text-decoration: none;
}

.btn-sm {
  padding: 2px 6px;
  font-size: 0.75rem;
}

.btn-outline-secondary {
  border: 1px solid #ced4da;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background: #e9ecef;
  color: #495057;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-panel {
    width: 320px;
    right: -320px;
  }
}

@media (max-width: 480px) {
  .notification-panel {
    width: 280px;
    right: -280px;
  }
}
</style>