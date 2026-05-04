import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Mic2, Target, BookOpen,
  BarChart2, Sparkles, Music2, Guitar, Trophy,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plan', label: 'This Week', icon: Sparkles },
  { to: '/studio', label: 'Song Studio', icon: Guitar },
  { to: '/challenge', label: 'Challenge', icon: Trophy },
  { to: '/log', label: 'Log Session', icon: Mic2 },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: BarChart2 },
]

const mobileNav = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/studio', label: 'Studio', icon: Guitar },
  { to: '/log', label: 'Log', icon: Mic2 },
  { to: '/challenge', label: 'Challenge', icon: Trophy },
  { to: '/plan', label: 'Plan', icon: Sparkles },
]

export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-forest-800 flex-col z-10">
        <div className="px-5 py-7 flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Music2 size={18} className="text-forest-800" />
          </div>
          <div>
            <p className="font-display text-cream-50 text-lg leading-tight">Music</p>
            <p className="font-display italic text-gold-300 text-lg leading-tight -mt-1">Growth</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-forest-600 text-cream-50 font-medium'
                    : 'text-forest-400 hover:bg-forest-700 hover:text-cream-200'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-5">
          <div className="bg-forest-700 rounded-xl p-3.5">
            <p className="text-xs text-forest-400 leading-relaxed">
              Keep showing up. Every session counts 🎵
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-forest-800 flex items-center px-4 h-14 border-b border-forest-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gold-400 rounded-lg flex items-center justify-center">
            <Music2 size={14} className="text-forest-800" />
          </div>
          <span className="font-display text-cream-50 text-base">Music</span>
          <span className="font-display italic text-gold-300 text-base -ml-1">Growth</span>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-forest-800 border-t border-forest-700 flex">
        {mobileNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                isActive ? 'text-gold-400' : 'text-forest-400'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}