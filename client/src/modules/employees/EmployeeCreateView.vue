<template>
  <div class="employee-create-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Add New Employee</h1>
        <p class="subtitle">Create a new employee record and register their information</p>
      </div>
      <div class="header-actions">
        <router-link to="/employees" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i>
          Back to Employees
        </router-link>
      </div>
    </div>

    <div class="create-form-container">
      <form @submit.prevent="handleSubmit" class="employee-form">
        <!-- Personal Information Section -->
        <div class="form-section">
          <h3>Personal Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="fullName">Full Name *</label>
              <input
                id="fullName"
                v-model="formData.fullName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.fullName }"
                placeholder="Enter full name"
                required
              />
              <div v-if="errors.fullName" class="invalid-feedback">
                {{ errors.fullName }}
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email Address *</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="Enter email address"
                required
              />
              <div v-if="errors.email" class="invalid-feedback">
                {{ errors.email }}
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.phone }"
                placeholder="Enter phone number"
              />
              <div v-if="errors.phone" class="invalid-feedback">
                {{ errors.phone }}
              </div>
            </div>

            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                v-model="formData.dateOfBirth"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.dateOfBirth }"
              />
              <div v-if="errors.dateOfBirth" class="invalid-feedback">
                {{ errors.dateOfBirth }}
              </div>
            </div>

            <div class="form-group">
              <label for="gender">Gender</label>
              <select
                id="gender"
                v-model="formData.gender"
                class="form-select"
                :class="{ 'is-invalid': errors.gender }"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div v-if="errors.gender" class="invalid-feedback">
                {{ errors.gender }}
              </div>
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <textarea
                id="address"
                v-model="formData.address"
                class="form-control"
                :class="{ 'is-invalid': errors.address }"
                placeholder="Enter full address"
                rows="3"
              />
              <div v-if="errors.address" class="invalid-feedback">
                {{ errors.address }}
              </div>
            </div>
          </div>
        </div>

        <!-- Work Information Section -->
        <div class="form-section">
          <h3>Work Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="employeeId">Employee ID *</label>
              <input
                id="employeeId"
                v-model="formData.employeeId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.employeeId }"
                placeholder="Enter employee ID"
                required
              />
              <div v-if="errors.employeeId" class="invalid-feedback">
                {{ errors.employeeId }}
              </div>
            </div>

            <div class="form-group">
              <label for="department">Department *</label>
              <select
                id="department"
                v-model="formData.department"
                class="form-select"
                :class="{ 'is-invalid': errors.department }"
                required
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
              </select>
              <div v-if="errors.department" class="invalid-feedback">
                {{ errors.department }}
              </div>
            </div>

            <div class="form-group">
              <label for="position">Position *</label>
              <input
                id="position"
                v-model="formData.position"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.position }"
                placeholder="Enter job position"
                required
              />
              <div v-if="errors.position" class="invalid-feedback">
                {{ errors.position }}
              </div>
            </div>

            <div class="form-group">
              <label for="manager">Manager</label>
              <input
                id="manager"
                v-model="formData.manager"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.manager }"
                placeholder="Enter manager name"
              />
              <div v-if="errors.manager" class="invalid-feedback">
                {{ errors.manager }}
              </div>
            </div>

            <div class="form-group">
              <label for="location">Work Location</label>
              <select
                id="location"
                v-model="formData.location"
                class="form-select"
                :class="{ 'is-invalid': errors.location }"
              >
                <option value="Main Office">Main Office</option>
                <option value="Remote">Remote</option>
                <option value="Branch Office A">Branch Office A</option>
                <option value="Branch Office B">Branch Office B</option>
              </select>
              <div v-if="errors.location" class="invalid-feedback">
                {{ errors.location }}
              </div>
            </div>

            <div class="form-group">
              <label for="employmentType">Employment Type</label>
              <select
                id="employmentType"
                v-model="formData.employmentType"
                class="form-select"
                :class="{ 'is-invalid': errors.employmentType }"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
              <div v-if="errors.employmentType" class="invalid-feedback">
                {{ errors.employmentType }}
              </div>
            </div>
          </div>
        </div>

        <!-- Account Information Section -->
        <div class="form-section">
          <h3>Account Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="username">Username *</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.username }"
                placeholder="Enter username"
                required
              />
              <div v-if="errors.username" class="invalid-feedback">
                {{ errors.username }}
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password *</label>
              <div class="input-group">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div v-if="errors.password" class="invalid-feedback">
                {{ errors.password }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password *</label>
              <div class="input-group">
                <input
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div v-if="errors.confirmPassword" class="invalid-feedback">
                {{ errors.confirmPassword }}
              </div>
            </div>

            <div class="form-group">
              <label for="role">User Role *</label>
              <select
                id="role"
                v-model="formData.role"
                class="form-select"
                :class="{ 'is-invalid': errors.role }"
                required
              >
                <option value="">Select Role</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Administrator</option>
              </select>
              <div v-if="errors.role" class="invalid-feedback">
                {{ errors.role }}
              </div>
            </div>
          </div>
        </div>

        <!-- Biometric Registration Section -->
        <div class="form-section">
          <h3>Biometric Registration</h3>
          <div class="biometric-options">
            <div class="form-check">
              <input
                id="registerBiometrics"
                v-model="formData.registerBiometrics"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="registerBiometrics">
                Register fingerprints for this employee
              </label>
            </div>
            <p class="biometric-help">
              Check this box to register fingerprint biometrics after creating the employee record.
              The employee will need to be present for fingerprint scanning.
            </p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <router-link to="/employees" class="btn btn-outline-secondary">
            <i class="bi bi-x-circle"></i>
            Cancel
          </router-link>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <i class="bi bi-check-circle"></i>
            <span v-if="isSubmitting">Creating Employee...</span>
            <span v-else>Create Employee</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'EmployeeCreateView',
  setup() {
    const router = useRouter()
    const { addNotification } = useNotifications()

    const isSubmitting = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const formData = reactive({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      employeeId: '',
      department: '',
      position: '',
      manager: '',
      location: 'Main Office',
      employmentType: 'Full-time',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      registerBiometrics: false
    })

    const errors = reactive({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      employeeId: '',
      department: '',
      position: '',
      manager: '',
      location: '',
      employmentType: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: ''
    })

    const validateForm = () => {
      // Clear previous errors
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })

      let isValid = true

      // Validate required fields
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required'
        isValid = false
      }

      if (!formData.email.trim()) {
        errors.email = 'Email is required'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
        isValid = false
      }

      if (!formData.employeeId.trim()) {
        errors.employeeId = 'Employee ID is required'
        isValid = false
      }

      if (!formData.department) {
        errors.department = 'Department is required'
        isValid = false
      }

      if (!formData.position.trim()) {
        errors.position = 'Position is required'
        isValid = false
      }

      if (!formData.username.trim()) {
        errors.username = 'Username is required'
        isValid = false
      }

      if (!formData.password) {
        errors.password = 'Password is required'
        isValid = false
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long'
        isValid = false
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm the password'
        isValid = false
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        isValid = false
      }

      if (!formData.role) {
        errors.role = 'User role is required'
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }

      try {
        isSubmitting.value = true

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock successful creation
        addNotification({
          type: 'success',
          message: `Employee ${formData.fullName} has been created successfully!`,
          duration: 5000
        })

        // If biometrics registration is checked, redirect to biometric enrollment
        if (formData.registerBiometrics) {
          router.push('/biometrics/enroll')
        } else {
          router.push('/employees')
        }

      } catch (error) {
        console.error('Error creating employee:', error)
        addNotification({
          type: 'error',
          message: 'Failed to create employee. Please try again.',
          duration: 3000
        })
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      isSubmitting,
      showPassword,
      showConfirmPassword,
      formData,
      errors,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.employee-create-view {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
  color: #495057;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.create-form-container {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.employee-form {
  display: grid;
  gap: 32px;
}

.form-section h3 {
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #495057;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-control,
.form-select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  outline: none;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 4px;
}

.input-group {
  display: flex;
  align-items: stretch;
}

.input-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.input-group .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.biometric-options {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.form-check-input {
  width: 16px;
  height: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
}

.form-check-label {
  color: #495057;
  font-size: 0.875rem;
  cursor: pointer;
}

.biometric-help {
  color: #6c757d;
  font-size: 0.75rem;
  line-height: 1.5;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  border-color: #5a6fd8;
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #ced4da;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .employee-create-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .create-form-container {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>