<template>
  <div class="profile-view">
    <div class="profile-header">
      <h2>My Profile</h2>
      <p class="subtitle">Manage your personal information and account settings</p>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-info-section">
          <div class="user-avatar">
            <div class="avatar-circle">
              {{ userInitials }}
            </div>
            <button class="avatar-change-btn">
              <i class="bi bi-camera"></i>
              Change Photo
            </button>
          </div>

          <div class="user-details">
            <h3>{{ user?.fullName || 'User' }}</h3>
            <p class="user-role">{{ userRole }}</p>
            <p class="user-email">{{ user?.email }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <strong>{{ formatDate(user?.lastLogin) }}</strong>
                <span>Last Login</span>
              </div>
              <div class="stat-item">
                <strong>{{ formatDate(user?.createdAt) }}</strong>
                <span>Member Since</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-sections">
        <!-- Personal Information -->
        <div class="section-card">
          <div class="section-header">
            <h4>
              <i class="bi bi-person"></i>
              Personal Information
            </h4>
            <button class="btn btn-sm btn-outline-primary" @click="editProfile">
              <i class="bi bi-pencil"></i>
              Edit
            </button>
          </div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <label>Full Name</label>
                <span>{{ user?.fullName || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Email Address</label>
                <span>{{ user?.email || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Employee ID</label>
                <span>{{ user?.employeeId || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Department</label>
                <span>{{ user?.department || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Position</label>
                <span>{{ user?.position || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Phone Number</label>
                <span>{{ user?.phone || 'Not provided' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="section-card">
          <div class="section-header">
            <h4>
              <i class="bi bi-shield-lock"></i>
              Security Settings
            </h4>
          </div>
          <div class="section-content">
            <div class="security-actions">
              <button class="security-btn" @click="changePassword">
                <i class="bi bi-key"></i>
                <div class="btn-content">
                  <strong>Change Password</strong>
                  <span>Update your account password</span>
                </div>
                <i class="bi bi-chevron-right"></i>
              </button>

              <button class="security-btn" @click="enable2FA">
                <i class="bi bi-phone"></i>
                <div class="btn-content">
                  <strong>Two-Factor Authentication</strong>
                  <span>Add an extra layer of security</span>
                </div>
                <i class="bi bi-chevron-right"></i>
              </button>

              <button class="security-btn" @click="viewSessions">
                <i class="bi bi-clock-history"></i>
                <div class="btn-content">
                  <strong>Active Sessions</strong>
                  <span>Manage your logged-in devices</span>
                </div>
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Biometric Settings -->
        <div class="section-card">
          <div class="section-header">
            <h4>
              <i class="bi bi-fingerprint"></i>
              Biometric Settings
            </h4>
          </div>
          <div class="section-content">
            <div class="biometric-status">
              <div class="status-indicator" :class="{ 'success': hasFingerprint }">
                <i :class="hasFingerprint ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
              </div>
              <div class="status-info">
                <strong>Fingerprint Registration</strong>
                <span>{{ hasFingerprint ? 'Fingerprint registered' : 'No fingerprint registered' }}</span>
              </div>
              <button class="btn btn-sm btn-outline-primary" @click="manageBiometric">
                {{ hasFingerprint ? 'Manage' : 'Register' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="section-card">
          <div class="section-header">
            <h4>
              <i class="bi bi-gear"></i>
              Preferences
            </h4>
          </div>
          <div class="section-content">
            <div class="preference-items">
              <div class="preference-item">
                <div class="preference-info">
                  <strong>Email Notifications</strong>
                  <span>Receive email updates about your account</span>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="preferences.emailNotifications" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="preference-item">
                <div class="preference-info">
                  <strong>Desktop Notifications</strong>
                  <span>Show browser notifications for important events</span>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="preferences.desktopNotifications" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="preference-item">
                <div class="preference-info">
                  <strong>Language</strong>
                  <span>Select your preferred language</span>
                </div>
                <select v-model="preferences.language" class="form-select">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UserProfileModal ref="userProfileModal" @close="handleModalClose" />
    <ChangePasswordModal ref="changePasswordModal" @success="handlePasswordSuccess" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

import UserProfileModal from '@/shared/components/modals/UserProfileModal'
import ChangePasswordModal from '@/shared/components/modals/ChangePasswordModal'

export default {
  name: 'ProfileView',
  components: {
    UserProfileModal,
    ChangePasswordModal
  },
  setup() {
    const router = useRouter()
    const { user, userRole } = useAuth()
    const { addNotification } = useNotifications()

    const hasFingerprint = ref(true)
    const userProfileModal = ref(null)
    const changePasswordModal = ref(null)

    const preferences = ref({
      emailNotifications: true,
      desktopNotifications: false,
      language: 'en'
    })

    const userInitials = computed(() => {
      if (!user.value?.fullName) return 'U'
      return user.value.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const formatDate = (date) => {
      if (!date) return 'Never'
      return new Date(date).toLocaleString()
    }

    const editProfile = () => {
      userProfileModal.value?.show()
    }

    const changePassword = () => {
      changePasswordModal.value?.show()
    }

    const enable2FA = () => {
      addNotification({
        type: 'info',
        message: 'Two-factor authentication setup would open here',
        duration: 3000
      })
    }

    const viewSessions = () => {
      addNotification({
        type: 'info',
        message: 'Session management would open here',
        duration: 3000
      })
    }

    const manageBiometric = () => {
      if (hasFingerprint.value) {
        router.push('/biometrics/manage')
      } else {
        router.push('/biometrics/enroll')
      }
    }

    const handleModalClose = () => {
      // Handle modal close if needed
    }

    const handlePasswordSuccess = () => {
      addNotification({
        type: 'success',
        message: 'Password changed successfully!',
        duration: 3000
      })
    }

    onMounted(() => {
      // Load user preferences or biometric status
      // This would typically come from an API call
    })

    return {
      user,
      userRole,
      hasFingerprint,
      userInitials,
      preferences,
      userProfileModal,
      changePasswordModal,
      formatDate,
      editProfile,
      changePassword,
      enable2FA,
      viewSessions,
      manageBiometric,
      handleModalClose,
      handlePasswordSuccess
    }
  }
}
</script>

<style scoped>
.profile-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-header h2 {
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

.profile-content {
  display: grid;
  gap: 24px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.profile-info-section {
  display: flex;
  align-items: center;
  gap: 32px;
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
  color: white;
}

.avatar-change-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.avatar-change-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

.user-details {
  flex: 1;
}

.user-details h3 {
  color: #495057;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.user-role {
  color: #667eea;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  margin: 0 0 4px 0;
}

.user-email {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0 24px 0;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item strong {
  color: #495057;
  font-size: 0.875rem;
}

.stat-item span {
  color: #6c757d;
  font-size: 0.75rem;
}

.profile-sections {
  display: grid;
  gap: 24px;
}

.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.section-header h4 {
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  padding: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.info-item span {
  color: #495057;
  font-size: 0.875rem;
}

.security-actions {
  display: grid;
  gap: 16px;
}

.security-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.security-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.security-btn i:first-child {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.25rem;
}

.btn-content {
  flex: 1;
}

.btn-content strong {
  display: block;
  color: #495057;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.btn-content span {
  color: #6c757d;
  font-size: 0.75rem;
}

.security-btn i:last-child {
  color: #6c757d;
  font-size: 1rem;
}

.biometric-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.status-indicator.success {
  background: #d4edda;
  color: #28a745;
}

.status-indicator:not(.success) {
  background: #f8d7da;
  color: #dc3545;
}

.status-info {
  flex: 1;
}

.status-info strong {
  display: block;
  color: #495057;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.status-info span {
  color: #6c757d;
  font-size: 0.75rem;
}

.preference-items {
  display: grid;
  gap: 20px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info {
  flex: 1;
}

.preference-info strong {
  display: block;
  color: #495057;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.preference-info span {
  color: #6c757d;
  font-size: 0.75rem;
}

.form-select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

/* Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Button Styles */
.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background: white;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }

  .profile-info-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .user-stats {
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>