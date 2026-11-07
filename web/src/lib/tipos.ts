/**
 * Contrato TypeScript que consume la web (PLAN_CONSTRUCCION_LLAVE.md §2.7, congelado 13:30).
 * P3 implementa el mock (web/src/mock/cliente-mock.ts) y P2 la versión real (web/src/lib/cliente-fuji.ts).
 * Las pantallas solo conocen `LlaveCliente`. Desde las 13:30 solo se AGREGA; nada se saca ni se renombra.
 *
 * 14:32 CAMBIO DE ALCANCE (PR #2, Juan): solo herencia por inactividad, liberada por un AGENTE KUMPLY (tier 5).
 * Lo de emergencias/guardianes queda marcado `@deprecated` para no romper `cliente-fuji.ts`; P2 lo saca de su lib.
 * Lo nuevo (fase `Liberada`, `esAgente`, `liberar`, `configurar`, `agentes`) es lo que usan las pantallas.
 */
import type { Address, Hash } from "viem";

/** `Repartiendo` es el nombre viejo del índice 4 del enum; el contrato v2-herencia lo llama `Liberada`. */
export type Fase = "Activa" | "Vencida" | "EnGracia" | "Ejecutable" | "Liberada" | "Repartiendo";
/** Índice = enum Solidity `Fase` (contracts/src/Llave.sol: Activa, Vencida, EnGracia, Ejecutable, Liberada). */
export const FASES: Fase[] = ["Activa", "Vencida", "EnGracia", "Ejecutable", "Liberada"];

export interface Verificacion {
  ok: boolean;
  tier: number;
  /** Persona verificada: ok && 2 ≤ tier ≤ 3 (misma regla que `KumplyGated._isPersonAtLeast`). Nunca `hasTier`. */
  esPersona: boolean;
  /** Empresa verificada (KYB): ok && tier == 4. */
  esEmpresa: boolean;
  /** Agente verificado (KYA): ok && tier == 5 exacto. Es el gate de `iniciarReclamo`/`liberar`. */
  esAgente?: boolean;
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
  /** @deprecated alcance viejo. En v2-herencia vale `totalLiberado` si ya se liberó, 0n si no. */
  foto: bigint;
  /** @deprecated alcance viejo (siempre 0n en v2-herencia) */
  emergenciaDisponible: bigint;
  /** @deprecated alcance viejo (siempre 0 en v2-herencia) */
  cantidadEmergencias: number;
  /** block.timestamp de la última lectura: la web corrige su reloj con esto (+2 s de margen). */
  ahoraCadena: number;
  // ── Agregados (solo suman) ──
  /** A1 (COMPLEMENTO_LLAVE.md §6): comisión al liberar la herencia. `undefined` = ABI v1, todavía sin comisión. */
  comisionBps?: number;
  tesoreria?: Address;
  /** v2-herencia: 0 = todavía no se liberó */
  liberadaEn?: number;
  /** v2-herencia: saldo bruto repartido al liberar (incluye la comisión) */
  totalLiberado?: bigint;
  plazoInactividad?: number;
  plazoGracia?: number;
}

export interface HerederoVista {
  cuenta: Address;
  alias: string;
  bps: number;
  /** neto que le corresponde (`parteDe`): sobre el saldo actual, o sobre `totalLiberado` si ya se liberó */
  parte: bigint;
  /** true = ya recibió su parte (v2: la Llave se liberó) */
  cobro: boolean;
  verificacion: Verificacion;
}

/** v2-herencia: el agente que vigila/libera y el bot sin verificar que rebota (para el panel). */
export interface AgenteVista {
  cuenta: Address;
  alias: string;
  verificacion: Verificacion;
  /** "agente" = el que debería pasar; "bot" = el impostor que tiene que rebotar con NotAgent */
  rol: "agente" | "bot";
}

/** @deprecated alcance viejo (guardianes) */
export interface GuardianVista {
  cuenta: Address;
  alias: string;
  verificacion: Verificacion;
}

/** @deprecated alcance viejo (emergencias) */
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
  vigente?: boolean;
}

export interface EventoLlave {
  nombre: string;
  args: Record<string, unknown>;
  hash: Hash;
  url: string;
  /** segundos unix del bloque */
  cuando: number;
  // ── Agregados (solo suman): para la tarjeta "Herencia enviada" del panel (mejora 6) ──
  /** ms envío → incluida, medido por el cliente que mandó la tx (si lo sabe) */
  ms?: number;
  /** texto libre, ej. "≈ ARS 0,40" (lo mide P4 en docs/finalidad.md) */
  costo?: string;
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

/** v2-herencia: lo que la dueña puede cambiar desde la web (`configurar(Config)`; `dueno` lo pone el cliente). */
export interface ConfigLlave {
  herederos: Address[];
  /** mismo largo que `herederos`, cada uno > 0, suman 10_000 */
  bps: number[];
  /** segundos (demo 60; prod 180 días) */
  plazoInactividad: number;
  /** segundos (demo 30; prod 30 días) */
  plazoGracia: number;
}

export interface LlaveCliente {
  // ── lectura (sin sesión) ──
  estado(): Promise<EstadoLlave>;
  herederos(): Promise<HerederoVista[]>;
  /** @deprecated alcance viejo: devolver [] */
  guardianes(): Promise<GuardianVista[]>;
  /** @deprecated alcance viejo: devolver [] */
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
  /** v2: solo el agente (tier 5). Desde una cuenta sin verificar revierte `NotAgent` (la evidencia KUMPLY "bloqueada"). */
  iniciarReclamo(): Promise<ResultadoTx>;
  /** @deprecated alcance viejo: devolver ok:false */
  cobrar(): Promise<ResultadoTx>;
  /** @deprecated alcance viejo: devolver ok:false */
  proponerEmergencia(destino: Address, monto: bigint, motivo: string): Promise<ResultadoTx>;
  /** @deprecated alcance viejo: devolver ok:false */
  aprobarEmergencia(id: number): Promise<ResultadoTx>;
  /** @deprecated alcance viejo: devolver ok:false */
  ejecutarEmergencia(id: number): Promise<ResultadoTx>;
  /** @deprecated alcance viejo: devolver ok:false */
  vetarEmergencia(id: number): Promise<ResultadoTx>;
  // ── Agregados v2-herencia (opcionales: las pantallas los usan solo si existen) ──
  /** solo el agente (tier 5): comisión a la tesorería y el resto a todos los herederos en la misma tx */
  liberar?(): Promise<ResultadoTx>;
  /** la dueña cambia herederos, porcentajes y plazos (A3: presets en /dueno) */
  configurar?(c: ConfigLlave): Promise<ResultadoTx>;
  /** depósito simple (ya hay approve) */
  depositar?(monto: bigint): Promise<ResultadoTx>;
  /** agente verificado + bot sin verificar, con su semáforo, para el panel /demo */
  agentes?(): Promise<AgenteVista[]>;
  /** nombre de fantasía de las cuentas de la demo (si no existe, la web usa `aliasDe` de config.ts) */
  aliasDe?(cuenta: Address): string;
  /** historial (más nuevo primero) para el feed del panel al abrirlo */
  eventosRecientes?(): Promise<EventoLlave[]>;
}
