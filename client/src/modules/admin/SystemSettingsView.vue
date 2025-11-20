<template>
  <div class="system-settings">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">System Settings</h2>
        <p class="text-muted mb-0">Configure system-wide settings and preferences</p>
      </div>
      <div>
        <button class="btn btn-success" @click="saveAllSettings" :disabled="!hasChanges">
          <i class="bi bi-check-circle me-2"></i>Save All Changes
        </button>
      </div>
    </div>

    <!-- Settings Navigation -->
    <div class="row">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <nav class="nav flex-column">
              <a class="nav-link" :class="{ active: activeTab === 'general' }" href="#" @click.prevent="activeTab = 'general'">
                <i class="bi bi-gear me-2"></i>General Settings
              </a>
              <a class="nav-link" :class="{ active: activeTab === 'security' }" href="#" @click.prevent="activeTab = 'security'">
                <i class="bi bi-shield-check me-2"></i>Security
              </a>
              <a class="nav-link" :class="{ active: activeTab === 'attendance' }" href="#" @click.prevent="activeTab = 'attendance'">
                <i class="bi bi-calendar-check me-2"></i>Attendance
              </a>
              <a class="nav-link" :class="{ active: activeTab === 'biometrics' }" href="#" @click.prevent="activeTab = 'biometrics'">
                <i class="bi bi-fingerprint me-2"></i>Biometrics
              </a>
              <a class="nav-link" :class="{ active: activeTab === 'notifications' }" href="#" @click.prevent="activeTab = 'notifications'">
                <i class="bi bi-bell me-2"></i>Notifications
              </a>
              <a class="nav-link" :class="{ active: activeTab === 'backup' }" href="#" @click.prevent="activeTab = 'backup'">
                <i class="bi bi-cloud-upload me-2"></i>Backup & Recovery
              </a>
              <a class="nav-link" :class="{ active: activeTab === 'system' }" href="#" @click.prevent="activeTab = 'system'">
                <i class="bi bi-cpu me-2"></i>System Maintenance
              </a>
            </nav>
          </div>
        </div>
      </div>

      <div class="col-md-9">
        <div class="card">
          <div class="card-body">
            <!-- General Settings -->
            <div v-show="activeTab === 'general'">
              <h5 class="card-title mb-4">General Settings</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Company Name</label>
                    <input type="text" class="form-control" v-model="settings.general.companyName">
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Default Time Zone</label>
                    <select class="form-select" v-model="settings.general.timeZone">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CST">Central Time</option>
                      <option value="MST">Mountain Time</option>
                    </select>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Default Language</label>
                    <select class="form-select" v-model="settings.general.language">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Date Format</label>
                    <select class="form-select" v-model="settings.general.dateFormat">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Time Format</label>
                    <select class="form-select" v-model="settings.general.timeFormat">
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Currency</label>
                    <select class="form-select" v-model="settings.general.currency">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-show="activeTab === 'security'">
              <h5 class="card-title mb-4">Security Settings</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Session Timeout (minutes)</label>
                    <input type="number" class="form-control" v-model="settings.security.sessionTimeout" min="5" max="480">
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Password Policy</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.security.passwordMinLength" id="passwordMinLength">
                      <label class="form-check-label" for="passwordMinLength">
                        Minimum 8 characters
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.security.passwordRequireUppercase" id="passwordRequireUppercase">
                      <label class="form-check-label" for="passwordRequireUppercase">
                        Require uppercase letters
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.security.passwordRequireNumbers" id="passwordRequireNumbers">
                      <label class="form-check-label" for="passwordRequireNumbers">
                        Require numbers
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.security.passwordRequireSpecialChars" id="passwordRequireSpecialChars">
                      <label class="form-check-label" for="passwordRequireSpecialChars">
                        Require special characters
                      </label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Account Lockout</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.security.accountLockoutEnabled" id="accountLockoutEnabled">
                      <label class="form-check-label" for="accountLockoutEnabled">
                        Enable account lockout after failed attempts
                      </label>
                    </div>
                    <div class="row mt-3" v-if="settings.security.accountLockoutEnabled">
                      <div class="col-md-6">
                        <label class="form-label">Max Failed Attempts</label>
                        <input type="number" class="form-control" v-model="settings.security.maxFailedAttempts" min="3" max="10">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Lockout Duration (minutes)</label>
                        <input type="number" class="form-control" v-model="settings.security.lockoutDuration" min="5" max="1440">
                      </div>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Two-Factor Authentication</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.security.twoFactorAuthEnabled" id="twoFactorAuthEnabled">
                      <label class="form-check-label" for="twoFactorAuthEnabled">
                        Enable two-factor authentication
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Attendance Settings -->
            <div v-show="activeTab === 'attendance'">
              <h5 class="card-title mb-4">Attendance Settings</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Standard Working Hours</label>
                    <div class="row">
                      <div class="col-md-6">
                        <label class="form-label">Start Time</label>
                        <input type="time" class="form-control" v-model="settings.attendance.workingHours.start">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">End Time</label>
                        <input type="time" class="form-control" v-model="settings.attendance.workingHours.end">
                      </div>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Grace Period (minutes)</label>
                    <input type="number" class="form-control" v-model="settings.attendance.gracePeriod" min="0" max="60">
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Overtime Settings</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.attendance.overtimeEnabled" id="overtimeEnabled">
                      <label class="form-check-label" for="overtimeEnabled">
                        Enable overtime calculation
                      </label>
                    </div>
                    <div class="row mt-3" v-if="settings.attendance.overtimeEnabled">
                      <div class="col-md-12">
                        <label class="form-label">Overtime starts after (minutes)</label>
                        <input type="number" class="form-control" v-model="settings.attendance.overtimeAfter" min="0" max="480">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Break Settings</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.attendance.autoBreakDeduction" id="autoBreakDeduction">
                      <label class="form-check-label" for="autoBreakDeduction">
                        Automatic break deduction
                      </label>
                    </div>
                    <div class="row mt-3" v-if="settings.attendance.autoBreakDeduction">
                      <div class="col-md-6">
                        <label class="form-label">Break Duration (minutes)</label>
                        <input type="number" class="form-control" v-model="settings.attendance.breakDuration" min="0" max="120">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Minimum Work Hours</label>
                        <input type="number" class="form-control" v-model="settings.attendance.minimumWorkHours" min="1" max="12" step="0.5">
                      </div>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Weekend Settings</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.attendance.weekendWork" id="weekendWork">
                      <label class="form-check-label" for="weekendWork">
                        Allow weekend work
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Biometrics Settings -->
            <div v-show="activeTab === 'biometrics'">
              <h5 class="card-title mb-4">Biometric Settings</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Fingerprint Quality Threshold</label>
                    <select class="form-select" v-model="settings.biometrics.qualityThreshold">
                      <option value="low">Low (50%)</option>
                      <option value="medium">Medium (70%)</option>
                      <option value="high">High (85%)</option>
                      <option value="very_high">Very High (95%)</option>
                    </select>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Maximum Fingers per Employee</label>
                    <input type="number" class="form-control" v-model="settings.biometrics.maxFingers" min="1" max="10">
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Security Settings</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.biometrics.antiSpoofing" id="antiSpoofing">
                      <label class="form-check-label" for="antiSpoofing">
                        Enable anti-spoofing
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.biometrics.livenessDetection" id="livenessDetection">
                      <label class="form-check-label" for="livenessDetection">
                        Enable liveness detection
                      </label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Scanner Configuration</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.biometrics.autoDetect" id="autoDetect">
                      <label class="form-check-label" for="autoDetect">
                        Auto-detect scanner
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.biometrics.multiScan" id="multiScan">
                      <label class="form-check-label" for="multiScan">
                        Require multiple scans for verification
                      </label>
                    </div>
                    <div class="row mt-3" v-if="settings.biometrics.multiScan">
                      <div class="col-md-6">
                        <label class="form-label">Minimum Scans</label>
                        <input type="number" class="form-control" v-model="settings.biometrics.minScans" min="2" max="5">
                      </div>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Data Storage</label>
                    <select class="form-select" v-model="settings.biometrics.storageMethod">
                      <option value="encrypted">Encrypted Database</option>
                      <option value="template">Template Only</option>
                      <option value="hybrid">Hybrid (Template + Encrypted)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notification Settings -->
            <div v-show="activeTab === 'notifications'">
              <h5 class="card-title mb-4">Notification Settings</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Email Notifications</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.notifications.emailEnabled" id="emailEnabled">
                      <label class="form-check-label" for="emailEnabled">
                        Enable email notifications
                      </label>
                    </div>
                    <div v-if="settings.notifications.emailEnabled" class="mt-3">
                      <label class="form-label">SMTP Server</label>
                      <input type="text" class="form-control mb-2" v-model="settings.notifications.smtpServer" placeholder="smtp.example.com">
                      <div class="row">
                        <div class="col-md-6">
                          <label class="form-label">Port</label>
                          <input type="number" class="form-control" v-model="settings.notifications.smtpPort">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Security</label>
                          <select class="form-select" v-model="settings.notifications.smtpSecurity">
                            <option value="none">None</option>
                            <option value="ssl">SSL</option>
                            <option value="tls">TLS</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Notification Types</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.notifications.attendanceAlerts" id="attendanceAlerts">
                      <label class="form-check-label" for="attendanceAlerts">
                        Attendance alerts
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.notifications.securityAlerts" id="securityAlerts">
                      <label class="form-check-label" for="securityAlerts">
                        Security alerts
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.notifications.systemAlerts" id="systemAlerts">
                      <label class="form-check-label" for="systemAlerts">
                        System alerts
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.notifications.backupAlerts" id="backupAlerts">
                      <label class="form-check-label" for="backupAlerts">
                        Backup notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Backup Settings -->
            <div v-show="activeTab === 'backup'">
              <h5 class="card-title mb-4">Backup & Recovery</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Automatic Backup</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.backup.autoBackup" id="autoBackup">
                      <label class="form-check-label" for="autoBackup">
                        Enable automatic backup
                      </label>
                    </div>
                    <div v-if="settings.backup.autoBackup" class="mt-3">
                      <label class="form-label">Backup Frequency</label>
                      <select class="form-select" v-model="settings.backup.frequency">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <label class="form-label mt-3">Backup Time</label>
                      <input type="time" class="form-control" v-model="settings.backup.backupTime">
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Retention Policy</label>
                    <select class="form-select" v-model="settings.backup.retentionPeriod">
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Backup Location</label>
                    <select class="form-select" v-model="settings.backup.location">
                      <option value="local">Local Storage</option>
                      <option value="cloud">Cloud Storage</option>
                      <option value="both">Both Local and Cloud</option>
                    </select>
                    <div v-if="settings.backup.location !== 'local'" class="mt-3">
                      <label class="form-label">Cloud Provider</label>
                      <select class="form-select" v-model="settings.backup.cloudProvider">
                        <option value="aws">AWS S3</option>
                        <option value="azure">Azure Blob</option>
                        <option value="google">Google Cloud</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Backup Content</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.backup.includeDatabase" id="includeDatabase">
                      <label class="form-check-label" for="includeDatabase">
                        Database
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.backup.includeFiles" id="includeFiles">
                      <label class="form-check-label" for="includeFiles">
                        Files and Documents
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.backup.includeSettings" id="includeSettings">
                      <label class="form-check-label" for="includeSettings">
                        System Settings
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Maintenance -->
            <div v-show="activeTab === 'system'">
              <h5 class="card-title mb-4">System Maintenance</h5>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">System Maintenance</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.system.autoMaintenance" id="autoMaintenance">
                      <label class="form-check-label" for="autoMaintenance">
                        Enable automatic maintenance
                      </label>
                    </div>
                    <div v-if="settings.system.autoMaintenance" class="mt-3">
                      <label class="form-label">Maintenance Window</label>
                      <div class="row">
                        <div class="col-md-6">
                          <input type="time" class="form-control" v-model="settings.system.maintenanceStart" placeholder="Start time">
                        </div>
                        <div class="col-md-6">
                          <input type="time" class="form-control" v-model="settings.system.maintenanceEnd" placeholder="End time">
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <label class="form-label">Log Management</label>
                    <select class="form-select" v-model="settings.system.logRetention">
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Performance Optimization</label>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.system.cacheEnabled" id="cacheEnabled">
                      <label class="form-check-label" for="cacheEnabled">
                        Enable system caching
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.system.compressionEnabled" id="compressionEnabled">
                      <label class="form-check-label" for="compressionEnabled">
                        Enable data compression
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.system.indexOptimization" id="indexOptimization">
                      <label class="form-check-label" for="indexOptimization">
                        Automatic index optimization
                      </label>
                    </div>
                  </div>
                  <div class="form-group mb-3">
                    <button class="btn btn-warning me-2" @click="clearCache">
                      <i class="bi bi-arrow-clockwise me-2"></i>Clear Cache
                    </button>
                    <button class="btn btn-info" @click="optimizeDatabase">
                      <i class="bi bi-speedometer2 me-2"></i>Optimize Database
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'SystemSettingsView',
  setup() {
    // Data
    const activeTab = ref('general')
    const originalSettings = ref({})
    const hasChanges = ref(false)

    const settings = ref({
      general: {
        companyName: 'Company Name',
        timeZone: 'EST',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD'
      },
      security: {
        sessionTimeout: 30,
        passwordMinLength: true,
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecialChars: false,
        accountLockoutEnabled: true,
        maxFailedAttempts: 5,
        lockoutDuration: 30,
        twoFactorAuthEnabled: false
      },
      attendance: {
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        gracePeriod: 15,
        overtimeEnabled: true,
        overtimeAfter: 480,
        autoBreakDeduction: true,
        breakDuration: 60,
        minimumWorkHours: 8,
        weekendWork: false
      },
      biometrics: {
        qualityThreshold: 'high',
        maxFingers: 10,
        antiSpoofing: true,
        livenessDetection: true,
        autoDetect: true,
        multiScan: true,
        minScans: 3,
        storageMethod: 'encrypted'
      },
      notifications: {
        emailEnabled: true,
        smtpServer: '',
        smtpPort: 587,
        smtpSecurity: 'tls',
        attendanceAlerts: true,
        securityAlerts: true,
        systemAlerts: true,
        backupAlerts: true
      },
      backup: {
        autoBackup: true,
        frequency: 'daily',
        backupTime: '02:00',
        retentionPeriod: '30',
        location: 'both',
        cloudProvider: 'aws',
        includeDatabase: true,
        includeFiles: true,
        includeSettings: true
      },
      system: {
        autoMaintenance: true,
        maintenanceStart: '02:00',
        maintenanceEnd: '04:00',
        logRetention: '90',
        cacheEnabled: true,
        compressionEnabled: true,
        indexOptimization: true
      }
    })

    // Methods
    const loadSettings = async () => {
      try {
        // Simulate loading settings from API
        console.log('Loading system settings...')
        originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    const saveAllSettings = async () => {
      try {
        console.log('Saving all settings:', settings.value)
        originalSettings.value = JSON.parse(JSON.stringify(settings.value))
        hasChanges.value = false
        alert('All settings saved successfully!')
      } catch (error) {
        console.error('Error saving settings:', error)
        alert('Failed to save settings. Please try again.')
      }
    }

    const clearCache = async () => {
      try {
        console.log('Clearing system cache...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('System cache cleared successfully!')
      } catch (error) {
        console.error('Error clearing cache:', error)
        alert('Failed to clear cache. Please try again.')
      }
    }

    const optimizeDatabase = async () => {
      try {
        console.log('Optimizing database...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert('Database optimized successfully!')
      } catch (error) {
        console.error('Error optimizing database:', error)
        alert('Failed to optimize database. Please try again.')
      }
    }

    // Watch for changes
    const checkForChanges = () => {
      hasChanges.value = JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
    }

    // Lifecycle
    onMounted(() => {
      loadSettings()
    })

    return {
      activeTab,
      settings,
      hasChanges,
      saveAllSettings,
      clearCache,
      optimizeDatabase
    }
  }
}
</script>

<style scoped>
.system-settings {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.nav-link {
  color: #495057;
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
  padding: 0.75rem 1rem;
}

.nav-link:hover {
  background-color: #f8f9fa;
}

.nav-link.active {
  background-color: #007bff;
  color: white;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}
</style>