import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Skip automatic 401 handling for vulnerability scan endpoints to allow fallback
    if (error.config?.url?.includes('/vulnerability/scan') && error.response?.status === 401) {
      // Let the scan page handle the 401 error for fallback to demo scan
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - logout user
      useAuthStore.getState().logout()
      // redirect to the right route used in the app
      window.location.href = '/auth/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else if (error.message) {
      toast.error(error.message)
    }
    
    return Promise.reject(error)
  }
)

// API service class
class ApiService {
  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    const response = await api.post('/auth/register', data)
    return response.data
  }

  async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data)
    return response.data
  }

  async verifyEmail(data: { email: string; otp: string }) {
    const response = await api.post('/auth/verify-email', data)
    return response.data
  }

  async resendVerification(data: { email: string }) {
    const response = await api.post('/auth/resend-verification', data)
    return response.data
  }

  async forgotPassword(data: { email: string }) {
    const response = await api.post('/auth/forgot-password', data)
    return response.data
  }

  async verifyResetOtp(data: { email: string; otp: string }) {
    const response = await api.post('/auth/verify-reset-otp', data)
    return response.data
  }

  async resetPassword(data: { token: string; new_password: string }) {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  }

  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  }

  async updateProfile(data: { name?: string; email?: string }) {
    const response = await api.put('/auth/profile', data)
    return response.data
  }

  async changePassword(data: { current_password: string; new_password: string }) {
    const response = await api.post('/auth/change-password', data)
    return response.data
  }

  // Vulnerability scanning endpoints
  async startVulnerabilityScan(target_url: string) {
    const response = await api.post('/vulnerability/scan', { target_url })
    return response.data
  }

  async getUserScans(limit: number = 50, offset: number = 0) {
    const response = await api.get(`/vulnerability/scans?limit=${limit}&offset=${offset}`)
    return response.data
  }

  async getScanResults(scan_id: string) {
    const response = await api.get(`/vulnerability/scan/${scan_id}`)
    return response.data
  }

  async deleteScan(scan_id: string) {
    const response = await api.delete(`/vulnerability/scan/${scan_id}`)
    return response.data
  }

  async getScanStatistics() {
    const response = await api.get('/vulnerability/statistics')
    return response.data
  }

  async processScan(scan_id: string) {
    const response = await api.post(`/vulnerability/process-scan/${scan_id}`)
    return response.data
  }

  // Demo endpoint (no auth required)
  async demoVulnerabilityScan(target_url: string) {
    const response = await api.post('/vulnerability/scan-demo', { target_url })
    return response.data
  }
}

export const apiService = new ApiService()
export default api