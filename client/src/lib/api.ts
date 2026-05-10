import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const api = axios.create({
  baseURL: apiBaseUrl,
})

export function getSocketBaseUrl(): string {
  return apiBaseUrl.replace(/\/api\/?$/, '')
}
