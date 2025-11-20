<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">User Profile</h3>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="profile-content">
          <div class="user-avatar">
            <div class="avatar-circle">
              {{ user?.fullName?.charAt(0) || 'U' }}
            </div>
          </div>
          <div class="user-info">
            <h4>{{ user?.fullName }}</h4>
            <p class="user-email">{{ user?.email }}</p>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>
        <div class="profile-details">
          <div class="detail-group">
            <label>Employee ID:</label>
            <span>{{ user?.employeeId || 'N/A' }}</span>
          </div>
          <div class="detail-group">
            <label>Department:</label>
            <span>{{ user?.department || 'N/A' }}</span>
          </div>
          <div class="detail-group">
            <label>Position:</label>
            <span>{{ user?.position || 'N/A' }}</span>
          </div>
          <div class="detail-group">
            <label>Last Login:</label>
            <span>{{ formatDate(user?.lastLogin) }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuth } from '@/shared/composables/useAuth'

export default {
  name: 'UserProfileModal',
  emits: ['close'],
  setup(props, { emit }) {
    const { user, userRole } = useAuth()

    const isVisible = ref(false)

    const show = () => {
      isVisible.value = true
    }

    const closeModal = () => {
      isVisible.value = false
      emit('close')
    }

    const formatDate = (date) => {
      if (!date) return 'Never'
      return new Date(date).toLocaleString()
    }

    return {
      user,
      userRole,
      isVisible,
      show,
      closeModal,
      formatDate
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

.profile-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: white;
}

.user-info {
  flex: 1;
}

.user-info h4 {
  margin: 0 0 4px 0;
  color: #495057;
  font-size: 1.25rem;
}

.user-email {
  margin: 0 0 4px 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.user-role {
  margin: 0;
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.detail-group span {
  color: #6c757d;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>