import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))

    // Error devuelto por Supabase en el hash
    const urlError = params.get('error')
    if (urlError) {
      setError('El link expiró o ya fue utilizado. Solicitá uno nuevo.')
      setReady(true)
      return
    }

    // Supabase (con flowType: 'implicit') procesa el hash automáticamente y dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Timeout: si en 8 segundos no llega el evento, mostrar error
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true)
        } else {
          setError('El link expiró o ya fue utilizado. Solicitá uno nuevo.')
          setReady(true)
        }
      })
    }, 8000)

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      // Verificar sesión activa antes de actualizar
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('La sesión de recuperación expiró. Solicitá un nuevo link.')
        return
      }

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Sin respuesta del servidor. Intentá nuevamente.')), 12000)
      )
      const { error: updateError } = await Promise.race([
        supabase.auth.updateUser({ password }),
        timeout
      ]) as Awaited<ReturnType<typeof supabase.auth.updateUser>>

      if (updateError) {
        setError('Error: ' + updateError.message)
      } else {
        setSuccess(true)
        await supabase.auth.signOut()
        setTimeout(() => navigate('/login'), 2500)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }



  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo-area">
            <div className="auth-logo">UTN</div>
            <h1 className="auth-title">Recuperar contraseña</h1>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Procesando el link de recuperación...
          </p>
        </div>
      </div>
    )
  }

  // Si hay error previo (link expirado) antes de mostrar el formulario
  const isLinkError = error && password === '' && confirm === '' && error.includes('expiró')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-area">
          <div className="auth-logo">UTN</div>
          <h1 className="auth-title">Nueva contraseña</h1>
          <p className="auth-subtitle">Facultad Regional Buenos Aires</p>
        </div>

        {success ? (
          <div className="alert alert-success">
            ✅ ¡Contraseña actualizada! Redirigiendo al inicio de sesión...
          </div>
        ) : isLinkError ? (
          <>
            <div className="alert alert-error">{error}</div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="auth-link">Volver al inicio de sesión</Link>
            </div>
          </>
        ) : (
          <>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
                <input
                  id="confirm"
                  type="password"
                  className="form-input"
                  placeholder="Repetí la contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary btn-primary-full" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
