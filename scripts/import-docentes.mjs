/**
 * Script de importación de docentes desde Excel (.xlsx) a Supabase
 * 
 * Uso:
 *   node scripts/import-docentes.mjs /ruta/al/archivo.xlsx
 * 
 * Columnas esperadas en el Excel: id, apellidoDocente, nombreDocente
 */

import { readFileSync } from 'fs'
import { read, utils } from 'xlsx'
import { createClient } from '@supabase/supabase-js'

// ── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://jnorbtapqfgkjnkyusmf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_0hx0Fk-Y0w6HzI8t1Jrn6w_eSGstWX1'
const BATCH_SIZE = 100   // Inserta de a 100 filas por vez
// ────────────────────────────────────────────────────────────────────

const xlsxPath = process.argv[2]
if (!xlsxPath) {
  console.error('❌ Falta la ruta al archivo .xlsx')
  console.error('   Uso: node scripts/import-docentes.mjs /ruta/al/docentes.xlsx')
  process.exit(1)
}

console.log(`📂 Leyendo archivo: ${xlsxPath}`)
const workbook = read(readFileSync(xlsxPath))
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = utils.sheet_to_json(sheet)

console.log(`📊 Filas encontradas: ${rows.length}`)
if (rows.length === 0) {
  console.error('❌ El archivo está vacío o no tiene el formato correcto.')
  process.exit(1)
}

// Verificar columnas
const sample = rows[0]
const hasColumns = 'apellidoDocente' in sample && 'nombreDocente' in sample
if (!hasColumns) {
  console.error('❌ No se encontraron las columnas esperadas.')
  console.error('   Columnas encontradas:', Object.keys(sample).join(', '))
  console.error('   Columnas esperadas: apellidoDocente, nombreDocente')
  process.exit(1)
}

// Transformar filas
const docentes = rows.map(row => ({
  apellido: String(row.apellidoDocente ?? '').trim().toUpperCase(),
  nombre:   String(row.nombreDocente   ?? '').trim().toUpperCase(),
})).filter(d => d.apellido && d.nombre) // Filtrar filas vacías

console.log(`✅ ${docentes.length} docentes válidos para importar`)

// Conectar a Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Insertar en lotes
let imported = 0
let errors = 0

for (let i = 0; i < docentes.length; i += BATCH_SIZE) {
  const batch = docentes.slice(i, i + BATCH_SIZE)
  const { error } = await supabase
    .from('docentes')
    .upsert(batch, { onConflict: 'apellido,nombre', ignoreDuplicates: true })

  if (error) {
    console.error(`❌ Error en lote ${i}–${i + batch.length}:`, error.message)
    errors += batch.length
  } else {
    imported += batch.length
    process.stdout.write(`\r⏳ Importando... ${imported}/${docentes.length}`)
  }
}

console.log(`\n\n🎉 Importación completada:`)
console.log(`   ✅ Importados: ${imported}`)
if (errors > 0) console.log(`   ❌ Con errores: ${errors}`)
