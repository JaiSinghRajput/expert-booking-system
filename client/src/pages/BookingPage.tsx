import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react'

import { createBooking, fetchExpert } from '../lib/bookingApi'
import { formatDateLabel } from '../lib/format'
import type { ExpertDetail } from '../types'

const bookingEmailStorageKey = 'vedaz.bookingEmail'

type BookingFormState = {
  name: string
  email: string
  phone: string
  date: string
  timeSlot: string
  notes: string
}

type BookingErrors = Partial<Record<keyof BookingFormState, string>>

type ApiErrorResponse = {
  response?: {
    status?: number
    data?: {
      message?: string
      errors?: unknown[]
    }
  }
}

const blankBookingForm: BookingFormState = {
  name: '',
  email: '',
  phone: '',
  date: '',
  timeSlot: '',
  notes: '',
}

function validateBookingForm(form: BookingFormState): BookingErrors {
  const errors: BookingErrors = {}
  const today = new Date().toISOString().slice(0, 10)

  if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (
    !form.email.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  ) {
    errors.email = 'Enter a valid email address.'
  }

  if (
    !form.phone.trim() ||
    form.phone.replace(/\D/g, '').length < 7
  ) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (!form.date) {
    errors.date = 'Choose a date.'
  } else if (form.date < today) {
    errors.date = 'Booking date cannot be in the past.'
  }

  if (!form.timeSlot) {
    errors.timeSlot = 'Choose an available time slot.'
  }

  return errors
}

function fieldLabelFromMessage(
  message: string
): keyof BookingFormState | null {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('name')) return 'name'
  if (normalizedMessage.includes('email')) return 'email'
  if (normalizedMessage.includes('phone')) return 'phone'
  if (normalizedMessage.includes('date')) return 'date'

  if (
    normalizedMessage.includes('slot') ||
    normalizedMessage.includes('time')
  ) {
    return 'timeSlot'
  }

  return null
}

function mapApiErrorsToFormErrors(error: ApiErrorResponse): {
  summary: string
  fieldErrors: BookingErrors
} {
  const fieldErrors: BookingErrors = {}

  const responseMessage =
    error.response?.data?.message?.trim() ?? ''

  const responseErrors = error.response?.data?.errors ?? []

  const messages = [
    responseMessage,
    ...responseErrors.map((item) =>
      typeof item === 'string' ? item : ''
    ),
  ].filter(Boolean)

  for (const message of messages) {
    const field = fieldLabelFromMessage(message)

    if (field) {
      fieldErrors[field] = message
    }
  }

  if (
    error.response?.status === 409 &&
    !fieldErrors.timeSlot
  ) {
    fieldErrors.timeSlot =
      'This slot was just booked. Please choose another available time.'
  }

  if (
    error.response?.status === 400 &&
    !Object.keys(fieldErrors).length
  ) {
    return {
      summary:
        'Please review the highlighted fields and try again.',
      fieldErrors,
    }
  }

  const summary =
    messages.find(
      (message) => !fieldLabelFromMessage(message)
    ) ??
    (error.response?.status === 409
      ? 'Selected slot is no longer available.'
      : 'Something went wrong.')

  return { summary, fieldErrors }
}

function BookingPage() {
  const { expertId = '' } = useParams()

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const [expert, setExpert] =
    useState<ExpertDetail | null>(null)

  const [loading, setLoading] = useState(true)

  const [bookingLoading, setBookingLoading] =
    useState(false)

  const [message, setMessage] = useState('')

  const [formSummary, setFormSummary] = useState('')

  const [errors, setErrors] = useState<BookingErrors>({})

  const [form, setForm] = useState<BookingFormState>({
    ...blankBookingForm,
    date: searchParams.get('date') ?? '',
    timeSlot: searchParams.get('timeSlot') ?? '',
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const data = await fetchExpert(expertId)

        if (!cancelled) {
          setExpert(data.expert)
        }
      } catch {
        if (!cancelled) {
          setExpert(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [expertId])

  const expertAvailability = expert?.availability ?? []

  const selectedSummary = useMemo(() => {
    if (!form.date) {
      return 'Select a slot before booking.'
    }

    return `${formatDateLabel(form.date)} • ${
      form.timeSlot || 'Select a time slot'
    }`
  }, [form.date, form.timeSlot])

  const selectedDay = useMemo(() => {
    return (
      expertAvailability.find(
        (day) => day.date === form.date
      ) ??
      expertAvailability[0] ??
      null
    )
  }, [expertAvailability, form.date])

  const availableDates = expertAvailability.filter((day) =>
    day.slots.some((slot) => slot.available)
  )

  const availableSlots =
    selectedDay?.slots.filter((slot) => slot.available) ?? []

  useEffect(() => {
    if (form.date) return

    const firstAvailableDay = availableDates[0]

    const firstAvailableSlot =
      firstAvailableDay?.slots.find(
        (slot) => slot.available
      )

    if (firstAvailableDay && firstAvailableSlot) {
      setForm((current) => ({
        ...current,
        date: firstAvailableDay.date,
        timeSlot: firstAvailableSlot.timeSlot,
      }))
    }
  }, [availableDates, form.date])

  useEffect(() => {
    if (!selectedDay) return

    const slotIsValid = selectedDay.slots.some(
      (slot) =>
        slot.available &&
        slot.timeSlot === form.timeSlot
    )

    if (!slotIsValid) {
      const firstAvailableSlot =
        selectedDay.slots.find((slot) => slot.available)

      setForm((current) => ({
        ...current,
        timeSlot: firstAvailableSlot?.timeSlot ?? '',
      }))
    }
  }, [form.timeSlot, selectedDay])

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/4 p-16 text-center text-slate-400">
        Loading booking details...
      </div>
    )
  }

  if (!expert) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/4 p-16 text-center">
        <p className="text-lg text-white">
          Expert not found.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to experts
        </Link>
      </section>
    )
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage('')
    setFormSummary('')

    const nextErrors = validateBookingForm(form)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setBookingLoading(true)

    try {
      await createBooking({
        expertId,
        ...form,
      })

      localStorage.setItem(
        bookingEmailStorageKey,
        form.email.trim()
      )

      navigate(
        `/bookings?email=${encodeURIComponent(form.email)}`
      )
    } catch (error) {
      const mapped = mapApiErrorsToFormErrors(
        error as ApiErrorResponse
      )

      setErrors((current) => ({
        ...current,
        ...mapped.fieldErrors,
      }))

      setFormSummary(mapped.summary)

      if (mapped.fieldErrors.timeSlot) {
        setForm((current) => ({
          ...current,
          timeSlot: '',
        }))
      }
    } finally {
      setBookingLoading(false)
    }
  }

  function updateField(
    field: keyof BookingFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))

    if (field === 'date') {
      setErrors((current) => ({
        ...current,
        timeSlot: undefined,
      }))
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
      {/* Left Summary */}
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
          <Sparkles className="h-4 w-4" />
          Booking Flow
        </div>

        <h2 className="text-3xl font-bold text-white">
          {expert.name}
        </h2>

        <p className="mt-2 text-cyan-300">
          {expert.category}
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              Selected Date
            </div>

            <p className="font-medium text-white">
              {form.date
                ? formatDateLabel(form.date)
                : 'Choose a date'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Clock3 className="h-4 w-4 text-cyan-300" />
              Selected Slot
            </div>

            <p className="font-medium text-white">
              {form.timeSlot || 'Choose a slot'}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-cyan-300">
              <CheckCircle2 className="h-4 w-4" />
              Availability
            </div>

            <p className="font-medium text-white">
              {availableSlots.length} Slots Available
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-5">
          <p className="text-sm text-slate-400">
            Booking Summary
          </p>

          <p className="mt-2 text-base font-medium text-white">
            {selectedSummary}
          </p>
        </div>
      </aside>

      {/* Form */}
      <section className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Confirm Your Session
            </h1>

            <p className="mt-2 text-slate-400">
              Fill in your details and reserve your slot instantly.
            </p>
          </div>

          <Link
            to={`/experts/${expertId}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expert
          </Link>
        </div>

        {formSummary ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {formSummary}
          </div>
        ) : null}

        {message ? (
          <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-300">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    updateField('name', event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                  placeholder="Enter your full name"
                />
              </div>

              {errors.name ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.name}
                </p>
              ) : null}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField('email', event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                  placeholder="Enter your email"
                />
              </div>

              {errors.email ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.email}
                </p>
              ) : null}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    updateField('phone', event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                  placeholder="Enter your phone number"
                />
              </div>

              {errors.phone ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Select Date
              </label>

              <select
                id="date"
                value={form.date}
                onChange={(event) =>
                  updateField('date', event.target.value)
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              >
                <option value="">
                  Choose an available date
                </option>

                {availableDates.map((day) => (
                  <option key={day.date} value={day.date}>
                    {formatDateLabel(day.date)}
                  </option>
                ))}
              </select>

              {errors.date ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.date}
                </p>
              ) : null}
            </div>

            {/* Slot */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Time Slot
              </label>

              <select
                id="timeSlot"
                value={form.timeSlot}
                onChange={(event) =>
                  updateField(
                    'timeSlot',
                    event.target.value
                  )
                }
                disabled={!selectedDay}
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10 disabled:opacity-50"
              >
                <option value="">
                  Choose an available time slot
                </option>

                {availableSlots.map((slot) => (
                  <option
                    key={slot.timeSlot}
                    value={slot.timeSlot}
                  >
                    {slot.timeSlot}
                  </option>
                ))}
              </select>

              {errors.timeSlot ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.timeSlot}
                </p>
              ) : null}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Additional Notes
              </label>

              <textarea
                id="notes"
                rows={5}
                value={form.notes}
                onChange={(event) =>
                  updateField('notes', event.target.value)
                }
                placeholder="Describe your goals, questions, or expectations..."
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Secure booking • Instant confirmation
            </p>

            <button
              type="submit"
              disabled={bookingLoading}
              className=" cursor-pointer inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading
                ? 'Submitting...'
                : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default BookingPage