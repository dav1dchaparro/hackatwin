/** Contrato común de los canales de aviso (consola, Telegram, mail). */
import type { Address } from "viem";
import type { Destinatario } from "../tipos.js";

export interface Mensaje {
  a: Destinatario;
  asunto: string;
  texto: string;
  /** Herederos on-chain a los que va el aviso (ver `AccionAviso.cuentas`). Sin lista, a todos los configurados. */
  cuentas?: readonly Address[];
}

export interface Canal {
  readonly nombre: string;
  /** Si el canal tiene a quién mandarle este destinatario (por ejemplo, Telegram solo tiene el chat del dueño). */
  aplica(a: Destinatario): boolean;
  /** Tira un Error con mensaje en castellano si el envío falla. */
  enviar(mensaje: Mensaje): Promise<void>;
}

/** Timeout de las llamadas HTTP de los canales. */
export const TIMEOUT_CANAL_MS = 10_000;

/** Error de envío. `parcial` = a algún destinatario sí le llegó, así que no conviene reintentar. */
export class ErrorEnvio extends Error {
  constructor(
    mensaje: string,
    readonly parcial = false,
  ) {
    super(mensaje);
    this.name = "ErrorEnvio";
  }
}
