<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="bi bi-shield-check text-success"></i>
          Security Information
        </h3>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="security-content">
          <div class="security-status">
            <h4>System Security Status</h4>
            <div class="status-item">
              <i class="bi bi-check-circle-fill text-success"></i>
              <span>Server-Side Verification</span>
            </div>
            <div class="status-item">
              <i class="bi bi-check-circle-fill text-success"></i>
              <span>AES-256 Encryption</span>
            </div>
            <div class="status-item">
              <i class="bi bi-check-circle-fill text-success"></i>
              <span>Tamper-Evident Logging</span>
            </div>
            <div class="status-item">
              <i class="bi bi-check-circle-fill text-success"></i>
              <span>Secure Session Management</span>
            </div>
          </div>

          <div class="security-features">
            <h4>Security Features</h4>

            <div class="feature-section">
              <h5>Authentication</h5>
              <ul>
                <li>Multi-factor authentication ready</li>
                <li>Account lockout after failed attempts</li>
                <li>Secure session timeout management</li>
                <li>Password complexity requirements</li>
              </ul>
            </div>

            <div class="feature-section">
              <h5>Biometric Security</h5>
              <ul>
                <li>Server-side fingerprint verification</li>
                <li>Template encryption and integrity validation</li>
                <li>Anti-spoofing protection</li>
                <li>Secure template storage</li>
              </ul>
            </div>

            <div class="feature-section">
              <h5>Data Protection</h5>
              <ul>
                <li>End-to-end encryption for all data</li>
                <li>GDPR compliance for biometric data</li>
                <li>Regular security audits</li>
                <li>Comprehensive audit trail</li>
              </ul>
            </div>
          </div>

          <div class="security-best-practices">
            <h4>Security Best Practices</h4>
            <div class="practice-item">
              <strong>Keep credentials secure:</strong> Never share your login details with anyone.
            </div>
            <div class="practice-item">
              <strong>Report suspicious activity:</strong> Immediately report any unauthorized access attempts.
            </div>
            <div class="practice-item">
              <strong>Regular password updates:</strong> Change your password periodically.
            </div>
            <div class="practice-item">
              <strong>Secure your device:</strong> Ensure your computer is protected with updated security software.
            </div>
          </div>

          <div class="compliance-info">
            <h4>Compliance</h4>
            <p>This system complies with:</p>
            <ul>
              <li>GDPR (General Data Protection Regulation)</li>
              <li>ISO/IEC 19794-2 (Biometric Data Standards)</li>
              <li>ISO/IEC 30107-3 (Presentation Attack Detection)</li>
              <li>NIST SP 800-63B (Digital Identity Guidelines)</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Close
        </button>
        <button type="button" class="btn btn-primary" @click="understand">
          I Understand
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SecurityInfoModal',
  emits: ['close', 'understand'],
  setup(props, { emit }) {
    const isVisible = ref(false)

    const show = () => {
      isVisible.value = true
    }

    const closeModal = () => {
      isVisible.value = false
      emit('close')
    }

    const understand = () => {
      isVisible.value = false
      emit('understand')
    }

    return {
      isVisible,
      show,
      closeModal,
      understand
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
  max-width: 700px;
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
  display: flex;
  align-items: center;
  gap: 8px;
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

.security-content h4 {
  color: #495057;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.security-status {
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #6c757d;
}

.feature-section {
  margin-bottom: 24px;
}

.feature-section h5 {
  color: #495057;
  margin: 12px 0 8px 0;
  font-size: 1rem;
}

.feature-section ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.feature-section li {
  color: #6c757d;
  margin-bottom: 4px;
  line-height: 1.5;
}

.security-best-practices {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.practice-item {
  margin-bottom: 12px;
  color: #495057;
  line-height: 1.5;
}

.practice-item:last-child {
  margin-bottom: 0;
}

.compliance-info p {
  color: #6c757d;
  margin-bottom: 8px;
}

.compliance-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.compliance-info li {
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