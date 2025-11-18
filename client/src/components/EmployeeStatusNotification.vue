<template>
  <transition name="notification-slide">
    <div v-if="notification" class="employee-status-notification" :class="notification.type">
      <div class="notification-content">
        <div class="notification-icon">
          <i class="bi" :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-text">
          <h6>{{ notification.title }}</h6>
          <p>{{ notification.message }}</p>
          <small v-if="notification.employee" class="text-muted">
            Employee ID: {{ notification.employee.idkaryawan }} |
            Department: {{ notification.employee.departemen || 'N/A' }}
          </small>
        </div>
        <button @click="closeNotification" class="notification-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Action Buttons for Inactive Employees -->
      <div v-if="notification.type === 'warning' && notification.employee" class="notification-actions">
        <button @click="proceedAnyway" class="btn btn-warning btn-sm me-2">
          <i class="bi bi-exclamation-triangle"></i>
          Proceed Anyway
        </button>
        <button @click="selectAnotherEmployee" class="btn btn-secondary btn-sm">
          <i class="bi bi-person-x"></i>
          Select Another Employee
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'EmployeeStatusNotification',
  emits: ['close-notification', 'proceed-anyway', 'select-another'],
  setup(props, { emit }) {
    const notification = ref(null)

    const showNotification = (employee, status) => {
      if (status === 'N') {
        notification.value = {
          type: 'warning',
          title: '⚠️ Inactive Employee Alert',
          message: `This employee is currently INACTIVE and cannot register fingerprints. Please verify the employee status or contact HR to activate this employee.`,
          employee: employee,
          autoHide: false // Don't auto-hide for inactive employees
        }
      } else if (status === 'Y') {
        notification.value = {
          type: 'success',
          title: '✅ Active Employee Confirmed',
          message: `This employee is ACTIVE and eligible for fingerprint registration.`,
          employee: employee,
          autoHide: true // Auto-hide for active employees
        }
      }
    }

    const showCustomNotification = (title, message, type = 'info', autoHide = true) => {
      notification.value = {
        type: type,
        title: title,
        message: message,
        autoHide: autoHide
      }
    }

    const closeNotification = () => {
      notification.value = null
      emit('close-notification')
    }

    const proceedAnyway = () => {
      notification.value = null
      emit('proceed-anyway')
    }

    const selectAnotherEmployee = () => {
      notification.value = null
      emit('select-another')
    }

    const getNotificationIcon = (type) => {
      const icons = {
        'success': 'bi-check-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'danger': 'bi-x-circle-fill',
        'info': 'bi-info-circle-fill'
      }
      return icons[type] || icons.info
    }

    return {
      notification,
      showNotification,
      showCustomNotification,
      closeNotification,
      proceedAnyway,
      selectAnotherEmployee,
      getNotificationIcon
    }
  }
}
</script>

<style scoped>
.employee-status-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 450px;
  min-width: 350px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 15px;
}

.notification-icon {
  font-size: 24px;
  min-width: 30px;
  text-align: center;
  margin-top: 2px;
}

.notification-text {
  flex: 1;
}

.notification-text h6 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.notification-text p {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.notification-close {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: rgba(255, 255, 255, 0.8);
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.notification-actions {
  background: rgba(0, 0, 0, 0.05);
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Notification Type Styles */
.employee-status-notification.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.employee-status-notification.warning {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  color: #212529;
}

.employee-status-notification.danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.employee-status-notification.info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

/* Override button styles for warning notification */
.employee-status-notification.warning .notification-close {
  color: rgba(33, 37, 41, 0.8);
}

.employee-status-notification.warning .notification-close:hover {
  background-color: rgba(33, 37, 41, 0.1);
  color: #212529;
}

/* Animations */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s ease;
}

.notification-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Pulse animation for warning */
@keyframes pulse {
  0% {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 10px 30px rgba(255, 193, 7, 0.4);
  }
  100% {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
}

.employee-status-notification.warning {
  animation: slideIn 0.3s ease-out, pulse 2s infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .employee-status-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
  }

  .notification-content {
    padding: 15px;
    gap: 12px;
  }

  .notification-icon {
    font-size: 20px;
  }

  .notification-text h6 {
    font-size: 15px;
  }

  .notification-text p {
    font-size: 13px;
  }

  .notification-actions {
    padding: 12px 15px;
    flex-direction: column;
    gap: 8px;
  }

  .notification-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .employee-status-notification.success,
  .employee-status-notification.danger,
  .employee-status-notification.info {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }

  .employee-status-notification.warning {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  }
}

/* Print styles */
@media print {
  .employee-status-notification {
    display: none !important;
  }
}
</style>