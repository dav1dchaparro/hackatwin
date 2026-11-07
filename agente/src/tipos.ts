/**
 * Tipos compartidos del agente. Los tiempos van en SEGUNDOS UNIX como `number` (entran sobrados en un double);
 * los montos del token, en `bigint` (unidades mínimas, 18 decimales en MockPesos).
 */
import type { Address, Hash } from "viem";
import type { Fase } from "./abi.js";

/** `Llave.estado()` normalizado (ver `cadena.ts#normalizarEstado`). */
export interface EstadoLlave {
  dueno: Address;
  /** Fase según la cadena; el agente la recalcula con su propio reloj (`faseEfectiva`). */
  fase: Fase;
  saldo: bigint;
  ultimaSenal: number;
  venceEn: number;
  /** 0 = no hay reclamo. */
  reclamoIniciadoEn: number;
  /** 0 si no hay reclamo. */
  graciaTerminaEn: number;
  /** 0 = no se liberó. */
  liberadaEn: number;
  totalLiberado: bigint;
  plazoInactividad: number;
  plazoGracia: number;
  comisionBps: number;
  /** `block.timestamp` del bloque leído. En la C-Chain puede estar atrasado: no hay bloques sin tx. */
  ahora: number;
}

export interface Heredero {
  cuenta: Address;
  bps: number;
}

export interface InfoToken {
  simbolo: string;
  decimales: number;
}

export type Destinatario = "dueno" | "herederos";

export interface AccionAviso {
  tipo: "aviso";
  a: Destinatario;
  /** Clave única del aviso: si ya está en la memoria, no se repite. */
  clave: string;
  texto: string;
  /** Asunto para el mail (Telegram y consola lo ignoran). */
  asunto?: string;
  /**
   * Solo para `a: "herederos"`: las cuentas que hoy son herederas on-chain (`herederos()`). El mail filtra
   * EMAILS_HEREDEROS por esta lista, así alguien que el dueño sacó con `configurar()` no recibe el aviso.
   */
  cuentas?: readonly Address[];
}

export type FuncionAgente = "iniciarReclamo" | "liberar";

export interface AccionTx {
  tipo: "tx";
  fn: FuncionAgente;
  /** Identifica la época (señal o reclamo) para no repetir logs de DRY_RUN. */
  clave?: string;
}

export type Accion = AccionAviso | AccionTx;

/** Lo único que `decidir` necesita de la memoria persistente. */
export interface MemoriaDecision {
  avisosEnviados: ReadonlySet<string>;
  /** Hash de la tx de `liberar`, si el agente lo conoce (la mandó él o lo vio en los logs). */
  hashLiberacion?: Hash | undefined;
}

export interface ContextoDecision {
  /** Base de la web, sin barra final. El dueño entra en `${webUrl}/dueno`. */
  webUrl: string;
  token: InfoToken;
  herederos: readonly Heredero[];
  /** Zona horaria para mostrar horas (por defecto, la del sistema). */
  zonaHoraria?: string;
  /**
   * `false` si el agente hoy no puede mandar tx (no es tier 5, o DRY_RUN): el aviso de vencimiento no promete que
   * se abre la gracia. Por defecto `true`.
   */
  agenteEjecuta?: boolean;
}
