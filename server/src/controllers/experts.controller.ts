import type { Request, Response } from 'express'

import { getExpertDetailsService, getExpertsService, createExpertService } from '../services/experts.service.js'
import { HttpError } from '../utils/httpError.js'

export async function listExpertsController(request: Request, response: Response): Promise<void> {
  const data = await getExpertsService(request)

  response.json({
    success: true,
    data,
  })
}

export async function getExpertController(request: Request, response: Response): Promise<void> {
  const expertId = String(request.params.id ?? '')
  const data = await getExpertDetailsService(expertId)

  if (!data) {
    throw new HttpError(404, 'Expert not found')
  }

  response.json({
    success: true,
    data,
  })
}

export async function createExpertController(request: Request, response: Response): Promise<void> {
  const expert = await createExpertService(request.body)

  response.status(201).json({
    success: true,
    data: expert,
  })
}
