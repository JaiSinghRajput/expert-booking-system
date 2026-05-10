import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Sparkles, UserPlus } from 'lucide-react'

function AppLayout() {
  const navItems = [
    {
      to: '/',
      label: 'Experts',
      icon: Sparkles,
    },
    {
      to: '/bookings',
      label: 'My Bookings',
      icon: CalendarDays,
    },
    {
      to: '/register-expert',
      label: 'Become an Expert',
      icon: UserPlus,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Background Design */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-30 -left-30 h-80 w-[320px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-37.5 -right-30 h-90 w-90 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Brand */}
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Tech Jai
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Expert Session Booking
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-400 md:text-base">
              Discover top experts, reserve live consultation slots, and manage
              your bookings seamlessly.
            </p>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 lg:flex"
          >
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-lg shadow-cyan-500/20'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Mobile Nav */}
        <div className="border-t border-white/10 px-4 py-3 lg:hidden">
          <nav className="flex items-center justify-between gap-2">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-3 text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-slate-900'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout