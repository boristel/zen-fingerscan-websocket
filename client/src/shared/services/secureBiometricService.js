/**
 * Secure Biometric Service
 * Replaces client-side verification with secure server-side processing
 * Addresses all security vulnerabilities identified in VERIFY-BIOMETRIC.md
 */

import api from '@/services/api'

export class SecureBiometricService {
  constructor() {
    this.sdk = null
    this.isInitialized = false
    this.devices = []
    this.currentDevice = null
    this.acquisitionInProgress = false
    this.eventListeners = new Map()

    // Security enhancements
    this.sessionId = this.generateSessionId()
    this.requestId = 1
    this.lastActivity = Date.now()

    // Rate limiting
    this.attemptCount = 0
    this.lastAttemptTime = 0
    this.rateLimitWindow = 60 * 1000 // 1 minute
    this.maxAttempts = 10 // Maximum attempts per window

    this.bindMethods()
  }

  /**
   * Initialize fingerprint SDK with security enhancements
   */
  async initialize() {
    try {
      console.log('🔒 Initializing SECURE biometric service...')

      // Check SDK availability
      if (typeof Fingerprint === 'undefined') {
        throw new Error('Fingerprint SDK not loaded')
      }

      // Create SDK instance
      this.sdk = new Fingerprint()
      this.isInitialized = true

      // Set up secure event listeners
      this.setupSecureEventListeners()

      // Enumerate available devices
      const devices = await this.enumerateDevices()

      if (devices.length === 0) {
        throw new Error('No fingerprint devices found')
      }

      console.log('✅ Secure biometric service initialized successfully')
      console.log('📱 Available devices:', devices)

      this.logSecurityEvent('SERVICE_INITIALIZED', {
        deviceCount: devices.length,
        sessionId: this.sessionId
      })

      return devices

    } catch (error) {
      console.error('❌ Secure biometric initialization failed:', error)
      this.logSecurityEvent('SERVICE_INIT_FAILED', {
        error: error.message,
        sessionId: this.sessionId
      })
      throw error
    }
  }

  /**
   * Setup secure event listeners with validation
   */
  setupSecureEventListeners() {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    // Device connection events
    this.sdk.on('deviceConnected', (event) => {
      this.validateEventData(event, 'deviceConnected')
      this.devices.push(event.deviceUid)
      this.emit('deviceConnected', event)
      this.logSecurityEvent('DEVICE_CONNECTED', { deviceUid: event.deviceUid })
    })

    this.sdk.on('deviceDisconnected', (event) => {
      this.validateEventData(event, 'deviceDisconnected')
      this.devices = this.devices.filter(uid => uid !== event.deviceUid)
      if (this.currentDevice === event.deviceUid) {
        this.currentDevice = null
      }
      this.emit('deviceDisconnected', event)
      this.logSecurityEvent('DEVICE_DISCONNECTED', { deviceUid: event.deviceUid })
    })

    // Acquisition events with enhanced security
    this.sdk.on('samplesAcquired', (event) => {
      this.validateEventData(event, 'samplesAcquired')
      this.validateSampleData(event)
      this.emit('samplesAcquired', event)
      this.lastActivity = Date.now()
    })

    this.sdk.on('qualityReported', (event) => {
      this.validateEventData(event, 'qualityReported')
      this.emit('qualityReported', event)
    })

    this.sdk.on('acquisitionError', (event) => {
      this.validateEventData(event, 'acquisitionError')
      this.emit('acquisitionError', event)
      this.logSecurityEvent('ACQUISITION_ERROR', {
        error: event.error,
        deviceUid: event.deviceUid
      })
    })
  }

  /**
   * Enumerate available fingerprint devices
   */
  async enumerateDevices() {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    try {
      const devices = await this.sdk.enumerateDevices()
      this.devices = devices || []
      return this.devices
    } catch (error) {
      console.error('Device enumeration failed:', error)
      throw new Error('Failed to enumerate fingerprint devices')
    }
  }

  /**
   * Start secure fingerprint acquisition
   * Templates are captured client-side but verified server-side
   */
  async startAcquisition(deviceUid = null, format = 'Intermediate', maxScans = 3) {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }

    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    if (this.acquisitionInProgress) {
      throw new Error('Acquisition already in progress')
    }

    try {
      // Select device
      const targetDevice = deviceUid || this.devices[0]
      if (!targetDevice) {
        throw new Error('No fingerprint device available')
      }

      this.currentDevice = targetDevice
      this.acquisitionInProgress = true

      console.log('🔒 Starting SECURE fingerprint acquisition:', {
        device: targetDevice,
        format,
        maxScans,
        sessionId: this.sessionId
      })

      // Start acquisition
      await this.sdk.startAcquisition(targetDevice, format, maxScans)

      this.logSecurityEvent('ACQUISITION_STARTED', {
        deviceUid: targetDevice,
        format,
        maxScans,
        sessionId: this.sessionId
      })

      return {
        success: true,
        deviceUid: targetDevice,
        format,
        maxScans
      }

    } catch (error) {
      this.acquisitionInProgress = false
      console.error('Failed to start acquisition:', error)
      this.logSecurityEvent('ACQUISITION_START_FAILED', {
        error: error.message,
        deviceUid: this.currentDevice
      })
      throw error
    }
  }

  /**
   * Stop fingerprint acquisition
   */
  async stopAcquisition() {
    if (!this.sdk || !this.acquisitionInProgress) {
      return
    }

    try {
      await this.sdk.stopAcquisition()
      this.acquisitionInProgress = false

      console.log('⏹️ Fingerprint acquisition stopped')
      this.logSecurityEvent('ACQUISITION_STOPPED', {
        deviceUid: this.currentDevice,
        sessionId: this.sessionId
      })

    } catch (error) {
      console.error('Failed to stop acquisition:', error)
      this.logSecurityEvent('ACQUISITION_STOP_FAILED', {
        error: error.message,
        deviceUid: this.currentDevice
      })
    }
  }

  /**
   * CAPTURE TEMPLATE ONLY - No client-side verification
   * Templates are sent to server for secure verification
   */
  async captureForAttendance(employeeId, timeoutMs = 30000) {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }

    try {
      console.log('🔒 Starting SECURE template capture for attendance:', {
        employeeId,
        sessionId: this.sessionId
      })

      this.incrementAttemptCount()

      // Start template acquisition
      await this.startAcquisition(null, 'Intermediate', 3)

      // Capture template with timeout
      const templateData = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.stopAcquisition()
          reject(new Error('Fingerprint capture timeout'))
        }, timeoutMs)

        const onSamplesAcquired = (event) => {
          clearTimeout(timeoutId)
          this.off('samplesAcquired', onSamplesAcquired)
          this.off('acquisitionError', onError)

          if (event.samples && event.samples.length > 0) {
            const sample = event.samples[0]

            // Validate template data
            if (!this.validateTemplateData(sample.Data)) {
              reject(new Error('Invalid template data received'))
              return
            }

            console.log('✅ Template captured successfully:', {
              dataLength: sample.Data.length,
              format: sample.Format,
              sessionId: this.sessionId
            })

            resolve({
              templateData: sample.Data,
              format: sample.Format,
              quality: event.quality || 0,
              deviceUid: event.deviceUid
            })
          } else {
            reject(new Error('No template data received'))
          }
        }

        const onError = (event) => {
          clearTimeout(timeoutId)
          this.off('samplesAcquired', onSamplesAcquired)
          this.off('acquisitionError', onError)
          this.stopAcquisition()
          reject(new Error(`Acquisition error: ${event.error}`))
        }

        this.on('samplesAcquired', onSamplesAcquired)
        this.on('acquisitionError', onError)
      })

      // IMPORTANT: NO CLIENT-SIDE VERIFICATION
      // Template is sent directly to server for secure verification
      console.log('🚀 Template captured - sending to server for verification')

      const verificationResult = await this.verifyOnServer(templateData, employeeId)

      this.logSecurityEvent('TEMPLATE_CAPTURED', {
        employeeId,
        templateLength: templateData.templateData.length,
        verificationSuccess: verificationResult.success,
        sessionId: this.sessionId
      })

      return {
        success: true,
        templateData: templateData.templateData,
        verificationResult,
        captureTime: Date.now(),
        sessionId: this.sessionId
      }

    } catch (error) {
      this.logSecurityEvent('TEMPLATE_CAPTURE_FAILED', {
        employeeId,
        error: error.message,
        sessionId: this.sessionId
      })
      throw error
    } finally {
      await this.stopAcquisition()
    }
  }

  /**
   * SERVER-SIDE VERIFICATION - Critical security improvement
   * All verification logic moved to secure backend
   */
  async verifyOnServer(templateData, employeeId) {
    try {
      console.log('🔒 Sending template to server for SECURE verification')

      const requestData = {
        employeeId,
        templateData,
        sessionId: this.sessionId,
        requestId: this.generateRequestId(),
        timestamp: Date.now(),
        deviceInfo: this.getDeviceInfo(),
        clientFingerprint: this.generateClientFingerprint()
      }

      console.log('📤 Verification request data:', {
        employeeId,
        templateLength: templateData.length,
        sessionId: requestData.sessionId,
        requestId: requestData.requestId
      })

      // Send to secure backend endpoint
      const response = await api.post('/biometric/verify', requestData, {
        timeout: 15000, // 15 second timeout
        headers: {
          'X-Session-ID': this.sessionId,
          'X-Request-ID': requestData.requestId
        }
      })

      console.log('📥 Server verification response:', response)

      if (response.success) {
        this.logSecurityEvent('VERIFICATION_SUCCESS', {
          employeeId,
          similarity: response.data.similarity,
          verified: response.data.verified,
          sessionId: this.sessionId,
          requestId: requestData.requestId
        })

        return {
          success: true,
          verified: response.data.verified,
          similarity: response.data.similarity,
          confidence: response.data.confidence,
          bestMatch: response.data.bestMatch,
          processingTime: response.data.processingTime,
          verificationMethod: 'SERVER_SIDE_SECURE',
          securityLevel: response.data.securityLevel || 'HIGH',
          serverTimestamp: response.data.timestamp
        }
      } else {
        this.logSecurityEvent('VERIFICATION_FAILED', {
          employeeId,
          error: response.message,
          sessionId: this.sessionId,
          requestId: requestData.requestId
        })

        throw new Error(response.message || 'Server verification failed')
      }

    } catch (error) {
      console.error('❌ Server verification failed:', error)
      this.logSecurityEvent('SERVER_VERIFICATION_ERROR', {
        employeeId,
        error: error.message,
        sessionId: this.sessionId
      })

      // Don't expose server errors to client for security
      throw new Error('Verification service temporarily unavailable')
    }
  }

  /**
   * Register new fingerprint template
   */
  async registerFingerprint(employeeId, fingerIndex, timeoutMs = 30000) {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }

    try {
      console.log('🔒 Starting SECURE fingerprint registration:', {
        employeeId,
        fingerIndex,
        sessionId: this.sessionId
      })

      // Capture template for registration
      const captureResult = await this.captureTemplateForRegistration(timeoutMs)

      // Send to server for registration
      const registrationResult = await this.registerOnServer(
        captureResult.templateData,
        employeeId,
        fingerIndex
      )

      this.logSecurityEvent('FINGERPRINT_REGISTERED', {
        employeeId,
        fingerIndex,
        success: registrationResult.success,
        sessionId: this.sessionId
      })

      return {
        success: true,
        employeeId,
        fingerIndex,
        templateId: registrationResult.templateId,
        quality: registrationResult.quality,
        registrationTime: Date.now()
      }

    } catch (error) {
      this.logSecurityEvent('FINGERPRINT_REGISTRATION_FAILED', {
        employeeId,
        fingerIndex,
        error: error.message,
        sessionId: this.sessionId
      })
      throw error
    }
  }

  /**
   * Capture template for registration
   */
  async captureTemplateForRegistration(timeoutMs = 30000) {
    await this.startAcquisition(null, 'Intermediate', 3)

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.stopAcquisition()
        reject(new Error('Registration capture timeout'))
      }, timeoutMs)

      const onSamplesAcquired = (event) => {
        clearTimeout(timeoutId)
        this.off('samplesAcquired', onSamplesAcquired)
        this.off('acquisitionError', onError)

        if (event.samples && event.samples.length > 0) {
          const sample = event.samples[0]

          if (!this.validateTemplateData(sample.Data)) {
            reject(new Error('Invalid template data'))
            return
          }

          resolve({
            templateData: sample.Data,
            format: sample.Format,
            quality: event.quality || 0
          })
        } else {
          reject(new Error('No template data received'))
        }
      }

      const onError = (event) => {
        clearTimeout(timeoutId)
        this.off('samplesAcquired', onSamplesAcquired)
        this.off('acquisitionError', onError)
        this.stopAcquisition()
        reject(new Error(`Registration capture error: ${event.error}`))
      }

      this.on('samplesAcquired', onSamplesAcquired)
      this.on('acquisitionError', onError)
    })
  }

  /**
   * Register template on server
   */
  async registerOnServer(templateData, employeeId, fingerIndex) {
    try {
      const requestData = {
        employeeId,
        fingerIndex,
        templateData,
        sessionId: this.sessionId,
        requestId: this.generateRequestId(),
        timestamp: Date.now(),
        deviceInfo: this.getDeviceInfo()
      }

      const response = await api.post('/biometric/register', requestData, {
        headers: {
          'X-Session-ID': this.sessionId,
          'X-Request-ID': requestData.requestId
        }
      })

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Registration failed')
      }

    } catch (error) {
      console.error('Server registration failed:', error)
      throw new Error('Registration service temporarily unavailable')
    }
  }

  /**
   * Security validation methods
   */
  validateEventData(event, eventType) {
    if (!event || typeof event !== 'object') {
      throw new Error(`Invalid event data for ${eventType}`)
    }

    // Add more specific validation based on event type
    switch (eventType) {
      case 'samplesAcquired':
        if (!event.samples || !Array.isArray(event.samples)) {
          throw new Error('Invalid samples data')
        }
        break
      case 'qualityReported':
        if (typeof event.quality !== 'number') {
          throw new Error('Invalid quality data')
        }
        break
    }
  }

  validateSampleData(event) {
    if (!event.samples || event.samples.length === 0) {
      throw new Error('No sample data received')
    }

    const sample = event.samples[0]
    if (!sample.Data || typeof sample.Data !== 'string') {
      throw new Error('Invalid sample data format')
    }

    if (sample.Data.length < 100) {
      throw new Error('Sample data too short')
    }

    if (sample.Data.length > 2000) {
      throw new Error('Sample data too long')
    }
  }

  validateTemplateData(templateData) {
    if (!templateData || typeof templateData !== 'string') {
      console.error('Template validation failed: Invalid data type')
      return false
    }

    if (templateData.length < 100) {
      console.error('Template validation failed: Data too short')
      return false
    }

    if (templateData.length > 2000) {
      console.error('Template validation failed: Data too long')
      return false
    }

    // Basic format validation for base64
    try {
      atob(templateData)
    } catch (error) {
      console.error('Template validation failed: Invalid base64 format')
      return false
    }

    return true
  }

  /**
   * Rate limiting implementation
   */
  checkRateLimit() {
    const now = Date.now()

    // Reset counter if window has passed
    if (now - this.lastAttemptTime > this.rateLimitWindow) {
      this.attemptCount = 0
      this.lastAttemptTime = now
    }

    if (this.attemptCount >= this.maxAttempts) {
      const waitTime = Math.ceil((this.rateLimitWindow - (now - this.lastAttemptTime)) / 1000)
      console.warn(`Rate limit exceeded. Wait ${waitTime} seconds.`)
      return false
    }

    return true
  }

  incrementAttemptCount() {
    this.attemptCount++
    this.lastAttemptTime = Date.now()
  }

  /**
   * Security utilities
   */
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  generateRequestId() {
    return 'req_' + (++this.requestId) + '_' + Date.now()
  }

  generateClientFingerprint() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Client fingerprint', 2, 2)

    return btoa(canvas.toDataURL()).slice(0, 32)
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    }
  }

  logSecurityEvent(eventType, details) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      details,
      clientFingerprint: this.generateClientFingerprint()
    }

    console.log('🔒 SECURITY EVENT:', event)

    // Send to server for audit logging
    api.post('/audit/log', event).catch(() => {
      // Log locally if server logging fails
      localStorage.setItem(`security_event_${Date.now()}`, JSON.stringify(event))
    })
  }

  /**
   * Event management
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  /**
   * Cleanup
   */
  async destroy() {
    try {
      await this.stopAcquisition()

      if (this.sdk) {
        // Clean up SDK resources if needed
        this.sdk = null
      }

      this.eventListeners.clear()
      this.isInitialized = false
      this.devices = []
      this.currentDevice = null

      this.logSecurityEvent('SERVICE_DESTROYED', {
        sessionId: this.sessionId
      })

    } catch (error) {
      console.error('Error during service cleanup:', error)
    }
  }

  /**
   * Bind methods to maintain context
   */
  bindMethods() {
    this.initialize = this.initialize.bind(this)
    this.startAcquisition = this.startAcquisition.bind(this)
    this.stopAcquisition = this.stopAcquisition.bind(this)
    this.captureForAttendance = this.captureForAttendance.bind(this)
    this.registerFingerprint = this.registerFingerprint.bind(this)
    this.destroy = this.destroy.bind(this)
  }
}

export default SecureBiometricService