<template>
  <div class="modal-overlay" v-if="isVisible" @click="cancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button type="button" class="btn-close" @click="cancel">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="confirmation-content">
          <div class="icon-container" :class="iconType">
            <i :class="icon"></i>
          </div>
          <p class="message">{{ message }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn"
          :class="cancelClass"
          @click="cancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="btn"
          :class="confirmClass"
          @click="confirm"
          :disabled="loading"
        >
          <span v-if="loading">
            <i class="bi bi-hourglass-split animate-spin"></i>
            Processing...
          </span>
          <span v-else>{{ confirmText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ConfirmationModal',
  emits: ['close', 'confirm', 'cancel'],
  setup(props, { emit }) {
    const isVisible = ref(false)
    const loading = ref(false)
    const title = ref('')
    const message = ref('')
    const confirmText = ref('Confirm')
    const cancelText = ref('Cancel')
    const confirmClass = ref('btn-primary')
    const cancelClass = ref('btn-secondary')
    const type = ref('warning')

    const iconType = computed(() => {
      switch (type.value) {
        case 'danger':
          return 'danger'
        case 'success':
          return 'success'
        case 'info':
          return 'info'
        case 'warning':
        default:
          return 'warning'
      }
    })

    const icon = computed(() => {
      switch (type.value) {
        case 'danger':
          return 'bi bi-exclamation-triangle-fill'
        case 'success':
          return 'bi bi-check-circle-fill'
        case 'info':
          return 'bi bi-info-circle-fill'
        case 'warning':
        default:
          return 'bi bi-question-circle-fill'
      }
    })

    const show = (options = {}) => {
      isVisible.value = true
      title.value = options.title || 'Confirm Action'
      message.value = options.message || 'Are you sure you want to proceed?'
      confirmText.value = options.confirmText || 'Confirm'
      cancelText.value = options.cancelText || 'Cancel'
      type.value = options.type || 'warning'

      // Set button classes based on type
      if (options.type === 'danger') {
        confirmClass.value = 'btn-danger'
      } else if (options.type === 'success') {
        confirmClass.value = 'btn-success'
      } else if (options.type === 'info') {
        confirmClass.value = 'btn-info'
      } else {
        confirmClass.value = 'btn-primary'
      }

      // Show loading spinner for long operations
      loading.value = false
    }

    const hide = () => {
      isVisible.value = false
      loading.value = false
    }

    const confirm = async () => {
      loading.value = true
      try {
        await emit('confirm')
        hide()
      } catch (error) {
        loading.value = false
      }
    }

    const cancel = () => {
      hide()
      emit('cancel')
    }

    return {
      isVisible,
      loading,
      title,
      message,
      confirmText,
      cancelText,
      confirmClass,
      cancelClass,
      iconType,
      icon,
      show,
      hide,
      confirm,
      cancel
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 24px;
}

.confirmation-content {
  text-align: center;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 1.5rem;
}

.icon-container.warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.icon-container.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.icon-container.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.icon-container.info {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.message {
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-info {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>