/**
 * Punto de entrada de `web/src/lib/` (P2). Las pantallas (P3) importan de acá y solo conocen `LlaveCliente`.
 *
 *   import { cliente, config, aliasDe } from "../lib";
 *
 * `VITE_MODO=fuji` → cliente real (cliente-fuji.ts). Si no, el mock de P3 (web/src/mock/cliente-mock.ts).
 * Si el mock no existe o todavía no está listo, se usa el cliente Fuji igual (con aviso en consola) para que la web arranque.
 */
import { crearClienteFuji } from "./cliente-fuji";
import { config } from "./config";
import type { LlaveCliente } from "./tipos";

export * from "./tipos";
export {
  config,
  chain,
  deployments,
  direccionLlave,
  direccionPesos,
  direccionAgente,
  urlTx,
  urlCuenta,
  aliasDe,
  acortar,
  esDireccion,
} from "./config";
export { sesion, onSesion, entrar, salir, reconectar, hayApiKey, saldoAvax, enviar } from "./gasless";
export type { Llamada, Envio } from "./gasless";
export { verificar, fuenteKumply, limpiarCacheKumply, FIXTURES_KUMPLY } from "./kumply";
export {
  interpretarError,
  mensajeDe,
  mmss,
  pesos,
  MENSAJE_GENERICO,
  MENSAJE_SOLO_DUENA,
  MENSAJE_SIN_SESION,
} from "./errores";
export type { ErrorLegible, ContextoError } from "./errores";
export { crearClienteFuji } from "./cliente-fuji";
export type { ExtrasFuji } from "./cliente-fuji";
export { clientePublico } from "./rpc";
export { llaveAbi, pesosAbi, kumplyStoreAbi, ABI_GENERADO } from "./abi-llave";

export const MODO: "mock" | "fuji" = config.modo;

const mocks = import.meta.glob("../mock/cliente-mock.ts", { eager: true }) as Record<
  string,
  { crearClienteMock?: () => LlaveCliente }
>;
const crearClienteMock = Object.values(mocks)[0]?.crearClienteMock;

function crear(): LlaveCliente {
  if (config.modo === "fuji") return crearClienteFuji();
  if (!crearClienteMock) {
    console.warn("[lib] VITE_MODO=mock pero no existe web/src/mock/cliente-mock.ts (P3): se usa el cliente Fuji.");
    return crearClienteFuji();
  }
  try {
    return crearClienteMock();
  } catch (e) {
    console.warn("[lib] el mock de P3 todavía no está listo; se usa el cliente Fuji:", e);
    return crearClienteFuji();
  }
}

export const cliente: LlaveCliente = crear();
