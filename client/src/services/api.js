import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:50001/api'

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

  // Delete Fingerprint
  async deleteFingerprint(fingerprintId) {
    return await apiClient.delete(`/fingerprint/${fingerprintId}`)
  }
}

export default apiService