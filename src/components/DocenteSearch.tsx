import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Docente {
  id: string
  apellido: string
  nombre: string
  legajo: string | null
}

interface DocenteSearchProps {
  onSelect: (docente: Docente) => void
  selectedDocente?: Docente | null
}

export default function DocenteSearch({ onSelect, selectedDocente }: DocenteSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Docente[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const q = query.trim()

    // Search by apellido, nombre, or combined (apellido nombre / nombre apellido)
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .or(
        `apellido.ilike.%${q}%,nombre.ilike.%${q}%,` +
        `apellido.ilike.${q.split(' ').join('%')}%`
      )
      .order('apellido', { ascending: true })
      .limit(20)

    if (!error && data) {
      setResults(data)
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="docente-search">
      <div className="search-row">
        <label className="search-label">Buscar docente:</label>
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Nombre, apellido o apellido nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn-primary" onClick={search} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {searched && results.length === 0 && !loading && (
        <p className="search-no-results">No se encontraron docentes con ese criterio.</p>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <h4 className="results-title">Resultados de búsqueda</h4>
          <table className="results-table">
            <thead>
              <tr>
                <th>Docente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((d) => (
                <tr
                  key={d.id}
                  className={selectedDocente?.id === d.id ? 'row-selected' : ''}
                >
                  <td className="docente-name">
                    {d.apellido} {d.nombre}
                  </td>
                  <td>
                    <button
                      className={selectedDocente?.id === d.id ? 'btn-selected' : 'btn-link'}
                      onClick={() => onSelect(d)}
                    >
                      {selectedDocente?.id === d.id ? '✓ Seleccionado' : 'Seleccionar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
