import type { Booking, Expert } from '../types.js'

export type SlotView = {
  timeSlot: string
  available: boolean
}

export type DateSlotView = {
  date: string
  slots: SlotView[]
}

export function buildAvailability(expert: Expert, bookings: Booking[]): DateSlotView[] {
  return expert.availableSlots.map((day) => ({
    date: day.date,
    slots: day.slots.map((timeSlot) => ({
      timeSlot,
      available: !bookings.some((booking) => booking.expertId === expert._id && booking.date === day.date && booking.timeSlot === timeSlot),
    })),
  }))
}
