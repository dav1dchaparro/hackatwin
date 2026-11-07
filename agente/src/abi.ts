/**
 * Subconjunto del ABI que usa el agente, escrito a mano con `parseAbi` (interfaz "v2-herencia").
 *
 * La fuente de verdad es `contracts/src/Llave.sol`. El test `test/abi.test.ts` compara cada ítem de acá contra el
 * ABI completo que genera `forge build` (contracts/out/Llave.sol/Llave.json), así que si el contrato cambia una
 * firma, el test lo detecta.
 */
import { parseAbi } from "viem";

/** Índices del enum `Llave.Fase` (Solidity lo expone como uint8). */
export const Fase = {
  Activa: 0,
  Vencida: 1,
  EnGracia: 2,
  Ejecutable: 3,
  Liberada: 4,
} as const;
export type Fase = (typeof Fase)[keyof typeof Fase];

export const NOMBRE_FASE: Record<Fase, string> = {
  0: "Activa",
  1: "Vencida",
  2: "EnGracia",
  3: "Ejecutable",
  4: "Liberada",
};

export const llaveAbi = parseAbi([
  "struct Estado { address dueno; uint8 fase; uint256 saldo; uint64 ultimaSenal; uint64 venceEn; uint64 reclamoIniciadoEn; uint64 graciaTerminaEn; uint64 liberadaEn; uint256 totalLiberado; uint64 plazoInactividad; uint64 plazoGracia; uint16 comisionBps; uint64 ahora; }",
  "struct Heredero { address cuenta; uint16 bps; }",

  // Lecturas
  "function estado() view returns (Estado)",
  "function herederos() view returns (Heredero[])",
  "function isAgent(address who) view returns (bool)",
  "function kumply() view returns (address)",
  "function token() view returns (address)",

  // Acciones del agente (solo tier 5)
  "function iniciarReclamo()",
  "function liberar()",

  // Eventos
  "event ReclamoIniciado(address indexed agente, uint64 graciaTerminaEn)",
  "event ReclamoCancelado(uint64 cuando)",
  "event SenalDeVida(address indexed dueno, uint64 cuando)",
  "event Liberada(address indexed agente, uint256 total, uint256 comision)",
  "event HerenciaEnviada(address indexed heredero, uint256 monto)",

  // Errores que el agente decodifica
  "error NotAgent(address who, uint32 tier)",
  "error SigueVivo(uint64 venceEn)",
  "error GraciaEnCurso(uint64 terminaEn)",
  "error YaLiberada(uint64 liberadaEn)",
  "error SinReclamo()",
  "error ReclamoYaIniciado(uint64 iniciadoEn)",
  "error SinSaldo()",
]);

/** Lo mínimo del ERC-20 de la bóveda (MockPesos en la demo) para formatear montos. */
export const tokenAbi = parseAbi([
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

/** AttestationStore de KUMPLY. Agente = verified && tier == 5 exacto (nunca "tier mínimo": una empresa no es agente). */
export const kumplyStoreAbi = parseAbi([
  "function verify(address subject) view returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry)",
]);
