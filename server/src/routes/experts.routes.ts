import { Router, type Router as ExpressRouter } from 'express'

import { getExpertController, listExpertsController, createExpertController } from '../controllers/experts.controller.js'

export const expertsRouter: ExpressRouter = Router()

expertsRouter.get('/', (request, response, next) => {
  listExpertsController(request, response).catch(next)
})

expertsRouter.post('/', (request, response, next) => {
  createExpertController(request, response).catch(next)
})

expertsRouter.get('/:id', (request, response, next) => {
  getExpertController(request, response).catch(next)
})
