import type { Booking, Expert } from '../types.js'

export type SlotView = {
  timeSlot: string
  available: boolean
}

export type DateSlotView = {
  date: string
  slots: SlotView[]
}

// Sanitize slots data in case they were stored/serialized as strings
function sanitizeSlots(slots: string | string[]): string[] {
  if (typeof slots === 'string') {
    const trimmed = slots.trim()
    if (trimmed.length === 0) {
      return []
    }

    // Handle JSON-serialized arrays first.
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed.filter((slot): slot is string => typeof slot === 'string' && slot.trim().length > 0) : []
      } catch {
        // Fall back to regex extraction below.
      }
    }

    // Extract time-like tokens such as "09:00 AM" from loosely serialized strings.
    const matches = trimmed.match(/\b\d{1,2}:\d{2}\s?(?:AM|PM)\b/gi)
    if (matches) {
      return matches.map((slot) => slot.toUpperCase())
    }

    return trimmed
      .split(',')
      .map((slot) => slot.trim())
      .filter((slot) => slot.length > 0)
  }
  return Array.isArray(slots) ? slots : []
}

export function buildAvailability(expert: Expert, bookings: Booking[]): DateSlotView[] {
  const expertId = (expert._id as any)?.toString?.() || String(expert._id ?? '')

  return expert.availableSlots.map((day) => ({
    date: day.date,
    slots: sanitizeSlots(day.slots as any).map((timeSlot) => {
      const available = !bookings.some((booking) => {
        const bid = (booking.expertId as any)?.toString?.() || String(booking.expertId ?? '')
        return bid === expertId && booking.date === day.date && booking.timeSlot === timeSlot
      })
      return { timeSlot, available }
    }),
  }))
}
