import type { Verificacion } from "../lib";

/**
 * Semáforo de identidad KUMPLY. Para personas: verde / azul empresa / rojo sin verificar.
 * Para `rol="agente"`: violeta "Agente verificado ✓" (tier 5 exacto) o rojo "Sin verificar ✗".
 */
export function BadgeKumply({ v, compacto = false, rol = "persona" }: { v?: Verificacion | null; compacto?: boolean; rol?: "persona" | "agente" }) {
  if (!v) return <span className="badge badge-gris" title="Consultando KUMPLY">Verificando…</span>;
  if (rol === "agente") {
    return v.esAgente
      ? <span className="badge badge-agente" title={`KUMPLY: agente verificado, tier ${v.tier} (${v.fuente})`}>{compacto ? "✓" : "Agente verificado ✓"}</span>
      : <span className="badge badge-mal" title={`KUMPLY: no es agente (tier ${v.tier}, ${v.fuente})`}>{compacto ? "✗" : "Sin verificar ✗"}</span>;
  }
  if (v.esPersona) return <span className="badge badge-ok" title={`KUMPLY: persona verificada (${v.fuente})`}>{compacto ? "✓" : "Identidad verificada ✓"}</span>;
  if (v.esEmpresa) return <span className="badge badge-info" title={`KUMPLY: empresa verificada (${v.fuente})`}>{compacto ? "🏢" : "Empresa verificada"}</span>;
  if (v.esAgente) return <span className="badge badge-agente" title={`KUMPLY: agente verificado (${v.fuente})`}>{compacto ? "🤖" : "Agente verificado ✓"}</span>;
  return <span className="badge badge-mal" title={`KUMPLY: sin verificación (${v.fuente})`}>{compacto ? "✗" : "Falta verificar identidad"}</span>;
}
