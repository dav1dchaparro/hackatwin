// Datos privados de la dueña que NUNCA van a la cadena: a qué email o nombre corresponde cada cuenta del reparto,
// y la preferencia de recordatorio por email. Viven solo en este dispositivo (localStorage).
export type TipoDestino = "persona" | "fondo" | "donacion";
export interface MetaDestino { tipo: TipoDestino; email?: string; nombre?: string }
export interface Recordatorio { activo: boolean; email: string; diasAntes: number }

export const NOMBRE_TIPO: Record<TipoDestino, string> = { persona: "Persona", fondo: "Fondo común", donacion: "Donación" };

const CLAVE_META = "llave.destinos.meta";
const CLAVE_REC = "llave.recordatorio";

export function cargarMeta(): Record<string, MetaDestino> {
  try { const t = localStorage.getItem(CLAVE_META); return t ? (JSON.parse(t) as Record<string, MetaDestino>) : {}; } catch { return {}; }
}
export function guardarMeta(m: Record<string, MetaDestino>) {
  try { localStorage.setItem(CLAVE_META, JSON.stringify(m)); } catch { /* sin storage */ }
}
export function cargarRecordatorio(): Recordatorio | null {
  try { const t = localStorage.getItem(CLAVE_REC); return t ? (JSON.parse(t) as Recordatorio) : null; } catch { return null; }
}
export function guardarRecordatorio(r: Recordatorio) {
  try { localStorage.setItem(CLAVE_REC, JSON.stringify(r)); } catch { /* sin storage */ }
}

/** Nombre para mostrar de una cuenta del reparto: el email o el nombre guardado, o lo que diga el cliente. */
export function nombreDestino(meta: MetaDestino | undefined, alias: string): string {
  if (!meta) return alias;
  if (meta.tipo === "persona") return meta.email || alias;
  return meta.nombre || NOMBRE_TIPO[meta.tipo];
}
