import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import DocenteSearch from '../../components/DocenteSearch'

interface Docente { id: string; apellido: string; nombre: string; legajo: string | null }

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

interface EncuestaRow {
  id: string
  anio: number
  modalidad_id: number | null
  modalidades: { nombre: string } | null
  asignaturas: { nombre: string; codigo: string | null } | null
  p01: number; p02: number; p03: number; p04: number; p05: number
  p06: number; p07: number; p08: number; p09: number; p10: number
  p11: number; p12: number; p13: number; p14: number; p15: number
  p16: number; p17: number; p18: number; p19: number; p20: number
  p21: number; p22: number; p23: number
  caracteristicas_positivas: string
  observaciones: string
  aspectos_a_mejorar: string
}

function scoreColor(val: number): string {
  if (val >= 80) return '#22c55e'
  if (val >= 60) return '#f59e0b'
  return '#ef4444'
}



export default function VerEncuestas() {
  const [docente, setDocente] = useState<Docente | null>(null)
  const [encuestas, setEncuestas] = useState<EncuestaRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleSelectDocente = async (d: Docente) => {
    setDocente(d)
    setLoading(true)
    setLoaded(false)

    const { data } = await supabase
      .from('encuestas')
      .select('*, asignaturas(nombre, codigo), modalidades(nombre)')
      .eq('docente_id', d.id)
      .order('anio', { ascending: false })
      .order('modalidad_id')

    if (data) setEncuestas(data as EncuestaRow[])
    setLoading(false)
    setLoaded(true)
  }

  // Per-question averages
  const avgPerQuestion = PREGUNTAS.map((_, i) => {
    const key = `p${String(i + 1).padStart(2, '0')}` as keyof EncuestaRow
    const vals = encuestas.map((e) => e[key] as number)
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  })

  const generalAvg = avgPerQuestion.filter(Boolean).length
    ? avgPerQuestion.reduce((a, b) => a! + b!, 0)! / avgPerQuestion.length
    : null

  // Group comments by año + modalidad + asignatura
  type GroupKey = string
  const groups: Record<GroupKey, { label: string; rows: EncuestaRow[] }> = {}
  encuestas.forEach((e) => {
    const modNombre = e.modalidades?.nombre ?? ''
    const key = `${e.anio}-${e.modalidad_id}-${e.asignaturas?.nombre ?? ''}`
    if (!groups[key]) {
      groups[key] = {
        label: `${e.anio} ${modNombre} — ${e.asignaturas?.nombre ?? ''}${e.asignaturas?.codigo ? ` (${e.asignaturas.codigo})` : ''}`,
        rows: [],
      }
    }
    groups[key].rows.push(e)
  })

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title"><span>Ver</span> Encuestas</h1>
        <p className="page-desc">Consultá los resultados de las encuestas de un docente.</p>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5"/>
              <path d="M10 10l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="card-title">Buscar Docente</span>
        </div>
        <div className="card-body">
          <DocenteSearch onSelect={handleSelectDocente} selectedDocente={docente} />
        </div>
      </div>

      {loading && (
        <div className="loading-screen" style={{ height: 200 }}>
          <div className="spinner" />
        </div>
      )}

      {loaded && !loading && docente && (
        <>
          {/* Docente header */}
          <div className="docente-header">
            <div className="docente-header-name">{docente.apellido} {docente.nombre}</div>
            <div className="docente-header-sub">
              {encuestas.length} encuesta{encuestas.length !== 1 ? 's' : ''} registrada{encuestas.length !== 1 ? 's' : ''}
              {docente.legajo ? ` · Legajo ${docente.legajo}` : ''}
            </div>
            {generalAvg !== null && (
              <div className="general-score">
                <span className="general-score-label">Promedio General:</span>
                <span className="general-score-val" style={{ background: scoreColor(generalAvg) }}>
                  {generalAvg.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {encuestas.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
                No hay encuestas registradas para este docente.
              </div>
            </div>
          ) : (
            <>
              {/* Scores table */}
              <div className="card" style={{ marginBottom: 28 }}>
                <div className="card-header">
                  <div className="card-header-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="10" width="2" height="4" rx="1" fill="white"/>
                      <rect x="7" y="6" width="2" height="8" rx="1" fill="white"/>
                      <rect x="12" y="2" width="2" height="12" rx="1" fill="white"/>
                    </svg>
                  </div>
                  <span className="card-title">Puntajes</span>
                </div>
                <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="score-table">
                    <thead>
                      <tr>
                        <th>Pregunta</th>
                        <th>Promedio</th>
                        <th>Muestra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PREGUNTAS.map((pregunta, i) => {
                        const avg = avgPerQuestion[i]
                        return (
                          <tr key={i}>
                            <td>{pregunta}</td>
                            <td>
                              {avg !== null ? (
                                <span
                                  className="score-badge"
                                  style={{ background: scoreColor(avg!) }}
                                >
                                  {avg!.toFixed(2)}
                                </span>
                              ) : '—'}
                            </td>
                            <td style={{ color: '#888' }}>{encuestas.length}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comments section */}
              <div className="comments-section">
                <p className="comments-title">Comentarios</p>
                {Object.entries(groups).map(([key, group]) => (
                  <div className="comment-group" key={key}>
                    <div className="comment-group-header">{group.label}</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="comments-table">
                        <thead>
                          <tr>
                            <th>Mencione las características del docente que ayudaron en su aprendizaje</th>
                            <th>Realice las observaciones y aclaraciones que crea convenientes sobre las puntuaciones asignadas</th>
                            <th>Mencione los aspectos del proceso de enseñanza que deberían mejorarse</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row) => (
                            <tr key={row.id}>
                              <td>
                                {row.caracteristicas_positivas
                                  ? <span className="comment-text">"{row.caracteristicas_positivas}"</span>
                                  : <span className="comment-empty">Sin comentarios.</span>}
                              </td>
                              <td>
                                {row.observaciones
                                  ? <span className="comment-text">"{row.observaciones}"</span>
                                  : <span className="comment-empty">Sin comentarios.</span>}
                              </td>
                              <td>
                                {row.aspectos_a_mejorar
                                  ? <span className="comment-text-red">"{row.aspectos_a_mejorar}"</span>
                                  : <span className="comment-empty">Sin comentarios.</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
