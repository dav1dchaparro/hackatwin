/**
 * Logger mínimo con hora local y nivel. Nunca recibe secretos: la clave del agente y los tokens de los canales no
 * pasan por acá.
 */
export type Nivel = "info" | "aviso" | "error";

export interface Log {
  info(mensaje: string): void;
  aviso(mensaje: string): void;
  error(mensaje: string): void;
}

function hora(): string {
  return new Date().toLocaleTimeString("es-AR", { hour12: false });
}

export const logConsola: Log = {
  info: (m) => console.log(`[${hora()}] ${m}`),
  aviso: (m) => console.warn(`[${hora()}] ⚠ ${m}`),
  error: (m) => console.error(`[${hora()}] ✖ ${m}`),
};

/** Logger que no imprime nada (tests). */
export const logMudo: Log = { info: () => {}, aviso: () => {}, error: () => {} };

/** Mensaje corto de un error desconocido, sin stack trace. */
export function mensajeDe(error: unknown): string {
  if (error instanceof Error) {
    const corto = (error as Error & { shortMessage?: unknown }).shortMessage;
    return typeof corto === "string" && corto !== "" ? corto : (error.message.split("\n")[0] ?? error.name);
  }
  return String(error);
}
