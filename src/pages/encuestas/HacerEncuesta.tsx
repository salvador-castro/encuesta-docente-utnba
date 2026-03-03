import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DocenteSearch from '../../components/DocenteSearch'

interface Docente { id: string; apellido: string; nombre: string; legajo: string | null }
interface Asignatura { id: string; nombre: string; codigo: string | null }
interface Modalidad { id: number; nombre: string }

const FALLBACK_MODALIDADES: Modalidad[] = [
  { id: 1, nombre: 'Anual' },
  { id: 2, nombre: '1er Cuatrimestre' },
  { id: 3, nombre: '2do Cuatrimestre' },
  { id: 4, nombre: 'Curso de Verano' },
]

const PREGUNTAS = [
  '¿Asiste regularmente a clases?',
  '¿Cumple con las fechas establecidas en el Calendario Académico?',
  '¿Da a conocer la forma de evaluación que se va a aplicar en la asignatura?',
  '¿Da a conocer las fechas de los parciales con anticipación respetando el Calendario Académico?',
  '¿Dedica tiempo suficiente a la ejercitación de los temas desarrollados?',
  '¿Demuestra seguridad en el tratamiento de los temas?',
  '¿Desarrolla todos los contenidos del programa?',
  '¿El docente explica los temas en forma clara y comprensible? (exposiciones organizadas y respuestas precisas)',
  '¿Emplea material didáctico de la asignatura que sea útil y accesible?',
  '¿Es puntual al llegar y al retirarse de las clases?',
  '¿Favorece la participación de los estudiantes?',
  '¿La bibliografía es actualizada y accesible?',
  '¿Las evaluaciones se llevan a cabo según la reglamentación vigente?',
  '¿Lidera el desarrollo de la asignatura tanto en sus aspectos teóricos como prácticos?',
  '¿Logró continuidad en el cursado y estudio de la asignatura? (estudiar regularmente, participación en clase, asistencia, puntualidad)',
  '¿Los temas de los parciales concuerdan con los contenidos desarrollados en clase?',
  '¿Planifica el desarrollo de los temas?',
  '¿Presenta la planificación de su asignatura al inicio del ciclo lectivo y luego la cumple?',
  '¿Relaciona los contenidos con otras asignaturas de la carrera?',
  '¿Satisface dudas o consultas que surgen en clase?',
  '¿Trata correctamente a los estudiantes? (respeto, comunicación adecuada)',
  '¿Tuvo posibilidad de aplicar sus conocimientos previos durante el cursado de esta materia?',
  '¿Utiliza diversos recursos para la enseñanza? (guía de trabajos, pizarra, presentaciones, proyector, videos, software, hardware, aula virtual, otros)',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

type Step = 1 | 2 | 3

export default function HacerEncuesta() {
  const { user, perfil } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [docente, setDocente] = useState<Docente | null>(null)
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [modalidades, setModalidades] = useState<Modalidad[]>([])
  const [asignaturaId, setAsignaturaId] = useState('')
  const [anio, setAnio] = useState(CURRENT_YEAR)
  const [modalidadId, setModalidadId] = useState<number | ''>('')
  const [scores, setScores] = useState<number[]>(Array(23).fill(50))
  const [caracteristicas, setCaracteristicas] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [aspectos, setAspectos] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargar modalidades
    supabase.from('modalidades').select('*').order('id').then(({ data, error }) => {
      if (data && data.length > 0 && !error) setModalidades(data)
      else setModalidades(FALLBACK_MODALIDADES)
    })
  }, [])

  useEffect(() => {
    // Cargar asignaturas filtradas por la carrera del estudiante + comunes (ciencias básicas)
    if (!perfil) return
    if (!perfil.carrera_id) {
      setAsignaturas([])
      return
    }

    const cargarAsignaturas = async () => {
      // Paso 1: IDs asignados a la carrera del estudiante
      const { data: propias } = await supabase
        .from('carreras_asignaturas')
        .select('asignatura_id')
        .eq('carrera_id', perfil.carrera_id)

      // Paso 2: todos los IDs que tienen asignación a ALGUNA carrera
      const { data: todas } = await supabase
        .from('carreras_asignaturas')
        .select('asignatura_id')

      const idsCarrera = (propias ?? []).map((r) => r.asignatura_id)
      const idsAsignados = new Set((todas ?? []).map((r) => r.asignatura_id))

      // Paso 3: buscar las asignaturas de la carrera + las que no están asignadas a nadie (comunes)
      const { data: todasAsignaturas } = await supabase
        .from('asignaturas')
        .select('*')
        .order('nombre')

      if (todasAsignaturas) {
        const filtradas = todasAsignaturas.filter(
          (a) => idsCarrera.includes(a.id) || !idsAsignados.has(a.id)
        )
        setAsignaturas(filtradas)
      }
    }

    cargarAsignaturas()
  }, [perfil])

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores]
    newScores[index] = value
    setScores(newScores)
  }

  const canGoStep2 = !!docente
  const canGoStep3 = !!asignaturaId && modalidadId !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caracteristicas.trim() || !observaciones.trim() || !aspectos.trim()) {
      setError('Por favor completá todos los campos de texto.')
      return
    }
    setSubmitting(true)
    setError('')

    const payload: Record<string, unknown> = {
      estudiante_id: user!.id,
      docente_id: docente!.id,
      asignatura_id: asignaturaId,
      anio,
      modalidad_id: modalidadId,
      caracteristicas_positivas: caracteristicas,
      observaciones,
      aspectos_a_mejorar: aspectos,
    }
    scores.forEach((s, i) => {
      payload[`p${String(i + 1).padStart(2, '0')}`] = s
    })

    const { error: err } = await supabase.from('encuestas').insert(payload)
    if (err) {
      setError('Error al guardar la encuesta: ' + err.message)
    } else {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="page-wrapper">
        <div className="card">
          <div className="card-body success-screen">
            <div className="success-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18l7 7 13-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="success-title">¡Encuesta enviada con éxito!</h2>
            <p className="success-desc">
              Tu evaluación sobre <strong>{docente?.apellido} {docente?.nombre}</strong> fue registrada correctamente.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => {
                setStep(1); setDocente(null); setAsignaturaId(''); setModalidadId('')
                setScores(Array(23).fill(50)); setCaracteristicas(''); setObservaciones(''); setAspectos(''); setSuccess(false)
              }}>
                Nueva Encuesta
              </button>
              <Link to="/encuestas/ver" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, border: '1.5px solid #e0e3ea', color: '#1a1a2e' }}>
                Ver Encuestas
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title"><span>Hacer</span> Encuesta</h1>
        <p className="page-desc">Evaluá a un docente respondiendo las preguntas del formulario.</p>
      </div>

      {/* Step indicator */}
      <div className="steps">
        <div className={`step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
          <div className="step-num">{step > 1 ? '✓' : '1'}</div>
          Buscar Docente
        </div>
        <div className="step-connector" />
        <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
          <div className="step-num">{step > 2 ? '✓' : '2'}</div>
          Datos del Curso
        </div>
        <div className="step-connector" />
        <div className={`step ${step === 3 ? 'active' : ''}`}>
          <div className="step-num">3</div>
          Encuesta
        </div>
      </div>

      {/* Step 1 — Search docente */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" />
                <path d="M10 10l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="card-title">Paso 1 — Buscar Docente</span>
          </div>
          <div className="card-body">
            <DocenteSearch onSelect={setDocente} selectedDocente={docente} />
            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={() => setStep(2)}
                disabled={!canGoStep2}
              >
                Continuar →
              </button>
              {!docente && <span style={{ fontSize: 13, color: '#888' }}>Seleccioná un docente para continuar</span>}
              {docente && <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>✓ {docente.apellido} {docente.nombre}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Course data */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5" />
                <path d="M5 8h6M5 5.5h4M5 10.5h3" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="card-title">Paso 2 — Datos del Curso</span>
          </div>
          <div className="card-body">
            <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>
              Docente seleccionado: <strong>{docente?.apellido} {docente?.nombre}</strong>
            </p>
            <div className="course-form">
              <div className="form-group">
                <label className="form-label" htmlFor="asignatura">Asignatura *</label>
                {!perfil?.carrera_id ? (
                  <p style={{ color: '#e57373', fontSize: 13, marginTop: 6 }}>
                    No tenés una carrera asignada en tu perfil. Por favor completá tu perfil antes de hacer una encuesta.
                  </p>
                ) : asignaturas.length === 0 ? (
                  <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
                    No se encontraron asignaturas para tu carrera.
                  </p>
                ) : (
                  <select
                    id="asignatura"
                    className="form-select"
                    value={asignaturaId}
                    onChange={(e) => setAsignaturaId(e.target.value)}
                    required
                  >
                    <option value="">Seleccioná la asignatura...</option>
                    {asignaturas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}{a.codigo ? ` (${a.codigo})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="anio">Año *</label>
                  <select
                    id="anio"
                    className="form-select"
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="modalidad">Modalidad *</label>
                  <select
                    id="modalidad"
                    className="form-select"
                    value={modalidadId}
                    onChange={(e) => setModalidadId(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  >
                    <option value="">Seleccioná...</option>
                    {modalidades.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Volver</button>
              <button
                className="btn-primary"
                onClick={() => setStep(3)}
                disabled={!canGoStep3}
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Survey form */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 3v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="card-title">Paso 3 — Encuesta</span>
          </div>
          <div className="card-body">
            <p style={{ color: '#555', fontSize: 14, marginBottom: 4 }}>
              Docente: <strong>{docente?.apellido} {docente?.nombre}</strong>
            </p>
            <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>
              {asignaturas.find(a => a.id === asignaturaId)?.nombre} — {anio} — {
                modalidades.find(m => m.id === modalidadId)?.nombre ?? ''
              }
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <p className="survey-section-title">Puntajes (0% — 100%)</p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
                Mové el control deslizante para cada pregunta. Todas las preguntas son obligatorias.
              </p>

              {PREGUNTAS.map((pregunta, i) => (
                <div className="question-item" key={i}>
                  <div className="question-text">{i + 1}. {pregunta}</div>
                  <div className="slider-row">
                    <input
                      type="range"
                      className="slider-input"
                      min={0}
                      max={100}
                      step={10}
                      value={scores[i]}
                      style={{ '--val': `${scores[i]}%` } as React.CSSProperties}
                      onChange={(e) => handleScoreChange(i, Number(e.target.value))}
                    />
                    <div className="slider-value">{scores[i]}%</div>
                  </div>
                </div>
              ))}

              <p className="survey-section-title">Comentarios</p>

              <div className="question-item">
                <div className="question-text">Mencione las características del docente que ayudaron en su aprendizaje *</div>
                <textarea
                  className="textarea-field"
                  value={caracteristicas}
                  onChange={(e) => setCaracteristicas(e.target.value)}
                  placeholder="Escribí tu respuesta aquí..."
                  required
                />
              </div>

              <div className="question-item">
                <div className="question-text">Realice las observaciones y aclaraciones que crea convenientes sobre las puntuaciones asignadas *</div>
                <textarea
                  className="textarea-field"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Escribí tu respuesta aquí..."
                  required
                />
              </div>

              <div className="question-item">
                <div className="question-text">Mencione los aspectos del proceso de enseñanza que deberían mejorarse *</div>
                <textarea
                  className="textarea-field"
                  value={aspectos}
                  onChange={(e) => setAspectos(e.target.value)}
                  placeholder="Escribí tu respuesta aquí..."
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Volver</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Enviando...' : '✓ Enviar Encuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
