import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Perfil {
  id: string
  nombre: string | null
  apellido: string | null
  padron: string | null
  carrera_id: number | null
  rol: 'admin' | 'estudiante'
}

interface AuthContextType {
  session: Session | null
  user: User | null
  perfil: Perfil | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshPerfil: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  perfil: null,
  isAdmin: false,
  loading: true,
  signOut: async () => { },
  refreshPerfil: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPerfil = async (userId: string) => {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setPerfil(data as Perfil)
  }

  const refreshPerfil = async () => {
    if (session?.user) await loadPerfil(session.user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) await loadPerfil(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        // Fire and forget — no await para evitar deadlock con el auth state machine de Supabase
        loadPerfil(session.user.id)
      } else {
        setPerfil(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      perfil,
      isAdmin: perfil?.rol === 'admin',
      loading,
      signOut,
      refreshPerfil,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
