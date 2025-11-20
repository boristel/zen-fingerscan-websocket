<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-illustration">
          <div class="error-number">404</div>
          <div class="error-icon">
            <i class="bi bi-search"></i>
          </div>
        </div>

        <h1 class="error-title">Page Not Found</h1>
        <p class="error-description">
          Oops! The page you're looking for seems to have vanished into the digital void.
          Let's get you back on track.
        </p>

        <div class="error-details">
          <div class="detail-item">
            <strong>Requested URL:</strong>
            <span>{{ currentUrl }}</span>
          </div>
          <div class="detail-item">
            <strong>Timestamp:</strong>
            <span>{{ currentDateTime }}</span>
          </div>
          <div class="detail-item">
            <strong>User Agent:</strong>
            <span class="user-agent">{{ userAgent }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i>
            Go Back
          </button>
          <router-link to="/dashboard" class="btn btn-primary">
            <i class="bi bi-speedometer2"></i>
            Dashboard
          </router-link>
          <button @click="goHome" class="btn btn-outline-primary">
            <i class="bi bi-house"></i>
            Home
          </button>
        </div>

        <div class="help-section">
          <h4>
            <i class="bi bi-question-circle"></i>
            Looking for something?
          </h4>
          <div class="quick-links">
            <router-link to="/dashboard" class="quick-link">
              <i class="bi bi-speedometer2"></i>
              Dashboard
            </router-link>
            <router-link to="/attendance" class="quick-link">
              <i class="bi bi-fingerprint"></i>
              Attendance
            </router-link>
            <router-link to="/employees" class="quick-link">
              <i class="bi bi-people"></i>
              Employees
            </router-link>
            <router-link to="/reports" class="quick-link">
              <i class="bi bi-file-earmark-bar-graph"></i>
              Reports
            </router-link>
          </div>
        </div>

        <div class="contact-support">
          <p>
            Still can't find what you're looking for?
            <a href="mailto:support@company.com" class="support-link">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'NotFoundView',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const currentUrl = ref('')
    const currentDateTime = ref('')
    const userAgent = ref('')

    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/dashboard')
      }
    }

    const goHome = () => {
      router.push('/dashboard')
    }

    onMounted(() => {
      // Set current URL
      currentUrl.value = window.location.href

      // Set current date and time
      currentDateTime.value = new Date().toLocaleString()

      // Set user agent (truncated for display)
      userAgent.value = navigator.userAgent.substring(0, 60) + '...'
    })

    return {
      currentUrl,
      currentDateTime,
      userAgent,
      goBack,
      goHome
    }
  }
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.not-found-container {
  width: 100%;
  max-width: 600px;
}

.not-found-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.error-illustration {
  position: relative;
  margin-bottom: 32px;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  color: #e9ecef;
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.5;
}

.error-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 4px solid #e9ecef;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 16px 0;
}

.error-description {
  color: #6c757d;
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 500px;
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

.user-agent {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
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
  min-width: 120px;
  justify-content: center;
}

.btn-outline-secondary {
  background: white;
  color: #6c757d;
  border: 1px solid #ced4da;
}

.btn-outline-secondary:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
  text-decoration: none;
}

.btn-primary:hover {
  background: #5a6fd8;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

.help-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.help-section h4 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.quick-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quick-link:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.contact-support {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.contact-support p {
  color: #6c757d;
  margin: 0;
  font-size: 0.875rem;
}

.support-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.support-link:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .not-found-view {
    padding: 16px;
  }

  .not-found-content {
    padding: 24px;
  }

  .error-number {
    font-size: 6rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1rem;
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

  .quick-links {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .error-illustration {
    margin-bottom: 24px;
  }

  .error-number {
    font-size: 4rem;
  }

  .error-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .help-section {
    padding: 16px;
  }
}
</style>