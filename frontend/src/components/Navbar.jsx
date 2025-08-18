import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Highlight if the current pathname starts with the given path
  const isActive = (path) => location.pathname.startsWith(path)

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        {/* Mobile menu */}
        <div className="dropdown md:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
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
              <a className="disabled" title="Coming soon">Quiz</a>
            </li>
          </ul>
        </div>

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
            <a className="disabled" title="Coming soon">Quiz</a>
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
    </div>
  )
}
