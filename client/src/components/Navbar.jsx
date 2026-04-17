import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const links = [
  { to: '/',        label: 'Home',    icon: '🏠' },
  { to: '/add',     label: 'Add',     icon: '➕', fab: true },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/accounts',label: 'Accounts',icon: '🏦' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {links.map(({ to, label, icon, fab }) => (
        <NavLink
          key={to}
          to={to}
          id={`nav-${label.toLowerCase()}`}
          end={to === '/'}
          className={({ isActive }) =>
            `nav-item ${fab ? 'nav-fab' : ''} ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}

      {/* Logout */}
      <button
        id="nav-logout"
        className="nav-item nav-logout"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <span className="nav-icon">🚪</span>
        <span className="nav-label">Logout</span>
      </button>
    </nav>
  )
}
