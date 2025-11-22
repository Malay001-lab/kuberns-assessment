import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const webAppAPI = {
  createWebApp: async (formData) => {
    try {
      const response = await apiClient.post('/webapps/', formData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getWebApps: async () => {
    try {
      const response = await apiClient.get('/webapps/')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getWebApp: async (id) => {
    try {
      const response = await apiClient.get(`/webapps/${id}/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // ✅ FIXED to match Page3
  getWebAppStatus: async (id) => {
    try {
      const response = await apiClient.get(`/webapps/${id}/status/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // ✅ FIXED to match Page3
  getWebAppLogs: async (id) => {
    try {
      const response = await apiClient.get(`/webapps/${id}/logs/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default apiClient
