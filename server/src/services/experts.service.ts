import type { Request } from 'express'

import { buildAvailability } from './availability.js'
import { getExpertByIdStore, listBookingsStore, listExpertsStore, createExpertStore } from './store.js'
import { HttpError } from '../utils/httpError.js'
import { expertCreateSchema } from '../validations/expert.js'

function readQueryNumber(value: Request['query'][string], fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export async function getExpertsService(request: Request) {
  const page = readQueryNumber(request.query.page, 1)
  const limit = readQueryNumber(request.query.limit, 10)
  const search = String(request.query.search ?? '').trim().toLowerCase()
  const category = String(request.query.category ?? '').trim().toLowerCase()

  const [experts, bookings] = await Promise.all([listExpertsStore(), listBookingsStore()])

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch = search.length === 0 || expert.name.toLowerCase().includes(search)
    const matchesCategory = category.length === 0 || expert.category.toLowerCase() === category
    return matchesSearch && matchesCategory
  })

  const startIndex = (page - 1) * limit
  const paginatedExperts = filteredExperts.slice(startIndex, startIndex + limit)

  return {
    experts: paginatedExperts.map((expert) => {
      const expertBookings = bookings.filter((booking) => booking.expertId === expert._id)
      const bookedSlots = expertBookings.length
      const totalSlots = expert.availableSlots.reduce((count, day) => count + day.slots.length, 0)

      return {
        ...expert,
        totalSlots,
        bookedSlots,
        availableSlotCount: totalSlots - bookedSlots,
      }
    }),
    pagination: {
      page,
      limit,
      total: filteredExperts.length,
      pages: Math.max(1, Math.ceil(filteredExperts.length / limit)),
    },
  }
}

export async function getExpertDetailsService(expertId: string) {
  const [expert, bookings] = await Promise.all([getExpertByIdStore(expertId), listBookingsStore()])

  if (!expert) {
    return null
  }

  return {
    expert: {
      ...expert,
      availability: buildAvailability(expert, bookings),
      totalSlots: expert.availableSlots.reduce((count, day) => count + day.slots.length, 0),
      bookedSlots: bookings.filter((booking) => booking.expertId === expertId).length,
    },
  }
}

export async function createExpertService(payload: unknown) {
  const parsed = expertCreateSchema.safeParse(payload)
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid expert details', parsed.error.issues.map((issue) => issue.message))
  }

  const expert = await createExpertStore(parsed.data)
  return expert
}
