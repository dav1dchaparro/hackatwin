import type { ReactNode } from "react";

export function Chip({ children, tono = "neutro", title }: { children: ReactNode; tono?: "neutro" | "ok" | "info" | "alerta"; title?: string }) {
  return <span className={`chip chip-${tono}`} title={title}>{children}</span>;
}
