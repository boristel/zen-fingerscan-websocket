<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Terms of Service</h3>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="terms-content">
          <h4>Terms of Service</h4>
          <p>By using this fingerprint attendance system, you agree to comply with the following terms and conditions.</p>

          <h5>1. Acceptance of Terms</h5>
          <p>By accessing and using this system, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h5>2. Use License</h5>
          <p>Permission is granted to temporarily use this system for the purpose of attendance tracking and time management.</p>

          <h5>3. User Responsibilities</h5>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining confidentiality of your login credentials</li>
            <li>Using the system only for legitimate business purposes</li>
            <li>Reporting any security concerns immediately</li>
            <li>Following company attendance policies</li>
          </ul>

          <h5>4. Biometric Data</h5>
          <p>Your fingerprint data is collected and processed in accordance with our Privacy Policy and applicable data protection laws.</p>

          <h5>5. Prohibited Activities</h5>
          <p>You may not:</p>
          <ul>
            <li>Attempt to bypass security measures</li>
            <li>Use the system for fraudulent purposes</li>
            <li>Share your login credentials</li>
            <li>Damage or interfere with system operations</li>
          </ul>

          <h5>6. System Availability</h5>
          <p>While we strive to maintain system availability, we do not guarantee uninterrupted service.</p>

          <h5>7. Modifications</h5>
          <p>We reserve the right to modify these terms at any time. Continued use of the system constitutes acceptance of modifications.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Close
        </button>
        <button type="button" class="btn btn-primary" @click="acceptTerms">
          I Agree
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TermsOfServiceModal',
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

    const acceptTerms = () => {
      isVisible.value = false
      emit('accept')
    }

    return {
      isVisible,
      show,
      closeModal,
      acceptTerms
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

.terms-content h4 {
  color: #495057;
  margin-bottom: 16px;
}

.terms-content h5 {
  color: #495057;
  margin: 20px 0 8px 0;
  font-size: 1.1rem;
}

.terms-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 16px;
}

.terms-content ul {
  margin: 8px 0 16px 0;
  padding-left: 20px;
}

.terms-content li {
  color: #6c757d;
  margin-bottom: 4px;
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