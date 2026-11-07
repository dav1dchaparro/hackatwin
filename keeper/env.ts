import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Carga keeper/.env si existe. Usa process.loadEnvFile (Node ≥ 20.12) o un parser mínimo propio. */
export function cargarEnv(): void {
  const ruta = join(dirname(fileURLToPath(import.meta.url)), '.env')
  if (!existsSync(ruta)) return
  if (typeof process.loadEnvFile === 'function') return process.loadEnvFile(ruta)
  // Parser mínimo: CLAVE=valor por línea, comentarios con #, no pisa variables ya definidas.
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*?)\s*$/.exec(linea)
    if (!m || linea.trimStart().startsWith('#')) continue
    process.env[m[1]] ??= m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

/** Lee una variable de entorno (recortada); si está vacía devuelve el valor por defecto. */
export const env = (nombre: string, porDefecto = ''): string => process.env[nombre]?.trim() || porDefecto

/** "a=1,b=2" → Map { a → "1", b → "2" }. Ignora pares incompletos. */
export function parsearPares(texto: string): Map<string, string> {
  const pares = new Map<string, string>()
  for (const par of texto.split(',')) {
    const [clave, valor] = par.split('=').map((s) => s.trim())
    if (clave && valor) pares.set(clave, valor)
  }
  return pares
}
