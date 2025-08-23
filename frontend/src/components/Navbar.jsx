import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

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
    <div className="navbar bg-base-100 shadow-sm relative">
      <div className="flex-1">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="btn btn-ghost md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand */}
        <Link to="/dashboard" className="btn btn-ghost text-xl">Quizarrow</Link>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link
              className={`link ${isActive('/dashboard') ? 'link-success font-bold' : ''}`}
              to="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              className={`link ${isActive('/lobby') ? 'link-success font-bold' : ''}`}
              to="/lobby"
            >
              Lobby
            </Link>
          </li>
          <li>
            <Link
              className={`link ${isActive('/quizzes/mine') ? 'link-success font-bold' : ''}`}
              to="/quizzes/mine"
            >
              My Quizzes
            </Link>
          </li>
          <li>
            <Link
              className={`link ${isActive('/sessions') ? 'link-success font-bold' : ''}`}
              to="/sessions"
            >
              My Sessions
            </Link>
          </li>
        </ul>
      </div>

      {/* Right side actions */}
      <div className="flex-none gap-2">
        <span className="text-sm text-base-content/70 hidden sm:inline">
          {user?.username}
        </span>
        <button onClick={onLogout} className="ml-3 btn btn-warning btn-sm sm:btn-md">
          Log out
        </button>
      </div>

      {/* Mobile panel + overlay */}
      {mobileOpen && (
        <>
          {/* click-away overlay */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div className="absolute left-2 top-14 z-50 md:hidden">
            <ul className="menu menu-sm bg-base-100 rounded-box w-56 p-2 shadow">
              <li>
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className={`link ${isActive('/dashboard') ? 'link-success font-bold' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/lobby"
                  onClick={closeMobile}
                  className={`link ${isActive('/lobby') ? 'link-success font-bold' : ''}`}
                >
                  Lobby
                </Link>
              </li>
              <li>
                <Link
                  to="/quizzes/mine"
                  onClick={closeMobile}
                  className={`link ${isActive('/quizzes/mine') ? 'link-success font-bold' : ''}`}
                >
                  My Quizzes
                </Link>
              </li>
              <li>
                <Link
                  to="/sessions"
                  onClick={closeMobile}
                  className={`link ${isActive('/sessions') ? 'link-success font-bold' : ''}`}
                >
                  My Sessions
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}