/**
 * Errores del contrato → texto en castellano (PLAN_CONSTRUCCION_LLAVE.md §2.7 + contracts/README.md §18).
 * P3 muestra `mensaje` tal cual y `nombre` en chico. Nunca llega una tx revertida al bundler: se simula antes.
 */
import { BaseError, ContractFunctionRevertedError, decodeErrorResult, formatUnits, type Hex } from "viem";
import { llaveAbi, pesosAbi } from "./abi-llave";

export interface ErrorLegible {
  nombre: string;
  mensaje: string;
  args?: readonly unknown[];
  /** dato crudo (selector/data o mensaje original), para la consola y el "nombre crudo en chico" */
  crudo?: string;
}

/** Para calcular "faltan mm:ss" con el reloj de la cadena y mostrar montos en pesos. */
export interface ContextoError {
  /** block.timestamp de la última lectura */
  ahora?: number;
  decimales?: number;
  simbolo?: string;
}

export const MENSAJE_GENERICO = "No se pudo mandar. Probá de nuevo.";
/** P2-8: la web solo manda operaciones de la dueña (las del agente salen de su propia cuenta). */
export const MENSAJE_SOLO_DUENA = "Esta cuenta no es la dueña de esta Llave: solo ella puede operar desde acá.";
export const MENSAJE_SIN_SESION = "Entrá con tu email para operar.";

export function mmss(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function faltan(hasta: unknown, ctx: ContextoError): string {
  const ahora = ctx.ahora ?? Math.floor(Date.now() / 1000);
  return mmss(Number(hasta) - ahora);
}
export function pesos(monto: unknown, ctx: ContextoError = {}): string {
  try {
    const n = Number(formatUnits(BigInt(monto as bigint), ctx.decimales ?? 18));
    return `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  } catch {
    return String(monto);
  }
}

type Traductor = (args: readonly unknown[], ctx: ContextoError) => string;

export const MENSAJES: Record<string, Traductor> = {
  // KumplyGated
  NotAgent: ([, tier]) => {
    const t = Number(tier);
    if (t === 0) return "Este bot no es un agente verificado por KUMPLY.";
    if (t === 4) return "Es una empresa, no un agente.";
    return "Es una persona, no un agente verificado por KUMPLY.";
  },
  NotPerson: ([, tier]) =>
    Number(tier) === 4 || Number(tier) === 5
      ? "Esta cuenta es una empresa o un agente, no una persona."
      : "Esta cuenta no tiene identidad verificada en KUMPLY.",
  NotBusiness: () => "Tiene que ser una empresa verificada en KUMPLY.",
  InvalidPersonLevel: () => "Nivel de verificación inválido.",
  KumplyStoreInvalid: () => "El registro de identidades de KUMPLY no está disponible.",
  // dueño
  NoEsDueno: () => "Esta cuenta no es la dueña de esta Llave.",
  MontoInvalido: () => "El monto tiene que ser mayor a cero.",
  SaldoInsuficiente: ([, disponible], ctx) => `No alcanza el saldo. Disponible: ${pesos(disponible, ctx)}.`,
  DireccionInvalida: () => "Esa dirección no sirve (vacía, repetida o es la dueña).",
  PorcentajesInvalidos: ([suma]) => `Los porcentajes tienen que sumar 100% (suman ${Number(suma) / 100}%).`,
  CantidadHerederosInvalida: () => "Tiene que haber entre 1 y 5 herederos.",
  PlazoInvalido: () => "El plazo es más corto que el mínimo permitido.",
  ComisionInvalida: () => "La comisión configurada es inválida.",
  // reloj y herencia
  SigueVivo: ([venceEn], ctx) => `Todavía no venció el plazo: faltan ${faltan(venceEn, ctx)}.`,
  GraciaEnCurso: ([terminaEn], ctx) =>
    `Período de gracia: la dueña todavía puede cancelar. Faltan ${faltan(terminaEn, ctx)}.`,
  ReclamoYaIniciado: () => "Ya hay un reclamo en curso.",
  SinReclamo: () => "Primero hay que iniciar el reclamo.",
  YaLiberada: () => "La herencia ya se envió.",
  SinSaldo: () => "La Llave no tiene saldo para repartir.",
  ReentrancyGuardReentrantCall: () => "La Llave está ocupada con otra operación. Probá de nuevo.",
  // MockPesos
  ERC20InsufficientBalance: ([, saldo], ctx) => `No alcanzan los pesos de prueba. Tenés ${pesos(saldo, ctx)}.`,
  ERC20InsufficientAllowance: () => "Falta autorizar a la Llave a mover tus pesos de prueba.",
};

export function mensajeDe(nombre: string, args: readonly unknown[] = [], ctx: ContextoError = {}): string {
  const f = MENSAJES[nombre];
  return f ? f(args, ctx) : MENSAJE_GENERICO;
}

const ABI_ERRORES = [...llaveAbi, ...pesosAbi] as const;

function decodificar(data: Hex, ctx: ContextoError): ErrorLegible | null {
  try {
    const d = decodeErrorResult({ abi: ABI_ERRORES, data });
    return { nombre: d.errorName, mensaje: mensajeDe(d.errorName, d.args ?? [], ctx), args: d.args, crudo: data };
  } catch {
    return null;
  }
}

/** Convierte cualquier error (revert de viem, widget de 0xGasless, bundler, red) a {nombre, mensaje} en castellano. */
export function interpretarError(e: unknown, ctx: ContextoError = {}): ErrorLegible {
  if (e instanceof BaseError) {
    const rev = e.walk((x) => x instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
    if (rev) {
      if (rev.data?.errorName) {
        const args = rev.data.args ?? [];
        return {
          nombre: rev.data.errorName,
          mensaje: mensajeDe(rev.data.errorName, args, ctx),
          args,
          crudo: rev.raw ?? rev.signature,
        };
      }
      if (rev.raw) {
        const d = decodificar(rev.raw, ctx);
        if (d) return d;
      }
      const nombre = rev.reason ?? "Revert";
      return { nombre, mensaje: mensajeDe(nombre, [], ctx), crudo: rev.raw ?? rev.shortMessage };
    }
    return { nombre: e.name, mensaje: MENSAJE_GENERICO, crudo: e.shortMessage };
  }

  const mensaje = e instanceof Error ? e.message : String(e);
  const codigo = (e as { code?: unknown } | null)?.code;
  if (codigo === "SIGNING_REJECTED") return { nombre: "FirmaRechazada", mensaje: "Cancelaste la firma.", crudo: mensaje };
  if (codigo === "TIMEOUT") {
    return { nombre: "TiempoAgotado", mensaje: "Se agotó el tiempo para firmar. Probá de nuevo.", crudo: mensaje };
  }
  if (codigo === "NOT_CONNECTED") return { nombre: "SinSesion", mensaje: MENSAJE_SIN_SESION, crudo: mensaje };
  if (codigo === "WIDGET_ERROR") {
    return { nombre: "Widget", mensaje: "No se pudo entrar con 0xGasless. Probá de nuevo.", crudo: mensaje };
  }
  // revert crudo dentro del mensaje del bundler/paymaster
  const hex = /0x[0-9a-fA-F]{8,}/.exec(mensaje)?.[0] as Hex | undefined;
  if (hex) {
    const d = decodificar(hex, ctx);
    if (d) return d;
  }
  if (/paymaster|sponsor/i.test(mensaje)) {
    return { nombre: "Paymaster", mensaje: "0xGasless no patrocinó esta operación.", crudo: mensaje };
  }
  if (/fetch|network|Failed to fetch|timeout/i.test(mensaje)) {
    return { nombre: "Red", mensaje: "Sin conexión con la red. Probá de nuevo.", crudo: mensaje };
  }
  return { nombre: e instanceof Error ? e.name : "Error", mensaje: MENSAJE_GENERICO, crudo: mensaje };
}
