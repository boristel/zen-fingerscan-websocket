import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3001/api'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add any authentication tokens if needed
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    console.error('API Error:', errorMessage, error)
    return Promise.reject(error)
  }
)

// API Service Methods
export const apiService = {
  // Simple API test
  async testSimple() {
    console.log('🔍 Testing simple API connection...')
    try {
      const result = await apiClient.get('/test-simple')
      console.log('✅ Simple API test successful:', result)
      return result
    } catch (error) {
      console.error('❌ Simple API test failed:', error)
      throw error
    }
  },

  // Test database connection
  async testConnection() {
    return await apiClient.get('/test-connection')
  },

  // Employee Search
  async searchEmployees(searchTerm) {
    return await apiClient.post('/search-employee', { searchTerm })
  },

  // Get Employee Details
  async getEmployeeDetails(employeeId) {
    return await apiClient.get(`/employee/${employeeId}`)
  },

  // Get Employee by ID (alias for getEmployeeDetails)
  async getEmployeeById(employeeId) {
    return await this.getEmployeeDetails(employeeId)
  },

  // Get Employee Fingerprints
  async getEmployeeFingerprints(employeeId) {
    return await apiClient.get(`/employee/${employeeId}/fingerprints`)
  },

  // Register Fingerprint
  async registerFingerprint(fingerprintData) {
    console.log('🚀 API SERVICE: registerFingerprint called')
    console.log('📤 API SERVICE: Sending data:', {
      karyawanid: fingerprintData.karyawanid,
      namakaryawan: fingerprintData.namakaryawan,
      fingerindex: fingerprintData.fingerindex,
      fingerimageLength: fingerprintData.fingerimage ? fingerprintData.fingerimage.length : 0,
      fingerimageType: typeof fingerprintData.fingerimage,
      fingerimagePreview: fingerprintData.fingerimage ? fingerprintData.fingerimage.substring(0, 50) + '...' : 'No data',
      notes: fingerprintData.notes
    })

    try {
      console.log('🌐 API SERVICE: Making POST request to /register-fingerprint')
      const response = await apiClient.post('/register-fingerprint', fingerprintData)
      console.log('✅ API SERVICE: Request successful, response:', response)
      return response
    } catch (error) {
      console.error('💥 API SERVICE: Request failed:', error)
      console.error('💥 API SERVICE: Error response:', error.response?.data)
      console.error('💥 API SERVICE: Error status:', error.response?.status)
      console.error('💥 API SERVICE: Error message:', error.message)
      throw error
    }
  },

  // Update Fingerprint
  async updateFingerprint(fingerprintId, fingerprintData) {
    return await apiClient.put(`/fingerprint/${fingerprintId}`, fingerprintData)
  },

  // Verify Fingerprint (for attendance - compare scanned fingerprint with registered template)
  async verifyFingerprint(verificationData) {
    console.log('🛡️ API SERVICE: SECURE verifyFingerprint for attendance called')
    console.log('📤 API SERVICE: Sending SECURE verification data:', {
      karyawanid: verificationData.karyawanid,
      hasScannedFingerprint: !!verificationData.scannedFingerprint,
      scannedFingerprintLength: verificationData.scannedFingerprint ? verificationData.scannedFingerprint.length : 0,
      verificationType: verificationData.verificationType || 'attendance'
    })

    try {
      console.log('🛡️ API SERVICE: Making SECURE POST request to /verify-fingerprint')
      const response = await apiClient.post('/verify-fingerprint', verificationData)
      console.log('✅ API SERVICE: SECURE verification request successful, response:', response)
      return response
    } catch (error) {
      console.error('💥 API SERVICE: SECURE verification request failed:', error)
      console.error('💥 API SERVICE: Error response:', error.response?.data)
      console.error('💥 API SERVICE: Error status:', error.response?.status)
      console.error('💥 API SERVICE: Error message:', error.message)
      throw error
    }
  },

  // Legacy Verify Fingerprint (for registration)
  async verifyFingerprintForRegistration(karyawanid, fingerindex, fingerimage) {
    console.log('🔍 API SERVICE: verifyFingerprintForRegistration called')
    console.log('📤 API SERVICE: Sending data:', {
      karyawanid: karyawanid,
      fingerindex: fingerindex,
      fingerimageExists: !!fingerimage,
      fingerimageLength: fingerimage ? fingerimage.length : 0,
      fingerimageType: typeof fingerimage
    })

    try {
      console.log('🌐 API SERVICE: Making POST request to /verify-fingerprint')
      const response = await apiClient.post('/verify-fingerprint', {
        karyawanid: karyawanid,
        fingerindex: fingerindex,
        fingerimage: fingerimage
      })
      console.log('✅ API SERVICE: Verification request successful, response:', response)
      return response
    } catch (error) {
      console.error('💥 API SERVICE: Verification request failed:', error)
      console.error('💥 API SERVICE: Error response:', error.response?.data)
      console.error('💥 API SERVICE: Error status:', error.response?.status)
      console.error('💥 API SERVICE: Error message:', error.message)
      throw error
    }
  },

  // Log Attendance Verification (for audit trail)
  async logAttendanceVerification(verificationData) {
    try {
      console.log('📝 API SERVICE: Logging attendance verification for audit trail...')
      const response = await apiClient.post('/log-attendance-verification', verificationData)
      console.log('✅ API SERVICE: Attendance verification logged successfully')
      return response
    } catch (error) {
      console.warn('⚠️ API SERVICE: Failed to log attendance verification:', error.message)
      // Don't throw error - logging failure shouldn't stop attendance process
      return { success: false, message: 'Logging failed but attendance continued' }
    }
  },

  // Delete Fingerprint
  async deleteFingerprint(fingerprintId) {
    return await apiClient.delete(`/fingerprint/${fingerprintId}`)
  },

  // Store Attendance Record
  async storeAttendance(attendanceData) {
    console.log('🔍 API SERVICE: storeAttendance called')
    console.log('📤 API SERVICE: Sending attendance data:', {
      karyawanid: attendanceData.karyawanid,
      kodekaryawan: attendanceData.kodekaryawan,
      namakaryawan: attendanceData.namakaryawan,
      attendanceType: attendanceData.attendanceType,
      fingerprintVerified: attendanceData.fingerprintVerified,
      verificationSimilarity: attendanceData.verificationSimilarity,
      verificationTime: attendanceData.verificationTime,
      fingerindexMatched: attendanceData.fingerindexMatched
    })

    try {
      console.log('🌐 API SERVICE: Making POST request to /store-attendance')
      const response = await apiClient.post('/store-attendance', {
        karyawanid: attendanceData.karyawanid,
        kodekaryawan: attendanceData.kodekaryawan,
        namakaryawan: attendanceData.namakaryawan,
        attendanceType: attendanceData.attendanceType,
        fingerprintVerified: attendanceData.fingerprintVerified,
        verificationSimilarity: attendanceData.verificationSimilarity,
        verificationTime: attendanceData.verificationTime,
        fingerindexMatched: attendanceData.fingerindexMatched,
        notes: attendanceData.notes
      })
      console.log('✅ API SERVICE: Attendance storage successful, response:', response)
      return response
    } catch (error) {
      console.error('💥 API SERVICE: Attendance storage failed:', error)
      console.error('💥 API SERVICE: Error response:', error.response?.data)
      console.error('💥 API SERVICE: Error status:', error.response?.status)
      console.error('💥 API SERVICE: Error message:', error.message)
      throw error
    }
  },

  // Direct API call for registration-style verification
  async verifyFingerprintRegistrationStyle(karyawanid, fingerindex, fingerimage) {
    console.log('🔍 API SERVICE: verifyFingerprintRegistrationStyle called')
    console.log('📤 API SERVICE: Sending data:', {
      karyawanid: karyawanid,
      fingerindex: fingerindex,
      fingerimageExists: !!fingerimage,
      fingerimageLength: fingerimage ? fingerimage.length : 0,
      fingerimageType: typeof fingerimage
    })

    try {
      console.log('🌐 API SERVICE: Making POST request to /verify-fingerprint (registration style)')
      const response = await apiClient.post('/verify-fingerprint', {
        karyawanid: karyawanid,
        fingerindex: fingerindex,
        fingerimage: fingerimage
      })
      console.log('✅ API SERVICE: Verification request successful, response:', response)
      return response
    } catch (error) {
      console.error('💥 API SERVICE: Verification request failed:', error)
      console.error('💥 API SERVICE: Error response:', error.response?.data)
      console.error('💥 API SERVICE: Error status:', error.response?.status)
      console.error('💥 API SERVICE: Error message:', error.message)
      throw error
    }
  }
}

export default apiService