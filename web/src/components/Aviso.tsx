import type { ReactNode } from "react";
import { IcoAlerta, IcoCheck, IcoInfo } from "./Iconos";

type Tono = "ok" | "mal" | "alerta" | "info" | "neutro";
const ICONO: Record<Tono, ReactNode> = {
  ok: <IcoCheck />, mal: <IcoAlerta />, alerta: <IcoAlerta />, info: <IcoInfo />, neutro: <IcoInfo />,
};

/** Aviso con ícono, título y cuerpo. El tono codifica el estado (bien / mal / atención / información). */
export function Aviso({ tono = "neutro", titulo, children, role }: { tono?: Tono; titulo?: ReactNode; children?: ReactNode; role?: "alert" | "status" }) {
  return (
    <div className={`aviso${tono === "neutro" ? "" : ` aviso-${tono}`}`} role={role}>
      <span className="aviso-icono">{ICONO[tono]}</span>
      <div className="aviso-cuerpo">
        {titulo && <strong>{titulo}</strong>}
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
