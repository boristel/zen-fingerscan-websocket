<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="bi bi-exclamation-triangle text-warning"></i>
          Session Expiring
        </h3>
      </div>
      <div class="modal-body">
        <div class="warning-content">
          <p class="warning-message">
            Your session will expire in <strong>{{ formatTime(remainingTime) }}</strong>
          </p>
          <p class="action-prompt">
            Would you like to extend your session?
          </p>
          <div class="timer-display">
            <div class="timer-circle" :style="{ '--progress': progress }">
              <div class="timer-text">{{ formatTime(remainingTime) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          Logout
        </button>
        <button type="button" class="btn btn-primary" @click="extendSession">
          <i class="bi bi-arrow-clockwise"></i>
          Extend Session
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'

export default {
  name: 'SessionWarningModal',
  emits: ['extend', 'logout'],
  setup(props, { emit }) {
    const isVisible = ref(false)
    const remainingTime = ref(300) // 5 minutes in seconds
    const totalTime = ref(300)

    let timerInterval = null

    const progress = computed(() => {
      return ((totalTime.value - remainingTime.value) / totalTime.value) * 100
    })

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const startTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }

      timerInterval = setInterval(() => {
        remainingTime.value--

        if (remainingTime.value <= 0) {
          clearInterval(timerInterval)
          logout()
        }
      }, 1000)
    }

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }

    const show = (initialTime = 300) => {
      remainingTime.value = initialTime
      totalTime.value = initialTime
      isVisible.value = true
      startTimer()
    }

    const hide = () => {
      isVisible.value = false
      stopTimer()
    }

    const extendSession = () => {
      stopTimer()
      remainingTime.value = 300 // Reset to 5 minutes
      startTimer()
      emit('extend')
    }

    const logout = () => {
      hide()
      emit('logout')
    }

    onUnmounted(() => {
      stopTimer()
    })

    return {
      isVisible,
      remainingTime,
      progress,
      formatTime,
      show,
      hide,
      extendSession,
      logout
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
  background: rgba(0, 0, 0, 0.7);
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
  border: 1px solid #ffc107;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-warning {
  color: #ffc107;
}

.modal-body {
  padding: 24px;
}

.warning-content {
  text-align: center;
}

.warning-message {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  color: #495057;
  line-height: 1.5;
}

.action-prompt {
  margin: 0 0 24px 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.timer-display {
  margin: 24px 0;
}

.timer-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  background: conic-gradient(
    #ffc107 0deg,
    #ffc107 var(--progress, 0deg),
    #e9ecef var(--progress, 0deg),
    #e9ecef 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.timer-circle::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
}

.timer-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #495057;
  position: relative;
  z-index: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  justify-content: center;
}

.btn-outline-secondary {
  background: white;
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-primary:hover {
  background: #5a6fd8;
  color: white;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.timer-text {
  animation: pulse 1s ease-in-out infinite;
}
</style>