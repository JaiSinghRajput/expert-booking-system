import { z } from 'zod'

export const bookingCreateSchema = z.object({
  expertId: z.string().min(1),
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  date: z.string().trim().min(10),
  timeSlot: z.string().trim().min(1),
  notes: z.string().trim().optional(),
})

export const bookingStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed']),
})
