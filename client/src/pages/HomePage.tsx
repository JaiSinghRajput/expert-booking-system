import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Search,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'

import { fetchExperts } from '../lib/bookingApi'
import { formatDateLabel } from '../lib/format'
import type { ExpertSummary, Pagination } from '../types'

function HomePage() {
  const [experts, setExperts] = useState<ExpertSummary[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  })

  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = useMemo(
    () =>
      Array.from(new Set(experts.map((expert) => expert.category))).sort(),
    [experts]
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await fetchExperts({
          page,
          limit: pagination.limit,
          search: searchText.trim() || undefined,
          category: categoryFilter || undefined,
        })

        if (cancelled) {
          return
        }

        setExperts(data.experts)
        setPagination(data.pagination)
      } catch {
        if (!cancelled) {
          setError('Unable to load experts right now.')
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
  }, [categoryFilter, page, pagination.limit, searchText])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-8 backdrop-blur-xl md:p-12">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          {/* Left */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Live Expert Marketplace
            </div>

            <h2 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Find the perfect expert for your next breakthrough.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
              Discover verified professionals across career, finance,
              wellness, business, and more. Book live sessions instantly with a
              seamless experience.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register-expert"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02]"
              >
                Become an Expert
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
                <CalendarDays className="h-4 w-4 text-cyan-300" />
                {formatDateLabel(new Date().toISOString().slice(0, 10))}
              </div>
            </div>
          </div>

          {/* Right Stats */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                {pagination.total}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Total Experts
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <Briefcase className="h-6 w-6" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                {categories.length}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Categories
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <Star className="h-6 w-6" />
              </div>

              <h3 className="text-3xl font-bold text-white">4.9</h3>

              <p className="mt-1 text-sm text-slate-400">
                Avg. Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-white/10 bg-white/4 p-5 backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              id="search"
              value={searchText}
              onChange={(event) => {
                setPage(1)
                setSearchText(event.target.value)
              }}
              placeholder="Search experts, categories, specialties..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-[#111827] pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
            />
          </div>

          {/* Category */}
          <select
            id="category"
            value={categoryFilter}
            onChange={(event) => {
              setPage(1)
              setCategoryFilter(event.target.value)
            }}
            className="h-14 rounded-2xl border border-white/10 bg-[#111827] px-4 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Expert Listing */}
      <section className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Expert Directory
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Explore professionals with live availability and instant booking.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Page {pagination.page} of {pagination.pages}
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/4 p-16 text-center text-slate-400">
            Loading experts...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
            {error}
          </div>
        ) : null}

        {/* Cards */}
        {!loading && !error ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {experts.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-white/10 bg-white/4 p-16 text-center text-slate-400">
                No experts match your filters.
              </div>
            ) : null}

            {experts.map((expert) => (
              <article
                key={expert._id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/6"
              >
                {/* Glow */}
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition-all duration-300 group-hover:bg-cyan-500/20" />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {expert.name}
                    </h3>

                    <p className="mt-1 text-sm text-cyan-300">
                      {expert.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-300">
                    <Star className="h-4 w-4 fill-current" />
                    {expert.rating.toFixed(1)}
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                    {expert.experience} Years Experience
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300">
                    {expert.availableSlotCount} Slots Available
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-slate-400">
                  {expert.bio}
                </p>

                {/* Actions */}
                <div className="mt-8 flex items-center gap-3">
                  <Link
                    to={`/experts/${expert._id}`}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/book/${expert._id}`}
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Book Session
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {/* Pagination */}
        {!loading && !error && experts.length > 0 ? (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={page <= 1 || loading}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.pages, current + 1)
                )
              }
              disabled={page >= pagination.pages || loading}
              className="cursor-pointer rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default HomePage