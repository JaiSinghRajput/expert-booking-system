import mongoose, { Schema, model } from 'mongoose'

const bookingSchema = new Schema(
  {
    expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true },
)

bookingSchema.index({ expertId: 1, date: 1, timeSlot: 1 }, { unique: true })

export const BookingModel = mongoose.models.Booking ?? model('Booking', bookingSchema)
