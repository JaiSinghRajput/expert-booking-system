import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Mail,
  Search,
  Sparkles,
  UserCircle2,
} from 'lucide-react'

import { fetchBookings } from '../lib/bookingApi'
import { formatDateLabel } from '../lib/format'
import type { BookingRecord } from '../types'

const bookingEmailStorageKey = 'vedaz.bookingEmail'

function statusStyles(status: BookingRecord['status']) {
  if (status === 'Confirmed') {
    return {
      badge:
        'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
      dot: 'bg-emerald-400',
    }
  }

  if (status === 'Completed') {
    return {
      badge:
        'border border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
      dot: 'bg-cyan-400',
    }
  }

  return {
    badge:
      'border border-amber-400/20 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-400',
  }
}

function BookingsPage() {
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState(
    () =>
      searchParams.get('email') ??
      localStorage.getItem(bookingEmailStorageKey) ??
      ''
  )

  const [bookings, setBookings] = useState<BookingRecord[]>(
    []
  )

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  async function load(nextEmail = email) {
    const trimmedEmail = nextEmail.trim()

    if (!trimmedEmail) {
      setBookings([])
      setError('')
      return
    }

    setLoading(true)
    setError('')

    try {
      setBookings(await fetchBookings(trimmedEmail))

      localStorage.setItem(
        bookingEmailStorageKey,
        trimmedEmail
      )
    } catch {
      setError(
        'Unable to load bookings for that email.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedEmail =
      searchParams.get('email') ??
      localStorage.getItem(bookingEmailStorageKey) ??
      ''

    if (savedEmail && savedEmail !== email) {
      setEmail(savedEmail)
      void load(savedEmail)
      return
    }

    if (savedEmail) {
      void load(savedEmail)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-8 backdrop-blur-xl md:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Booking History
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Manage your booked sessions.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
              Search using your booking email to instantly
              access session details, schedules, and booking
              statuses.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <CalendarDays className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-bold text-white">
                {bookings.length}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Sessions Found
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <Clock3 className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-bold text-white">
                Live
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Status Tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex-1">
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Booking Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                id="bookingEmail"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="jasmine@example.com"
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load(email)}
            className=" cursor-pointer inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] lg:mt-auto"
          >
            <Search className="h-4 w-4" />
            Search Bookings
          </button>
        </div>
      </section>

      {/* Empty Email State */}
      {!email.trim() ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
            <Mail className="h-8 w-8" />
          </div>

          <h3 className="mt-6 text-2xl font-semibold text-white">
            No booking email yet
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
            Create your first booking or enter the email
            used during booking to view your sessions.
          </p>
        </div>
      ) : null}

      {/* Loading */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/4 p-16 text-center text-slate-400">
          Loading bookings...
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
          {error}
        </div>
      ) : null}

      {/* Bookings */}
      {!loading && !error ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Your Sessions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View all scheduled and completed bookings.
              </p>
            </div>

            {bookings.length > 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {bookings.length} Booking
                {bookings.length > 1 ? 's' : ''}
              </div>
            ) : null}
          </div>

          {/* No Results */}
          {bookings.length === 0 && email.trim() ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                <Search className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-white">
                No bookings found
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
                We couldn&apos;t find any bookings linked
                to this email address.
              </p>
            </div>
          ) : null}

          {/* Cards */}
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const styles = statusStyles(booking.status)

              return (
                <article
                  key={booking._id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/6"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-300 group-hover:bg-cyan-500/20" />

                  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-cyan-300">
                          <UserCircle2 className="h-7 w-7" />
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {booking.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {booking.email}
                          </p>
                        </div>
                      </div>

                      {/* Expert */}
                      {booking.expertName ? (
                        <div className="mt-6 inline-flex items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                          Expert: {booking.expertName}
                        </div>
                      ) : null}

                      {/* Notes */}
                      {booking.notes ? (
                        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm leading-relaxed text-slate-300">
                            {booking.notes}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Right */}
                    <div className="flex flex-col gap-4 lg:min-w-60">
                      {/* Status */}
                      <div
                        className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium ${styles.badge}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
                        />

                        {booking.status}
                      </div>

                      {/* Meta */}
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#111827] p-5">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-5 w-5 text-cyan-300" />

                          <div>
                            <p className="text-xs text-slate-500">
                              Session Date
                            </p>

                            <p className="text-sm font-medium text-white">
                              {formatDateLabel(
                                booking.date
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock3 className="h-5 w-5 text-cyan-300" />

                          <div>
                            <p className="text-xs text-slate-500">
                              Time Slot
                            </p>

                            <p className="text-sm font-medium text-white">
                              {booking.timeSlot}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Footer Actions */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
        >
          Back to Experts
        </Link>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02]"
        >
          Book Another Session
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default BookingsPage