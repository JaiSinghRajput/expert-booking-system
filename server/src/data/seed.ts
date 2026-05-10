import { Types } from 'mongoose'

import { addDays, buildTimeSlots, formatDateKey } from '../utils/date.js'
import type { Booking, Expert } from '../types.js'

const today = new Date()
const slotTemplate = buildTimeSlots()

function createExpert(name: string, category: string, experience: number, rating: number, bio: string, offsetDays: number): Expert {
  const availableSlots = Array.from({ length: 5 }, (_, dayIndex) => {
    const date = formatDateKey(addDays(today, offsetDays + dayIndex))
    const slots = slotTemplate.filter((_, slotIndex) => slotIndex < 5 - (dayIndex % 2))

    return {
      date,
      slots,
    }
  })

  return {
    _id: new Types.ObjectId().toString(),
    name,
    category,
    experience,
    rating,
    bio,
    availableSlots,
  }
}

export const seedExperts: Expert[] = [
  createExpert('Dr. Maya Carter', 'Career Strategy', 14, 4.9, 'Helps high-growth professionals make sharp career moves with practical session plans.', 1),
  createExpert('Aarav Mehta', 'Startup Finance', 11, 4.8, 'Advises founders on runway, pricing, and investor-ready financial narratives.', 2),
  createExpert('Nina Solis', 'Wellness Coaching', 9, 4.7, 'Focuses on structured wellness routines that work in demanding schedules.', 1),
  createExpert('Owen Blake', 'Product Leadership', 16, 4.9, 'Guides product teams through roadmap prioritization and cross-functional alignment.', 3),
  createExpert('Sara Iqbal', 'Legal Advisory', 12, 4.8, 'Supports founders with contract reviews, compliance planning, and risk mitigation.', 2),
  createExpert('Leo Park', 'AI Consulting', 10, 4.9, 'Helps teams ship useful AI features with a practical implementation playbook.', 4),
]

export const seedBookings: Booking[] = [
  {
    _id: new Types.ObjectId().toString(),
    expertId: seedExperts[0]!._id,
    name: 'Jasmine Lee',
    email: 'jasmine@example.com',
    phone: '9999911111',
    date: seedExperts[0]!.availableSlots[0]!.date,
    timeSlot: seedExperts[0]!.availableSlots[0]!.slots[0]!,
    notes: 'Discuss senior leadership transition.',
    status: 'Confirmed',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: new Types.ObjectId().toString(),
    expertId: seedExperts[1]!._id,
    name: 'Jasmine Lee',
    email: 'jasmine@example.com',
    phone: '9999911111',
    date: seedExperts[1]!.availableSlots[1]!.date,
    timeSlot: seedExperts[1]!.availableSlots[1]!.slots[1]!,
    notes: 'Review burn rate before hiring.',
    status: 'Pending',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60).toISOString(),
  },
]

export const expertCategories = Array.from(new Set(seedExperts.map((expert) => expert.category))).sort()
