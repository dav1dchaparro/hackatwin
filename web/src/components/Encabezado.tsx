import type { ReactNode } from "react";

/** Cabecera de página: ceja (quién / contexto), título, descripción y la acción principal a la derecha. */
export function Encabezado({ ceja, titulo, descripcion, acciones }: { ceja?: ReactNode; titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="encabezado">
      <div className="encabezado-texto">
        {ceja && <div className="ceja">{ceja}</div>}
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && <div className="encabezado-acciones">{acciones}</div>}
    </header>
  );
}
