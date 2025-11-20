<template>
  <div class="employee-edit-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Edit Employee</h1>
        <p class="subtitle">Update employee information and settings</p>
      </div>
      <div class="header-actions">
        <router-link to="/employees" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i>
          Back to Employees
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading employee data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <h3>Error Loading Employee</h3>
      <p>{{ error }}</p>
      <button @click="loadEmployee" class="btn btn-primary">
        <i class="bi bi-arrow-clockwise"></i>
        Retry
      </button>
    </div>

    <!-- Edit Form -->
    <div v-else-if="employee" class="edit-form-container">
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
                readonly
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

            <div class="form-group">
              <label for="status">Employee Status</label>
              <select
                id="status"
                v-model="formData.status"
                class="form-select"
                :class="{ 'is-invalid': errors.status }"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
              <div v-if="errors.status" class="invalid-feedback">
                {{ errors.status }}
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

          <div class="password-section">
            <h4>Password Reset</h4>
            <p class="password-help">
              You can reset the employee's password by entering a new password below.
              Leave empty to keep the current password unchanged.
            </p>
            <div class="form-grid">
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <div class="input-group">
                  <input
                    id="newPassword"
                    v-model="formData.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.newPassword }"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.newPassword" class="invalid-feedback">
                  {{ errors.newPassword }}
                </div>
              </div>

              <div class="form-group">
                <label for="confirmNewPassword">Confirm New Password</label>
                <div class="input-group">
                  <input
                    id="confirmNewPassword"
                    v-model="formData.confirmNewPassword"
                    :type="showConfirmNewPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirmNewPassword }"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showConfirmNewPassword = !showConfirmNewPassword"
                  >
                    <i :class="showConfirmNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.confirmNewPassword" class="invalid-feedback">
                  {{ errors.confirmNewPassword }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Biometric Information Section -->
        <div class="form-section">
          <h3>Biometric Information</h3>
          <div class="biometric-status">
            <div class="status-indicator" :class="{ registered: employee.hasBiometric }">
              <i :class="employee.hasBiometric ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
              <span>{{ employee.hasBiometric ? 'Biometrics Registered' : 'No Biometrics Registered' }}</span>
            </div>
            <router-link
              v-if="employee.hasBiometric"
              :to="`/biometrics/manage?employee=${employee.id}`"
              class="btn btn-outline-primary"
            >
              <i class="bi bi-fingerprint"></i>
              Manage Biometrics
            </router-link>
            <router-link
              v-else
              :to="`/biometrics/enroll?employee=${employee.id}`"
              class="btn btn-primary"
            >
              <i class="bi bi-plus-circle"></i>
              Register Biometrics
            </router-link>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <router-link :to="`/employees/${employee.id}`" class="btn btn-outline-secondary">
            <i class="bi bi-x-circle"></i>
            Cancel
          </router-link>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <i class="bi bi-check-circle"></i>
            <span v-if="isSubmitting">Updating Employee...</span>
            <span v-else>Update Employee</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'EmployeeEditView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { addNotification } = useNotifications()

    const loading = ref(true)
    const error = ref(null)
    const employee = ref(null)
    const isSubmitting = ref(false)
    const showNewPassword = ref(false)
    const showConfirmNewPassword = ref(false)

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
      location: '',
      employmentType: '',
      status: '',
      username: '',
      role: '',
      newPassword: '',
      confirmNewPassword: ''
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
      status: '',
      username: '',
      role: '',
      newPassword: '',
      confirmNewPassword: ''
    })

    const loadEmployee = async () => {
      try {
        loading.value = true
        error.value = null

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock employee data
        const mockEmployee = {
          id: parseInt(route.params.id),
          fullName: 'John Doe',
          email: 'john.doe@company.com',
          phone: '+1 (555) 123-4567',
          dateOfBirth: '1985-06-15',
          gender: 'Male',
          address: '123 Main St, City, State 12345',
          employeeId: 'EMP001',
          department: 'Engineering',
          position: 'Senior Developer',
          manager: 'Jane Smith',
          location: 'Main Office',
          employmentType: 'Full-time',
          status: 'active',
          username: 'johndoe',
          role: 'employee',
          hasBiometric: true
        }

        employee.value = mockEmployee

        // Populate form data
        Object.keys(formData).forEach(key => {
          if (mockEmployee[key] !== undefined) {
            formData[key] = mockEmployee[key]
          }
        })

      } catch (err) {
        error.value = 'Failed to load employee details. Please try again.'
        console.error('Error loading employee:', err)
      } finally {
        loading.value = false
      }
    }

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

      if (!formData.role) {
        errors.role = 'User role is required'
        isValid = false
      }

      // Validate password fields only if new password is provided
      if (formData.newPassword) {
        if (formData.newPassword.length < 8) {
          errors.newPassword = 'Password must be at least 8 characters long'
          isValid = false
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
          errors.confirmNewPassword = 'Passwords do not match'
          isValid = false
        }
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

        // Mock successful update
        addNotification({
          type: 'success',
          message: `Employee ${formData.fullName} has been updated successfully!`,
          duration: 5000
        })

        // Redirect to employee details page
        router.push(`/employees/${employee.value.id}`)

      } catch (error) {
        console.error('Error updating employee:', error)
        addNotification({
          type: 'error',
          message: 'Failed to update employee. Please try again.',
          duration: 3000
        })
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      loadEmployee()
    })

    return {
      loading,
      error,
      employee,
      isSubmitting,
      showNewPassword,
      showConfirmNewPassword,
      formData,
      errors,
      handleSubmit,
      loadEmployee
    }
  }
}
</script>

<style scoped>
.employee-edit-view {
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

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.edit-form-container {
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

.form-control[readonly] {
  background-color: #f8f9fa;
  opacity: 0.8;
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

.password-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
  margin-top: 20px;
}

.password-section h4 {
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.password-help {
  color: #6c757d;
  font-size: 0.75rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.biometric-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.registered {
  background: #d4edda;
  color: #155724;
}

.status-indicator:not(.registered) {
  background: #f8d7da;
  color: #721c24;
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

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .employee-edit-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .edit-form-container {
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

  .biometric-status {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>