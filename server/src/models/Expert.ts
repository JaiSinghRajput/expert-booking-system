import mongoose, { Schema, model } from 'mongoose'

const slotSchema = new Schema(
  {
    date: { type: String, required: true },
    slots: [{ type: String, required: true }],
  },
  { _id: false },
)

const expertSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    experience: { type: Number, required: true },
    rating: { type: Number, required: true },
    bio: { type: String, required: true, trim: true },
    availableSlots: { type: [slotSchema], required: true },
  },
  { timestamps: true },
)

export const ExpertModel = mongoose.models.Expert ?? model('Expert', expertSchema)
