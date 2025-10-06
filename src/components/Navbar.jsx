import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/academics', label: 'Academics' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="container-pad py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/src/assets/logo.png" alt="Logo" className="w-9 h-9" />
          <div className="leading-tight">
            <div className="font-bold text-primary text-xl">Immaculate heart intl. school</div>
          </div>
        </Link>

        <button
          className="md:hidden p-2 border rounded-xl"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`absolute md:static left-0 right-0 top-full md:top-auto bg-white md:bg-transparent border-t md:border-0 md:block ${open ? 'block' : 'hidden'}`}>
          <ul className="container-pad md:container mx-auto md:flex md:items-center gap-1 py-3 md:py-0">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-xl transition hover:bg-gray-100 ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            {/* Mobile CTA / Auth controls */}
            <li className="md:hidden mt-2">
              {isAuthenticated ? (
                <div className="flex gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="flex-1 text-center border font-semibold px-5 py-2 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setOpen(false)}
                  className="block text-center bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
        {/* Desktop CTA */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.name || 'Account'}</span>
              <Link to="/dashboard" className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl">Dashboard</Link>
              <button onClick={logout} className="border font-semibold px-4 py-2 rounded-xl">Logout</button>
            </div>
          ) : (
            <Link to="/auth/login" className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
