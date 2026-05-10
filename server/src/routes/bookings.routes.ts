import { Router, type Router as ExpressRouter } from 'express'

import { createBookingController, listBookingsController, updateBookingStatusController } from '../controllers/bookings.controller.js'

export const bookingsRouter: ExpressRouter = Router()

bookingsRouter.get('/', (request, response, next) => {
  listBookingsController(request, response).catch(next)
})

bookingsRouter.post('/', (request, response, next) => {
  createBookingController(request, response).catch(next)
})

bookingsRouter.patch('/:id/status', (request, response, next) => {
  updateBookingStatusController(request, response).catch(next)
})
