import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  Star,
} from 'lucide-react'

import { fetchExpert } from '../lib/bookingApi'
import { apiBaseUrl, getSocketBaseUrl } from '../lib/api'
import { formatDateLabel } from '../lib/format'
import type { ExpertDetail } from '../types'

function ExpertPage() {
  const { expertId = '' } = useParams()

  const navigate = useNavigate()

  const [expert, setExpert] =
    useState<ExpertDetail | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [selectedDate, setSelectedDate] =
    useState('')

  const [selectedSlot, setSelectedSlot] =
    useState('')

  const [liveState, setLiveState] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await fetchExpert(expertId)

        if (cancelled) {
          return
        }

        setExpert(data.expert)

        const firstAvailableDay =
          data.expert.availability.find((day) =>
            day.slots.some((slot) => slot.available)
          )

        const firstAvailableSlot =
          firstAvailableDay?.slots.find(
            (slot) => slot.available
          )

        if (firstAvailableDay && firstAvailableSlot) {
          setSelectedDate(firstAvailableDay.date)
          setSelectedSlot(
            firstAvailableSlot.timeSlot
          )
        }
      } catch {
        if (!cancelled) {
          setError(
            'Unable to load expert details.'
          )
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

  useEffect(() => {
    const socket: Socket = io(
      getSocketBaseUrl(),
      {
        transports: ['websocket'],
      }
    )

    socket.on(
      'slotBooked',
      async (payload: {
        expertId: string
        date: string
        timeSlot: string
      }) => {
        if (payload.expertId !== expertId) {
          return
        }

        setLiveState(
          `Slot updated live for ${payload.date} at ${payload.timeSlot}`
        )

        const data = await fetchExpert(expertId)

        setExpert(data.expert)

        window.setTimeout(() => {
          setLiveState('')
        }, 2200)
      }
    )

    return () => {
      socket.disconnect()
    }
  }, [expertId])

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/4 p-16 text-center text-slate-400 backdrop-blur-xl">
        Loading expert details...
      </div>
    )
  }

  if (error || !expert) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/4 p-16 text-center backdrop-blur-xl">
        <p className="text-lg text-white">
          {error || 'Expert not found.'}
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experts
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-8 backdrop-blur-xl md:p-10">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          {/* Left */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" />
              {expert.category}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              {expert.name}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-400 md:text-lg">
              {expert.bio}
            </p>

            {liveState ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300">
                <Activity className="h-4 w-4" />
                {liveState}
              </div>
            ) : null}
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <Star className="h-6 w-6 fill-current" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                {expert.rating.toFixed(1)}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Expert Rating
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                {expert.availableSlotCount}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Available Slots
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <CalendarDays className="h-6 w-6" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                {expert.bookedSlots}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Slots Booked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Availability */}
      <section className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Availability
            </h2>

            <p className="mt-2 text-slate-400">
              Choose an available slot to continue
              with your booking.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4">
            <p className="text-sm text-cyan-300">
              Selected Slot
            </p>

            <p className="mt-1 font-medium text-white">
              {selectedDate
                ? formatDateLabel(selectedDate)
                : 'Select Date'}
              {' • '}
              {selectedSlot || 'Select Time'}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {expert.availability.map((day) => {
            const availableCount =
              day.slots.filter(
                (slot) => slot.available
              ).length

            return (
              <div
                key={day.date}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                {/* Day Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {formatDateLabel(day.date)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {availableCount} slots available
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                    {availableCount} Open
                  </div>
                </div>

                {/* Slots */}
                <div className="grid grid-cols-2 gap-3">
                  {day.slots.map((slot) => {
                    const active =
                      selectedDate === day.date &&
                      selectedSlot ===
                        slot.timeSlot

                    return (
                      <button
                        key={`${day.date}-${slot.timeSlot}`}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          if (!slot.available) {
                            return
                          }

                          setSelectedDate(day.date)
                          setSelectedSlot(
                            slot.timeSlot
                          )
                        }}
                        className={` cursor-pointer group rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                          !slot.available
                            ? 'cursor-not-allowed border-white/5 bg-white/5 opacity-40'
                            : active
                            ? 'border-cyan-400/30 bg-cyan-400/10'
                            : 'border-white/10 bg-[#111827] hover:border-cyan-400/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-white">
                              {slot.timeSlot}
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                slot.available
                                  ? 'text-cyan-300'
                                  : 'text-slate-500'
                              }`}
                            >
                              {slot.available
                                ? 'Available'
                                : 'Booked'}
                            </p>
                          </div>

                          <Clock3
                            className={`h-4 w-4 ${
                              slot.available
                                ? 'text-cyan-300'
                                : 'text-slate-600'
                            }`}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Experts
          </Link>

          <button
            type="button"
            disabled={
              !selectedDate || !selectedSlot
            }
            onClick={() => {
              navigate(
                `/book/${expertId}?date=${encodeURIComponent(
                  selectedDate
                )}&timeSlot=${encodeURIComponent(
                  selectedSlot
                )}`
              )
            }}
            className=" cursor-pointer inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Book This Slot
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 text-sm text-slate-400">
          <span className="font-medium text-white">
            Backend:
          </span>{' '}
          {apiBaseUrl}
        </div>
      </section>
    </div>
  )
}

export default ExpertPage