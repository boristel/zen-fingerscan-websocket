<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Privacy Policy</h3>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="privacy-content">
          <h4>Biometric Data Privacy</h4>
          <p>We are committed to protecting your biometric data and ensuring compliance with all applicable privacy regulations.</p>

          <h5>Data Collection</h5>
          <p>We collect fingerprint templates solely for the purpose of attendance verification and time tracking.</p>

          <h5>Data Usage</h5>
          <p>Your biometric data is used only for:</p>
          <ul>
            <li>Attendance verification</li>
            <li>Time and attendance tracking</li>
            <li>Security access control</li>
          </ul>

          <h5>Data Protection</h5>
          <p>All biometric data is encrypted and stored securely with strict access controls.</p>

          <h5>Your Rights</h5>
          <p>You have the right to:</p>
          <ul>
            <li>Access your biometric data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of biometric collection</li>
          </ul>

          <div class="consent-section">
            <h5>Consent</h5>
            <p>By using this system, you consent to the collection and processing of your biometric data as described in this policy.</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Close
        </button>
        <button type="button" class="btn btn-primary" @click="acceptPolicy">
          I Understand
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PrivacyPolicyModal',
  emits: ['close', 'accept'],
  setup(props, { emit }) {
    const isVisible = ref(false)

    const show = () => {
      isVisible.value = true
    }

    const closeModal = () => {
      isVisible.value = false
      emit('close')
    }

    const acceptPolicy = () => {
      isVisible.value = false
      emit('accept')
    }

    return {
      isVisible,
      show,
      closeModal,
      acceptPolicy
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
  max-width: 600px;
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

.privacy-content h4 {
  color: #495057;
  margin-bottom: 16px;
}

.privacy-content h5 {
  color: #495057;
  margin: 20px 0 8px 0;
  font-size: 1.1rem;
}

.privacy-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 16px;
}

.privacy-content ul {
  margin: 8px 0 16px 0;
  padding-left: 20px;
}

.privacy-content li {
  color: #6c757d;
  margin-bottom: 4px;
}

.consent-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
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

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-primary:hover {
  background: #5a6fd8;
}
</style>