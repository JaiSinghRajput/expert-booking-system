import mongoose from 'mongoose'

import { BookingModel } from '../models/Booking.js'
import { ExpertModel } from '../models/Expert.js'
import { seedBookings, seedExperts } from '../data/seed.js'
import type { Booking, BookingInput, BookingStatus, Expert } from '../types.js'
import type { ExpertCreateInput } from '../validations/expert.js'

const memoryExperts: Expert[] = seedExperts.map((expert) => ({ ...expert }))
const memoryBookings: Booking[] = seedBookings.map((booking) => ({ ...booking }))

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1
}

export async function ensureSeedData(): Promise<void> {
  if (!isMongoConnected()) {
    return
  }

  const expertCount = await ExpertModel.countDocuments()
  if (expertCount === 0) {
    await (ExpertModel as any).insertMany(seedExperts)
  }

  const bookingCount = await BookingModel.countDocuments()
  if (bookingCount === 0) {
    await (BookingModel as any).insertMany(seedBookings)
  }
}

export async function listExpertsStore(): Promise<Expert[]> {
  if (isMongoConnected()) {
    return ((await (ExpertModel as any).find().lean()) ?? []) as Expert[]
  }

  return memoryExperts
}

export async function getExpertByIdStore(expertId: string): Promise<Expert | null> {
  if (isMongoConnected()) {
    return ((await (ExpertModel as any).findById(expertId).lean()) ?? null) as Expert | null
  }

  return memoryExperts.find((expert) => expert._id === expertId) ?? null
}

export async function createExpertStore(input: ExpertCreateInput): Promise<Expert> {
  if (isMongoConnected()) {
    const created = await (ExpertModel as any).create(input)
    return created.toObject() as unknown as Expert
  }

  const expert: Expert = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: input.name,
    category: input.category,
    experience: input.experience,
    rating: input.rating,
    bio: input.bio,
    availableSlots: input.availableSlots,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  memoryExperts.push(expert)
  return expert
}

export async function listBookingsStore(): Promise<Booking[]> {
  if (isMongoConnected()) {
    return ((await (BookingModel as any).find().sort({ createdAt: -1 }).lean()) ?? []) as Booking[]
  }

  return [...memoryBookings].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export async function createBookingStore(input: BookingInput): Promise<Booking> {
  if (isMongoConnected()) {
    const created = await (BookingModel as any).create({
      ...input,
      email: input.email.toLowerCase(),
      notes: input.notes ?? '',
    })

    return created.toObject() as unknown as Booking
  }

  const duplicate = memoryBookings.find(
    (booking) => booking.expertId === input.expertId && booking.date === input.date && booking.timeSlot === input.timeSlot,
  )

  if (duplicate) {
    throw new Error('duplicate-booking')
  }

  const booking: Booking = {
    _id: new mongoose.Types.ObjectId().toString(),
    expertId: input.expertId,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    date: input.date,
    timeSlot: input.timeSlot,
    notes: input.notes ?? '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }

  memoryBookings.push(booking)
  return booking
}

export async function getBookingBySlotStore(expertId: string, date: string, timeSlot: string): Promise<Booking | null> {
  if (isMongoConnected()) {
    return ((await (BookingModel as any).findOne({ expertId, date, timeSlot }).lean()) ?? null) as Booking | null
  }

  return memoryBookings.find((booking) => booking.expertId === expertId && booking.date === date && booking.timeSlot === timeSlot) ?? null
}

export async function listBookingsByEmailStore(email: string): Promise<Booking[]> {
  const normalizedEmail = email.toLowerCase()

  if (isMongoConnected()) {
    return ((await (BookingModel as any).find({ email: normalizedEmail }).sort({ createdAt: -1 }).lean()) ?? []) as Booking[]
  }

  return memoryBookings.filter((booking) => booking.email.toLowerCase() === normalizedEmail).sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export async function updateBookingStatusStore(bookingId: string, status: BookingStatus): Promise<Booking | null> {
  if (isMongoConnected()) {
    return ((await (BookingModel as any).findByIdAndUpdate(bookingId, { status }, { new: true }).lean()) ?? null) as Booking | null
  }

  const booking = memoryBookings.find((record) => record._id === bookingId)
  if (!booking) {
    return null
  }

  booking.status = status
  return booking
}
