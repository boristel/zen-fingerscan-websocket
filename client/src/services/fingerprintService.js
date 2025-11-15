// Fingerprint SDK Service for Vue.js
// This service wraps the DigitalPersona U.areU Web SDK functionality

class FingerprintService {
  constructor() {
    this.sdk = null
    this.currentDevice = null
    this.isInitialized = false
    this.acquisitionInProgress = false
    this.scanCount = 0
    this.maxScans = 4
    this.capturedSamples = []
    this.currentFormat = 'PngImage' // Default format
    this.listeners = new Map()
  }

  // Initialize the fingerprint SDK
  async initialize() {
    try {
      console.log('🚀 Initializing Fingerprint SDK...')

      // Check if Fingerprint WebApi is available
      if (typeof Fingerprint === 'undefined' || typeof Fingerprint.WebApi === 'undefined') {
        throw new Error('Fingerprint SDK not loaded. Please ensure the SDK files are properly included.')
      }

      // Check if WebSocket server is available
      await this.checkWebSocketConnection()

      // Initialize SDK instance
      this.sdk = new Fingerprint.WebApi()

      // Set up event listeners
      this.setupEventListeners()

      // Enumerate devices
      const devices = await this.enumerateDevices()

      this.isInitialized = true
      this.emit('initialized', { devices })

      console.log('✅ Fingerprint SDK initialized successfully')
      console.log('📱 Available devices:', devices)

      return devices

    } catch (error) {
      console.error('❌ Failed to initialize Fingerprint SDK:', error)
      this.emit('error', error)
      throw error
    }
  }

  // Set up SDK event listeners
  setupEventListeners() {
    if (!this.sdk) return

    // Add global error handler for SDK
    window.addEventListener('error', (event) => {
      if (event.filename && event.filename.includes('fingerprint.sdk.min.js')) {
        console.error('🚨 Fingerprint SDK Error caught:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        })

        // Emit user-friendly error
        this.emit('sdkError', {
          type: 'FINGERPRINT_SDK_ERROR',
          message: 'Fingerprint device communication error. Please check the device connection and try again.',
          technicalDetails: event.message
        })

        event.preventDefault()
        return false
      }
    })

    // Device connected event
    this.sdk.onDeviceConnected = (e) => {
      console.log('🔗 Device connected:', e)
      this.emit('deviceConnected', e)
    }

    // Device disconnected event
    this.sdk.onDeviceDisconnected = (e) => {
      console.log('🔌 Device disconnected:', e)
      this.currentDevice = null
      this.emit('deviceDisconnected', e)
    }

    // Communication failed event
    this.sdk.onCommunicationFailed = (e) => {
      console.error('❌ Communication failed:', e)
      this.emit('communicationFailed', e)
    }

    // Samples acquired event
    this.sdk.onSamplesAcquired = (s) => {
      console.log('📸 Samples acquired:', s)
      this.handleSamplesAcquired(s)
    }

    // Quality reported event
    this.sdk.onQualityReported = (e) => {
      console.log('📊 Quality reported:', e)
      this.emit('qualityReported', {
        quality: e.quality,
        qualityText: this.getQualityText(e.quality)
      })
    }
  }

  // Get quality text from quality code
  getQualityText(qualityCode) {
    const qualityCodes = {
      0: 'Good',
      1: 'TooLight',
      2: 'TooDark',
      3: 'TooNoisy',
      4: 'LowContrast',
      5: 'NotCentered',
      6: 'TooHigh',
      7: 'TooLow',
      8: 'TooLeft',
      9: 'TooRight',
      10: 'TooFast',
      11: 'TooSlow',
      12: 'TooSkewed',
      13: 'TooShort',
      14: 'WetFinger',
      15: 'FakeFinger',
      16: 'PressureTooHard',
      17: 'PressureTooLight',
      18: 'TooSmall',
      19: 'TooLarge'
    }
    return qualityCodes[qualityCode] || `Unknown (${qualityCode})`
  }

  // Handle acquired fingerprint samples
  handleSamplesAcquired(s) {
    try {
      console.log('🔍 Raw sample data received:', s)
      console.log('🔍 s.samples type:', typeof s.samples)
      console.log('🔍 s.samples content:', s.samples)

      if (!s.samples || s.samples === '') {
        throw new Error('Empty samples data received from fingerprint device')
      }

      let samples
      try {
        samples = JSON.parse(s.samples)
      } catch (parseError) {
        console.error('❌ JSON.parse failed for s.samples:', parseError)
        console.error('❌ Problematic data:', s.samples)
        throw new Error(`Failed to parse fingerprint sample data: ${parseError.message}`)
      }

      if (!Array.isArray(samples) || samples.length === 0) {
        throw new Error('Invalid samples format: expected non-empty array')
      }

      const sample = samples[0]

      console.log(`📝 Sample ${this.scanCount + 1} acquired:`, sample)

      // Process sample based on current format
      let processedSample = this.processSample(sample, this.currentFormat)

      this.capturedSamples.push(processedSample)
      this.scanCount++

      this.emit('sampleAcquired', {
        sample: processedSample,
        scanCount: this.scanCount,
        totalScans: this.maxScans,
        quality: processedSample.quality || 'Good'
      })

      // Check if all scans are completed
      if (this.scanCount >= this.maxScans) {
        this.stopAcquisition()
        this.emit('allScansCompleted', {
          samples: this.capturedSamples,
          totalScans: this.scanCount
        })
      }

    } catch (error) {
      console.error('❌ Error processing sample:', error)
      this.emit('sampleError', error)
    }
  }

  // Process sample based on format
  processSample(sample, format) {
    let processedData = {
      format: format,
      timestamp: new Date().toISOString(),
      originalSample: sample
    }

    try {
      switch (format) {
        case 'PngImage':
          processedData.data = `data:image/png;base64,${Fingerprint.b64UrlTo64(sample)}`
          processedData.type = 'image'
          break

        case 'Raw':
          const rawSampleData = Fingerprint.b64UrlTo64(sample.Data)
          const decodedRawData = JSON.parse(Fingerprint.b64UrlToUtf8(rawSampleData))
          processedData.data = Fingerprint.b64UrlTo64(decodedRawData.Data)
          processedData.type = 'raw'
          processedData.analysis = this.analyzeRawData(processedData.data)
          break

        case 'Compressed':
          const compressedSampleData = Fingerprint.b64UrlTo64(sample.Data)
          const decodedCompressedData = JSON.parse(Fingerprint.b64UrlToUtf8(compressedSampleData))
          processedData.data = `data:application/octet-stream;base64,${Fingerprint.b64UrlTo64(decodedCompressedData.Data)}`
          processedData.type = 'wsq'
          break

        case 'Intermediate':
          const intermediateData = Fingerprint.b64UrlTo64(sample.Data)
          processedData.data = intermediateData
          processedData.type = 'feature'
          break

        default:
          throw new Error(`Unsupported format: ${format}`)
      }

    } catch (error) {
      console.error('❌ Error processing sample format:', format, error)
      processedData.error = error.message
    }

    return processedData
  }

  // Analyze raw fingerprint data
  analyzeRawData(data) {
    return {
      length: data.length,
      estimatedSize: Math.floor(data.length * 0.75),
      hasValidStructure: data.length > 100 && data.includes('/'),
      isBase64: /^[A-Za-z0-9+/=]+$/.test(data),
      firstBytes: data.substring(0, 100)
    }
  }

  // Enumerate available fingerprint devices
  async enumerateDevices() {
    try {
      if (!this.sdk) {
        throw new Error('SDK not initialized')
      }

      const devices = await this.sdk.enumerateDevices()
      console.log('📱 Found devices:', devices)
      return devices

    } catch (error) {
      console.error('❌ Error enumerating devices:', error)
      throw error
    }
  }

  // Get device information
  async getDeviceInfo(deviceId) {
    try {
      if (!this.sdk) {
        throw new Error('SDK not initialized')
      }

      const deviceInfo = await this.sdk.getDeviceInfo(deviceId)
      console.log('ℹ️ Device info:', deviceInfo)
      return deviceInfo

    } catch (error) {
      console.error('❌ Error getting device info:', error)
      throw error
    }
  }

  // Start fingerprint acquisition
  async startAcquisition(deviceId = null, format = 'PngImage', maxScans = 4) {
    try {
      if (!this.isInitialized) {
        throw new Error('SDK not initialized')
      }

      if (this.acquisitionInProgress) {
        throw new Error('Acquisition already in progress')
      }

      // Reset scan state
      this.scanCount = 0
      this.maxScans = maxScans
      this.capturedSamples = []
      this.currentFormat = format

      // Get device if not provided
      if (!deviceId) {
        const devices = await this.enumerateDevices()
        if (devices.length === 0) {
          throw new Error('No fingerprint devices found')
        }
        deviceId = devices[0]
      }

      this.currentDevice = deviceId

      // Start acquisition with specified format
      const formatEnum = this.getFormatEnum(format)
      await this.sdk.startAcquisition(formatEnum, deviceId)

      this.acquisitionInProgress = true

      this.emit('acquisitionStarted', {
        deviceId: deviceId,
        format: format,
        maxScans: maxScans
      })

      console.log(`🚀 Started fingerprint acquisition: Device=${deviceId}, Format=${format}, MaxScans=${maxScans}`)

    } catch (error) {
      console.error('❌ Error starting acquisition:', error)
      this.emit('acquisitionError', error)
      throw error
    }
  }

  // Stop fingerprint acquisition
  async stopAcquisition() {
    try {
      if (!this.sdk || !this.acquisitionInProgress) {
        return
      }

      await this.sdk.stopAcquisition()
      this.acquisitionInProgress = false

      this.emit('acquisitionStopped', {
        scanCount: this.scanCount,
        samples: this.capturedSamples
      })

      console.log('⏹️ Fingerprint acquisition stopped')

    } catch (error) {
      console.error('❌ Error stopping acquisition:', error)
      this.emit('acquisitionError', error)
      throw error
    }
  }

  // Get format enum from string
  getFormatEnum(format) {
    if (typeof Fingerprint === 'undefined' || typeof Fingerprint.SampleFormat === 'undefined') {
      throw new Error('Fingerprint SDK not loaded properly')
    }

    const formats = {
      'PngImage': Fingerprint.SampleFormat.PngImage,
      'Raw': Fingerprint.SampleFormat.Raw,
      'Compressed': Fingerprint.SampleFormat.Compressed,
      'Intermediate': Fingerprint.SampleFormat.Intermediate
    }

    const enumValue = formats[format]
    if (!enumValue) {
      throw new Error(`Invalid format: ${format}. Supported formats: ${Object.keys(formats).join(', ')}`)
    }

    return enumValue
  }

  // Event listener methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Reset scan state
  resetScanState() {
    this.scanCount = 0
    this.capturedSamples = []
    this.acquisitionInProgress = false
  }

  // Get current status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      acquisitionInProgress: this.acquisitionInProgress,
      currentDevice: this.currentDevice,
      scanCount: this.scanCount,
      maxScans: this.maxScans,
      currentFormat: this.currentFormat,
      capturedSamples: this.capturedSamples
    }
  }

  // Check WebSocket connection to fingerprint server
  async checkWebSocketConnection() {
    return new Promise((resolve, reject) => {
      console.log('🔍 Skipping WebSocket pre-check - allowing SDK to auto-detect connection')
      console.log('💡 The DigitalPersona SDK will handle WebSocket connections internally')

      // Don't pre-check WebSocket - let the SDK handle it
      // This avoids the connection issue since your device is detected successfully
      resolve()
    })
  }

  // Cleanup
  destroy() {
    if (this.acquisitionInProgress) {
      this.stopAcquisition()
    }
    this.listeners.clear()
    this.sdk = null
    this.isInitialized = false
    console.log('🗑️ Fingerprint service destroyed')
  }
}

// Create singleton instance
export const fingerprintService = new FingerprintService()

export default fingerprintService