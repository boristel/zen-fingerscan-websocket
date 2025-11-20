// Mock Fingerprint Service for Testing
// This service provides mock fingerprint functionality when the actual SDK is not available

class MockFingerprintService {
  constructor() {
    this.isInitialized = false
    this.acquisitionInProgress = false
    this.scanCount = 0
    this.maxScans = 4
    this.capturedSamples = []
    this.listeners = new Map()
    this.currentDevice = 'Mock-Device-001'
  }

  async initialize() {
    console.log('🧪 Initializing Mock Fingerprint SDK (for testing)')

    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    this.isInitialized = true

    this.emit('initialized', {
      devices: [this.currentDevice],
      mock: true
    })

    console.log('✅ Mock Fingerprint SDK initialized successfully')
    return [this.currentDevice]
  }

  setupEventListeners() {
    // Mock implementation
  }

  async enumerateDevices() {
    if (!this.isInitialized) {
      throw new Error('Mock SDK not initialized')
    }
    return [this.currentDevice]
  }

  async getDeviceInfo(deviceId) {
    return {
      DeviceID: deviceId,
      eUidType: 0,
      eDeviceModality: 2, // Area
      eDeviceTech: 1, // Optical
      version: 'Mock SDK v1.0'
    }
  }

  async startAcquisition(deviceId, format, maxScans = 4) {
    if (!this.isInitialized) {
      throw new Error('Mock SDK not initialized')
    }

    if (this.acquisitionInProgress) {
      throw new Error('Acquisition already in progress')
    }

    this.scanCount = 0
    this.maxScans = maxScans
    this.capturedSamples = []
    this.acquisitionInProgress = true

    console.log(`🧪 Starting mock acquisition: Device=${deviceId || this.currentDevice}, Format=${format}, MaxScans=${maxScans}`)

    this.emit('acquisitionStarted', {
      deviceId: deviceId || this.currentDevice,
      format: format,
      maxScans: maxScans
    })

    // Simulate scanning process
    this.simulateScanning(format)

    return true
  }

  async simulateScanning(format) {
    for (let scan = 1; scan <= this.maxScans; scan++) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay per scan

      const mockSample = this.generateMockSample(format, scan)
      this.scanCount = scan
      this.capturedSamples.push(mockSample)

      this.emit('sampleAcquired', {
        sample: mockSample,
        scanCount: scan,
        totalScans: this.maxScans,
        quality: 0 // Good quality
      })

      this.emit('qualityReported', {
        quality: 0,
        qualityText: 'Good'
      })

      if (scan === this.maxScans) {
        this.acquisitionInProgress = false
        this.emit('allScansCompleted', {
          samples: this.capturedSamples,
          totalScans: this.maxScans
        })
      }
    }
  }

  generateMockSample(format, scanNumber) {
    const mockData = {
      format: format,
      timestamp: new Date().toISOString(),
      scanNumber: scanNumber,
      mock: true
    }

    switch (format) {
      case 'PngImage':
        mockData.data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        mockData.type = 'image'
        break

      case 'Raw':
        mockData.data = this.generateMockRawData()
        mockData.type = 'raw'
        mockData.analysis = this.analyzeRawData(mockData.data)
        break

      case 'Compressed':
        mockData.data = 'data:application/octet-stream;base64,H4sIAAAAAAAAAwMAAAAAAAAAAAA= limited?'
        mockData.type = 'wsq'
        break

      case 'Intermediate':
        mockData.data = this.generateMockIntermediateData()
        mockData.type = 'feature'
        break

      default:
        throw new Error(`Unsupported format: ${format}`)
    }

    return mockData
  }

  generateMockRawData() {
    // Generate realistic-looking base64 fingerprint data
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    let data = ''
    for (let i = 0; i < 5000; i++) {
      data += base64Chars.charAt(Math.floor(Math.random() * base64Chars.length))
    }
    return data
  }

  generateMockIntermediateData() {
    const data = []
    for (let i = 0; i < 500; i++) {
      data.push(Math.floor(Math.random() * 256))
    }
    return btoa(String.fromCharCode.apply(null, data))
  }

  analyzeRawData(data) {
    return {
      length: data.length,
      estimatedSize: Math.floor(data.length * 0.75),
      hasValidStructure: data.length > 100 && data.includes('/'),
      isBase64: /^[A-Za-z0-9+/=]+$/.test(data),
      firstBytes: data.substring(0, 100)
    }
  }

  async stopAcquisition() {
    this.acquisitionInProgress = false
    console.log('🧪 Mock acquisition stopped')
    this.emit('acquisitionStopped', {
      scanCount: this.scanCount,
      samples: this.capturedSamples
    })
  }

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

  getFormatEnum(format) {
    const formats = {
      'PngImage': 0,
      'Raw': 1,
      'Compressed': 2,
      'Intermediate': 3
    }
    return formats[format] || 0
  }

  // Event handling
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
          console.error(`Error in mock event listener for ${event}:`, error)
        }
      })
    }
  }

  resetScanState() {
    this.scanCount = 0
    this.capturedSamples = []
    this.acquisitionInProgress = false
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      acquisitionInProgress: this.acquisitionInProgress,
      currentDevice: this.currentDevice,
      scanCount: this.scanCount,
      maxScans: this.maxScans,
      currentFormat: 'PngImage',
      capturedSamples: this.capturedSamples,
      mock: true
    }
  }

  // STRICT MOCK VERIFICATION: Proper fingerprint verification with high security
  async verifyFingerprint(scannedFingerprint, registeredTemplates) {
    try {
      console.log('🧪 === MOCK FINGERPRINT VERIFICATION (STRICT MODE) ===')
      console.log('📊 Verification parameters:', {
        scannedFingerprintLength: scannedFingerprint ? scannedFingerprint.length : 0,
        registeredTemplatesCount: registeredTemplates ? registeredTemplates.length : 0
      })

      if (!scannedFingerprint || !registeredTemplates || registeredTemplates.length === 0) {
        return {
          success: false,
          verified: false,
          similarity: 0,
          error: 'Missing fingerprint data for verification'
        }
      }

      let bestMatch = null
      let bestScore = 0
      let verificationResults = []

      // Simulate secure verification for each registered template
      for (let i = 0; i < registeredTemplates.length; i++) {
        const template = registeredTemplates[i]

        if (!template.fingerimage) {
          console.log(`⚠️ Skipping template ${i} - no fingerprint data`)
          continue
        }

        console.log(`🔍 Mock verification for fingerindex ${template.fingerindex}...`)

        // STRICT MOCK VERIFICATION: Only exact finger match passes
        // This simulates how real biometric verification should work
        console.log('🔒 STRICT MOCK: Simulating secure biometric verification...')

        // For secure testing, we need to simulate exact finger matching
        // In real deployment, this would compare actual biometric features
        let similarity

        // To simulate secure verification properly:
        // - Only the FIRST registered fingerprint will match (simulating correct finger)
        // - All other registered fingerprints will get lower scores (simulating wrong fingers)
        const isFirstTemplate = i === 0 // Assume first template is the "correct" finger

        if (isFirstTemplate) {
          // Exact same finger: High similarity (80-94%)
          similarity = 80 + Math.floor(Math.random() * 15) // 80-94%
          console.log(`✅ MOCK: Exact finger match for template ${i} (simulating correct finger)`)
        } else {
          // Different finger: Always below threshold (45-72% max)
          similarity = 45 + Math.floor(Math.random() * 27) // 45-71%
          console.log(`❌ MOCK: Wrong finger for template ${i} (simulating different finger)`)
        }

        const result = {
          fingerindex: template.fingerindex,
          similarity: similarity,
          verified: similarity >= 75, // BALANCED: 75%+ qualifies as verified
          confidence: similarity >= 75 ? similarity : 0,
          matchDetails: {
            mockVerification: true,
            securityLevel: 'HIGH',
            threshold: 75
          },
          namakaryawan: template.namakaryawan,
          karyawanid: template.karyawanid
        }

        verificationResults.push(result)

        console.log(`📊 Mock verification result for finger ${template.fingerindex}:`, {
          similarity: similarity + '%',
          verified: result.verified,
          securityThreshold: '75%'
        })

        if (similarity > bestScore) {
          bestScore = similarity
          bestMatch = result
        }
      }

      // STRICT SECURITY: Only verify if best match meets high threshold
      const finalVerified = bestMatch && bestMatch.verified
      const finalSimilarity = finalVerified ? bestScore : 0

      const finalResult = {
        success: true,
        verified: finalVerified,
        bestMatch: bestMatch,
        similarity: finalSimilarity,
        verificationResults: verificationResults,
        processingTime: Date.now(),
        securityLevel: 'HIGH',
        threshold: 75
      }

      console.log('🔒 MOCK VERIFICATION RESULT:', {
        verified: finalResult.verified,
        similarity: finalResult.similarity + '%',
        securityThreshold: '75%',
        bestMatchFinger: finalResult.bestMatch?.fingerindex || 'none',
        totalTemplatesCompared: registeredTemplates.length,
        securityStatus: finalResult.verified ? '✅ SECURE VERIFICATION' : '❌ REJECTED - Below security threshold'
      })

      return finalResult

    } catch (error) {
      console.error('❌ Mock fingerprint verification error:', error)
      return {
        success: false,
        verified: false,
        similarity: 0,
        error: error.message
      }
    }
  }

  destroy() {
    if (this.acquisitionInProgress) {
      this.stopAcquisition()
    }
    this.listeners.clear()
    this.isInitialized = false
    console.log('🧪 Mock fingerprint service destroyed')
  }
}

export const mockFingerprintService = new MockFingerprintService()
export default mockFingerprintService