<template>
  <div class="forgot-password-view">
    <div class="forgot-password-container">
      <div class="forgot-password-form-container">
        <div class="back-button">
          <router-link to="/login" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i>
            Back to Login
          </router-link>
        </div>

        <div class="forgot-password-header">
          <div class="icon-section">
            <div class="icon-circle">
              <i class="bi bi-key-fill"></i>
            </div>
          </div>
          <h2 class="title">Forgot Password?</h2>
          <p class="subtitle">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="forgot-password-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="Enter your email address"
              required
              autocomplete="email"
            />
            <div class="invalid-feedback" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">
              <i class="bi bi-hourglass-split animate-spin"></i>
              Sending...
            </span>
            <span v-else>Send Reset Instructions</span>
          </button>
        </form>

        <div class="security-notice">
          <div class="notice-content">
            <i class="bi bi-shield-check text-success"></i>
            <div>
              <strong>Security Notice:</strong>
              <p>
                We will never ask for your password via email. The reset link will expire after 24 hours for your security.
              </p>
            </div>
          </div>
        </div>

        <div class="alternative-options">
          <p>Don't have access to your email?</p>
          <router-link to="/help" class="help-link">
            <i class="bi bi-question-circle"></i>
            Contact IT Support
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const router = useRouter()
    const { requestPasswordReset } = useAuth()
    const { addNotification } = useNotifications()

    const loading = ref(false)

    const form = ref({
      email: ''
    })

    const errors = ref({
      email: ''
    })

    const isFormValid = computed(() => {
      return form.value.email && !Object.values(errors.value).some(Boolean)
    })

    const validateForm = () => {
      errors.value = { email: '' }

      if (!form.value.email) {
        errors.value.email = 'Email is required'
        return false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email address'
        return false
      }

      return true
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        await requestPasswordReset(form.value.email)

        addNotification({
          type: 'success',
          message: 'Password reset instructions have been sent to your email address.',
          duration: 10000
        })

        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)

      } catch (error) {
        if (error.message.includes('email')) {
          errors.value.email = error.message
        } else {
          addNotification({
            type: 'error',
            message: error.message || 'Failed to send reset instructions. Please try again.',
            duration: 5000
          })
        }
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      form,
      errors,
      isFormValid,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.forgot-password-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.forgot-password-container {
  width: 100%;
  max-width: 450px;
}

.forgot-password-form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  border: 1px solid #e9ecef;
}

.back-button {
  margin-bottom: 24px;
}

.btn-outline-secondary {
  background: white;
  color: #6c757d;
  border: 1px solid #ced4da;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-outline-secondary:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon-section {
  margin-bottom: 20px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 12px 0;
}

.subtitle {
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.forgot-password-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-control.is-invalid {
  border-color: #dc3545;
  background: #fff5f5;
}

.invalid-feedback {
  display: block;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #dc3545;
}

.btn {
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-block {
  display: block;
  width: 100%;
}

.security-notice {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.notice-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notice-content i {
  font-size: 1.25rem;
  margin-top: 2px;
}

.notice-content strong {
  color: #0c5460;
  display: block;
  margin-bottom: 4px;
}

.notice-content p {
  color: #0c5460;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.alternative-options {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.alternative-options p {
  color: #6c757d;
  margin: 0 0 12px 0;
  font-size: 0.875rem;
}

.help-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.help-link:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

.text-success {
  color: #28a745 !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive design */
@media (max-width: 480px) {
  .forgot-password-view {
    padding: 16px;
  }

  .forgot-password-form-container {
    padding: 24px;
  }

  .title {
    font-size: 1.5rem;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
}
</style>