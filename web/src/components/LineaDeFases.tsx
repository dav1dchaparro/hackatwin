import { FASES } from "../lib";
import type { EstadoLlave, Fase } from "../lib";
import { CuentaRegresiva } from "./CuentaRegresiva";
import { Monto } from "./Monto";

export const NOMBRE_FASE: Record<Fase, string> = {
  Activa: "Todo en orden",
  Vencida: "Sin señales",
  EnGracia: "Aviso y espera",
  Ejecutable: "Lista para liberar",
  Liberada: "Herencia enviada",
  Repartiendo: "Herencia enviada",
};

export function LineaDeFases({ estado, leidoEn, grande = false }: { estado: EstadoLlave; leidoEn: number; grande?: boolean }) {
  const idx = Math.max(0, FASES.indexOf(estado.fase === "Repartiendo" ? "Liberada" : estado.fase));
  const detalle = (f: Fase) => {
    switch (f) {
      case "Activa": return <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={leidoEn} prefijo="Vence en " />;
      case "Vencida": return <span>El agente puede avisar</span>;
      case "EnGracia": return <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={leidoEn} prefijo="Se libera en " />;
      case "Ejecutable": return <span>El agente libera la herencia</span>;
      default: return <span>Se repartió <Monto valor={estado.totalLiberado ?? estado.foto} decimales={estado.decimales} /></span>;
    }
  };
  return (
    <ol className={`fases${grande ? " fases-grande" : ""}`} aria-label="Etapas de la Llave">
      {FASES.map((f, i) => (
        <li key={f} className={i < idx ? "fase-pasada" : i === idx ? "fase-actual" : "fase-futura"}>
          <span className="fase-num">{i + 1}</span>
          <span className="fase-nombre">{NOMBRE_FASE[f]}</span>
          {i === idx && <span className="fase-detalle">{detalle(f)}</span>}
        </li>
      ))}
    </ol>
  );
}
