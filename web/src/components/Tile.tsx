import type { ReactNode } from "react";

/** Tile de resumen: etiqueta chica arriba, valor grande en mono, nota abajo. */
export function Tile({ etiqueta, valor, nota, destacado = false, chico = false, className = "" }:
  { etiqueta: ReactNode; valor: ReactNode; nota?: ReactNode; destacado?: boolean; chico?: boolean; className?: string }) {
  return (
    <div className={`tile${destacado ? " tile-destacado" : ""} ${className}`.trim()}>
      <span className="tile-etiqueta">{etiqueta}</span>
      <span className={`tile-valor${chico ? " chico" : ""}`}>{valor}</span>
      {nota && <span className="tile-nota">{nota}</span>}
    </div>
  );
}
