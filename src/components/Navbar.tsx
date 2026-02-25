import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [encuestasOpen, setEncuestasOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileEncuestasOpen, setMobileEncuestasOpen] = useState(false)
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false)

  // Desktop hover helpers
  let encuestasTimer: ReturnType<typeof setTimeout> | null = null
  let adminTimer: ReturnType<typeof setTimeout> | null = null
  const openEncuestas = () => { if (encuestasTimer) clearTimeout(encuestasTimer); setEncuestasOpen(true) }
  const closeEncuestas = () => { encuestasTimer = setTimeout(() => setEncuestasOpen(false), 150) }
  const openAdmin = () => { if (adminTimer) clearTimeout(adminTimer); setAdminOpen(true) }
  const closeAdmin = () => { adminTimer = setTimeout(() => setAdminOpen(false), 150) }

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/login')
  }

  const closeMobileMenu = () => setMenuOpen(false)

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-link" onClick={closeMobileMenu}>
            <div className="brand-logo">UTN</div>
            <div className="brand-text">
              <span className="brand-title">Encuesta Docente</span>
              <span className="brand-sub">Facultad Regional Buenos Aires</span>
            </div>
          </Link>
        </div>

        {/* Desktop menu */}
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
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {encuestasOpen && (
                <div className="dropdown-menu">
                  <Link to="/encuestas/hacer" className="dropdown-item" onClick={() => setEncuestasOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Hacer Encuesta
                  </Link>
                  <Link to="/encuestas/ver" className="dropdown-item" onClick={() => setEncuestasOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M1 8C3 4 5.5 2 8 2s5 2 7 6c-2 4-4.5 6-7 6s-5-2-7-6z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    Ver Encuestas
                  </Link>
                </div>
              )}
            </div>

            {/* ADMIN dropdown */}
            {isAdmin && (
              <div className="nav-dropdown" onMouseEnter={openAdmin} onMouseLeave={closeAdmin}>
                <button
                  className={`nav-link dropdown-trigger ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setAdminOpen(!adminOpen)}
                  style={{ color: '#ffd700' }}
                >
                  ★ ADMIN
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {adminOpen && (
                  <div className="dropdown-menu">
                    <Link to="/admin/usuarios" className="dropdown-item" onClick={() => setAdminOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M11 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Gestión de Usuarios
                    </Link>
                    <Link to="/admin/encuestas" className="dropdown-item" onClick={() => setAdminOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="10" width="2" height="4" rx="1" fill="currentColor" />
                        <rect x="7" y="6" width="2" height="8" rx="1" fill="currentColor" />
                        <rect x="12" y="2" width="2" height="12" rx="1" fill="currentColor" />
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
                  <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Perfil
              </Link>
              <button onClick={handleSignOut} className="btn-signout">
                Salir
              </button>
            </div>
          </div>
        )}

        {/* Hamburger button — solo visible en mobile */}
        {user && (
          <button
            className={`hamburger-btn ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 5L17 17M17 5L5 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </nav>

      {/* Mobile menu panel */}
      {user && menuOpen && (
        <div className="mobile-menu">
          <Link
            to="/"
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            Inicio
          </Link>

          {/* Encuestas expandible */}
          <div className="mobile-dropdown-section">
            <button
              className={`mobile-section-btn ${isActive('/encuestas') ? 'active' : ''}`}
              onClick={() => setMobileEncuestasOpen(!mobileEncuestasOpen)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Encuestas
              </span>
              <svg
                width="14" height="14" viewBox="0 0 12 12" fill="none"
                style={{ transform: mobileEncuestasOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {mobileEncuestasOpen && (
              <div className="mobile-sub-links">
                <Link to="/encuestas/hacer" className="mobile-sub-link" onClick={closeMobileMenu}>
                  Hacer Encuesta
                </Link>
                <Link to="/encuestas/ver" className="mobile-sub-link" onClick={closeMobileMenu}>
                  Ver Encuestas
                </Link>
              </div>
            )}
          </div>

          {/* Admin expandible */}
          {isAdmin && (
            <div className="mobile-dropdown-section">
              <button
                className={`mobile-section-btn ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
                style={{ color: '#ffd700' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>★</span>
                  Admin
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 12 12" fill="none"
                  style={{ transform: mobileAdminOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {mobileAdminOpen && (
                <div className="mobile-sub-links">
                  <Link to="/admin/usuarios" className="mobile-sub-link" onClick={closeMobileMenu}>
                    Gestión de Usuarios
                  </Link>
                  <Link to="/admin/encuestas" className="mobile-sub-link" onClick={closeMobileMenu}>
                    Vista de Encuestas
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Perfil y Salir */}
          <div className="mobile-menu-footer">
            <Link to="/perfil" className="mobile-nav-link" onClick={closeMobileMenu}>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Perfil
            </Link>
            <button onClick={handleSignOut} className="mobile-signout-btn">
              Salir
            </button>
          </div>
        </div>
      )}
    </>
  )
}
