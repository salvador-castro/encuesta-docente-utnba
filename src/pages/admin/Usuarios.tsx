import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Carrera { id: number; nombre: string }

interface PerfilRow {
  id: string
  nombre: string | null
  apellido: string | null
  padron: string | null
  rol: 'admin' | 'estudiante'
  created_at: string
  carrera_id?: number | null
  email?: string | null
}

// ─── Drawer de edición ──────────────────────────────────────────────────────
interface DrawerProps {
  user: PerfilRow | null
  carreras: Carrera[]
  onClose: () => void
  onSaved: (msg: string) => void
  onDeleted: (msg: string) => void
}

function EditDrawer({ user, carreras, onClose, onSaved, onDeleted }: DrawerProps) {
  const [nombre, setNombre] = useState(user?.nombre ?? '')
  const [apellido, setApellido] = useState(user?.apellido ?? '')
  const [padron, setPadron] = useState(user?.padron ?? '')
  const [carreraId, setCarreraId] = useState<number | ''>(user?.carrera_id ?? '')
  const [rol, setRol] = useState<'admin' | 'estudiante'>(user?.rol ?? 'estudiante')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [localMsg, setLocalMsg] = useState('')

  useEffect(() => {
    if (user) {
      setNombre(user.nombre ?? '')
      setApellido(user.apellido ?? '')
      setPadron(user.padron ?? '')
      setCarreraId(user.carrera_id ?? '')
      setRol(user.rol)
      setLocalMsg('')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        padron: padron.trim(),
        carrera_id: carreraId || null,
        rol,
      })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      setLocalMsg('Error: ' + error.message)
    } else {
      onSaved('Usuario actualizado correctamente.')
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) { setLocalMsg('Este usuario no tiene email.'); return }
    setSending(true)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setSending(false)
    if (error) {
      setLocalMsg('Error enviando mail: ' + error.message)
    } else {
      setLocalMsg('✓ Mail de recuperación enviado a ' + user.email)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm(`¿Eliminar al usuario ${user.nombre ?? user.id}? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error) {
      setLocalMsg('Error: ' + error.message)
    } else {
      onDeleted('Usuario eliminado.')
    }
  }

  const initials = `${(user?.apellido ?? '?')[0] ?? ''}${(user?.nombre ?? '?')[0] ?? ''}`.toUpperCase()
  const carreraActual = carreras.find(c => c.id === user?.carrera_id)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 460,
        background: 'white',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.18)',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d0a0a 100%)',
          padding: '24px 28px',
          color: 'white',
          display: 'flex', alignItems: 'center', gap: 16,
          flexShrink: 0,
        }}>
          <div style={{
            width: 56, height: 56,
            background: '#8B1A1A',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: 'white',
            border: '2px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {user?.apellido && user?.nombre
                ? `${user.apellido}, ${user.nombre}`
                : user?.email ?? 'Usuario'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
              {carreraActual?.nombre ?? 'Sin carrera asignada'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none', color: 'white',
              width: 36, height: 36, borderRadius: 8,
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px', flex: 1 }}>

          {localMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 20,
              fontSize: 13,
              background: localMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
              border: localMsg.startsWith('Error') ? '1px solid #fecaca' : '1px solid #bbf7d0',
              color: localMsg.startsWith('Error') ? '#b91c1c' : '#16a34a',
            }}>
              {localMsg}
            </div>
          )}

          {/* Sección datos personales */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
            Datos personales
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input style={inputStyle} value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
            </div>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Legajo / Padrón</label>
            <input style={inputStyle} value={padron} onChange={e => setPadron(e.target.value)} placeholder="Ej: 123456" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Carrera</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer', background: 'white' }}
              value={carreraId}
              onChange={e => setCarreraId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sin carrera</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Sección rol */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '24px 0 14px' }}>
            Rol y permisos
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {(['estudiante', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRol(r)}
                style={{
                  flex: 1, padding: '10px 0',
                  border: '1.5px solid',
                  borderColor: rol === r ? '#8B1A1A' : '#e0e3ea',
                  borderRadius: 8,
                  background: rol === r ? '#8B1A1A' : 'white',
                  color: rol === r ? 'white' : '#555c70',
                  fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {r === 'admin' ? '★ Admin' : 'Estudiante'}
              </button>
            ))}
          </div>

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '13px', border: 'none',
              background: saving ? '#ccc' : '#8B1A1A',
              color: 'white', fontWeight: 700, fontSize: 15,
              borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginBottom: 12,
            }}
          >
            {saving ? 'Guardando...' : '✓ Guardar cambios'}
          </button>

          {/* Reset contraseña */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '24px 0 14px' }}>
            Seguridad
          </div>

          <div style={{
            background: '#fafbfc',
            border: '1px solid #e0e3ea',
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>
              Recuperación de contraseña
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              Se enviará un mail a <strong>{user?.email ?? '—'}</strong> con un enlace para restablecer su contraseña.
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={sending}
              style={{
                padding: '9px 18px',
                border: '1.5px solid #1a1a2e',
                borderRadius: 7,
                background: 'white',
                color: '#1a1a2e',
                fontWeight: 600, fontSize: 13,
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? 'Enviando...' : '📧 Enviar mail de recuperación'}
            </button>
          </div>

          {/* Zona peligrosa */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '28px 0 14px' }}>
            Zona peligrosa
          </div>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            padding: '16px 18px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c', marginBottom: 4 }}>
              Eliminar usuario
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              Esta acción es permanente y no se puede deshacer.
            </div>
            <button
              onClick={handleDelete}
              style={{
                padding: '9px 18px',
                border: 'none', borderRadius: 7,
                background: '#ef4444',
                color: 'white',
                fontWeight: 600, fontSize: 13,
                cursor: 'pointer',
              }}
            >
              🗑 Eliminar usuario
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#555c70', marginBottom: 5,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid #e0e3ea',
  borderRadius: 7, fontSize: 14,
  fontFamily: 'inherit', color: '#1a1a2e',
  outline: 'none',
  transition: 'border-color 0.15s',
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<PerfilRow[]>([])
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const [isError, setIsError] = useState(false)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<PerfilRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setActionMsg('Error al cargar usuarios: ' + error.message)
        setIsError(true)
      } else {
        setUsuarios((data ?? []) as PerfilRow[])
      }
    } catch (err) {
      console.error(err)
      setActionMsg('Error inesperado al cargar usuarios.')
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    supabase.from('carreras').select('*').order('nombre').then(({ data }) => {
      if (data) setCarreras(data as Carrera[])
    })
  }, [])

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase()
    return (
      u.apellido?.toLowerCase().includes(q) ||
      u.nombre?.toLowerCase().includes(q) ||
      u.padron?.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    )
  })

  const carreraMap = Object.fromEntries(carreras.map(c => [c.id, c.nombre]))

  const handleSaved = (msg: string) => {
    setActionMsg(msg)
    setIsError(false)
    setEditUser(null)
    load()
  }
  const handleDeleted = (msg: string) => {
    setActionMsg(msg)
    setIsError(false)
    setEditUser(null)
    load()
  }

  const getInitials = (u: PerfilRow) =>
    `${(u.apellido ?? '?')[0]}${(u.nombre ?? '?')[0]}`.toUpperCase()

  const rolColors: Record<string, { bg: string; color: string }> = {
    admin: { bg: '#8B1A1A', color: 'white' },
    estudiante: { bg: '#1a1a2e', color: 'white' },
  }

  return (
    <>
      {/* Keyframes via style tag */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .usr-row:hover td { background: #f9f9fb !important; }
        .usr-row td { transition: background 0.12s; }
      `}</style>

      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title"><span>Admin</span> — Usuarios</h1>
          <p className="page-desc">Gestión de usuarios registrados en el sistema.</p>
        </div>

        {actionMsg && (
          <div
            className={`alert ${isError ? 'alert-error' : 'alert-success'}`}
            style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>{actionMsg}</span>
            <button
              onClick={() => setActionMsg('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.6 }}
            >✕</button>
          </div>
        )}

        <div className="card">
          {/* Card header */}
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="card-header-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="6" cy="5" r="2.5" stroke="white" strokeWidth="1.5"/>
                  <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M11 7l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="card-title">Usuarios registrados ({usuarios.length})</span>
            </div>
            <input
              className="search-input"
              style={{ width: '100%', maxWidth: 340 }}
              placeholder="Buscar por nombre, apellido o padrón..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-screen" style={{ height: 140 }}>
                <div className="spinner" />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr>
                      {['Usuario', 'Legajo', 'Carrera', 'Rol', 'Registrado', ''].map((h, i) => (
                        <th key={i} style={{
                          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d0a0a 100%)',
                          color: 'white',
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 600, fontSize: 12,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 40, fontSize: 14 }}>
                          {search ? '🔍 Sin resultados para esta búsqueda.' : 'No hay usuarios registrados.'}
                        </td>
                      </tr>
                    )}
                    {filtered.map((u) => (
                      <tr key={u.id} className="usr-row" style={{ borderBottom: '1px solid #f0f0f5' }}>
                        {/* Avatar + nombre */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 10,
                              background: u.rol === 'admin' ? '#8B1A1A' : '#1a1a2e',
                              color: 'white', fontWeight: 700, fontSize: 13,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {getInitials(u)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                                {u.apellido && u.nombre
                                  ? `${u.apellido}, ${u.nombre}`
                                  : <span style={{ color: '#bbb', fontStyle: 'italic' }}>Sin nombre</span>
                                }
                              </div>
                              <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>
                                {u.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Legajo */}
                        <td style={{ padding: '12px 16px', color: '#555c70', fontFamily: 'monospace', fontSize: 13 }}>
                          {u.padron || <span style={{ color: '#ccc' }}>—</span>}
                        </td>

                        {/* Carrera */}
                        <td style={{ padding: '12px 16px', color: '#555c70', fontSize: 13, maxWidth: 180 }}>
                          {u.carrera_id && carreraMap[u.carrera_id]
                            ? <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {carreraMap[u.carrera_id]}
                              </span>
                            : <span style={{ color: '#ccc' }}>—</span>
                          }
                        </td>

                        {/* Rol */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                            background: rolColors[u.rol]?.bg,
                            color: rolColors[u.rol]?.color,
                            fontSize: 11, fontWeight: 700,
                            letterSpacing: '0.3px',
                            textTransform: 'uppercase',
                          }}>
                            {u.rol === 'admin' ? '★ Admin' : 'Estudiante'}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td style={{ padding: '12px 16px', color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(u.created_at).toLocaleDateString('es-AR')}
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setEditUser(u)}
                            style={{
                              background: '#1a1a2e',
                              color: 'white',
                              border: 'none',
                              borderRadius: 7,
                              padding: '7px 14px',
                              fontSize: 12, fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M8.5 1.5l2 2L3 11H1V9L8.5 1.5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {editUser && (
        <EditDrawer
          user={editUser}
          carreras={carreras}
          onClose={() => setEditUser(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}
