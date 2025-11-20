<template>
  <div class="settings-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Settings</h1>
        <p class="subtitle">Manage application preferences and configurations</p>
      </div>
    </div>

    <!-- Settings Navigation -->
    <div class="settings-nav">
      <div class="nav-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="nav-tab"
          :class="{ active: activeTab === tab.key }"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="settings-content">
      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="settings-section">
        <div class="section-header">
          <h3>General Settings</h3>
          <p class="section-description">Configure basic application preferences</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label for="companyName">Company Name</label>
            <input
              id="companyName"
              v-model="settings.general.companyName"
              type="text"
              class="form-control"
              placeholder="Enter company name"
            />
          </div>

          <div class="form-group">
            <label for="timezone">Timezone</label>
            <select id="timezone" v-model="settings.general.timezone" class="form-select">
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dateFormat">Date Format</label>
            <select id="dateFormat" v-model="settings.general.dateFormat" class="form-select">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>

          <div class="form-group">
            <label for="language">Language</label>
            <select id="language" v-model="settings.general.language" class="form-select">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div class="form-actions">
            <button @click="saveGeneralSettings" class="btn btn-primary">
              <i class="bi bi-check-circle"></i>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Biometric Settings -->
      <div v-if="activeTab === 'biometrics'" class="settings-section">
        <div class="section-header">
          <h3>Biometric Settings</h3>
          <p class="section-description">Configure fingerprint and biometric security settings</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">Biometric Security Level</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="settings.biometrics.securityLevel"
                  value="standard"
                />
                <span class="radio-label">Standard</span>
                <span class="radio-description">Basic biometric verification</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="settings.biometrics.securityLevel"
                  value="high"
                />
                <span class="radio-label">High</span>
                <span class="radio-description">Enhanced security with additional verification</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="settings.biometrics.securityLevel"
                  value="maximum"
                />
                <span class="radio-label">Maximum</span>
                <span class="radio-description">Highest security with multi-factor authentication</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Required Fingers for Verification</label>
            <div class="finger-requirements">
              <label class="finger-option">
                <input
                  type="radio"
                  v-model="settings.biometrics.requiredFingers"
                  value="1"
                />
                <span>1 Finger (Fast)</span>
              </label>
              <label class="finger-option">
                <input
                  type="radio"
                  v-model="settings.biometrics.requiredFingers"
                  value="2"
                />
                <span>2 Fingers (Balanced)</span>
              </label>
              <label class="finger-option">
                <input
                  type="radio"
                  v-model="settings.biometrics.requiredFingers"
                  value="any"
                />
                <span>Any 2 of 3 (Secure)</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="switch-label">
              <div class="switch">
                <input
                  type="checkbox"
                  v-model="settings.biometrics.antiSpoofing"
                  class="switch-input"
                />
                <span class="slider"></span>
              </div>
              <span>Enable Anti-Spoofing Protection</span>
            </label>
            <p class="help-text">Advanced security features to prevent fake fingerprint attacks</p>
          </div>

          <div class="form-group">
            <label class="switch-label">
              <div class="switch">
                <input
                  type="checkbox"
                  v-model="settings.biometrics.qualityThreshold"
                  class="switch-input"
                />
                <span class="slider"></span>
              </div>
              <span>Enforce Quality Threshold</span>
            </label>
            <p class="help-text">Require minimum fingerprint quality for enrollment and verification</p>
          </div>

          <div class="form-group">
            <label for="timeout">Verification Timeout (seconds)</label>
            <input
              id="timeout"
              v-model.number="settings.biometrics.timeout"
              type="number"
              class="form-control"
              min="5"
              max="60"
            />
            <p class="help-text">Maximum time allowed for fingerprint verification</p>
          </div>

          <div class="form-actions">
            <button @click="saveBiometricSettings" class="btn btn-primary">
              <i class="bi bi-check-circle"></i>
              Save Changes
            </button>
            <button @click="testBiometricSettings" class="btn btn-outline-secondary">
              <i class="bi bi-fingerprint"></i>
              Test Biometric Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Attendance Settings -->
      <div v-if="activeTab === 'attendance'" class="settings-section">
        <div class="section-header">
          <h3>Attendance Settings</h3>
          <p class="section-description">Configure attendance tracking and rules</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label for="workStartTime">Work Day Start Time</label>
            <input
              id="workStartTime"
              v-model="settings.attendance.workStartTime"
              type="time"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="workEndTime">Work Day End Time</label>
            <input
              id="workEndTime"
              v-model="settings.attendance.workEndTime"
              type="time"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="gracePeriod">Grace Period (minutes)</label>
            <input
              id="gracePeriod"
              v-model.number="settings.attendance.gracePeriod"
              type="number"
              class="form-control"
              min="0"
              max="30"
            />
            <p class="help-text">Minutes allowed before marking as late</p>
          </div>

          <div class="form-group">
            <label for="overtimeThreshold">Overtime Threshold (hours)</label>
            <input
              id="overtimeThreshold"
              v-model.number="settings.attendance.overtimeThreshold"
              type="number"
              class="form-control"
              min="0"
              max="4"
              step="0.5"
            />
            <p class="help-text">Minimum hours before overtime calculation begins</p>
          </div>

          <div class="form-group">
            <label class="switch-label">
              <div class="switch">
                <input
                  type="checkbox"
                  v-model="settings.attendance.weekendTracking"
                  class="switch-input"
                />
                <span class="slider"></span>
              </div>
              <span>Track Weekend Attendance</span>
            </label>
            <p class="help-text">Include weekends in attendance calculations</p>
          </div>

          <div class="form-group">
            <label class="switch-label">
              <div class="switch">
                <input
                  type="checkbox"
                  v-model="settings.attendance.autoCheckout"
                  class="switch-input"
                />
                <span class="slider"></span>
              </div>
              <span>Auto-Checkout</span>
            </label>
            <p class="help-text">Automatically check out at work day end time</p>
          </div>

          <div class="form-actions">
            <button @click="saveAttendanceSettings" class="btn btn-primary">
              <i class="bi bi-check-circle"></i>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div v-if="activeTab === 'notifications'" class="settings-section">
        <div class="section-header">
          <h3>Notification Settings</h3>
          <p class="section-description">Configure system notifications and alerts</p>
        </div>

        <div class="settings-form">
          <div class="notification-category">
            <h4>Email Notifications</h4>
            <div class="notification-items">
              <label class="notification-item">
                <div class="switch">
                  <input
                    type="checkbox"
                    v-model="settings.notifications.email.dailyReport"
                    class="switch-input"
                  />
                  <span class="slider"></span>
                </div>
                <div class="notification-info">
                  <span class="notification-title">Daily Attendance Report</span>
                  <span class="notification-description">Receive daily summary of attendance records</span>
                </div>
              </label>

              <label class="notification-item">
                <div class="switch">
                  <input
                    type="checkbox"
                    v-model="settings.notifications.email.anomalyAlert"
                    class="switch-input"
                  />
                  <span class="slider"></span>
                </div>
                <div class="notification-info">
                  <span class="notification-title">Anomaly Alerts</span>
                  <span class="notification-description">Alert for unusual attendance patterns</span>
                </div>
              </label>

              <label class="notification-item">
                <div class="switch">
                  <input
                    type="checkbox"
                    v-model="settings.notifications.email.systemMaintenance"
                    class="switch-input"
                  />
                  <span class="slider"></span>
                </div>
                <div class="notification-info">
                  <span class="notification-title">System Maintenance</span>
                  <span class="notification-description">Notify about scheduled maintenance</span>
                </div>
              </label>
            </div>
          </div>

          <div class="notification-category">
            <h4>Desktop Notifications</h4>
            <div class="notification-items">
              <label class="notification-item">
                <div class="switch">
                  <input
                    type="checkbox"
                    v-model="settings.notifications.desktop.checkInReminder"
                    class="switch-input"
                  />
                  <span class="slider"></span>
                </div>
                <div class="notification-info">
                  <span class="notification-title">Check-in Reminders</span>
                  <span class="notification-description">Remind employees to check in</span>
                </div>
              </label>

              <label class="notification-item">
                <div class="switch">
                  <input
                    type="checkbox"
                    v-model="settings.notifications.desktop.lateAlert"
                    class="switch-input"
                  />
                  <span class="slider"></span>
                </div>
                <div class="notification-info">
                  <span class="notification-title">Late Arrival Alerts</span>
                  <span class="notification-description">Notify when employees are late</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveNotificationSettings" class="btn btn-primary">
              <i class="bi bi-check-circle"></i>
              Save Changes
            </button>
            <button @click="testNotification" class="btn btn-outline-secondary">
              <i class="bi bi-bell"></i>
              Test Notifications
            </button>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div v-if="activeTab === 'system'" class="settings-section">
        <div class="section-header">
          <h3>System Settings</h3>
          <p class="section-description">Advanced system configuration and maintenance</p>
        </div>

        <div class="settings-form">
          <div class="system-section">
            <h4>Data Management</h4>
            <div class="system-actions">
              <div class="action-item">
                <div class="action-info">
                  <span class="action-title">Database Backup</span>
                  <span class="action-description">Last backup: {{ formatDate(settings.system.lastBackup) }}</span>
                </div>
                <button @click="backupDatabase" class="btn btn-outline-primary">
                  <i class="bi bi-cloud-download"></i>
                  Backup Now
                </button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <span class="action-title">Data Export</span>
                  <span class="action-description">Export attendance data to CSV/Excel</span>
                </div>
                <button @click="exportData" class="btn btn-outline-primary">
                  <i class="bi bi-file-earmark-arrow-down"></i>
                  Export Data
                </button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <span class="action-title">System Logs</span>
                  <span class="action-description">View and download system logs</span>
                </div>
                <button @click="viewLogs" class="btn btn-outline-secondary">
                  <i class="bi bi-file-text"></i>
                  View Logs
                </button>
              </div>
            </div>
          </div>

          <div class="system-section">
            <h4>Maintenance</h4>
            <div class="system-actions">
              <div class="action-item">
                <div class="action-info">
                  <span class="action-title">Clear Cache</span>
                  <span class="action-description">Clear application cache and temporary files</span>
                </div>
                <button @click="clearCache" class="btn btn-outline-warning">
                  <i class="bi bi-trash"></i>
                  Clear Cache
                </button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <span class="action-title">Database Optimization</span>
                  <span class="action-description">Optimize database for better performance</span>
                </div>
                <button @click="optimizeDatabase" class="btn btn-outline-warning">
                  <i class="bi bi-speedometer2"></i>
                  Optimize
                </button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <span class="action-title">System Reset</span>
                  <span class="action-description">Reset to factory settings (dangerous)</span>
                </div>
                <button @click="confirmSystemReset" class="btn btn-outline-danger">
                  <i class="bi bi-exclamation-triangle"></i>
                  Reset System
                </button>
              </div>
            </div>
          </div>

          <div class="system-info">
            <h4>System Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Version</label>
                <span>{{ settings.system.version }}</span>
              </div>
              <div class="info-item">
                <label>Database Size</label>
                <span>{{ settings.system.databaseSize }}</span>
              </div>
              <div class="info-item">
                <label>Last Maintenance</label>
                <span>{{ formatDate(settings.system.lastMaintenance) }}</span>
              </div>
              <div class="info-item">
                <label>System Uptime</label>
                <span>{{ settings.system.uptime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useNotifications } from '@/shared/composables/useNotifications'

export default {
  name: 'SettingsView',
  setup() {
    const { addNotification } = useNotifications()
    const activeTab = ref('general')

    const tabs = [
      { key: 'general', label: 'General', icon: 'bi bi-gear' },
      { key: 'biometrics', label: 'Biometrics', icon: 'bi bi-fingerprint' },
      { key: 'attendance', label: 'Attendance', icon: 'bi bi-calendar-check' },
      { key: 'notifications', label: 'Notifications', icon: 'bi bi-bell' },
      { key: 'system', label: 'System', icon: 'bi bi-pc-display' }
    ]

    const settings = reactive({
      general: {
        companyName: 'Your Company',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        language: 'en'
      },
      biometrics: {
        securityLevel: 'standard',
        requiredFingers: '1',
        antiSpoofing: true,
        qualityThreshold: true,
        timeout: 30
      },
      attendance: {
        workStartTime: '09:00',
        workEndTime: '18:00',
        gracePeriod: 10,
        overtimeThreshold: 8,
        weekendTracking: false,
        autoCheckout: false
      },
      notifications: {
        email: {
          dailyReport: true,
          anomalyAlert: true,
          systemMaintenance: true
        },
        desktop: {
          checkInReminder: true,
          lateAlert: false
        }
      },
      system: {
        lastBackup: new Date('2024-01-15'),
        version: '2.1.0',
        databaseSize: '245.7 MB',
        lastMaintenance: new Date('2024-01-10'),
        uptime: '15 days, 8 hours'
      }
    })

    const formatDate = (date) => {
      if (!date) return 'Never'
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date))
    }

    const saveGeneralSettings = () => {
      addNotification({
        type: 'success',
        message: 'General settings have been saved successfully.',
        duration: 3000
      })
    }

    const saveBiometricSettings = () => {
      addNotification({
        type: 'success',
        message: 'Biometric settings have been updated successfully.',
        duration: 3000
      })
    }

    const saveAttendanceSettings = () => {
      addNotification({
        type: 'success',
        message: 'Attendance settings have been saved successfully.',
        duration: 3000
      })
    }

    const saveNotificationSettings = () => {
      addNotification({
        type: 'success',
        message: 'Notification preferences have been updated successfully.',
        duration: 3000
      })
    }

    const testBiometricSettings = () => {
      addNotification({
        type: 'info',
        message: 'Biometric settings test would be performed here.',
        duration: 3000
      })
    }

    const testNotification = () => {
      addNotification({
        type: 'info',
        message: 'Test notification sent successfully!',
        duration: 3000
      })
    }

    const backupDatabase = () => {
      addNotification({
        type: 'info',
        message: 'Database backup started. You will be notified when complete.',
        duration: 5000
      })

      setTimeout(() => {
        addNotification({
          type: 'success',
          message: 'Database backup completed successfully!',
          duration: 3000
        })
        settings.system.lastBackup = new Date()
      }, 3000)
    }

    const exportData = () => {
      addNotification({
        type: 'info',
        message: 'Preparing data export. Download will start shortly.',
        duration: 3000
      })
    }

    const viewLogs = () => {
      addNotification({
        type: 'info',
        message: 'System logs viewer would open here.',
        duration: 3000
      })
    }

    const clearCache = () => {
      addNotification({
        type: 'warning',
        message: 'Application cache cleared successfully.',
        duration: 3000
      })
    }

    const optimizeDatabase = () => {
      addNotification({
        type: 'info',
        message: 'Database optimization started. This may take a few minutes.',
        duration: 5000
      })

      setTimeout(() => {
        addNotification({
          type: 'success',
          message: 'Database optimization completed successfully!',
          duration: 3000
        })
      }, 4000)
    }

    const confirmSystemReset = () => {
      if (confirm('⚠️ WARNING: This will reset all system settings to factory defaults. This action cannot be undone. Are you sure you want to continue?')) {
        if (confirm('⚠️ FINAL WARNING: All your data will be permanently lost. Type "RESET" to confirm:')) {
          addNotification({
            type: 'error',
            message: 'System reset cancelled for safety. This would be a destructive operation.',
            duration: 5000
          })
        }
      }
    }

    onMounted(() => {
      // Load settings from storage or API
      // This would typically fetch from an API
    })

    return {
      activeTab,
      tabs,
      settings,
      formatDate,
      saveGeneralSettings,
      saveBiometricSettings,
      saveAttendanceSettings,
      saveNotificationSettings,
      testBiometricSettings,
      testNotification,
      backupDatabase,
      exportData,
      viewLogs,
      clearCache,
      optimizeDatabase,
      confirmSystemReset
    }
  }
}
</script>

<style scoped>
.settings-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
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

.settings-nav {
  background: white;
  border-radius: 12px;
  padding: 0 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 0;
}

.nav-tab {
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-tab:hover {
  background: #f8f9fa;
  color: #495057;
}

.nav-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.settings-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.section-header h3 {
  color: #495057;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-description {
  color: #6c757d;
  margin: 0;
}

.settings-form {
  display: grid;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.help-text {
  color: #6c757d;
  font-size: 0.75rem;
  margin: 4px 0 0 0;
}

.radio-group {
  display: grid;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.radio-option:has(input:checked) {
  border-color: #667eea;
  background: #f0f4ff;
}

.radio-option input[type="radio"] {
  margin-top: 2px;
}

.radio-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 4px;
}

.radio-description {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.4;
}

.finger-requirements {
  display: grid;
  gap: 12px;
}

.finger-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
}

.finger-option:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.finger-option:has(input:checked) {
  border-color: #667eea;
  background: #f0f4ff;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch-input {
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

.notification-category {
  margin-bottom: 32px;
}

.notification-category h4 {
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.notification-items {
  display: grid;
  gap: 16px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.notification-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.notification-info {
  flex: 1;
}

.notification-title {
  display: block;
  color: #495057;
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-description {
  color: #6c757d;
  font-size: 0.875rem;
}

.system-section {
  margin-bottom: 32px;
}

.system-section h4 {
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.system-actions {
  display: grid;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.action-info {
  flex: 1;
}

.action-title {
  display: block;
  color: #495057;
  font-weight: 500;
  margin-bottom: 4px;
}

.action-description {
  color: #6c757d;
  font-size: 0.875rem;
}

.system-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.system-info h4 {
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item label {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.875rem;
}

.info-item span {
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
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

.btn-primary:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
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

.btn-outline-secondary {
  color: #6c757d;
  border-color: #ced4da;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-outline-warning {
  color: #fd7e14;
  border-color: #fd7e14;
  background: transparent;
}

.btn-outline-warning:hover {
  background: #fd7e14;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  background: transparent;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .settings-view {
    padding: 16px;
  }

  .settings-nav {
    padding: 0 16px;
  }

  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-tab {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .settings-content {
    padding: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-item {
    flex-direction: column;
    gap: 12px;
    text-align: center;
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