import type { ReactNode } from "react";

/** Etiqueta chica de contexto (sponsors, red, modo). Para estados usar BadgeKumply o Aviso. */
export function Chip({ children, tono = "neutro", title }: { children: ReactNode; tono?: "neutro" | "ok" | "info" | "alerta" | "mal"; title?: string }) {
  return <span className={`badge${tono === "neutro" ? "" : ` badge-${tono}`}`} title={title}>{children}</span>;
}
