import cors from 'cors'
import express, { type Express } from 'express'
import morgan from 'morgan'

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { bookingsRouter } from './routes/bookings.routes.js'
import { expertsRouter } from './routes/experts.routes.js'

export function createApp(): Express {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? true,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/health', (_request, response) => {
    response.json({ success: true, message: 'Expert booking API is running' })
  })

  app.use('/experts', expertsRouter)
  app.use('/bookings', bookingsRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
