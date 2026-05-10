export type TimeSlotView = {
  timeSlot: string
  available: boolean
}

export type DateAvailability = {
  date: string
  slots: TimeSlotView[]
}

export type Expert = {
  _id: string
  name: string
  category: string
  experience: number
  rating: number
  bio: string
  availableSlots: Array<{
    date: string
    slots: string[]
  }>
  createdAt?: string
  updatedAt?: string
}

export type ExpertSummary = Expert & {
  totalSlots: number
  bookedSlots: number
  availableSlotCount: number
}

export type ExpertDetail = ExpertSummary & {
  availability: DateAvailability[]
}

export type BookingRecord = {
  _id: string
  expertId: string
  name: string
  email: string
  phone: string
  date: string
  timeSlot: string
  expertName?: string
  notes?: string
  status: 'Pending' | 'Confirmed' | 'Completed'
  createdAt: string
}

export type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
}
