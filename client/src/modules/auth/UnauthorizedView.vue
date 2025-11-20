<template>
  <div class="unauthorized-view">
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="icon-section">
          <div class="icon-circle error">
            <i class="bi bi-shield-exclamation"></i>
          </div>
        </div>

        <h1 class="error-code">403</h1>
        <h2 class="error-title">Access Denied</h2>
        <p class="error-message">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div class="error-details" v-if="errorDetails">
          <div class="detail-item">
            <strong>Required Permission:</strong>
            <span>{{ errorDetails.requiredPermission }}</span>
          </div>
          <div class="detail-item">
            <strong>Your Role:</strong>
            <span>{{ errorDetails.userRole }}</span>
          </div>
          <div class="detail-item">
            <strong>Attempted Access:</strong>
            <span>{{ formatDate(errorDetails.timestamp) }}</span>
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
          <button @click="logout" class="btn btn-outline-danger">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>

        <div class="help-section">
          <h4>
            <i class="bi bi-question-circle"></i>
            Need Help?
          </h4>
          <p>If you need access to this page, please:</p>
          <ul>
            <li>Contact your system administrator</li>
            <li>Check if your account has the correct role</li>
            <li>Verify you're logged in with the correct account</li>
          </ul>

          <div class="contact-info">
            <p>
              <strong>IT Support:</strong>
              <a href="mailto:it-support@company.com">it-support@company.com</a>
            </p>
            <p>
              <strong>Help Desk:</strong>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'UnauthorizedView',
  setup() {
    const router = useRouter()
    const { logout: authLogout, user } = useAuth()
    const { addNotification } = useNotifications()

    const errorDetails = ref(null)

    const goBack = () => {
      router.go(-1)
    }

    const logout = async () => {
      try {
        await authLogout()
        addNotification({
          type: 'info',
          message: 'You have been logged out successfully.',
          duration: 3000
        })
        router.push('/login')
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to logout. Please try again.',
          duration: 3000
        })
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        return new Date(dateString).toLocaleString()
      } catch (error) {
        return 'Invalid date'
      }
    }

    onMounted(() => {
      // Extract error details from route query or state
      const route = useRoute()
      if (route.query.error) {
        try {
          errorDetails.value = JSON.parse(atob(route.query.error))
        } catch (error) {
          console.error('Failed to parse error details:', error)
        }
      }

      // Log unauthorized access attempt
      if (user.value) {
        console.warn(`Unauthorized access attempt by user: ${user.value.email} at ${new Date().toISOString()}`)
      }
    })

    return {
      errorDetails,
      goBack,
      logout,
      formatDate
    }
  }
}
</script>

<style scoped>
.unauthorized-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.unauthorized-container {
  width: 100%;
  max-width: 600px;
}

.unauthorized-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.icon-section {
  margin-bottom: 24px;
}

.icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 3rem;
  color: white;
}

.icon-circle.error {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.error-code {
  font-size: 4rem;
  font-weight: 700;
  color: #dc3545;
  margin: 0 0 16px 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 16px 0;
}

.error-message {
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
  border-radius: 8px;
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

.btn-outline-danger {
  background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
}

.help-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  text-align: left;
}

.help-section h4 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-section p {
  color: #6c757d;
  margin-bottom: 12px;
  line-height: 1.6;
}

.help-section ul {
  margin: 0 0 20px 0;
  padding-left: 20px;
  color: #6c757d;
}

.help-section li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.contact-info {
  border-top: 1px solid #e9ecef;
  padding-top: 16px;
}

.contact-info p {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
}

.contact-info a {
  color: #667eea;
  text-decoration: none;
}

.contact-info a:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .unauthorized-view {
    padding: 16px;
  }

  .unauthorized-content {
    padding: 24px;
  }

  .error-code {
    font-size: 3rem;
  }

  .error-title {
    font-size: 1.5rem;
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
}

@media (max-width: 480px) {
  .icon-circle {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .error-code {
    font-size: 2.5rem;
  }

  .error-message {
    font-size: 1rem;
  }
}
</style>