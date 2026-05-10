import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  CalendarPlus,
  Plus,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
} from 'lucide-react'

import { createExpert } from '../lib/bookingApi'

type ExpertFormState = {
  name: string
  category: string
  experience: string
  rating: string
  bio: string
}

type ExpertErrors = Partial<
  Record<keyof ExpertFormState, string>
>

type SlotEntry = {
  date: string
  slots: string[]
}

type ApiErrorResponse = {
  response?: {
    status?: number
    data?: {
      message?: string
      errors?: unknown[]
    }
  }
}

const blankForm: ExpertFormState = {
  name: '',
  category: '',
  experience: '',
  rating: '',
  bio: '',
}

function validateExpertForm(
  form: ExpertFormState
): ExpertErrors {
  const errors: ExpertErrors = {}

  if (form.name.trim().length < 2) {
    errors.name =
      'Name must be at least 2 characters.'
  }

  if (form.category.trim().length < 2) {
    errors.category =
      'Category must be at least 2 characters.'
  }

  const exp = Number(form.experience)

  if (isNaN(exp) || exp < 0 || exp > 70) {
    errors.experience =
      'Experience must be between 0 and 70 years.'
  }

  const rat = Number(form.rating)

  if (isNaN(rat) || rat < 0 || rat > 5) {
    errors.rating =
      'Rating must be between 0 and 5.'
  }

  if (form.bio.trim().length < 10) {
    errors.bio =
      'Bio must be at least 10 characters.'
  }

  return errors
}

function fieldLabelFromMessage(
  message: string
): keyof ExpertFormState | null {
  const normalizedMessage =
    message.toLowerCase()

  if (normalizedMessage.includes('name'))
    return 'name'

  if (normalizedMessage.includes('category'))
    return 'category'

  if (
    normalizedMessage.includes('experience')
  )
    return 'experience'

  if (normalizedMessage.includes('rating'))
    return 'rating'

  if (normalizedMessage.includes('bio'))
    return 'bio'

  return null
}

function mapApiErrorsToFormErrors(
  error: ApiErrorResponse
): {
  summary: string
  fieldErrors: ExpertErrors
} {
  const fieldErrors: ExpertErrors = {}

  const responseMessage =
    error.response?.data?.message?.trim() ?? ''

  const responseErrors =
    error.response?.data?.errors ?? []

  const messages = [
    responseMessage,
    ...responseErrors.map((item) =>
      typeof item === 'string' ? item : ''
    ),
  ].filter(Boolean)

  for (const message of messages) {
    const field =
      fieldLabelFromMessage(message)

    if (field) {
      fieldErrors[field] = message
    }
  }

  const summary =
    messages.find(
      (message) =>
        !fieldLabelFromMessage(message)
    ) ?? 'Something went wrong.'

  return { summary, fieldErrors }
}

function ExpertRegistrationPage() {
  const navigate = useNavigate()

  const [form, setForm] =
    useState<ExpertFormState>(blankForm)

  const [errors, setErrors] =
    useState<ExpertErrors>({})

  const [formSummary, setFormSummary] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [slots, setSlots] = useState<
    SlotEntry[]
  >([
    {
      date: '',
      slots: ['10:00 AM', '2:00 PM'],
    },
  ])

  const [slotErrors, setSlotErrors] =
    useState('')

  function updateField(
    field: keyof ExpertFormState,
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
  }

  function updateSlotDate(
    index: number,
    date: string
  ) {
    setSlots((current) => {
      const next = [...current]

      next[index].date = date

      return next
    })

    setSlotErrors('')
  }

  function updateSlotTimes(
    index: number,
    value: string
  ) {
    setSlots((current) => {
      const next = [...current]

      next[index].slots = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      return next
    })

    setSlotErrors('')
  }

  function addSlotRow() {
    setSlots((current) => [
      ...current,
      {
        date: '',
        slots: ['10:00 AM', '2:00 PM'],
      },
    ])
  }

  function removeSlotRow(index: number) {
    if (slots.length > 1) {
      setSlots((current) =>
        current.filter((_, i) => i !== index)
      )
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setFormSummary('')
    setSlotErrors('')

    const nextErrors =
      validateExpertForm(form)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const validSlots = slots.filter(
      (s) => s.date && s.slots.length > 0
    )

    if (validSlots.length === 0) {
      setSlotErrors(
        'Add at least one available slot.'
      )

      return
    }

    setLoading(true)

    try {
      await createExpert({
        name: form.name.trim(),
        category: form.category.trim(),
        experience: Number(
          form.experience
        ),
        rating: Number(form.rating),
        bio: form.bio.trim(),
        availableSlots: validSlots,
      })

      navigate('/experts', {
        state: {
          message:
            'Expert registered successfully!',
        },
      })
    } catch (error) {
      const mapped =
        mapApiErrorsToFormErrors(
          error as ApiErrorResponse
        )

      setErrors((current) => ({
        ...current,
        ...mapped.fieldErrors,
      }))

      setFormSummary(mapped.summary)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
      {/* Left Panel */}
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
          <Sparkles className="h-4 w-4" />
          Expert Registration
        </div>

        <h1 className="text-3xl font-bold text-white">
          Join the platform as an expert.
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Share your expertise, create available
          booking slots, and connect with people
          seeking professional guidance.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <UserPlus className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Create Your Profile
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Showcase your experience and
              expertise professionally.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <CalendarPlus className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Add Availability
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Define time slots clients can
              instantly book.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Star className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Grow Your Reach
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Connect with users actively seeking
              professional sessions.
            </p>
          </div>
        </div>
      </aside>

      {/* Form */}
      <section className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Register as Expert
            </h2>

            <p className="mt-2 text-slate-400">
              Complete your profile and set your
              available booking slots.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
        </div>

        {/* Error */}
        {formSummary ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {formSummary}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Inputs */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <input
                id="name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value
                  )
                }
                placeholder="Dr. Jane Smith"
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />

              {errors.name ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.name}
                </p>
              ) : null}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Specialty / Category
              </label>

              <input
                id="category"
                value={form.category}
                onChange={(event) =>
                  updateField(
                    'category',
                    event.target.value
                  )
                }
                placeholder="Software Engineer"
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />

              {errors.category ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.category}
                </p>
              ) : null}
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Experience
              </label>

              <input
                id="experience"
                type="number"
                min="0"
                max="70"
                value={form.experience}
                onChange={(event) =>
                  updateField(
                    'experience',
                    event.target.value
                  )
                }
                placeholder="10"
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />

              {errors.experience ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.experience}
                </p>
              ) : null}
            </div>

            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Rating
              </label>

              <input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={form.rating}
                onChange={(event) =>
                  updateField(
                    'rating',
                    event.target.value
                  )
                }
                placeholder="4.8"
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />

              {errors.rating ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.rating}
                </p>
              ) : null}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Professional Bio
              </label>

              <textarea
                id="bio"
                rows={5}
                value={form.bio}
                onChange={(event) =>
                  updateField(
                    'bio',
                    event.target.value
                  )
                }
                placeholder="Tell us about your experience, certifications, achievements, and expertise..."
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />

              {errors.bio ? (
                <p className="mt-2 text-sm text-red-400">
                  {errors.bio}
                </p>
              ) : null}
            </div>
          </div>

          {/* Slots */}
          <div className="border-t border-white/10 pt-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Available Slots
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Add dates and time slots clients
                  can book.
                </p>
              </div>

              <button
                type="button"
                onClick={addSlotRow}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20"
              >
                <Plus className="h-4 w-4" />
                Add Slot
              </button>
            </div>

            {slotErrors ? (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                {slotErrors}
              </div>
            ) : null}

            <div className="space-y-5">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[220px_1fr_auto]">
                    {/* Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Date
                      </label>

                      <input
                        id={`slot-date-${index}`}
                        type="date"
                        value={slot.date}
                        onChange={(event) =>
                          updateSlotDate(
                            index,
                            event.target.value
                          )
                        }
                        className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                      />
                    </div>

                    {/* Times */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Time Slots
                      </label>

                      <input
                        id={`slot-times-${index}`}
                        value={slot.slots.join(
                          ', '
                        )}
                        onChange={(event) =>
                          updateSlotTimes(
                            index,
                            event.target.value
                          )
                        }
                        placeholder="10:00 AM, 2:00 PM, 4:00 PM"
                        className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                      />
                    </div>

                    {/* Remove */}
                    {slots.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          removeSlotRow(index)
                        }
                        className="cursor-pointer flex h-14 w-14 items-center justify-center self-end rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 transition-all duration-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Your profile will be visible after
              registration.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Registering...'
                : 'Register as Expert'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ExpertRegistrationPage