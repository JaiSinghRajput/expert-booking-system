import mongoose from 'mongoose'

import { emitSlotBooked } from '../sockets/index.js'
import type { BookingInput, BookingStatus } from '../types.js'
import { HttpError } from '../utils/httpError.js'
import { bookingCreateSchema, bookingStatusSchema } from '../validations/booking.js'
import { createBookingStore, getBookingBySlotStore, getExpertByIdStore, listBookingsByEmailStore, updateBookingStatusStore } from './store.js'

export async function createBookingService(payload: unknown) {
  const parsed = bookingCreateSchema.safeParse(payload)
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid booking details', parsed.error.issues.map((issue) => issue.message))
  }

  const bookingInput: BookingInput = parsed.data
  const expert = await getExpertByIdStore(bookingInput.expertId)
  if (!expert) {
    throw new HttpError(404, 'Expert not found')
  }

  const slotExists = expert.availableSlots.some((day) => day.date === bookingInput.date && day.slots.includes(bookingInput.timeSlot))
  if (!slotExists) {
    throw new HttpError(400, 'Invalid booking details', ['Selected slot is not available for this expert'])
  }

  const existingBooking = await getBookingBySlotStore(bookingInput.expertId, bookingInput.date, bookingInput.timeSlot)
  if (existingBooking) {
    throw new HttpError(409, 'Slot already booked')
  }

  try {
    const booking = await createBookingStore(bookingInput)

    emitSlotBooked({
      expertId: booking.expertId,
      date: booking.date,
      timeSlot: booking.timeSlot,
    })

    return booking
  } catch (error) {
    if (error instanceof Error && error.message === 'duplicate-booking') {
      throw new HttpError(409, 'Slot already booked')
    }

    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      throw new HttpError(409, 'Slot already booked')
    }

    throw error
  }
}

export async function listBookingsByEmailService(email: string) {
  if (!email.trim()) {
    return []
  }

  return listBookingsByEmailStore(email)
}

export async function updateBookingStatusService(bookingId: string, payload: unknown) {
  const parsed = bookingStatusSchema.safeParse(payload)
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid booking details', parsed.error.issues.map((issue) => issue.message))
  }

  const updatedBooking = await updateBookingStatusStore(bookingId, parsed.data.status as BookingStatus)
  if (!updatedBooking) {
    throw new HttpError(404, 'Booking not found')
  }

  return updatedBooking
}
