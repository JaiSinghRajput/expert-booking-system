import { api } from './api'
import type { BookingRecord, ExpertDetail, ExpertSummary, Pagination, Expert } from '../types'

export type ExpertsResponse = {
  experts: ExpertSummary[]
  pagination: Pagination
}

export type ExpertResponse = {
  expert: ExpertDetail
}

export async function fetchExperts(params: {
  page: number
  limit: number
  search?: string
  category?: string
}): Promise<ExpertsResponse> {
  const response = await api.get('/experts', { params })
  return response.data.data as ExpertsResponse
}

export async function fetchExpert(expertId: string): Promise<ExpertResponse> {
  const response = await api.get(`/experts/${expertId}`)
  return response.data.data as ExpertResponse
}

export async function fetchBookings(email: string): Promise<BookingRecord[]> {
  const response = await api.get('/bookings', {
    params: { email },
  })

  return response.data.data as BookingRecord[]
}

export async function createBooking(payload: {
  expertId: string
  name: string
  email: string
  phone: string
  date: string
  timeSlot: string
  notes: string
}): Promise<BookingRecord> {
  const response = await api.post('/bookings', payload)
  return response.data.data as BookingRecord
}

export async function createExpert(payload: {
  name: string
  category: string
  experience: number
  rating: number
  bio: string
  availableSlots: Array<{ date: string; slots: string[] }>
}): Promise<Expert> {
  const response = await api.post('/experts', payload)
  return response.data.data as Expert
}
