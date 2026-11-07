/**
 * Contrato TypeScript que consume la web (PLAN_CONSTRUCCION_LLAVE.md §2.7, congelado 13:30).
 * P3 implementa el mock (web/src/mock/cliente-mock.ts) y P2 la versión real (web/src/lib/cliente-fuji.ts).
 * Las pantallas solo conocen `LlaveCliente`. Desde las 13:30 solo se AGREGA; nada se saca ni se renombra.
 */
import type { Address, Hash } from "viem";

export type Fase = "Activa" | "Vencida" | "EnGracia" | "Ejecutable" | "Repartiendo";
/** Índice = enum Solidity `Fase`. */
export const FASES: Fase[] = ["Activa", "Vencida", "EnGracia", "Ejecutable", "Repartiendo"];

export interface Verificacion {
  ok: boolean;
  tier: number;
  /** Persona verificada: ok && 2 ≤ tier ≤ 3 (misma regla que `KumplyGated._isPersonAtLeast`). Nunca `hasTier`. */
  esPersona: boolean;
  /** Empresa verificada (KYB): ok && tier == 4. */
  esEmpresa: boolean;
  /** De dónde salió el dato. "contrato" = fallback DECLARADO a `verify()` del store con viem. */
  fuente: "kumply-sdk" | "contrato" | "mock";
}

export interface EstadoLlave {
  direccion: Address;
  dueno: Address;
  fase: Fase;
  saldo: bigint;
  decimales: number;
  simbolo: string;
  /** segundos unix */
  ultimaSenal: number;
  venceEn: number;
  /** 0 = no hay reclamo */
  reclamoIniciadoEn: number;
  graciaTerminaEn: number;
  /** saldo fijado en el 1.er cobro (0n = no empezó el reparto) */
  foto: bigint;
  emergenciaDisponible: bigint;
  cantidadEmergencias: number;
  /** block.timestamp de la última lectura: la web corrige su reloj con esto (+2 s de margen). */
  ahoraCadena: number;
  // ── Agregados (solo suman) ──
  /** A1 (COMPLEMENTO_LLAVE.md §6): comisión al liberar la herencia. `undefined` = ABI v1, todavía sin comisión. */
  comisionBps?: number;
  tesoreria?: Address;
}

export interface HerederoVista {
  cuenta: Address;
  alias: string;
  bps: number;
  /** neto que le corresponde (`parteDe`) */
  parte: bigint;
  cobro: boolean;
  verificacion: Verificacion;
}

export interface GuardianVista {
  cuenta: Address;
  alias: string;
  verificacion: Verificacion;
}

export interface EmergenciaVista {
  id: number;
  proponente: Address;
  destino: Address;
  aliasDestino: string;
  monto: bigint;
  motivo: string;
  propuestaEn: number;
  aprobadaEn: number;
  votos: number;
  ejecutada: boolean;
  vetada: boolean;
  yoVote: boolean;
  /** Mejora 17: `emergenciaVigente(id)`. false = "Caducó" (ejecutada, vetada o de una época vieja). `undefined` = ABI v1. */
  vigente?: boolean;
}

export interface EventoLlave {
  nombre: string;
  args: Record<string, unknown>;
  hash: Hash;
  url: string;
  /** segundos unix del bloque */
  cuando: number;
}

export interface ResultadoTx {
  ok: boolean;
  hash?: Hash;
  url?: string;
  /** ms desde que se mandó hasta que quedó incluida (incluye el bundler de 0xGasless). */
  ms?: number;
  error?: { nombre: string; mensaje: string };
  // ── Agregados (solo suman): los dos tiempos honestos (mejora 6) ──
  /** ms desde incluida hasta final. En Avalanche la inclusión ES la finalidad: siempre 0. */
  msFinal?: number;
  userOpHash?: Hash;
  /** true = salió de la smart account con gas patrocinado (0xGasless). */
  patrocinada?: boolean;
}

export interface Sesion {
  email: string;
  /** smart account ERC-4337 (la que ve el contrato como msg.sender y la que atesta KUMPLY) */
  cuenta: Address;
  alias: string;
  /** EOA firmante en KMS (0xGasless). Solo informativa: la web nunca firma tx con ella. */
  eoa?: Address;
}

export interface LlaveCliente {
  // ── lectura (sin sesión) ──
  estado(): Promise<EstadoLlave>;
  herederos(): Promise<HerederoVista[]>;
  guardianes(): Promise<GuardianVista[]>;
  emergencias(): Promise<EmergenciaVista[]>;
  saldoDe(cuenta: Address): Promise<bigint>;
  verificacion(cuenta: Address): Promise<Verificacion>;
  /** devuelve "desuscribir" */
  escucharEventos(cb: (e: EventoLlave) => void): () => void;
  // ── sesión 0xGasless ──
  sesion(): Sesion | null;
  entrar(email: string): Promise<Sesion>;
  salir(): Promise<void>;
  // ── escritura: todas patrocinadas; SIEMPRE simulan antes y, si revierte, devuelven ok:false sin mandar ──
  estoyBien(): Promise<ResultadoTx>;
  /** batch en una sola userOp: faucet + approve + depositar */
  cargarPesosDePrueba(monto: bigint): Promise<ResultadoTx>;
  retirar(a: Address, monto: bigint): Promise<ResultadoTx>;
  iniciarReclamo(): Promise<ResultadoTx>;
  cobrar(): Promise<ResultadoTx>;
  proponerEmergencia(destino: Address, monto: bigint, motivo: string): Promise<ResultadoTx>;
  aprobarEmergencia(id: number): Promise<ResultadoTx>;
  ejecutarEmergencia(id: number): Promise<ResultadoTx>;
  vetarEmergencia(id: number): Promise<ResultadoTx>;
}
