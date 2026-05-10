import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'

function NotFoundPage() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-8 backdrop-blur-xl md:p-14">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <Compass className="h-12 w-12" />
        </div>

        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
          <Sparkles className="h-4 w-4" />
          404 Error
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
          The page you&apos;re looking for doesn&apos;t exist
          or may have been moved. Let&apos;s get you back
          to the expert marketplace.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02]"
          >
            Go Home
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Experts
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage