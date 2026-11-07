import type { ReactNode } from "react";

/** Cabecera de página: título, descripción y la acción principal a la derecha. */
export function Encabezado({ titulo, descripcion, acciones }: { titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="encabezado">
      <div className="encabezado-texto">
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && <div className="encabezado-acciones">{acciones}</div>}
    </header>
  );
}
