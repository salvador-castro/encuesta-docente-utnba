import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface Carrera { id: number; nombre: string }

export default function Perfil() {
  const { user, perfil, refreshPerfil } = useAuth()
  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [apellido, setApellido] = useState(perfil?.apellido ?? '')
  const [padron, setPadron] = useState(perfil?.padron ?? '')
  const [carreraId, setCarreraId] = useState<number | ''>(
    (perfil as unknown as { carrera_id?: number })?.carrera_id ?? ''
  )
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('carreras').select('*').order('nombre').then(({ data }) => {
      if (data) setCarreras(data as Carrera[])
    })
  }, [])

  // Sync state when perfil loads
  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre ?? '')
      setApellido(perfil.apellido ?? '')
      setPadron(perfil.padron ?? '')
      setCarreraId((perfil as unknown as { carrera_id?: number })?.carrera_id ?? '')
    }
  }, [perfil])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    const { error: err } = await supabase
      .from('perfiles')
      .update({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        padron: padron.trim(),
        carrera_id: carreraId || null,
      })
      .eq('id', user!.id)

    if (err) {
      setError('Error al guardar: ' + err.message)
    } else {
      await refreshPerfil()
      setSuccess(true)
    }
    setSaving(false)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title"><span>Mi</span> Perfil</h1>
        <p className="page-desc">Editá tus datos personales.</p>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="white" strokeWidth="1.5"/>
                <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="card-title">Datos personales</span>
          </div>
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">¡Perfil actualizado correctamente!</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="p-apellido">Apellido</label>
                <input
                  id="p-apellido"
                  className="form-input"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p-nombre">Nombre</label>
                <input
                  id="p-nombre"
                  className="form-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p-padron">Legajo</label>
                <input
                  id="p-padron"
                  className="form-input"
                  value={padron}
                  onChange={(e) => setPadron(e.target.value)}
                  placeholder="Ej: 123456"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p-carrera">Carrera</label>
                <select
                  id="p-carrera"
                  className="form-select"
                  value={carreraId}
                  onChange={(e) => setCarreraId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Seleccioná tu carrera...</option>
                  {carreras.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : '✓ Guardar cambios'}
              </button>
            </form>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 4 }}>Rol en el sistema</div>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 6,
                background: perfil?.rol === 'admin' ? '#8B1A1A' : '#1a1a2e',
                color: 'white', fontSize: 13, fontWeight: 700
              }}>
                {perfil?.rol === 'admin' ? '★ Administrador' : 'Estudiante'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
