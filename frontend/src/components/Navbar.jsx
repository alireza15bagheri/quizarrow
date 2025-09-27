import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useMemo } from 'react'
import {
  HomeIcon,
  RectangleStackIcon,
  ClockIcon,
  PlayIcon,
  UserGroupIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

function Icon({ name, className = 'w-4 h-4' }) {
  // Using Heroicons for a consistent and professional look
  switch (name) {
    case 'dashboard':
      return <HomeIcon className={className} />
    case 'lobby':
      return <UserGroupIcon className={className} />
    case 'quizzes':
      return <RectangleStackIcon className={className} />
    case 'sessions':
      return <PlayIcon className={className} />
    case 'history':
      return <ClockIcon className={className} />
    case 'user':
      return <UserCircleIcon className={className} />
    default:
      return null
  }
}

function NavLinks({ onClick, isActive, userRole }) {
  const linkBase =
    // Base (mobile): roomier; md: tighter; lg: roomy again. Prevent label wrapping.
    'inline-flex items-center gap-2 md:gap-1.5 lg:gap-2 px-4 md:px-3 lg:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60'
  const activeClasses =
    'bg-gradient-to-r from-secondary to-primary text-base-100 shadow-md'
  const inactiveClasses =
    'text-base-content/80 hover:text-base-content hover:bg-base-200/80 hover:shadow-sm'
  
  const allItems = useMemo(() => [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['player', 'host', 'admin'] },
    { to: '/lobby', label: 'Lobby', icon: 'lobby', roles: ['player', 'host', 'admin'] },
    { to: '/quizzes/mine', label: 'My Quizzes', icon: 'quizzes', roles: ['host', 'admin'] },
    { to: '/sessions', label: 'My Sessions', icon: 'sessions', roles: ['host', 'admin'] },
    { to: '/history', label: 'History', icon: 'history', roles: ['player', 'host', 'admin'] },
  ], []);

  const visibleItems = allItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {visibleItems.map((it) => {
        const active = isActive(it.to)
        const cls = `${linkBase} ${active ? activeClasses : inactiveClasses}`
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClick}
            className={cls}
            aria-current={active ? 'page' : undefined}
            title={it.label}
          >
            <Icon name={it.icon} className="w-4 h-4 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
            <span className="font-semibold text-sm md:text-xs lg:text-sm">{it.label}</span>
          </Link>
        )
      })}
    </>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname.startsWith(path)

  const onLogout = async () => {
    await logout()
    setMobileOpen(false)
    navigate('/login', { replace: true })
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="navbar bg-base-100/95 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="flex-1 items-center gap-2">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="btn btn-ghost md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand */}
        <Link to="/dashboard" className="btn btn-ghost normal-case text-xl group">
          <span className="font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            Quizarrow
          </span>
        </Link>
      </div>

      {/* Desktop menu */}
      <nav className="hidden md:flex items-center gap-2 md:gap-1.5 lg:gap-2">
        <NavLinks isActive={isActive} userRole={user?.role} />
      </nav>

      {/* Right side actions */}
      <div className="flex-none flex items-center gap-2 ml-3">
        <Link
          to="/settings"
          className="hidden sm:inline-flex items-center gap-2 bg-base-200/80 text-base-content/80 font-semibold text-sm px-3 py-1.5 rounded-full hover:bg-base-300 transition-colors"
        >
          <Icon name="user" className="w-5 h-5" />
          {user?.username}
        </Link>
        <button onClick={onLogout} className="ml-2 btn btn-warning btn-sm sm:btn-md">
          Log out
        </button>
      </div>

      {/* Mobile panel + overlay */}
      {mobileOpen && (
        <>
          {/* click-away overlay */}
          <button
            className="fixed inset-0 z-40 md:hidden cursor-default"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div className="absolute left-2 top-16 z-50 md:hidden">
            <div className="bg-base-100 rounded-box w-64 p-3 shadow-lg border border-base-200">
              <div className="flex flex-col gap-2">
                <NavLinks onClick={closeMobile} isActive={isActive} userRole={user?.role} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}