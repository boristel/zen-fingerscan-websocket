<template>
  <div class="server-error-view">
    <div class="server-error-container">
      <div class="server-error-content">
        <div class="error-illustration">
          <div class="error-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
        </div>

        <h1 class="error-title">Server Error</h1>
        <h2 class="error-code">500</h2>
        <p class="error-description">
          Something went wrong on our end! Our team has been notified and is working to fix the issue.
          Please try again in a few minutes.
        </p>

        <div class="error-details" v-if="errorDetails">
          <div class="detail-item">
            <strong>Error ID:</strong>
            <span>{{ errorDetails.errorId }}</span>
          </div>
          <div class="detail-item">
            <strong>Timestamp:</strong>
            <span>{{ currentDateTime }}</span>
          </div>
          <div class="detail-item">
            <strong>URL:</strong>
            <span class="error-url">{{ errorDetails.url }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="refreshPage" class="btn btn-primary">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh Page
          </button>
          <router-link to="/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-speedometer2"></i>
            Go to Dashboard
          </router-link>
          <button @click="reportIssue" class="btn btn-outline-primary">
            <i class="bi bi-bug"></i>
            Report Issue
          </button>
        </div>

        <div class="status-section">
          <h4>
            <i class="bi bi-info-circle"></i>
            System Status
          </h4>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-indicator online">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="status-info">
                <strong>Database</strong>
                <span>Operational</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-indicator warning">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div class="status-info">
                <strong>API Services</strong>
                <span>Degraded Performance</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-indicator online">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="status-info">
                <strong>Authentication</strong>
                <span>Operational</span>
              </div>
            </div>
          </div>
        </div>

        <div class="troubleshooting-section">
          <h4>
            <i class="bi bi-tools"></i>
            Troubleshooting Steps
          </h4>
          <div class="troubleshooting-list">
            <div class="troubleshooting-item">
              <span class="step-number">1</span>
              <div class="step-content">
                <strong>Refresh the page</strong>
                <p>Sometimes a simple refresh can resolve temporary issues.</p>
              </div>
            </div>
            <div class="troubleshooting-item">
              <span class="step-number">2</span>
              <div class="step-content">
                <strong>Check your internet connection</strong>
                <p>Ensure you have a stable internet connection.</p>
              </div>
            </div>
            <div class="troubleshooting-item">
              <span class="step-number">3</span>
              <div class="step-content">
                <strong>Clear browser cache</strong>
                <p>Clear your browser's cache and cookies, then try again.</p>
              </div>
            </div>
            <div class="troubleshooting-item">
              <span class="step-number">4</span>
              <div class="step-content">
                <strong>Try a different browser</strong>
                <p>If the issue persists, try accessing the site from a different browser.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="contact-section">
          <div class="contact-info">
            <h4>
              <i class="bi bi-headset"></i>
              Need Immediate Help?
            </h4>
            <div class="contact-methods">
              <div class="contact-method">
                <i class="bi bi-telephone-fill"></i>
                <div>
                  <strong>IT Support</strong>
                  <span>+1 (234) 567-8900</span>
                </div>
              </div>
              <div class="contact-method">
                <i class="bi bi-envelope-fill"></i>
                <div>
                  <strong>Email Support</strong>
                  <span>it-support@company.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="auto-refresh" v-if="autoRefreshEnabled">
          <div class="refresh-info">
            <i class="bi bi-arrow-clockwise animate-spin"></i>
            <span>Auto-refreshing in {{ countdown }} seconds...</span>
            <button @click="cancelAutoRefresh" class="btn btn-sm btn-link">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'ServerErrorView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { addNotification } = useNotifications()

    const currentDateTime = ref('')
    const errorDetails = ref(null)
    const autoRefreshEnabled = ref(true)
    const countdown = ref(30)
    let refreshInterval = null

    const refreshPage = () => {
      window.location.reload()
    }

    const reportIssue = () => {
      addNotification({
        type: 'info',
        message: 'Issue report form would open here. For now, please contact IT support directly.',
        duration: 5000
      })
    }

    const cancelAutoRefresh = () => {
      autoRefreshEnabled.value = false
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }

    const startCountdown = () => {
      refreshInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          refreshPage()
        }
      }, 1000)
    }

    onMounted(() => {
      // Set current date and time
      currentDateTime.value = new Date().toLocaleString()

      // Extract error details from route query if available
      if (route.query.error) {
        try {
          errorDetails.value = JSON.parse(atob(route.query.error))
        } catch (error) {
          console.error('Failed to parse error details:', error)
        }
      }

      // Generate error details if not provided
      if (!errorDetails.value) {
        errorDetails.value = {
          errorId: `ERR-${Date.now()}`,
          url: window.location.href
        }
      }

      // Start auto-refresh countdown
      startCountdown()
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      currentDateTime,
      errorDetails,
      autoRefreshEnabled,
      countdown,
      refreshPage,
      reportIssue,
      cancelAutoRefresh
    }
  }
}
</script>

<style scoped>
.server-error-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.server-error-container {
  width: 100%;
  max-width: 700px;
}

.server-error-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.error-illustration {
  margin-bottom: 24px;
}

.error-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 3rem;
  box-shadow: 0 8px 24px rgba(220, 53, 69, 0.3);
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #dc3545;
  margin: 0 0 8px 0;
}

.error-code {
  font-size: 4rem;
  font-weight: 900;
  color: #e9ecef;
  margin: 0 0 24px 0;
  line-height: 1;
}

.error-description {
  color: #6c757d;
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.error-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  color: #495057;
}

.detail-item span {
  color: #6c757d;
  font-weight: 500;
}

.error-url {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  word-break: break-all;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-outline-secondary {
  background: white;
  color: #6c757d;
  border: 1px solid #ced4da;
  text-decoration: none;
}

.btn-outline-secondary:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}

.btn-outline-primary {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  text-decoration: none;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

.btn-link {
  background: none;
  border: none;
  color: #6c757d;
  text-decoration: underline;
  padding: 4px 8px;
  min-width: auto;
}

.btn-link:hover {
  color: #495057;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.status-section, .troubleshooting-section, .contact-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: left;
}

.status-section h4, .troubleshooting-section h4, .contact-section h4 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-grid {
  display: grid;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.status-indicator.online {
  background: #28a745;
}

.status-indicator.warning {
  background: #ffc107;
  color: #212529;
}

.status-info {
  flex: 1;
}

.status-info strong {
  display: block;
  color: #495057;
  font-size: 0.875rem;
}

.status-info span {
  color: #6c757d;
  font-size: 0.75rem;
}

.troubleshooting-list {
  display: grid;
  gap: 16px;
}

.troubleshooting-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content strong {
  display: block;
  color: #495057;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.step-content p {
  color: #6c757d;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
}

.contact-methods {
  display: grid;
  gap: 16px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-method i {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.contact-method div {
  text-align: left;
}

.contact-method strong {
  display: block;
  color: #495057;
  font-size: 0.875rem;
}

.contact-method span {
  color: #6c757d;
  font-size: 0.75rem;
}

.auto-refresh {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 12px;
  margin-top: 24px;
}

.refresh-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #0c5460;
  font-size: 0.875rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive design */
@media (max-width: 768px) {
  .server-error-view {
    padding: 16px;
  }

  .server-error-content {
    padding: 24px;
  }

  .error-title {
    font-size: 1.75rem;
  }

  .error-code {
    font-size: 3rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .troubleshooting-item {
    align-items: center;
  }

  .step-content {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .error-icon {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .status-section, .troubleshooting-section, .contact-section {
    padding: 16px;
  }
}
</style>