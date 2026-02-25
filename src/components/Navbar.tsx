import { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [encuestasOpen, setEncuestasOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const encuestasTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adminTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openEncuestas = () => { if (encuestasTimer.current) clearTimeout(encuestasTimer.current); setEncuestasOpen(true) }
  const closeEncuestas = () => { encuestasTimer.current = setTimeout(() => setEncuestasOpen(false), 150) }
  const openAdmin = () => { if (adminTimer.current) clearTimeout(adminTimer.current); setAdminOpen(true) }
  const closeAdmin = () => { adminTimer.current = setTimeout(() => setAdminOpen(false), 150) }

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <div className="brand-logo">UTN</div>
          <div className="brand-text">
            <span className="brand-title">Encuesta Docente</span>
            <span className="brand-sub">Facultad Regional Buenos Aires</span>
          </div>
        </Link>
      </div>

      {user && (
        <div className="navbar-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Inicio
          </Link>

          {/* ENCUESTAS dropdown */}
          <div className="nav-dropdown" onMouseEnter={openEncuestas} onMouseLeave={closeEncuestas}>
            <button
              className={`nav-link dropdown-trigger ${isActive('/encuestas') ? 'active' : ''}`}
              onClick={() => setEncuestasOpen(!encuestasOpen)}
            >
              ENCUESTAS
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 6 }}>
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {encuestasOpen && (
              <div className="dropdown-menu">
                <Link to="/encuestas/hacer" className="dropdown-item" onClick={() => setEncuestasOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Hacer Encuesta
                </Link>
                <Link to="/encuestas/ver" className="dropdown-item" onClick={() => setEncuestasOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M1 8C3 4 5.5 2 8 2s5 2 7 6c-2 4-4.5 6-7 6s-5-2-7-6z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  Ver Encuestas
                </Link>
              </div>
            )}
          </div>

          {/* ADMIN dropdown — solo visible para admins */}
          {isAdmin && (
            <div className="nav-dropdown" onMouseEnter={openAdmin} onMouseLeave={closeAdmin}>
              <button
                className={`nav-link dropdown-trigger ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setAdminOpen(!adminOpen)}
                style={{ color: '#ffd700' }}
              >
                ★ ADMIN
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 6 }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {adminOpen && (
                <div className="dropdown-menu">
                  <Link to="/admin/usuarios" className="dropdown-item" onClick={() => setAdminOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M11 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Gestión de Usuarios
                  </Link>
                  <Link to="/admin/encuestas" className="dropdown-item" onClick={() => setAdminOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="10" width="2" height="4" rx="1" fill="currentColor"/>
                      <rect x="7" y="6" width="2" height="8" rx="1" fill="currentColor"/>
                      <rect x="12" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                    </svg>
                    Vista de Encuestas
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Usuario */}
          <div className="nav-user">
            <Link to="/perfil" className="nav-link" style={{ fontSize: 13, gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Perfil
            </Link>
            <button onClick={handleSignOut} className="btn-signout">
              Salir
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
