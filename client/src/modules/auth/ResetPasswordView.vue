<template>
  <div class="reset-password-view">
    <div class="reset-password-container">
      <div class="reset-password-form-container">
        <div class="back-button">
          <router-link to="/login" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i>
            Back to Login
          </router-link>
        </div>

        <div class="reset-password-header">
          <div class="icon-section">
            <div class="icon-circle">
              <i class="bi bi-shield-lock-fill"></i>
            </div>
          </div>
          <h2 class="title">Reset Password</h2>
          <p class="subtitle">
            Enter your new password below. Make sure it's strong and secure.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="reset-password-form">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <div class="password-input-container">
              <input
                id="newPassword"
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.newPassword }"
                placeholder="Enter your new password"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="errors.newPassword">
              {{ errors.newPassword }}
            </div>

            <!-- Password Requirements -->
            <div class="password-requirements">
              <small class="text-muted">Password must contain:</small>
              <ul class="requirements-list">
                <li :class="{ 'text-success': passwordRequirements.length }">
                  <i :class="passwordRequirements.length ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                  At least 8 characters
                </li>
                <li :class="{ 'text-success': passwordRequirements.uppercase }">
                  <i :class="passwordRequirements.uppercase ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                  One uppercase letter
                </li>
                <li :class="{ 'text-success': passwordRequirements.lowercase }">
                  <i :class="passwordRequirements.lowercase ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                  One lowercase letter
                </li>
                <li :class="{ 'text-success': passwordRequirements.number }">
                  <i :class="passwordRequirements.number ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                  One number
                </li>
                <li :class="{ 'text-success': passwordRequirements.special }">
                  <i :class="passwordRequirements.special ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                  One special character
                </li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <div class="password-input-container">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                placeholder="Confirm your new password"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <i class="bi bi-check-circle-fill"></i>
            {{ successMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">
              <i class="bi bi-hourglass-split animate-spin"></i>
              Resetting...
            </span>
            <span v-else>Reset Password</span>
          </button>
        </form>

        <div class="security-tips">
          <h4>
            <i class="bi bi-lightbulb text-warning"></i>
            Security Tips
          </h4>
          <ul>
            <li>Use a combination of letters, numbers, and symbols</li>
            <li>Avoid using personal information in your password</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Consider using a password manager</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'ResetPasswordView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { resetPassword } = useAuth()
    const { addNotification } = useNotifications()

    const loading = ref(false)
    const successMessage = ref('')
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const form = ref({
      newPassword: '',
      confirmPassword: ''
    })

    const errors = ref({
      newPassword: '',
      confirmPassword: ''
    })

    const passwordRequirements = computed(() => ({
      length: form.value.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(form.value.newPassword),
      lowercase: /[a-z]/.test(form.value.newPassword),
      number: /\d/.test(form.value.newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(form.value.newPassword)
    }))

    const isFormValid = computed(() => {
      return (
        form.value.newPassword &&
        form.value.confirmPassword &&
        Object.values(passwordRequirements.value).every(Boolean) &&
        form.value.newPassword === form.value.confirmPassword &&
        !Object.values(errors.value).some(Boolean)
      )
    })

    const validateForm = () => {
      errors.value = { newPassword: '', confirmPassword: '' }

      if (!form.value.newPassword) {
        errors.value.newPassword = 'New password is required'
        return false
      }

      if (!Object.values(passwordRequirements.value).every(Boolean)) {
        errors.value.newPassword = 'Password does not meet all requirements'
        return false
      }

      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = 'Please confirm your new password'
        return false
      }

      if (form.value.newPassword !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match'
        return false
      }

      return true
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true
      successMessage.value = ''

      try {
        const token = route.query.token || route.params.token
        if (!token) {
          throw new Error('Invalid or missing reset token')
        }

        await resetPassword(token, form.value.newPassword)

        successMessage.value = 'Password reset successfully! Redirecting to login...'

        addNotification({
          type: 'success',
          message: 'Your password has been reset successfully.',
          duration: 5000
        })

        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login')
        }, 3000)

      } catch (error) {
        if (error.message.includes('token')) {
          addNotification({
            type: 'error',
            message: 'This reset link is invalid or has expired. Please request a new one.',
            duration: 5000
          })
        } else {
          errors.value.newPassword = error.message || 'Failed to reset password. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }

    // Clear error when user starts typing
    watch(() => form.value.newPassword, () => {
      if (errors.value.newPassword) {
        errors.value.newPassword = ''
      }
    })

    watch(() => form.value.confirmPassword, () => {
      if (errors.value.confirmPassword) {
        errors.value.confirmPassword = ''
      }
    })

    return {
      loading,
      successMessage,
      showNewPassword,
      showConfirmPassword,
      form,
      errors,
      passwordRequirements,
      isFormValid,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.reset-password-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reset-password-container {
  width: 100%;
  max-width: 500px;
}

.reset-password-form-container {
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

.reset-password-header {
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

.reset-password-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
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

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 1rem;
}

.password-toggle:hover {
  color: #495057;
  background: #e9ecef;
}

.invalid-feedback {
  display: block;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #dc3545;
}

.password-requirements {
  margin-top: 12px;
}

.password-requirements small {
  display: block;
  margin-bottom: 8px;
  font-size: 0.75rem;
}

.requirements-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  margin-bottom: 4px;
  color: #6c757d;
}

.requirements-list li.text-success {
  color: #28a745;
}

.requirements-list i {
  font-size: 0.75rem;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
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

.security-tips {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.security-tips h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.security-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
}

.security-tips li {
  margin-bottom: 6px;
}

.text-muted {
  color: #6c757d !important;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
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
  .reset-password-view {
    padding: 16px;
  }

  .reset-password-form-container {
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