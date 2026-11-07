import type { Verificacion } from "../lib";
import { IcoCheck, IcoX } from "./Iconos";

/**
 * Semáforo de identidad KUMPLY. Personas: verde / empresa / rojo sin verificar.
 * `rol="agente"`: "Agente verificado" (tier 5 exacto) o "Sin verificar".
 */
export function BadgeKumply({ v, compacto = false, rol = "persona" }: { v?: Verificacion | null; compacto?: boolean; rol?: "persona" | "agente" }) {
  if (!v) return <span className="badge badge-gris">Verificando…</span>;
  const detalle = `KUMPLY · tier ${v.tier} · ${v.fuente}`;
  if (rol === "agente") {
    return v.esAgente
      ? <span className="badge badge-agente" title={detalle}><IcoCheck tam={13} />{!compacto && "Agente verificado"}</span>
      : <span className="badge badge-mal" title={detalle}><IcoX tam={13} />{!compacto && "Sin verificar"}</span>;
  }
  if (v.esPersona) return <span className="badge badge-ok" title={detalle}><IcoCheck tam={13} />{!compacto && "Identidad verificada"}</span>;
  if (v.esEmpresa) return <span className="badge badge-info" title={detalle}>{compacto ? "E" : "Empresa verificada"}</span>;
  if (v.esAgente) return <span className="badge badge-agente" title={detalle}><IcoCheck tam={13} />{!compacto && "Agente verificado"}</span>;
  return <span className="badge badge-mal" title={detalle}><IcoX tam={13} />{!compacto && "Sin verificar"}</span>;
}
