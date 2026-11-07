import type { ReactNode } from "react";

/** Módulo de pantalla: cabecera (título + descripción + extra a la derecha) y cuerpo. */
export function Modulo({ titulo, descripcion, extra, children, id }: { titulo: string; descripcion?: ReactNode; extra?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="modulo" id={id} aria-label={titulo}>
      <div className="modulo-cab">
        <div>
          <h2>{titulo}</h2>
          {descripcion && <p>{descripcion}</p>}
        </div>
        {extra && <div className="modulo-extra">{extra}</div>}
      </div>
      {children}
    </section>
  );
}
