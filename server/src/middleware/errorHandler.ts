import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'

import { HttpError } from '../utils/httpError.js'

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction): void {
  next(new HttpError(404, 'Route not found'))
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.details,
    })
    return
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message),
    })
    return
  }

  response.status(500).json({
    success: false,
    message: 'Something went wrong',
    errors: [],
  })
}
