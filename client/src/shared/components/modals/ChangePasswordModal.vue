<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Change Password</h3>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="form.currentPassword"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.currentPassword }"
              placeholder="Enter your current password"
              required
            />
            <div class="invalid-feedback" v-if="errors.currentPassword">
              {{ errors.currentPassword }}
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.newPassword }"
              placeholder="Enter your new password"
              required
            />
            <div class="invalid-feedback" v-if="errors.newPassword">
              {{ errors.newPassword }}
            </div>
            <div class="password-requirements">
              <small class="text-muted">Password must contain:</small>
              <ul class="requirements-list">
                <li :class="{ 'text-success': passwordRequirements.length }">At least 8 characters</li>
                <li :class="{ 'text-success': passwordRequirements.uppercase }">One uppercase letter</li>
                <li :class="{ 'text-success': passwordRequirements.lowercase }">One lowercase letter</li>
                <li :class="{ 'text-success': passwordRequirements.number }">One number</li>
                <li :class="{ 'text-success': passwordRequirements.special }">One special character</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
              placeholder="Confirm your new password"
              required
            />
            <div class="invalid-feedback" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="loading">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleChangePassword"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading">
            <i class="bi bi-hourglass-split animate-spin"></i>
            Changing...
          </span>
          <span v-else>Change Password</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/shared/composables/useAuth'

export default {
  name: 'ChangePasswordModal',
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const { changePassword } = useAuth()

    const isVisible = ref(false)
    const loading = ref(false)
    const successMessage = ref('')

    const form = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const errors = ref({
      currentPassword: '',
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
        form.value.currentPassword &&
        form.value.newPassword &&
        form.value.confirmPassword &&
        Object.values(passwordRequirements.value).every(Boolean) &&
        form.value.newPassword === form.value.confirmPassword &&
        !Object.values(errors.value).some(Boolean)
      )
    })

    const validateForm = () => {
      errors.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }

      if (!form.value.currentPassword) {
        errors.value.currentPassword = 'Current password is required'
        return false
      }

      if (!form.value.newPassword) {
        errors.value.newPassword = 'New password is required'
        return false
      }

      if (form.value.newPassword.length < 8) {
        errors.value.newPassword = 'Password must be at least 8 characters long'
        return false
      }

      if (!Object.values(passwordRequirements.value).every(Boolean)) {
        errors.value.newPassword = 'Password does not meet all requirements'
        return false
      }

      if (form.value.newPassword === form.value.currentPassword) {
        errors.value.newPassword = 'New password must be different from current password'
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

    const handleChangePassword = async () => {
      if (!validateForm()) return

      loading.value = true
      successMessage.value = ''

      try {
        await changePassword(form.value.currentPassword, form.value.newPassword)

        successMessage.value = 'Password changed successfully!'

        // Reset form after successful change
        setTimeout(() => {
          resetForm()
          emit('success')
          closeModal()
        }, 2000)

      } catch (error) {
        if (error.message.includes('Current password')) {
          errors.value.currentPassword = error.message
        } else {
          errors.value.newPassword = error.message || 'Failed to change password'
        }
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      form.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      errors.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      successMessage.value = ''
    }

    const show = () => {
      isVisible.value = true
      resetForm()
    }

    const closeModal = () => {
      isVisible.value = false
      emit('close')
    }

    return {
      isVisible,
      loading,
      form,
      errors,
      successMessage,
      passwordRequirements,
      isFormValid,
      handleChangePassword,
      show,
      closeModal
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  outline: 0;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc3545;
}

.password-requirements {
  margin-top: 8px;
}

.requirements-list {
  margin: 4px 0 0 20px;
  padding: 0;
  list-style: none;
}

.requirements-list li {
  font-size: 0.75rem;
  margin-bottom: 2px;
  color: #6c757d;
}

.requirements-list li.text-success {
  color: #28a745;
}

.requirements-list li::before {
  content: "•";
  margin-right: 8px;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>