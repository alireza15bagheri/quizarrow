import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

function Icon({ name, className = 'w-4 h-4' }) {
  // Minimal inline icons with no external deps
  switch (name) {
    case 'dashboard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 11h8V3H3v8zm0 10h8v-8H3v8zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      )
    case 'lobby':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05A6.1 6.1 0 0118 16.5V20h6v-3.5C24 14.57 19.33 13 16 13z" />
        </svg>
      )
    case 'quizzes':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 2H8C6.9 2 6 2.9 6 4v13c0 1.1.9 2 2 2h11v-2H8V4h11v16h2V4c0-1.1-.9-2-2-2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
        </svg>
      )
    case 'sessions':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H5V9h14v9z" />
        </svg>
      )
    case 'history':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7v2a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"/>
        </svg>
      )
    default:
      return null
  }
}

function NavLinks({ onClick, isActive }) {
  const linkBase =
    // Base (mobile): roomier; md: tighter; lg: roomy again. Prevent label wrapping.
    'inline-flex items-center gap-2 md:gap-1.5 lg:gap-2 px-4 md:px-3 lg:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60'
  const activeClasses =
    'bg-gradient-to-r from-secondary to-primary text-base-100 shadow-md'
  const inactiveClasses =
    'text-base-content/80 hover:text-base-content hover:bg-base-200/80 hover:shadow-sm'
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/lobby', label: 'Lobby', icon: 'lobby' },
    { to: '/quizzes/mine', label: 'My Quizzes', icon: 'quizzes' },
    { to: '/sessions', label: 'My Sessions', icon: 'sessions' },
    { to: '/history', label: 'History', icon: 'history' },
  ]

  return (
    <>
      {items.map((it) => {
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
        <Link to="/dashboard" className="btn btn-ghost normal-case text-xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            Quizarrow
          </span>
        </Link>
      </div>

      {/* Desktop menu */}
      <nav className="hidden md:flex items-center gap-2 md:gap-1.5 lg:gap-2">
        <NavLinks isActive={isActive} />
      </nav>

      {/* Right side actions */}
      <div className="flex-none gap-2 ml-3">
        <span className="text-sm text-base-content/70 hidden sm:inline">
          {user?.username}
        </span>
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
                <NavLinks onClick={closeMobile} isActive={isActive} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}