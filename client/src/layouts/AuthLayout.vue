<template>
  <div class="auth-layout">
    <!-- Security Headers and Meta -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.ipify.org;"
    />

    <!-- Background Pattern -->
    <div class="auth-background">
      <div class="auth-overlay"></div>
    </div>

    <!-- Main Content -->
    <div class="auth-container">
      <!-- Logo and Branding -->
      <div class="auth-header">
        <div class="logo-container">
          <img
            src="/images/log 192x192.png"
            alt="Company Logo"
            class="company-logo"
            @error="handleLogoError"
          />
          <h1 class="company-name">Fingerprint Attendance System</h1>
          <p class="company-tagline">Secure Biometric Time & Attendance</p>
        </div>
      </div>

      <!-- Router View -->
      <div class="auth-content">
        <transition name="auth-transition" mode="out-in">
          <router-view />
        </transition>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <div class="footer-content">
          <p class="copyright">&copy; {{ currentYear }} {{ companyName }}. All rights reserved.</p>
          <div class="footer-links">
            <a href="#" @click.prevent="showPrivacyPolicy">Privacy Policy</a>
            <a href="#" @click.prevent="showTermsOfService">Terms of Service</a>
            <a href="#" @click.prevent="showSecurityInfo">Security Info</a>
          </div>
        </div>
        <div class="security-notice">
          <i class="bi bi-shield-check"></i>
          <span>Secure connection - Your data is protected</span>
        </div>
      </div>
    </div>

    <!-- Security Modals -->
    <PrivacyPolicyModal ref="privacyModal" />
    <TermsOfServiceModal ref="termsModal" />
    <SecurityInfoModal ref="securityModal" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import PrivacyPolicyModal from '@/shared/components/modals/PrivacyPolicyModal'
import TermsOfServiceModal from '@/shared/components/modals/TermsOfServiceModal'
import SecurityInfoModal from '@/shared/components/modals/SecurityInfoModal'

export default {
  name: 'AuthLayout',
  components: {
    PrivacyPolicyModal,
    TermsOfServiceModal,
    SecurityInfoModal
  },
  setup() {
    const companyName = ref('Your Company')
    const currentYear = computed(() => new Date().getFullYear())

    const privacyModal = ref(null)
    const termsModal = ref(null)
    const securityModal = ref(null)

    onMounted(() => {
      // Add security enhancements
      document.title = 'Secure Login - Fingerprint Attendance System'

      // Prevent right-click on auth pages
      document.addEventListener('contextmenu', preventContextMenu)

      // Prevent text selection on sensitive elements
      document.addEventListener('selectstart', preventTextSelection)

      // Add keyboard shortcuts for accessibility
      document.addEventListener('keydown', handleKeyboardShortcuts)
    })

    const preventContextMenu = (event) => {
      // Allow context menu on input fields for accessibility
      if (!event.target.matches('input, textarea')) {
        event.preventDefault()
      }
    }

    const preventTextSelection = (event) => {
      // Allow text selection on input fields and text areas
      if (!event.target.matches('input, textarea, .allow-select')) {
        event.preventDefault()
      }
    }

    const handleKeyboardShortcuts = (event) => {
      // Alt + L: Focus on login input
      if (event.altKey && event.key === 'l') {
        event.preventDefault()
        const usernameInput = document.querySelector('input[name="username"]')
        if (usernameInput) {
          usernameInput.focus()
        }
      }

      // Alt + P: Focus on password input
      if (event.altKey && event.key === 'p') {
        event.preventDefault()
        const passwordInput = document.querySelector('input[name="password"]')
        if (passwordInput) {
          passwordInput.focus()
        }
      }

      // Escape: Clear form inputs
      if (event.key === 'Escape') {
        const inputs = document.querySelectorAll('input')
        inputs.forEach(input => {
          if (input.type !== 'hidden') {
            input.value = ''
          }
        })
      }
    }

    const handleLogoError = (event) => {
      // Fallback if logo fails to load
      event.target.style.display = 'none'
      const fallbackLogo = document.createElement('div')
      fallbackLogo.className = 'fallback-logo'
      fallbackLogo.innerHTML = '<i class="bi bi-fingerprint"></i>'
      event.target.parentNode.appendChild(fallbackLogo)
    }

    const showPrivacyPolicy = () => {
      if (privacyModal.value) {
        privacyModal.value.show()
      }
    }

    const showTermsOfService = () => {
      if (termsModal.value) {
        termsModal.value.show()
      }
    }

    const showSecurityInfo = () => {
      if (securityModal.value) {
        securityModal.value.show()
      }
    }

    return {
      companyName,
      currentYear,
      privacyModal,
      termsModal,
      securityModal,
      handleLogoError,
      showPrivacyPolicy,
      showTermsOfService,
      showSecurityInfo
    }
  }
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
}

.auth-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
}

.auth-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.company-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  background-color: white;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.company-logo:hover {
  transform: scale(1.05);
}

.fallback-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #667eea;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.company-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.company-tagline {
  font-size: 1rem;
  opacity: 0.9;
  margin: 8px 0 0 0;
  font-weight: 300;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.auth-content {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.auth-footer {
  margin-top: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.footer-content {
  margin-bottom: 16px;
}

.copyright {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 0.875rem;
}

.footer-links a:hover {
  color: white;
  text-decoration: underline;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.7);
}

.security-notice i {
  color: rgba(255, 255, 255, 0.8);
}

/* Transitions */
.auth-transition-enter-active,
.auth-transition-leave-active {
  transition: all 0.3s ease;
}

.auth-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.auth-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    padding: 15px;
  }

  .company-name {
    font-size: 1.5rem;
  }

  .company-tagline {
    font-size: 0.875rem;
  }

  .auth-content {
    max-width: 100%;
  }

  .footer-links {
    flex-direction: column;
    gap: 8px;
  }

  .security-notice {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .auth-header {
    margin-bottom: 30px;
  }

  .company-logo {
    width: 60px;
    height: 60px;
  }

  .fallback-logo {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .company-name {
    font-size: 1.25rem;
  }

  .company-tagline {
    font-size: 0.813rem;
  }
}
</style>