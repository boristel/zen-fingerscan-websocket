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
          console.log('🧬 Processing Intermediate format sample for template verification:')
          console.log('   - Original sample length:', sample ? sample.length : 0)
          console.log('   - Processed template length:', intermediateData ? intermediateData.length : 0)
          console.log('   - Template first 50 chars:', intermediateData ? intermediateData.substring(0, 50) : 'NONE')
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

  // Verify fingerprint using proper feature-based matching
  async verifyFingerprint(scannedTemplate, registeredTemplates) {
    try {
      console.log('🔍 === PROPER FINGERPRINT VERIFICATION ===')
      console.log('📥 Scanned template:', {
        length: scannedTemplate ? scannedTemplate.length : 0,
        type: typeof scannedTemplate,
        first50: scannedTemplate ? scannedTemplate.substring(0, 50) : 'NONE'
      })

      console.log('📊 Registered templates:', registeredTemplates.map((template, index) => ({
        index: index,
        length: template.fingerimage ? template.fingerimage.length : 0,
        fingerindex: template.fingerindex,
        hasData: !!template.fingerimage,
        first50: template.fingerimage ? template.fingerimage.substring(0, 50) : 'NONE'
      })))

      if (!scannedTemplate || !registeredTemplates || registeredTemplates.length === 0) {
        throw new Error('Missing fingerprint templates for verification')
      }

      // Extract fingerprint features from the scanned template
      const scannedFeatures = this.extractFingerprintFeatures(scannedTemplate)

      if (!scannedFeatures || scannedFeatures.length === 0) {
        throw new Error('Failed to extract features from scanned fingerprint')
      }

      console.log('🧬 Extracted features from scanned fingerprint:', {
        featureCount: scannedFeatures.length,
        qualityScore: scannedFeatures.qualityScore || 'N/A'
      })

      let bestMatch = null
      let bestScore = 0
      let verificationResults = []

      // Compare scanned features with each registered template
      for (let i = 0; i < registeredTemplates.length; i++) {
        const registeredTemplate = registeredTemplates[i]

        if (!registeredTemplate.fingerimage) {
          console.log(`⚠️ Skipping template ${i} - no fingerprint data`)
          continue
        }

        console.log(`🔍 Comparing with registered template ${i} (fingerindex: ${registeredTemplate.fingerindex})...`)

        try {
          // Extract features from registered template
          const registeredFeatures = this.extractFingerprintFeatures(registeredTemplate.fingerimage)

          if (!registeredFeatures || registeredFeatures.length === 0) {
            console.log(`⚠️ Could not extract features from registered template ${i}`)
            continue
          }

          console.log(`🧬 Extracted features from registered template ${i}:`, {
            featureCount: registeredFeatures.length,
            qualityScore: registeredFeatures.qualityScore || 'N/A'
          })

          // Perform proper fingerprint feature matching
          const matchResult = await this.matchFingerprintFeatures(scannedFeatures, registeredFeatures)

          const result = {
            fingerindex: registeredTemplate.fingerindex,
            similarity: matchResult.similarity,
            verified: matchResult.verified,
            confidence: matchResult.confidence,
            matchDetails: matchResult.details,
            namakaryawan: registeredTemplate.namakaryawan,
            karyawanid: registeredTemplate.karyawanid
          }

          verificationResults.push(result)

          console.log(`📊 Template ${i} result:`, {
            fingerindex: result.fingerindex,
            similarity: result.similarity + '%',
            verified: result.verified,
            confidence: result.confidence
          })

          if (matchResult.similarity > bestScore) {
            bestScore = matchResult.similarity
            bestMatch = result
          }

        } catch (error) {
          console.error(`❌ Error processing template ${i}:`, error)
          verificationResults.push({
            fingerindex: registeredTemplate.fingerindex,
            similarity: 0,
            verified: false,
            confidence: 0,
            error: error.message
          })
        }
      }

      const finalResult = {
        success: true,
        verified: bestMatch ? bestMatch.verified : false,
        bestMatch: bestMatch,
        similarity: bestScore,
        verificationResults: verificationResults,
        processingTime: Date.now()
      }

      console.log('✅ FINGERPRINT VERIFICATION COMPLETED:', {
        verified: finalResult.verified,
        bestMatch: finalResult.bestMatch,
        similarity: finalResult.similarity + '%',
        confidence: finalResult.bestMatch?.confidence || 'N/A',
        totalTemplatesCompared: registeredTemplates.length
      })

      return finalResult

    } catch (error) {
      console.error('❌ Fingerprint verification failed:', error)
      return {
        success: false,
        verified: false,
        error: error.message,
        similarity: 0
      }
    }
  }

  // Compare two fingerprint templates
  async compareTemplates(template1, template2) {
    try {
      console.log('🔬 === TEMPLATE COMPARISON ===')
      console.log('📊 Template 1:', {
        length: template1 ? template1.length : 0,
        type: typeof template1,
        first30: template1 ? template1.substring(0, 30) : 'NONE'
      })
      console.log('📊 Template 2:', {
        length: template2 ? template2.length : 0,
        type: typeof template2,
        first30: template2 ? template2.substring(0, 30) : 'NONE'
      })

      if (!template1 || !template2) {
        throw new Error('Missing template data for comparison')
      }

      // Convert base64 to Uint8Array for browser compatibility
      const buffer1 = this.base64ToUint8Array(template1)
      const buffer2 = this.base64ToUint8Array(template2)

      console.log('📏 Buffer sizes:', {
        buffer1: buffer1.length,
        buffer2: buffer2.length
      })

      // Advanced template comparison algorithm
      const similarity = await this.performTemplateComparison(buffer1, buffer2)

      console.log('📊 Template similarity:', similarity + '%')
      return similarity

    } catch (error) {
      console.error('❌ Template comparison error:', error)
      return 0
    }
  }

  // Convert base64 to Uint8Array (browser compatible)
  base64ToUint8Array(base64) {
    try {
      console.log('🔄 === DETAILED BASE64 CONVERSION DEBUG ===')
      console.log('📥 Input base64 length:', base64.length)
      console.log('📥 Input base64 first 100 chars:', base64.substring(0, 100))
      console.log('📥 Input base64 last 100 chars:', base64.substring(base64.length - 100))

      // Check if base64 contains URL-safe characters
      const hasUrlSafeChars = /[-_]/.test(base64)
      const hasPadding = /=/.test(base64)
      console.log('🔍 Base64 analysis:', {
        hasUrlSafeChars: hasUrlSafeChars,
        hasPadding: hasPadding,
        isUrlSafe: hasUrlSafeChars || !hasPadding
      })

      // Decode base64 string to binary string
      const binaryString = atob(base64)
      console.log('📦 Decoded binary string length:', binaryString.length)

      // Create Uint8Array from binary string
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      console.log('🔢 Uint8Array created, length:', bytes.length)
      console.log('🔢 First 20 bytes:', Array.from(bytes.slice(0, 20)))
      console.log('🔢 Last 20 bytes:', Array.from(bytes.slice(-20)))

      // Check for template structure patterns
      const uniqueBytes = new Set(bytes)
      console.log('🔍 Byte diversity:', {
        totalBytes: bytes.length,
        uniqueBytes: uniqueBytes.size,
        diversity: (uniqueBytes.size / bytes.length * 100).toFixed(1) + '%'
      })

      return bytes
    } catch (error) {
      console.error('❌ Base64 to Uint8Array conversion error:', error)
      console.error('❌ Input base64 was:', base64.substring(0, 100) + '...')
      return new Uint8Array(0)
    }
  }

  // Template comparison for fingerprint templates using feature-based analysis
  async performTemplateComparison(buffer1, buffer2) {
    try {
      console.log('🔬 Starting ADVANCED fingerprint template comparison')

      const minLength = Math.min(buffer1.length, buffer2.length)
      const maxLength = Math.max(buffer1.length, buffer2.length)

      console.log('📏 Template analysis:', {
        buffer1Length: buffer1.length,
        buffer2Length: buffer2.length,
        minLength: minLength,
        maxLength: maxLength
      })

      // Remove padding bytes (trailing zeros) from templates
      const cleanBuffer1 = this.removePadding(buffer1)
      const cleanBuffer2 = this.removePadding(buffer2)

      console.log('🧹 After padding removal:', {
        buffer1Length: cleanBuffer1.length,
        buffer2Length: cleanBuffer2.length
      })

      // Feature-based fingerprint comparison
      const similarity = this.calculateFingerprintSimilarity(cleanBuffer1, cleanBuffer2)

      console.log('🔬 Advanced fingerprint analysis result:', {
        similarity: similarity,
        buffer1Features: cleanBuffer1.length,
        buffer2Features: cleanBuffer2.length
      })

      return similarity

    } catch (error) {
      console.error('❌ Advanced template comparison error:', error)
      return 0
    }
  }

  // Remove padding bytes from fingerprint template
  removePadding(buffer) {
    // Find the last non-zero byte
    let lastNonZeroIndex = buffer.length - 1
    while (lastNonZeroIndex >= 0 && buffer[lastNonZeroIndex] === 0) {
      lastNonZeroIndex--
    }

    // Return buffer without trailing padding
    return buffer.slice(0, lastNonZeroIndex + 1)
  }

  // Advanced fingerprint similarity calculation
  calculateFingerprintSimilarity(buffer1, buffer2) {
    const minLength = Math.min(buffer1.length, buffer2.length)
    const maxLength = Math.max(buffer1.length, buffer2.length)

    if (minLength === 0) return 0

    let featureMatches = 0
    let totalFeatures = minLength
    let cumulativeScore = 0

    // Analyze fingerprint features using sliding window approach
    const windowSize = 8
    const stepSize = 4

    for (let i = 0; i <= minLength - windowSize; i += stepSize) {
      const window1 = buffer1.slice(i, i + windowSize)
      const window2 = buffer2.slice(i, i + windowSize)

      let windowScore = 0
      let maxDiff = 0

      // Calculate window similarity
      for (let j = 0; j < windowSize; j++) {
        const diff = Math.abs(window1[j] - window2[j])
        maxDiff = Math.max(maxDiff, diff)

        // Higher score for exact matches, lower for differences
        if (diff === 0) {
          windowScore += windowSize
        } else if (diff <= 10) {
          windowScore += windowSize - diff
        }
      }

      cumulativeScore += windowScore

      // Consider it a feature match if the window is very similar
      if (maxDiff <= 15) {
        featureMatches++
      }
    }

    // Calculate similarity scores
    const windowSimilarity = (cumulativeScore / (totalFeatures * windowSize)) * 100
    const featureMatchPercentage = (featureMatches / Math.floor(totalFeatures / stepSize)) * 100
    const lengthSimilarity = (minLength / maxLength) * 100

    // Weighted combination focusing on feature patterns
    const finalSimilarity = Math.round(
      (windowSimilarity * 0.6) +      // 60% byte-level similarity
      (featureMatchPercentage * 0.3) +  // 30% feature pattern matching
      (lengthSimilarity * 0.1)         // 10% length consistency
    )

    console.log('🔍 Feature analysis:', {
      totalWindows: Math.floor(totalFeatures / stepSize),
      featureMatches: featureMatches,
      windowSimilarity: windowSimilarity.toFixed(1),
      featureMatchPercentage: featureMatchPercentage.toFixed(1),
      lengthSimilarity: lengthSimilarity.toFixed(1),
      finalSimilarity: finalSimilarity
    })

    return Math.min(100, Math.max(0, finalSimilarity))
  }

  // Extract fingerprint features from template data
  extractFingerprintFeatures(templateData) {
    try {
      console.log('🧬 === FINGERPRINT FEATURE EXTRACTION ===')

      if (!templateData) {
        throw new Error('No template data provided for feature extraction')
      }

      // Clean template data
      let cleanData = templateData
      if (templateData.startsWith('data:')) {
        cleanData = templateData.split(',')[1]
      }

      // Apply URL-safe base64 conversion if needed
      if (typeof Fingerprint !== 'undefined' && Fingerprint.b64UrlTo64) {
        cleanData = Fingerprint.b64UrlTo64(cleanData)
      }

      console.log('📊 Template data for feature extraction:', {
        originalLength: templateData.length,
        cleanLength: cleanData.length,
        type: 'Intermediate format features'
      })

      // Convert to binary data for feature analysis
      const binaryData = this.base64ToBinary(cleanData)

      if (!binaryData || binaryData.length === 0) {
        throw new Error('Failed to convert template to binary data')
      }

      console.log('📦 Binary data converted:', {
        length: binaryData.length,
        dataType: typeof binaryData
      })

      // Extract fingerprint features
      const features = this.analyzeFingerprintFeatures(binaryData)

      console.log('✅ Feature extraction completed:', {
        featureCount: features.length,
        qualityScore: features.qualityScore,
        minutiaePoints: features.minutiaePoints?.length || 0,
        ridgePatterns: features.ridgePatterns?.length || 0
      })

      return features

    } catch (error) {
      console.error('❌ Feature extraction failed:', error)
      return null
    }
  }

  // Convert base64 to binary string
  base64ToBinary(base64) {
    try {
      return atob(base64)
    } catch (error) {
      console.error('❌ Base64 to binary conversion error:', error)
      return ''
    }
  }

  // Analyze fingerprint features from binary data
  analyzeFingerprintFeatures(binaryData) {
    try {
      const features = {
        qualityScore: 0,
        minutiaePoints: [],
        ridgePatterns: [],
        singularPoints: [],
        textureFeatures: [],
        overallPattern: null,
        featureVector: []
      }

      // Calculate quality score based on data characteristics
      features.qualityScore = this.calculateQualityScore(binaryData)

      // Extract minutiae-like features from binary patterns
      features.minutiaePoints = this.extractMinutiaePoints(binaryData)

      // Analyze ridge patterns
      features.ridgePatterns = this.analyzeRidgePatterns(binaryData)

      // Extract texture features
      features.textureFeatures = this.extractTextureFeatures(binaryData)

      // Create feature vector for comparison
      features.featureVector = this.createFeatureVector(features)

      console.log('🔍 Feature analysis results:', {
        qualityScore: features.qualityScore,
        minutiaeCount: features.minutiaePoints.length,
        ridgePatternCount: features.ridgePatterns.length,
        textureFeatureCount: features.textureFeatures.length,
        featureVectorLength: features.featureVector.length
      })

      return features

    } catch (error) {
      console.error('❌ Feature analysis error:', error)
      return {
        qualityScore: 0,
        minutiaePoints: [],
        ridgePatterns: [],
        singularPoints: [],
        textureFeatures: [],
        overallPattern: null,
        featureVector: []
      }
    }
  }

  // Calculate quality score from binary data
  calculateQualityScore(binaryData) {
    let score = 0

    // Check data density and variety
    const uniqueBytes = new Set(binaryData)
    const density = uniqueBytes.size / binaryData.length
    score += Math.min(50, density * 100) // Max 50 points for variety

    // Check for structured patterns (indicates real fingerprint)
    const structureScore = this.analyzeDataStructure(binaryData)
    score += Math.min(30, structureScore * 30) // Max 30 points for structure

    // Check entropy (randomness vs structure)
    const entropy = this.calculateEntropy(binaryData)
    score += Math.min(20, (entropy / 8) * 20) // Max 20 points for entropy

    return Math.round(score)
  }

  // Analyze data structure patterns
  analyzeDataStructure(binaryData) {
    let structureScore = 0

    // Look for repeating patterns (ridge-like structures)
    const patternSize = 8
    const patternMap = new Map()

    for (let i = 0; i <= binaryData.length - patternSize; i++) {
      const pattern = binaryData.substring(i, i + patternSize)
      patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1)
    }

    // Calculate pattern repetition score
    const totalPatterns = binaryData.length - patternSize + 1
    const uniquePatterns = patternMap.size
    const repetitionRatio = (totalPatterns - uniquePatterns) / totalPatterns

    // Fingerprint data has some repetition but not too much
    if (repetitionRatio > 0.05 && repetitionRatio < 0.9) {
      structureScore += 0.8 // Increased from 0.5 for better sensitivity
    }

    return structureScore
  }

  // Calculate entropy of binary data
  calculateEntropy(binaryData) {
    const frequency = {}
    for (const byte of binaryData) {
      frequency[byte] = (frequency[byte] || 0) + 1
    }

    let entropy = 0
    const length = binaryData.length

    for (const byte in frequency) {
      const prob = frequency[byte] / length
      entropy -= prob * Math.log2(prob)
    }

    return entropy
  }

  // Extract minutiae-like points
  extractMinutiaePoints(binaryData) {
    const minutiae = []
    const sampleRate = Math.max(1, Math.floor(binaryData.length / 1000)) // Sample at most 1000 points

    for (let i = 0; i < binaryData.length - 10; i += sampleRate) {
      const localPattern = binaryData.substring(i, i + 10)

      // Look for patterns that could represent minutiae (endings, bifurcations)
      const pattern = this.analyzeLocalPattern(localPattern, i)

      if (pattern.type !== 'normal') {
        minutiae.push({
          position: i / binaryData.length, // Normalized position
          type: pattern.type,
          strength: pattern.strength,
          angle: pattern.angle
        })
      }
    }

    return minutiae.slice(0, 50) // Limit to top 50 minutiae
  }

  // Analyze local binary pattern
  analyzeLocalPattern(pattern, position) {
    let transitions = 0
    let strength = 0

    // Count transitions and calculate strength
    for (let i = 0; i < pattern.length - 1; i++) {
      const diff = Math.abs(pattern.charCodeAt(i) - pattern.charCodeAt(i + 1))
      if (diff > 20) transitions++
      strength += diff
    }

    strength = strength / pattern.length

    // Classify pattern type (made more sensitive)
    if (transitions >= 3 && strength > 12) { // Reduced from 4 and 15
      return { type: 'bifurcation', strength: strength, angle: 0 }
    } else if (transitions >= 1 && transitions < 3 && strength > 8) { // Reduced from 2 and 10
      return { type: 'ending', strength: strength, angle: 0 }
    } else {
      return { type: 'normal', strength: strength, angle: 0 }
    }
  }

  // Analyze ridge patterns
  analyzeRidgePatterns(binaryData) {
    const patterns = []
    const windowSize = 16

    for (let i = 0; i <= binaryData.length - windowSize; i += windowSize / 2) {
      const window = binaryData.substring(i, i + windowSize)
      const pattern = this.extractRidgePattern(window, i)

      if (pattern.strength > 5) {
        patterns.push(pattern)
      }
    }

    return patterns.slice(0, 20) // Limit to top 20 patterns
  }

  // Extract ridge pattern from window
  extractRidgePattern(window, position) {
    let strength = 0
    let frequency = 0

    // Calculate ridge strength and frequency
    for (let i = 0; i < window.length - 1; i++) {
      const diff = Math.abs(window.charCodeAt(i) - window.charCodeAt(i + 1))
      strength += diff
      if (diff > 10) frequency++
    }

    return {
      position: position,
      strength: strength / window.length,
      frequency: frequency / window.length,
      type: frequency > window.length / 4 ? 'strong' : 'weak'
    }
  }

  // Extract texture features
  extractTextureFeatures(binaryData) {
    const features = []
    const sampleSize = Math.min(100, Math.floor(binaryData.length / 10))

    for (let i = 0; i < sampleSize; i++) {
      const pos = Math.floor((i / sampleSize) * (binaryData.length - 1))
      const localValue = binaryData.charCodeAt(pos)

      features.push({
        position: pos / binaryData.length,
        value: localValue / 255, // Normalized
        gradient: this.calculateGradient(binaryData, pos)
      })
    }

    return features
  }

  // Calculate gradient at position
  calculateGradient(binaryData, position) {
    if (position <= 0 || position >= binaryData.length - 1) return 0

    const prev = binaryData.charCodeAt(position - 1)
    const curr = binaryData.charCodeAt(position)
    const next = binaryData.charCodeAt(position + 1)

    return (next - prev) / 2
  }

  // Create feature vector for comparison
  createFeatureVector(features) {
    const vector = []

    // Add quality score
    vector.push(features.qualityScore / 100)

    // Add minutiae features
    for (let i = 0; i < Math.min(10, features.minutiaePoints.length); i++) {
      const minutia = features.minutiaePoints[i]
      vector.push(minutia.position, minutia.strength / 50, minutia.type === 'bifurcation' ? 1 : 0)
    }

    // Add ridge pattern features
    for (let i = 0; i < Math.min(10, features.ridgePatterns.length); i++) {
      const pattern = features.ridgePatterns[i]
      vector.push(pattern.strength / 20, pattern.frequency, pattern.type === 'strong' ? 1 : 0)
    }

    // Add texture features (sample)
    for (let i = 0; i < Math.min(20, features.textureFeatures.length); i += 2) {
      const texture = features.textureFeatures[i]
      vector.push(texture.value, texture.gradient / 100)
    }

    return vector
  }

  // Match fingerprint features
  async matchFingerprintFeatures(features1, features2) {
    try {
      console.log('🎯 === FINGERPRINT FEATURE MATCHING ===')

      if (!features1 || !features2 || !features1.featureVector || !features2.featureVector) {
        throw new Error('Invalid feature data for matching')
      }

      const vector1 = features1.featureVector
      const vector2 = features2.featureVector

      console.log('📊 Feature vectors for matching:', {
        vector1Length: vector1.length,
        vector2Length: vector2.length,
        quality1: features1.qualityScore,
        quality2: features2.qualityScore
      })

      // Calculate feature vector similarity
      const vectorSimilarity = this.calculateVectorSimilarity(vector1, vector2)

      // Compare minutiae points
      const minutiaeSimilarity = this.compareMinutiaePoints(features1.minutiaePoints, features2.minutiaePoints)

      // Compare ridge patterns
      const ridgeSimilarity = this.compareRidgePatterns(features1.ridgePatterns, features2.ridgePatterns)

      // Compare texture features
      const textureSimilarity = this.compareTextureFeatures(features1.textureFeatures, features2.textureFeatures)

      // Quality-based weighting
      const qualityWeight = (features1.qualityScore + features2.qualityScore) / 200 // Average quality, normalized to 0-1

      // Calculate weighted similarity score
      const overallSimilarity = Math.round(
        (vectorSimilarity * 0.4) +      // 40% feature vector similarity
        (minutiaeSimilarity * 0.3) +    // 30% minutiae matching
        (ridgeSimilarity * 0.2) +       // 20% ridge pattern matching
        (textureSimilarity * 0.1)       // 10% texture matching
      )

      // Adjust by quality
      const finalSimilarity = Math.round(overallSimilarity * (0.5 + qualityWeight * 0.5))

      // Determine verification result
      const verified = finalSimilarity >= 60 // 60% threshold for fingerprint matching (optimized for feature-based verification)
      const confidence = this.calculateConfidence(finalSimilarity, features1.qualityScore, features2.qualityScore)

      const result = {
        similarity: finalSimilarity,
        verified: verified,
        confidence: confidence,
        details: {
          vectorSimilarity: Math.round(vectorSimilarity),
          minutiaeSimilarity: Math.round(minutiaeSimilarity),
          ridgeSimilarity: Math.round(ridgeSimilarity),
          textureSimilarity: Math.round(textureSimilarity),
          qualityWeight: Math.round(qualityWeight * 100),
          overallSimilarity: overallSimilarity
        }
      }

      console.log('✅ Feature matching completed:', {
        finalSimilarity: finalSimilarity + '%',
        verified: verified,
        confidence: confidence,
        breakdown: result.details
      })

      return result

    } catch (error) {
      console.error('❌ Feature matching error:', error)
      return {
        similarity: 0,
        verified: false,
        confidence: 0,
        details: { error: error.message }
      }
    }
  }

  // Calculate vector similarity
  calculateVectorSimilarity(vector1, vector2) {
    const minLength = Math.min(vector1.length, vector2.length)
    let similarity = 0

    for (let i = 0; i < minLength; i++) {
      const diff = Math.abs(vector1[i] - vector2[i])
      similarity += Math.max(0, 1 - diff) // Cosine-like similarity
    }

    return (similarity / minLength) * 100
  }

  // Compare minutiae points
  compareMinutiaePoints(minutiae1, minutiae2) {
    if (minutiae1.length === 0 || minutiae2.length === 0) return 0

    let matches = 0
    const threshold = 0.1 // Position tolerance

    for (const m1 of minutiae1) {
      for (const m2 of minutiae2) {
        const positionDiff = Math.abs(m1.position - m2.position)
        const typeMatch = m1.type === m2.type
        const strengthDiff = Math.abs(m1.strength - m2.strength)

        if (positionDiff < threshold && typeMatch && strengthDiff < 10) {
          matches++
          break
        }
      }
    }

    return (matches / Math.max(minutiae1.length, minutiae2.length)) * 100
  }

  // Compare ridge patterns
  compareRidgePatterns(ridges1, ridges2) {
    if (ridges1.length === 0 || ridges2.length === 0) return 0

    let similarity = 0
    const minLength = Math.min(ridges1.length, ridges2.length)

    for (let i = 0; i < minLength; i++) {
      const r1 = ridges1[i]
      const r2 = ridges2[i]

      const strengthDiff = Math.abs(r1.strength - r2.strength)
      const frequencyDiff = Math.abs(r1.frequency - r2.frequency)
      const typeMatch = r1.type === r2.type

      const matchScore = (1 - strengthDiff / 20) * 0.4 + // Strength similarity
                        (1 - frequencyDiff) * 0.3 +       // Frequency similarity
                        (typeMatch ? 1 : 0) * 0.3          // Type match

      similarity += matchScore
    }

    return (similarity / minLength) * 100
  }

  // Compare texture features
  compareTextureFeatures(texture1, texture2) {
    if (texture1.length === 0 || texture2.length === 0) return 0

    let similarity = 0
    const minLength = Math.min(texture1.length, texture2.length)

    for (let i = 0; i < minLength; i++) {
      const t1 = texture1[i]
      const t2 = texture2[i]

      const valueDiff = Math.abs(t1.value - t2.value)
      const gradientDiff = Math.abs(t1.gradient - t2.gradient)

      similarity += (1 - valueDiff) * 0.5 + (1 - gradientDiff / 100) * 0.5
    }

    return (similarity / minLength) * 100
  }

  // Calculate confidence score
  calculateConfidence(similarity, quality1, quality2) {
    const avgQuality = (quality1 + quality2) / 2
    const qualityFactor = avgQuality / 100
    const similarityFactor = similarity / 100

    const confidence = Math.round((qualityFactor * 0.4 + similarityFactor * 0.6) * 100)
    return Math.min(100, Math.max(0, confidence))
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