import type { Request, Response } from 'express'

import { createBookingService, listBookingsByEmailService, updateBookingStatusService } from '../services/bookings.service.js'
import { getExpertByIdStore } from '../services/store.js'

export async function createBookingController(request: Request, response: Response): Promise<void> {
  const booking = await createBookingService(request.body)

  response.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking,
  })
}

export async function listBookingsController(request: Request, response: Response): Promise<void> {
  const email = String(request.query.email ?? '')
  const bookings = await listBookingsByEmailService(email)

  // Enrich bookings with expertName to simplify client rendering
  const enriched = await Promise.all(
    bookings.map(async (b) => {
      const expert = await getExpertByIdStore(b.expertId)
      return {
        ...b,
        expertName: expert?.name ?? '',
      }
    }),
  )

  response.json({
    success: true,
    data: enriched,
  })
}

export async function updateBookingStatusController(request: Request, response: Response): Promise<void> {
  const bookingId = String(request.params.id ?? '')
  const booking = await updateBookingStatusService(bookingId, request.body)

  response.json({
    success: true,
    message: 'Booking status updated successfully',
    data: booking,
  })
}
