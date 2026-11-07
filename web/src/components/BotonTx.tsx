import { useState } from "react";
import type { ResultadoTx } from "../lib";
import { TxLink } from "./TxLink";

type EstadoBoton = "inactivo" | "firmando" | "enviada" | "confirmada" | "error";

/**
 * Botón que manda una transacción patrocinada: inactivo → firmando → enviada → confirmada / error.
 * El cliente simula antes de mandar: si el contrato rechaza, el error llega en castellano sin gastar nada.
 */
export function BotonTx({ texto, accion, onResultado, deshabilitado = false, variante = "primario", grande = false, nota, className = "" }: {
  texto: string;
  accion: () => Promise<ResultadoTx>;
  onResultado?: (r: ResultadoTx) => void;
  deshabilitado?: boolean;
  variante?: "primario" | "secundario" | "peligro";
  grande?: boolean;
  nota?: string;
  className?: string;
}) {
  const [estado, setEstado] = useState<EstadoBoton>("inactivo");
  const [resultado, setResultado] = useState<ResultadoTx | null>(null);

  async function clic() {
    setEstado("firmando");
    setResultado(null);
    const timer = setTimeout(() => setEstado("enviada"), 700);
    let r: ResultadoTx;
    try {
      r = await accion();
    } catch (e) {
      r = { ok: false, error: { nombre: e instanceof Error ? e.name : "Error", mensaje: e instanceof Error && e.message ? e.message : "No se pudo mandar. Probá de nuevo." } };
    }
    clearTimeout(timer);
    setResultado(r);
    setEstado(r.ok ? "confirmada" : "error");
    onResultado?.(r);
  }

  const ocupado = estado === "firmando" || estado === "enviada";
  const etiqueta = estado === "firmando" ? "Confirmando…" : estado === "enviada" ? "Enviando…" : texto;
  return (
    <div className={`boton-tx ${className}`.trim()}>
      <button type="button" className={`btn btn-${variante}${grande ? " btn-grande" : ""}`} disabled={deshabilitado || ocupado} onClick={() => void clic()}>
        {ocupado && <span className="spinner" aria-hidden />}{etiqueta}
      </button>
      {nota && <div className="boton-nota">{nota}</div>}
      {resultado?.ok && <div className="tx-ok">Listo ✓ <TxLink hash={resultado.hash} url={resultado.url} ms={resultado.ms} /></div>}
      {resultado && !resultado.ok && (
        <div className="tx-error" role="alert">
          <strong>{resultado.error?.mensaje ?? "No se pudo mandar. Probá de nuevo."}</strong>
          {resultado.error?.nombre && <small> {resultado.error.nombre}</small>}
        </div>
      )}
    </div>
  );
}
