<template>
  <div class="main-layout">
    <!-- Security Headers -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
    />

    <!-- Main Navigation -->
    <nav class="main-navbar" :class="{ 'navbar-collapsed': sidebarCollapsed }">
      <div class="navbar-brand">
        <button
          class="sidebar-toggle"
          @click="toggleSidebar"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i class="bi" :class="sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>
        <img
          src="/images/log 192x192.png"
          alt="Company Logo"
          class="navbar-logo"
          @error="handleLogoError"
        />
        <span class="navbar-title" v-show="!sidebarCollapsed">Attendance System</span>
      </div>

      <div class="navbar-actions">
        <!-- Session Timer -->
        <div class="session-timer" v-if="showSessionTimer">
          <i class="bi bi-clock"></i>
          <span>Session: {{ formatTime(remainingSessionTime) }}</span>
        </div>

        <!-- Notifications -->
        <div class="navbar-notifications">
          <button
            class="notification-btn"
            @click="toggleNotifications"
            :class="{ 'has-notifications': unreadNotifications > 0 }"
            title="Notifications"
          >
            <i class="bi bi-bell"></i>
            <span class="notification-badge" v-if="unreadNotifications > 0">
              {{ unreadNotifications }}
            </span>
          </button>
        </div>

        <!-- User Menu -->
        <div class="navbar-user">
          <button
            class="user-menu-btn"
            @click="toggleUserMenu"
            :class="{ 'menu-open': userMenuOpen }"
          >
            <div class="user-avatar">
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user?.fullName"
                @error="handleAvatarError"
              />
              <div v-else class="avatar-placeholder">
                {{ user?.fullName?.charAt(0) || 'U' }}
              </div>
            </div>
            <span class="user-name" v-show="!sidebarCollapsed">{{ user?.fullName }}</span>
            <i class="bi bi-chevron-down user-menu-arrow"></i>
          </button>

          <!-- User Dropdown Menu -->
          <transition name="dropdown">
            <div v-show="userMenuOpen" class="user-dropdown">
              <div class="dropdown-header">
                <div class="user-info">
                  <div class="user-role-badge">{{ userRole }}</div>
                  <p class="user-email">{{ user?.email }}</p>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-menu">
                <button class="dropdown-item" @click="navigateToProfile">
                  <i class="bi bi-person"></i>
                  My Profile
                </button>
                <button class="dropdown-item" @click="navigateToSettings">
                  <i class="bi bi-gear"></i>
                  Settings
                </button>
                <button class="dropdown-item" @click="showChangePassword">
                  <i class="bi bi-key"></i>
                  Change Password
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" @click="showHelp">
                  <i class="bi bi-question-circle"></i>
                  Help & Support
                </button>
                <button class="dropdown-item dropdown-item-danger" @click="handleLogout">
                  <i class="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </nav>

    <!-- Sidebar Navigation -->
    <aside class="main-sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-content">
        <!-- Main Navigation -->
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item" v-for="item in navigationItems" :key="item.name">
              <router-link
                :to="item.path"
                class="nav-link"
                :class="{ 'active': $route.path === item.path }"
                :title="sidebarCollapsed ? item.title : ''"
              >
                <i :class="item.icon"></i>
                <span class="nav-text">{{ item.title }}</span>
                <span
                  v-if="item.badge"
                  class="nav-badge"
                  :class="item.badge.type"
                >
                  {{ item.badge.text }}
                </span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Quick Actions -->
        <div class="quick-actions" v-if="!sidebarCollapsed">
          <h6 class="quick-actions-title">Quick Actions</h6>
          <div class="quick-actions-grid">
            <button
              class="quick-action-btn"
              @click="handleQuickAction(action)"
              v-for="action in quickActions"
              :key="action.name"
              :title="action.title"
            >
              <i :class="action.icon"></i>
              <span>{{ action.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'content-expanded': sidebarCollapsed }">
      <!-- Breadcrumb Navigation -->
      <div class="content-header">
        <div class="breadcrumb-container">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol class="breadcrumb-list">
              <li class="breadcrumb-item">
                <router-link to="/dashboard">
                  <i class="bi bi-house"></i>
                  Home
                </router-link>
              </li>
              <li
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                class="breadcrumb-item"
                :class="{ 'active': index === breadcrumbs.length - 1 }"
              >
                <router-link
                  v-if="index < breadcrumbs.length - 1"
                  :to="crumb.path"
                >
                  {{ crumb.title }}
                </router-link>
                <span v-else>{{ crumb.title }}</span>
              </li>
            </ol>
          </nav>
        </div>

        <div class="page-actions">
          <slot name="page-actions"></slot>
        </div>
      </div>

      <!-- Page Content -->
      <div class="content-body">
        <transition name="page" mode="out-in">
          <router-view />
        </transition>
      </div>
    </main>

    <!-- Notification Panel -->
    <NotificationPanel
      ref="notificationPanel"
      @mark-read="markNotificationAsRead"
      @mark-all-read="markAllNotificationsAsRead"
    />

    <!-- Modals -->
    <ChangePasswordModal ref="changePasswordModal" />
    <UserProfileModal ref="userProfileModal" />
    <ConfirmationModal ref="confirmationModal" />
    <SessionWarningModal ref="sessionWarningModal" @extend-session="extendSession" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useSession } from '@/shared/composables/useSession'

import NotificationPanel from '@/shared/components/NotificationPanel'
import ChangePasswordModal from '@/shared/components/modals/ChangePasswordModal'
import UserProfileModal from '@/shared/components/modals/UserProfileModal'
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal'
import SessionWarningModal from '@/shared/components/modals/SessionWarningModal'

export default {
  name: 'MainLayout',
  components: {
    NotificationPanel,
    ChangePasswordModal,
    UserProfileModal,
    ConfirmationModal,
    SessionWarningModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { user, userRole, logout } = useAuth()
    const { notifications, unreadNotifications, markAsRead, markAllAsRead } = useNotifications()
    const { remainingSessionTime, showSessionTimer, extendSession: extendUserSession } = useSession()

    // Layout state
    const sidebarCollapsed = ref(false)
    const userMenuOpen = ref(false)

    // Refs for modals
    const notificationPanel = ref(null)
    const changePasswordModal = ref(null)
    const userProfileModal = ref(null)
    const confirmationModal = ref(null)
    const sessionWarningModal = ref(null)

    // Computed properties
    const navigationItems = computed(() => {
      const items = [
        {
          name: 'dashboard',
          path: '/dashboard',
          title: 'Dashboard',
          icon: 'bi bi-grid-1x2',
          permission: 'VIEW_DASHBOARD'
        },
        {
          name: 'attendance',
          path: '/attendance',
          title: 'Attendance',
          icon: 'bi bi-clock-history',
          permission: 'VIEW_ATTENDANCE',
          badge: {
            type: 'badge-primary',
            text: 'New'
          }
        },
        {
          name: 'employees',
          path: '/employees',
          title: 'Employees',
          icon: 'bi bi-people',
          permission: 'VIEW_EMPLOYEES'
        },
        {
          name: 'biometrics',
          path: '/biometrics',
          title: 'Biometrics',
          icon: 'bi bi-fingerprint',
          permission: 'MANAGE_BIOMETRICS'
        },
        {
          name: 'reports',
          path: '/reports',
          title: 'Reports',
          icon: 'bi bi-graph-up',
          permission: 'GENERATE_REPORTS'
        }
      ]

      // Add admin items for admin users
      if (userRole.value === 'ADMIN') {
        items.push({
          name: 'admin',
          path: '/admin',
          title: 'Administration',
          icon: 'bi bi-gear-fill',
          permission: 'MANAGE_SYSTEM'
        })
      }

      return items
    })

    const quickActions = computed(() => {
      const actions = [
        {
          name: 'clock-in',
          title: 'Clock In',
          icon: 'bi bi-play-circle',
          action: 'clockIn',
          permission: 'CLOCK_IN'
        },
        {
          name: 'clock-out',
          title: 'Clock Out',
          icon: 'bi bi-stop-circle',
          action: 'clockOut',
          permission: 'CLOCK_OUT'
        }
      ]

      // Add quick actions based on user role
      if (['MANAGER', 'HR', 'ADMIN'].includes(userRole.value)) {
        actions.push({
          name: 'manage-team',
          title: 'Team',
          icon: 'bi bi-people-fill',
          action: 'manageTeam',
          permission: 'VIEW_TEAM_ATTENDANCE'
        })
      }

      return actions
    })

    const breadcrumbs = computed(() => {
      const pathSegments = route.path.split('/').filter(Boolean)
      const crumbs = []

      let currentPath = ''
      pathSegments.forEach(segment => {
        currentPath += `/${segment}`
        const title = segment.charAt(0).toUpperCase() + segment.slice(1)
        crumbs.push({
          path: currentPath,
          title: title.replace('-', ' ')
        })
      })

      return crumbs
    })

    // Methods
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
    }

    const toggleUserMenu = () => {
      userMenuOpen.value = !userMenuOpen.value
    }

    const toggleNotifications = () => {
      if (notificationPanel.value) {
        notificationPanel.value.toggle()
      }
      userMenuOpen.value = false
    }

    const navigateToProfile = () => {
      router.push('/profile')
      userMenuOpen.value = false
    }

    const navigateToSettings = () => {
      router.push('/settings')
      userMenuOpen.value = false
    }

    const showChangePassword = () => {
      if (changePasswordModal.value) {
        changePasswordModal.value.show()
      }
      userMenuOpen.value = false
    }

    const showHelp = () => {
      router.push('/help')
      userMenuOpen.value = false
    }

    const handleLogout = async () => {
      if (confirmationModal.value) {
        const confirmed = await confirmationModal.value.show({
          title: 'Confirm Logout',
          message: 'Are you sure you want to logout?',
          confirmText: 'Logout',
          cancelText: 'Cancel',
          type: 'warning'
        })

        if (confirmed) {
          userMenuOpen.value = false
          await logout()
        }
      }
    }

    const handleQuickAction = (action) => {
      switch (action.action) {
        case 'clockIn':
          router.push('/attendance/clock-in')
          break
        case 'clockOut':
          router.push('/attendance/clock-out')
          break
        case 'manageTeam':
          router.push('/team')
          break
        default:
          console.warn('Unknown quick action:', action.action)
      }
    }

    const markNotificationAsRead = (notificationId) => {
      markAsRead(notificationId)
    }

    const markAllNotificationsAsRead = () => {
      markAllAsRead()
    }

    const extendSession = async () => {
      try {
        await extendUserSession()
      } catch (error) {
        console.error('Failed to extend session:', error)
      }
    }

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const handleLogoError = (event) => {
      event.target.style.display = 'none'
      const fallbackLogo = document.createElement('div')
      fallbackLogo.className = 'fallback-logo'
      fallbackLogo.innerHTML = '<i class="bi bi-fingerprint"></i>'
      event.target.parentNode.appendChild(fallbackLogo)
    }

    const handleAvatarError = (event) => {
      event.target.style.display = 'none'
      const placeholder = event.target.nextElementSibling
      if (placeholder && placeholder.classList.contains('avatar-placeholder')) {
        placeholder.style.display = 'flex'
      }
    }

    const handleClickOutside = (event) => {
      // Close user menu when clicking outside
      if (!event.target.closest('.navbar-user')) {
        userMenuOpen.value = false
      }

      // Close notification panel when clicking outside
      if (!event.target.closest('.navbar-notifications') &&
          !event.target.closest('.notification-panel')) {
        if (notificationPanel.value && notificationPanel.value.isOpen) {
          notificationPanel.value.close()
        }
      }
    }

    const handleKeyboardShortcuts = (event) => {
      // Ctrl/Cmd + K: Focus on search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // Focus on search input if available
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Ctrl/Cmd + B: Toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        toggleSidebar()
      }

      // Escape: Close dropdowns and modals
      if (event.key === 'Escape') {
        userMenuOpen.value = false
        if (notificationPanel.value && notificationPanel.value.isOpen) {
          notificationPanel.value.close()
        }
      }
    }

    // Lifecycle
    onMounted(() => {
      // Restore sidebar state
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        sidebarCollapsed.value = savedState === 'true'
      }

      // Add event listeners
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeyboardShortcuts)

      // Update document title
      document.title = `${route.meta.title || 'Dashboard'} - Attendance System`
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    })

    // Watch for route changes to update document title
    watch(() => route.meta.title, (newTitle) => {
      if (newTitle) {
        document.title = `${newTitle} - Attendance System`
      }
    })

    return {
      // State
      sidebarCollapsed,
      userMenuOpen,
      showSessionTimer,
      remainingSessionTime,

      // Computed
      user,
      userRole,
      navigationItems,
      quickActions,
      breadcrumbs,
      unreadNotifications,

      // Methods
      toggleSidebar,
      toggleUserMenu,
      toggleNotifications,
      navigateToProfile,
      navigateToSettings,
      showChangePassword,
      showHelp,
      handleLogout,
      handleQuickAction,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      extendSession,
      formatTime,
      handleLogoError,
      handleAvatarError,

      // Refs
      notificationPanel,
      changePasswordModal,
      userProfileModal,
      confirmationModal,
      sessionWarningModal
    }
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

/* Navbar Styles */
.main-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: padding-left 0.3s ease;
}

.navbar-collapsed {
  padding-left: 80px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.navbar-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: white;
  padding: 4px;
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.session-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.notification-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  color: white;
  font-size: 0.625rem;
  padding: 2px 4px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.navbar-user {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-btn:hover,
.user-menu-btn.menu-open {
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.user-menu-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.user-menu-btn.menu-open .user-menu-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 1001;
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.user-role-badge {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.user-email {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background-color: #e9ecef;
}

.dropdown-menu {
  padding: 8px 0;
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  padding: 12px 16px;
  text-align: left;
  color: #495057;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-item-danger {
  color: #dc3545;
}

.dropdown-item-danger:hover {
  background-color: #f8d7da;
}

/* Sidebar Styles */
.main-sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 260px;
  background: white;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
  transition: width 0.3s ease;
  z-index: 999;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-content {
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0 12px;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #495057;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #667eea;
}

.nav-link.active {
  background-color: #667eea;
  color: white;
}

.nav-link i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.badge-primary {
  background: #dc3545;
  color: white;
}

/* Quick Actions */
.quick-actions {
  padding: 24px 12px 0;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.quick-actions-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.quick-action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.quick-action-btn i {
  font-size: 1.25rem;
}

/* Main Content */
.main-content {
  margin-left: 260px;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  transition: margin-left 0.3s ease;
}

.content-expanded {
  margin-left: 80px;
}

.content-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin-left: 8px;
  color: #6c757d;
}

.breadcrumb-item a {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item a:hover {
  color: #667eea;
}

.breadcrumb-item.active {
  color: #495057;
  font-weight: 500;
}

.content-body {
  padding: 24px;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-sidebar {
    transform: translateX(-100%);
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }

  .content-expanded {
    margin-left: 0;
  }

  .navbar-collapsed {
    padding-left: 20px;
  }
}

@media (max-width: 768px) {
  .navbar-actions {
    gap: 12px;
  }

  .session-timer {
    display: none;
  }

  .user-name {
    display: none;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    padding: 16px;
  }

  .content-body {
    padding: 16px;
  }
}
</style>