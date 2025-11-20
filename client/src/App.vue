<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <img src="/images/log 192x192.png" alt="Zen Fingerscan Apps" width="30" height="30" class="d-inline-block align-text-top me-2">
          Zen Fingerscan Apps
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-clock-history"></i> Attendance
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigateToRegister">
                <i class="bi bi-person-plus"></i> Register Fingerprint
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container mt-4">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-light text-center py-3 mt-5">
      <div class="container">
        <p class="text-muted mb-0">
          Zen Fingerscan Apps v.1.1 &copy; 2025
        </p>
      </div>
    </footer>
  </div>

  <!-- Password Modal -->
  <div class="modal fade" id="passwordModal" tabindex="-1" ref="passwordModalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-lock"></i>
            Password Required
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>Please enter the password to access the Register Fingerprint module:</p>
          <div class="form-group">
            <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Enter password"
              @keyup.enter="submitPassword"
              ref="passwordInputRef"
            >
            <small v-if="passwordError" class="text-danger">
              {{ passwordError }}
            </small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="submitPassword" :disabled="!password">
            <i class="bi bi-unlock"></i>
            Unlock
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const password = ref('')
    const passwordError = ref('')
    const passwordModalRef = ref(null)
    const passwordInputRef = ref(null)
    let passwordModal = null

    const navigateToRegister = () => {
      password.value = ''
      passwordError.value = ''

      // Create or get modal instance
      if (passwordModalRef.value) {
        passwordModal = new Modal(passwordModalRef.value)
        passwordModal.show()

        // Focus input after modal is shown
        setTimeout(() => {
          passwordInputRef.value?.focus()
        }, 500)
      }
    }

    const submitPassword = () => {
      if (password.value === 'ZenSpa168') {
        passwordError.value = ''
        passwordModal?.hide()
        router.push('/register')
      } else {
        passwordError.value = 'Incorrect password. Please try again.'
        password.value = ''
        passwordInputRef.value?.focus()
      }
    }

    return {
      password,
      passwordError,
      passwordModalRef,
      passwordInputRef,
      navigateToRegister,
      submitPassword
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.navbar-brand {
  font-weight: bold;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #0e8a7d 0%, #2ed66f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #da2a3d 0%, #e74c33 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(235, 51, 73, 0.4);
}

.transition-all {
  transition: all 0.3s ease;
}

.finger-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.finger-button {
  padding: 15px;
  text-align: center;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.finger-button:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,123,255,0.2);
}

.finger-button.selected {
  border-color: #28a745;
  background: #d4edda;
  transform: scale(1.05);
}

.finger-button.registered {
  border-color: #ffc107;
  background: #fff3cd;
}

.finger-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.finger-icon {
  font-size: 2em;
  margin-bottom: 5px;
  display: block;
}

.fingerprint-preview {
  max-width: 300px;
  max-height: 300px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}

.quality-indicator {
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
  text-align: center;
  font-weight: bold;
}

.quality-good {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.quality-fair {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.quality-poor {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.employee-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.employee-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.employee-card.selected {
  border: 3px solid #007bff;
  background: #e3f2fd;
}

.scan-progress {
  margin: 20px 0;
}

.scan-step {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  background: #f8f9fa;
}

.scan-step.completed {
  background: #d4edda;
  color: #155724;
}

.scan-step.active {
  background: #cce7ff;
  border: 2px solid #007bff;
}

.scan-icon {
  font-size: 1.5em;
  margin-right: 10px;
  min-width: 30px;
  text-align: center;
}
</style>