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
};

/** Las 5 etapas de la Llave en orden real (es una secuencia): la actual resaltada con su cuenta regresiva. */
export function LineaDeFases({ estado, leidoEn, grande = false }: { estado: EstadoLlave; leidoEn: number; grande?: boolean }) {
  const idx = Math.max(0, FASES.indexOf(estado.fase));
  const detalle = (f: Fase) => {
    switch (f) {
      case "Activa": return <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={leidoEn} prefijo="Vence en " />;
      case "Vencida": return <span>El agente puede avisar</span>;
      case "EnGracia": return <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={leidoEn} prefijo="Se libera en " />;
      case "Ejecutable": return <span>El agente está liberando</span>;
      default: return <span>Repartido: <Monto valor={estado.totalLiberado} decimales={estado.decimales} /></span>;
    }
  };
  return (
    <ol className={`etapas${grande ? " etapas-xl" : ""}`} aria-label="Etapas de la Llave">
      {FASES.map((f, i) => (
        <li key={f} className={`etapa ${i < idx ? "pasada" : i === idx ? "actual" : "futura"}`} aria-current={i === idx ? "step" : undefined}>
          <span className="etapa-num"><i>{i < idx ? "✓" : i + 1}</i>{i === idx ? "Ahora" : i < idx ? "Hecho" : "Después"}</span>
          <span className="etapa-nombre">{NOMBRE_FASE[f]}</span>
          {i === idx && <span className="etapa-detalle">{detalle(f)}</span>}
        </li>
      ))}
    </ol>
  );
}
