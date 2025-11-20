<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-form-container">
        <div class="login-header">
          <div class="logo-section">
            <img src="/images/log 192x192.png" alt="Company Logo" class="logo" />
            <h2 class="company-name">Fingerprint Attendance System</h2>
          </div>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="Enter your email"
              required
              autocomplete="email"
            />
            <div class="invalid-feedback" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input-container">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="errors.password">
              {{ errors.password }}
            </div>
          </div>

          <div class="form-options">
            <div class="remember-me">
              <input id="remember" v-model="form.rememberMe" type="checkbox" />
              <label for="remember">Remember me</label>
            </div>
            <router-link to="/forgot-password" class="forgot-password">
              Forgot password?
            </router-link>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">
              <i class="bi bi-hourglass-split animate-spin"></i>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="login-footer">
          <p class="security-note">
            <i class="bi bi-shield-check text-success"></i>
            Your connection is secure and encrypted
          </p>
          <div class="policy-links">
            <a href="#" @click.prevent="showPrivacyPolicy">Privacy Policy</a>
            <a href="#" @click.prevent="showTermsOfService">Terms of Service</a>
            <a href="#" @click.prevent="showSecurityInfo">Security</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PrivacyPolicyModal ref="privacyPolicyModal" @accept="handlePolicyAccept" />
    <TermsOfServiceModal ref="termsOfServiceModal" @accept="handleTermsAccept" />
    <SecurityInfoModal ref="securityInfoModal" @understand="handleSecurityUnderstand" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

import PrivacyPolicyModal from '@/shared/components/modals/PrivacyPolicyModal'
import TermsOfServiceModal from '@/shared/components/modals/TermsOfServiceModal'
import SecurityInfoModal from '@/shared/components/modals/SecurityInfoModal'

export default {
  name: 'LoginView',
  components: {
    PrivacyPolicyModal,
    TermsOfServiceModal,
    SecurityInfoModal
  },
  setup() {
    const router = useRouter()
    const { login, user } = useAuth()
    const { addNotification } = useNotifications()

    const loading = ref(false)
    const showPassword = ref(false)

    const form = ref({
      email: '',
      password: '',
      rememberMe: false
    })

    const errors = ref({
      email: '',
      password: ''
    })

    const isFormValid = computed(() => {
      return form.value.email && form.value.password && !Object.values(errors.value).some(Boolean)
    })

    const validateForm = () => {
      errors.value = { email: '', password: '' }

      if (!form.value.email) {
        errors.value.email = 'Email is required'
        return false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email address'
        return false
      }

      if (!form.value.password) {
        errors.value.password = 'Password is required'
        return false
      }

      if (form.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
        return false
      }

      return true
    }

    const handleLogin = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        await login(form.value.email, form.value.password, form.value.rememberMe)

        addNotification({
          type: 'success',
          message: `Welcome back, ${user.value?.fullName || 'User'}!`,
          duration: 5000
        })

        // Redirect based on user role
        if (user.value?.role === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/attendance')
        }

      } catch (error) {
        if (error.message.includes('email')) {
          errors.value.email = error.message
        } else if (error.message.includes('password')) {
          errors.value.password = error.message
        } else {
          addNotification({
            type: 'error',
            message: error.message || 'Login failed. Please try again.',
            duration: 5000
          })
        }
      } finally {
        loading.value = false
      }
    }

    const showPrivacyPolicy = () => {
      document.querySelector('[data-modal="privacy-policy"]')?.show()
    }

    const showTermsOfService = () => {
      document.querySelector('[data-modal="terms-of-service"]')?.show()
    }

    const showSecurityInfo = () => {
      document.querySelector('[data-modal="security-info"]')?.show()
    }

    const handlePolicyAccept = () => {
      addNotification({
        type: 'info',
        message: 'Privacy policy accepted',
        duration: 3000
      })
    }

    const handleTermsAccept = () => {
      addNotification({
        type: 'info',
        message: 'Terms of service accepted',
        duration: 3000
      })
    }

    const handleSecurityUnderstand = () => {
      addNotification({
        type: 'info',
        message: 'Security information acknowledged',
        duration: 3000
      })
    }

    onMounted(() => {
      // Auto-focus email field
      document.getElementById('email')?.focus()
    })

    return {
      loading,
      showPassword,
      form,
      errors,
      isFormValid,
      handleLogin,
      showPrivacyPolicy,
      showTermsOfService,
      showSecurityInfo,
      handlePolicyAccept,
      handleTermsAccept,
      handleSecurityUnderstand
    }
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  border: 1px solid #e9ecef;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-section {
  margin-bottom: 20px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 16px;
  object-fit: cover;
}

.company-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 0.875rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
}

.remember-me label {
  margin: 0;
  color: #495057;
  cursor: pointer;
  user-select: none;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #5a6fd8;
  text-decoration: underline;
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

.login-footer {
  text-align: center;
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #6c757d;
  font-size: 0.75rem;
}

.policy-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 0.75rem;
}

.policy-links a {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.policy-links a:hover {
  color: #667eea;
  text-decoration: underline;
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
  .login-view {
    padding: 16px;
  }

  .login-form-container {
    padding: 24px;
  }

  .company-name {
    font-size: 1.25rem;
  }

  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .policy-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>