// Contrato TypeScript entre la web y el cliente (PLAN_CONSTRUCCION_LLAVE.md §2.7).
// Congelado a las 13:30: desde entonces es de P2. Solo se AGREGA (campos opcionales), nunca se cambia lo que hay.
// P3 implementa el mock (web/src/mock/cliente-mock.ts); P2 la versión real (web/src/lib/cliente-fuji.ts).
// Las pantallas solo conocen `LlaveCliente`.
import type { Address, Hash } from "viem";

export type Fase = "Activa" | "Vencida" | "EnGracia" | "Ejecutable" | "Repartiendo";
export const FASES: Fase[] = ["Activa", "Vencida", "EnGracia", "Ejecutable", "Repartiendo"]; // índice = enum Solidity

export interface Verificacion { ok: boolean; tier: number; esPersona: boolean; esEmpresa: boolean; fuente: "kumply-sdk" | "contrato" | "mock"; }

export interface EstadoLlave {
  direccion: Address; dueno: Address; fase: Fase;
  saldo: bigint; decimales: number; simbolo: string;
  ultimaSenal: number; venceEn: number;                 // segundos unix
  reclamoIniciadoEn: number; graciaTerminaEn: number;   // 0 = no hay
  foto: bigint; emergenciaDisponible: bigint; cantidadEmergencias: number;
  ahoraCadena: number;                                  // block.timestamp de la última lectura
  // ── Agregados opcionales (P3, 7/11 14:20). P2 los completa si el ABI los tiene; si no, la web no los muestra ──
  comisionBps?: number;            // A1 (COMPLEMENTO_LLAVE.md §6): comisión al liberar, 100 = 1%
  topeEmergenciaBps?: number;      // para el texto "tope 20%"
  demoraVeto?: number;             // segundos; 0 = se ejecuta con el 2.º voto
}
export interface HerederoVista { cuenta: Address; alias: string; bps: number; parte: bigint; cobro: boolean; verificacion: Verificacion; }
export interface GuardianVista { cuenta: Address; alias: string; verificacion: Verificacion; }
export interface EmergenciaVista {
  id: number; proponente: Address; destino: Address; aliasDestino: string; monto: bigint; motivo: string;
  propuestaEn: number; aprobadaEn: number; votos: number; ejecutada: boolean; vetada: boolean; yoVote: boolean;
  // ── Agregados opcionales (P3) ──
  vigente?: boolean;               // MEJORAS_LLAVE.md 2: false = "Caducó" (una señal del dueño cerró los pedidos viejos)
  aliasProponente?: string;
}
export interface EventoLlave { nombre: string; args: Record<string, unknown>; hash: Hash; url: string; cuando: number; }
export interface ResultadoTx { ok: boolean; hash?: Hash; url?: string; ms?: number; error?: { nombre: string; mensaje: string } }
export interface Sesion { email: string; cuenta: Address; alias: string; }

// ── Agregado opcional (P3): configuración desde la pantalla del dueño (presets A3). El cliente real puede no implementarlo ──
export interface ConfigLlave {
  herederos: Address[]; bps: number[]; guardianes: [Address, Address, Address];
  plazoInactividad: number; plazoGracia: number; topeEmergenciaBps: number; demoraVeto: number;
}
export interface DestinoVista { cuenta: Address; alias: string; verificacion: Verificacion; }

export interface LlaveCliente {
  // lectura (sin sesión)
  estado(): Promise<EstadoLlave>;
  herederos(): Promise<HerederoVista[]>;
  guardianes(): Promise<GuardianVista[]>;
  emergencias(): Promise<EmergenciaVista[]>;
  saldoDe(cuenta: Address): Promise<bigint>;
  verificacion(cuenta: Address): Promise<Verificacion>;
  escucharEventos(cb: (e: EventoLlave) => void): () => void;   // devuelve "desuscribir"
  // sesión 0xGasless
  sesion(): Sesion | null;
  entrar(email: string): Promise<Sesion>;
  salir(): Promise<void>;
  // escritura: todas patrocinadas; SIEMPRE simulan antes y, si revierte, devuelven ok:false sin mandar
  estoyBien(): Promise<ResultadoTx>;
  cargarPesosDePrueba(monto: bigint): Promise<ResultadoTx>;    // batch: faucet + approve + depositar
  retirar(a: Address, monto: bigint): Promise<ResultadoTx>;
  iniciarReclamo(): Promise<ResultadoTx>;
  cobrar(): Promise<ResultadoTx>;
  proponerEmergencia(destino: Address, monto: bigint, motivo: string): Promise<ResultadoTx>;
  aprobarEmergencia(id: number): Promise<ResultadoTx>;
  ejecutarEmergencia(id: number): Promise<ResultadoTx>;
  vetarEmergencia(id: number): Promise<ResultadoTx>;
  // ── Agregados opcionales (P3). Las pantallas los usan solo si existen ──
  configurar?(c: ConfigLlave): Promise<ResultadoTx>;
  destinosPermitidos?(): Promise<DestinoVista[]>;             // MEJORAS_LLAVE.md 4: lista blanca de destinos
  aliasDe?(cuenta: Address): string;                          // nombre de fantasía de las cuentas de la demo
}
