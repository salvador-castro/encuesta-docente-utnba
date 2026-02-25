import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Modalidad { id: number; nombre: string }

const PREGUNTAS_SHORT = [
  'Asistencia regular', 'Cumple calendario', 'Da a conocer evaluación',
  'Fechas parciales anticipadas', 'Tiempo ejercitación', 'Seguridad en temas',
  'Desarrolla contenidos', 'Explica claramente', 'Material didáctico útil',
  'Puntualidad', 'Favorece participación', 'Bibliografía actualizada',
  'Evaluaciones reglamentarias', 'Lidera teoría y práctica', 'Continuidad cursado',
  'Temas parciales vs clase', 'Planifica temas', 'Presenta planificación',
  'Relaciona asignaturas', 'Satisface consultas', 'Trato correcto estudiantes',
  'Aplica conocimientos previos', 'Recursos didácticos variados',
]

interface EncuestaRow {
  id: string
  anio: number
  modalidad_id: number | null
  modalidades: { nombre: string } | null
  created_at: string
  docentes: { apellido: string; nombre: string } | null
  asignaturas: { nombre: string } | null
  perfiles: { apellido: string | null; nombre: string | null; padron: string | null } | null
  p01: number; p02: number; p03: number; p04: number; p05: number
  p06: number; p07: number; p08: number; p09: number; p10: number
  p11: number; p12: number; p13: number; p14: number; p15: number
  p16: number; p17: number; p18: number; p19: number; p20: number
  p21: number; p22: number; p23: number
  caracteristicas_positivas: string
  observaciones: string
  aspectos_a_mejorar: string
}

function promedio(e: EncuestaRow): number {
  const keys = ['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10',
    'p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p21','p22','p23'] as const
  const total = keys.reduce((acc, k) => acc + (e[k as keyof EncuestaRow] as number), 0)
  return Math.round(total / 23)
}

function scoreColor(val: number): string {
  if (val >= 80) return '#22c55e'
  if (val >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function AdminEncuestas() {
  const [encuestas, setEncuestas] = useState<EncuestaRow[]>([])
  const [modalidades, setModalidades] = useState<Modalidad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAnio, setFilterAnio] = useState('')
  const [filterModalidad, setFilterModalidad] = useState('')
  const [selected, setSelected] = useState<EncuestaRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('encuestas')
      .select('*, docentes(apellido, nombre), asignaturas(nombre), perfiles(apellido, nombre, padron), modalidades(nombre)')
      .order('created_at', { ascending: false })
    if (data) setEncuestas(data as EncuestaRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('modalidades').select('*').order('id').then(({ data }) => {
      if (data) setModalidades(data)
    })
  }, [load])

  const filtered = encuestas.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.docentes?.apellido.toLowerCase().includes(q) ||
      e.docentes?.nombre.toLowerCase().includes(q) ||
      e.asignaturas?.nombre.toLowerCase().includes(q) ||
      e.perfiles?.apellido?.toLowerCase().includes(q) ||
      e.perfiles?.padron?.toLowerCase().includes(q)
    const matchAnio = !filterAnio || String(e.anio) === filterAnio
    const matchMod = !filterModalidad || String(e.modalidad_id) === filterModalidad
    return matchSearch && matchAnio && matchMod
  })

  const anios = [...new Set(encuestas.map(e => e.anio))].sort((a, b) => b - a)

  const getModalidadNombre = (e: EncuestaRow) => e.modalidades?.nombre ?? '—'

  if (selected) {
    const avg = promedio(selected)
    const keys = ['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10',
      'p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p21','p22','p23']
    return (
      <div className="page-wrapper">
        <div className="page-header">
          <button className="btn-secondary" onClick={() => setSelected(null)}>← Volver</button>
          <h1 className="page-title" style={{ marginTop: 16 }}>
            Detalle de Encuesta
          </h1>
        </div>
        <div className="docente-header">
          <div className="docente-header-name">
            {selected.docentes?.apellido} {selected.docentes?.nombre}
          </div>
          <div className="docente-header-sub">
            {selected.asignaturas?.nombre} · {selected.anio} · {getModalidadNombre(selected)}
          </div>
          <div className="general-score">
            <span className="general-score-label">Promedio:</span>
            <span className="general-score-val" style={{ background: scoreColor(avg) }}>{avg}%</span>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">Puntajes</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="score-table">
              <thead><tr><th>Pregunta</th><th>Puntaje</th></tr></thead>
              <tbody>
                {keys.map((k, i) => (
                  <tr key={k}>
                    <td>{PREGUNTAS_SHORT[i]}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-badge" style={{ background: scoreColor(selected[k as keyof EncuestaRow] as number) }}>
                        {selected[k as keyof EncuestaRow] as number}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Comentarios</span></div>
          <div className="card-body">
            <p style={{ fontWeight: 700, fontSize: 13, color: '#888', marginBottom: 4 }}>Características positivas</p>
            <p className="comment-text" style={{ marginBottom: 16 }}>"{selected.caracteristicas_positivas || '—'}"</p>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#888', marginBottom: 4 }}>Observaciones</p>
            <p className="comment-text" style={{ marginBottom: 16 }}>"{selected.observaciones || '—'}"</p>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#888', marginBottom: 4 }}>Aspectos a mejorar</p>
            <p className="comment-text-red">"{selected.aspectos_a_mejorar || '—'}"</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title"><span>Admin</span> — Encuestas</h1>
        <p className="page-desc">Vista general de todas las encuestas registradas.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="10" width="2" height="4" rx="1" fill="white"/>
              <rect x="7" y="6" width="2" height="8" rx="1" fill="white"/>
              <rect x="12" y="2" width="2" height="12" rx="1" fill="white"/>
            </svg>
          </div>
          <span className="card-title">Todas las encuestas ({encuestas.length})</span>
        </div>
        <div className="card-body">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <input
              className="search-input"
              style={{ flex: 1, minWidth: 200 }}
              placeholder="Buscar docente, asignatura o estudiante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="form-select" style={{ width: 120 }} value={filterAnio} onChange={e => setFilterAnio(e.target.value)}>
              <option value="">Todos los años</option>
              {anios.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="form-select" style={{ width: 200 }} value={filterModalidad} onChange={e => setFilterModalidad(e.target.value)}>
              <option value="">Todas las modalidades</option>
              {modalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ height: 120 }}><div className="spinner" /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Docente</th>
                    <th>Asignatura</th>
                    <th>Año</th>
                    <th>Modalidad</th>
                    <th>Estudiante</th>
                    <th>Promedio</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 24 }}>
                      No hay encuestas.
                    </td></tr>
                  )}
                  {filtered.map((e) => {
                    const avg = promedio(e)
                    return (
                      <tr key={e.id}>
                        <td className="docente-name">{e.docentes?.apellido} {e.docentes?.nombre}</td>
                        <td style={{ fontSize: 13 }}>{e.asignaturas?.nombre}</td>
                        <td>{e.anio}</td>
                        <td style={{ fontSize: 13 }}>{getModalidadNombre(e)}</td>
                        <td style={{ fontSize: 13, color: '#888' }}>
                          {e.perfiles?.apellido || ''} {e.perfiles?.nombre || ''}
                          {e.perfiles?.padron ? ` (${e.perfiles.padron})` : ''}
                        </td>
                        <td>
                          <span className="score-badge" style={{ background: scoreColor(avg) }}>{avg}%</span>
                        </td>
                        <td style={{ fontSize: 13, color: '#888' }}>
                          {new Date(e.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td>
                          <button className="btn-link" onClick={() => setSelected(e)}>Ver</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
