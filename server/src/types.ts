export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed'

export type SlotRecord = {
  date: string
  slots: string[]
}

export type Expert = {
  _id: string
  name: string
  category: string
  experience: number
  rating: number
  bio: string
  availableSlots: SlotRecord[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type Booking = {
  _id: string
  expertId: string
  name: string
  email: string
  phone: string
  date: string
  timeSlot: string
  notes?: string | undefined
  status: BookingStatus
  createdAt: string
}

export type BookingInput = {
  expertId: string
  name: string
  email: string
  phone: string
  date: string
  timeSlot: string
  notes?: string | undefined
}

export type SlotBookEvent = {
  expertId: string
  date: string
  timeSlot: string
}
