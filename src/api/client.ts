import axios, { AxiosError } from 'axios'
import Constants from 'expo-constants'

import { useAuthStore } from '../store/authStore'

const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0]
const developmentUrl = debuggerHost ? `http://${debuggerHost}:8100` : 'http://localhost:8100'

export const API_BASE_URL = (configuredUrl || developmentUrl).replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status ?? 0
    if (status === 401) await useAuthStore.getState().clearSession()
    const detail = error.response?.data?.detail
    throw new ApiError(
      typeof detail === 'string'
        ? detail
        : error.message || '연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.',
      status,
    )
  },
)
