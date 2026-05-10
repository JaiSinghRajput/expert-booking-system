import { z } from 'zod'

export const expertCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  category: z.string().trim().min(2, 'Category must be at least 2 characters'),
  experience: z.number().min(0, 'Experience must be 0 or higher').max(70, 'Experience must be 70 years or less'),
  rating: z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5'),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters'),
  availableSlots: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        slots: z.array(z.string().min(1, 'Slot time cannot be empty')).min(1, 'At least one slot must be provided'),
      }),
    )
    .min(1, 'At least one available slot must be provided'),
})

export type ExpertCreateInput = z.infer<typeof expertCreateSchema>
