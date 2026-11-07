/**
 * Contrato TypeScript entre la web y el cliente (PLAN_CONSTRUCCION_LLAVE.md §2.7), versión "v2-herencia"
 * tras el cambio de alcance del 7/11 14:32 (PR #2): la Llave es SOLO herencia por inactividad.
 * Se van guardianes, emergencias, `cobrar` y la fase `Repartiendo`; entran `Liberada`, `liberadaEn`, `totalLiberado`,
 * `comisionBps` y el agente KUMPLY tier 5 (`isAgent`) que inicia el reclamo y libera (`contracts/src/Llave.sol`).
 *
 * P3 implementa el mock (web/src/mock/cliente-mock.ts) y P2 la versión real (web/src/lib/cliente-fuji.ts).
 * Las pantallas solo conocen `LlaveCliente`. Desde acá solo se AGREGA (campos opcionales), nunca se cambia lo que hay.
 */
import type { Address, Hash } from "viem";

export type Fase = "Activa" | "Vencida" | "EnGracia" | "Ejecutable" | "Liberada";
/** Índice = enum Solidity `Llave.Fase` (0…4). */
export const FASES: Fase[] = ["Activa", "Vencida", "EnGracia", "Ejecutable", "Liberada"];

export interface Verificacion {
  ok: boolean;
  tier: number;
  /** Persona verificada: ok && 2 ≤ tier ≤ 3 (misma regla que `KumplyGated._isPersonAtLeast`). Nunca `hasTier`. */
  esPersona: boolean;
  /** Empresa verificada (KYB): ok && tier == 4. */
  esEmpresa: boolean;
  /** Agente verificado (KYA): ok && tier == 5. Es el gate de `iniciarReclamo()` y `liberar()`. */
  esAgente: boolean;
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
  /** 0 = no se liberó */
  liberadaEn: number;
  /** saldo bruto repartido al liberar (incluye la comisión) */
  totalLiberado: bigint;
  plazoInactividad: number;
  plazoGracia: number;
  /** 100 = 1% al liberar (A1) */
  comisionBps: number;
  /** block.timestamp de la última lectura: la web corrige su reloj con esto (+2 s de margen). */
  ahoraCadena: number;
  // ── Agregados opcionales ──
  tesoreria?: Address;
}

export interface HerederoVista {
  cuenta: Address;
  alias: string;
  bps: number;
  /** neto que le corresponde hoy (`parteDe`: sobre el saldo, o sobre `totalLiberado` si ya se liberó) */
  parte: bigint;
  /** Solo informativo: el contrato ya no exige identidad a los herederos. */
  verificacion: Verificacion;
}

/** El agente ejecutor (EOA atestada por KUMPLY como agente, tier 5). */
export interface AgenteVista {
  cuenta: Address;
  alias: string;
  verificacion: Verificacion;
}

export interface EventoLlave {
  nombre: string;
  args: Record<string, unknown>;
  hash: Hash;
  url: string;
  /** segundos unix del bloque */
  cuando: number;
  // ── Agregados opcionales (P3): para la tarjeta "Herencia enviada" del panel ──
  /** ms envío → incluida, lo pone el cliente que mandó la tx (si lo sabe) */
  ms?: number;
}

export interface ResultadoTx {
  ok: boolean;
  hash?: Hash;
  url?: string;
  /** ms desde que se mandó hasta que quedó incluida (incluye el bundler de 0xGasless). */
  ms?: number;
  error?: { nombre: string; mensaje: string };
  // ── Agregados opcionales: los dos tiempos honestos (mejora 6) ──
  /** ms desde incluida hasta final. En Avalanche la inclusión ES la finalidad: siempre 0. */
  msFinal?: number;
  userOpHash?: Hash;
  /** true = salió de la smart account con gas patrocinado (0xGasless). */
  patrocinada?: boolean;
}

export interface Sesion {
  email: string;
  /** smart account ERC-4337 (la que ve el contrato como msg.sender) */
  cuenta: Address;
  alias: string;
  /** EOA firmante en KMS (0xGasless). Solo informativa: la web nunca firma tx con ella. */
  eoa?: Address;
}

/** Configuración desde la pantalla del dueño (presets A3: partes iguales / porcentajes / un solo destino). */
export interface ConfigLlave {
  herederos: Address[];
  /** mismo largo que `herederos`, cada uno > 0, suman 10.000 */
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
  saldoDe(cuenta: Address): Promise<bigint>;
  verificacion(cuenta: Address): Promise<Verificacion>;
  /** devuelve "desuscribir" */
  escucharEventos(cb: (e: EventoLlave) => void): () => void;
  // ── sesión 0xGasless ──
  sesion(): Sesion | null;
  entrar(email: string): Promise<Sesion>;
  salir(): Promise<void>;
  // ── escritura del dueño: todas patrocinadas; SIEMPRE simulan antes y, si revierte, devuelven ok:false sin mandar ──
  estoyBien(): Promise<ResultadoTx>;
  /** batch en una sola userOp: faucet + approve + depositar */
  cargarPesosDePrueba(monto: bigint): Promise<ResultadoTx>;
  depositar(monto: bigint): Promise<ResultadoTx>;
  retirar(a: Address, monto: bigint): Promise<ResultadoTx>;
  configurar(c: ConfigLlave): Promise<ResultadoTx>;
  // ── Agregados opcionales. Las pantallas los usan solo si existen ──
  /** el agente ejecutor y su verificación KUMPLY (para el chip "agente verificado ✓" de /demo); null si no se conoce */
  agente?(): Promise<AgenteVista | null>;
  /** nombre de fantasía de las cuentas de la demo (Marta, Lucía, Tomás, agente) */
  aliasDe?(cuenta: Address): string;
  /** cuenta que corresponde a un email (cuenta embebida de 0xGasless; en mock, derivación determinística). Para cargar herederos por email */
  cuentaDeEmail?(email: string): Promise<Address>;
  /** el bot SIN atestación (cuentas.botSinKya) para mostrar en /demo que rebota; null si no se conoce */
  bot?(): Promise<AgenteVista | null>;
  /** acciones del agente (tier 5). Desde una sesión sin atestación revierten `NotAgent`: es la evidencia "bloqueada" del bonus KUMPLY */
  iniciarReclamo?(): Promise<ResultadoTx>;
  liberar?(): Promise<ResultadoTx>;
  /** historial (más nuevo primero) para el feed del panel al abrirlo */
  eventosRecientes?(): Promise<EventoLlave[]>;
}
