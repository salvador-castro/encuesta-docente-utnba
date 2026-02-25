import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
  }
})


export type Database = {
  public: {
    Tables: {
      docentes: {
        Row: {
          id: string
          apellido: string
          nombre: string
          legajo: string | null
        }
      }
      asignaturas: {
        Row: {
          id: string
          nombre: string
          codigo: string | null
        }
      }
      encuestas: {
        Row: {
          id: string
          estudiante_id: string
          docente_id: string
          asignatura_id: string
          anio: number
          modalidad: string
          created_at: string
          p01: number; p02: number; p03: number; p04: number; p05: number
          p06: number; p07: number; p08: number; p09: number; p10: number
          p11: number; p12: number; p13: number; p14: number; p15: number
          p16: number; p17: number; p18: number; p19: number; p20: number
          p21: number; p22: number; p23: number
          caracteristicas_positivas: string
          observaciones: string
          aspectos_a_mejorar: string
        }
      }
    }
  }
}
