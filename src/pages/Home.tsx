import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page-wrapper">
      <div className="hero-banner">
        <h1 className="hero-title">Sistema de Encuesta Docente</h1>
        <p className="hero-sub">
          Facultad Regional Buenos Aires — Universidad Tecnológica Nacional
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 12 }}>
          Bienvenido, {user?.email}
        </p>
      </div>

      <div className="home-grid">
        <Link to="/encuestas/hacer" className="home-card">
          <div className="home-card-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 5v16M5 13h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="home-card-title">Hacer Encuesta</div>
          <div className="home-card-desc">
            Completá la encuesta sobre un docente. Buscá al docente, seleccioná la asignatura y respondé las 23 preguntas del formulario.
          </div>
        </Link>

        <Link to="/encuestas/ver" className="home-card">
          <div className="home-card-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="5" stroke="white" strokeWidth="2"/>
              <path d="M2 13C5 7 8.5 4 13 4s8 3 11 9c-3 6-6.5 9-11 9s-8-3-11-9z" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="home-card-title">Ver Encuestas</div>
          <div className="home-card-desc">
            Consultá los resultados y comentarios de las encuestas realizadas sobre un docente, organizados por asignatura y ciclo lectivo.
          </div>
        </Link>
      </div>
    </div>
  )
}
