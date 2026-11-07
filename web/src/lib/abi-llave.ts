/**
 * ABI PROVISIONAL de `LlaveEmergencia`, `MockPesos` y el store de KUMPLY, escrito a mano desde la interfaz congelada
 * (PLAN_CONSTRUCCION_LLAVE.md §2.2 + "Cambios al contrato" de MEJORAS_LLAVE.md + A1 de COMPLEMENTO_LLAVE.md §6).
 *
 * Cuando P1 corra `export-abi.mjs`, el ABI real queda en `web/src/abi/LlaveEmergencia.ts` (`llaveAbi`) y
 * `web/src/abi/MockPesos.ts` (`pesosAbi`): ahí se cambia el import en `cliente-fuji.ts` y este archivo se borra.
 * Lo que esté acá y no en el contrato no rompe nada: una función que no existe revierte y se trata como "no soportada".
 */
import { parseAbi } from "viem";

export const llaveAbi = parseAbi([
  // ── structs ──
  "struct Heredero { address cuenta; uint16 bps; }",
  "struct Emergencia { address proponente; address destino; uint256 monto; uint64 propuestaEn; uint64 aprobadaEn; uint8 votos; bool ejecutada; bool vetada; string motivo; }",
  "struct Config { address dueno; address[] herederos; uint16[] bps; address[3] guardianes; uint64 plazoInactividad; uint64 plazoGracia; uint16 topeEmergenciaBps; uint64 demoraVeto; }",
  "struct Estado { address dueno; uint8 fase; uint256 saldo; uint64 ultimaSenal; uint64 venceEn; uint64 reclamoIniciadoEn; uint64 graciaTerminaEn; uint256 foto; uint256 emergenciaDisponible; uint256 cantidadEmergencias; uint64 ahora; }",
  // ── constantes y estado público ──
  "function NIVEL_PERSONA() view returns (uint32)",
  "function VOTOS_NECESARIOS() view returns (uint8)",
  "function MAX_HEREDEROS() view returns (uint8)",
  "function BPS_TOTAL() view returns (uint16)",
  "function TOPE_EMERGENCIA_MAX_BPS() view returns (uint16)",
  "function COMISION_MAX_BPS() view returns (uint16)",
  "function token() view returns (address)",
  "function periodoMinimo() view returns (uint64)",
  "function dueno() view returns (address)",
  "function ultimaSenal() view returns (uint64)",
  "function plazoInactividad() view returns (uint64)",
  "function plazoGracia() view returns (uint64)",
  "function reclamoIniciadoEn() view returns (uint64)",
  "function foto() view returns (uint256)",
  "function topeEmergenciaBps() view returns (uint16)",
  "function demoraVeto() view returns (uint64)",
  "function baseEmergencia() view returns (uint256)",
  "function usadoEmergencia() view returns (uint256)",
  "function cobro(address heredero) view returns (bool)",
  "function voto(uint256 id, address guardian) view returns (bool)",
  "function epoca() view returns (uint256)",
  "function comisionBps() view returns (uint16)",
  "function tesoreria() view returns (address)",
  "function destinoPermitido(address destino) view returns (bool)",
  // ── dueño (cada acción del dueño cuenta como "estoy bien") ──
  "function estoyBien()",
  "function depositar(uint256 monto)",
  "function retirar(address a, uint256 monto)",
  "function configurar(Config c)",
  "function transferirDueno(address nuevo)",
  "function vetarEmergencia(uint256 id)",
  "function permitirDestino(address destino, bool permitido)",
  // ── herencia ──
  "function iniciarReclamo()",
  "function iniciarReclamoPorAgente()",
  "function cobrar()",
  // ── emergencia ──
  "function proponerEmergencia(address destino, uint256 monto, string motivo) returns (uint256 id)",
  "function aprobarEmergencia(uint256 id)",
  "function ejecutarEmergencia(uint256 id)",
  // ── lecturas ──
  "function fase() view returns (uint8)",
  "function estado() view returns (Estado)",
  "function herederos() view returns (Heredero[])",
  "function guardianes() view returns (address[3])",
  "function esHeredero(address cuenta) view returns (bool es, uint16 bps)",
  "function esGuardian(address cuenta) view returns (bool)",
  "function parteDe(address heredero) view returns (uint256)",
  "function emergencia(uint256 id) view returns (Emergencia)",
  "function cantidadEmergencias() view returns (uint256)",
  "function emergenciaDisponible() view returns (uint256)",
  "function emergenciaVigente(uint256 id) view returns (bool)",
  // ── heredadas de KumplyGated ──
  "function kumply() view returns (address)",
  "function isPersonAtLeast(address who, uint32 level) view returns (bool)",
  "function isBusiness(address who) view returns (bool)",
  "function isAgent(address who) view returns (bool)",
  // ── eventos ──
  "event Configurada(address indexed dueno, address[] herederos, uint16[] bps, address[3] guardianes, uint64 plazoInactividad, uint64 plazoGracia, uint16 topeEmergenciaBps, uint64 demoraVeto)",
  "event SenalDeVida(address indexed dueno, uint64 cuando, uint256 baseEmergencia)",
  "event Depositado(address indexed de, uint256 monto)",
  "event Retirado(address indexed a, uint256 monto)",
  "event DuenoTransferido(address indexed anterior, address indexed nuevo)",
  "event ReclamoIniciado(address indexed heredero, uint64 graciaTerminaEn)",
  "event ReclamoCancelado(uint64 cuando)",
  "event RepartoIniciado(uint256 foto)",
  "event Cobrado(address indexed heredero, uint256 monto)",
  "event EmergenciaPropuesta(uint256 indexed id, address indexed guardian, address indexed destino, uint256 monto, string motivo)",
  "event EmergenciaVotada(uint256 indexed id, address indexed guardian, uint8 votos)",
  "event EmergenciaEjecutada(uint256 indexed id, address indexed destino, uint256 monto)",
  "event EmergenciaVetada(uint256 indexed id)",
  "event VerificadoKumply(address indexed cuenta, uint32 tier, uint8 rol)",
  "event DestinoActualizado(address indexed destino, bool permitido)",
  "event ComisionCobrada(address indexed tesoreria, uint256 monto)",
  // ── errores de LlaveEmergencia ──
  "error NoEsDueno(address quien)",
  "error NoEsHeredero(address quien)",
  "error NoEsGuardian(address quien)",
  "error PorcentajesInvalidos(uint256 suma)",
  "error CantidadHerederosInvalida(uint256 cantidad)",
  "error DireccionInvalida(address cuenta)",
  "error PlazoInvalido(uint64 plazo, uint64 minimo)",
  "error TopeInvalido(uint16 bps)",
  "error MontoInvalido()",
  "error SaldoInsuficiente(uint256 pedido, uint256 disponible)",
  "error SigueVivo(uint64 venceEn)",
  "error ReclamoYaIniciado(uint64 iniciadoEn)",
  "error SinReclamo()",
  "error GraciaEnCurso(uint64 terminaEn)",
  "error RepartoEnCurso()",
  "error YaCobraste(address heredero)",
  "error TopeEmergenciaSuperado(uint256 monto, uint256 disponible)",
  "error EmergenciaInexistente(uint256 id)",
  "error EmergenciaCerrada(uint256 id)",
  "error YaVotaste(uint256 id, address guardian)",
  "error FaltanVotos(uint256 id, uint8 votos)",
  "error VetoEnCurso(uint256 id, uint64 ejecutableDesde)",
  "error DestinoNoPermitido(address destino)",
  "error ComisionInvalida(uint16 bps)",
  // ── errores de KumplyGated (PLAN_TAREA2_KUMPLY_GATE.md) ──
  "error KumplyStoreInvalid(address store)",
  "error InvalidPersonLevel(uint32 level)",
  "error NotPerson(address who, uint32 tier, uint32 minLevel)",
  "error NotBusiness(address who, uint32 tier)",
  "error NotAgent(address who, uint32 tier)",
  // ── ReentrancyGuard (OZ v5) ──
  "error ReentrancyGuardReentrantCall()",
]);

/** MockPesos (ERC20 de OZ v5, 18 decimales) + faucet sin límite (testnet). */
export const pesosAbi = parseAbi([
  "function MONTO_FAUCET() view returns (uint256)",
  "function faucet()",
  "function faucetPara(address a)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address cuenta) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 monto) returns (bool)",
  "function transfer(address a, uint256 monto) returns (bool)",
  "function transferFrom(address de, address a, uint256 monto) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
  "error ERC20InvalidSender(address sender)",
  "error ERC20InvalidReceiver(address receiver)",
  "error ERC20InvalidApprover(address approver)",
  "error ERC20InvalidSpender(address spender)",
]);

/** AttestationStore de KUMPLY (misma firma que `IKumplyAttestationStore.verify`). */
export const kumplyStoreAbi = parseAbi([
  "function verify(address subject) view returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry)",
]);
