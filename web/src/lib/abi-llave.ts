/**
 * ABI de `Llave` (v2-herencia), `MockPesos` y el store de KUMPLY.
 *
 * La fuente de verdad es `contracts/src/Llave.sol` (P1). El ABI PROVISIONAL de abajo está escrito a mano con
 * `parseAbi` desde ese archivo (7/11 15:00) y sirve para los TIPOS. En runtime, si P1 ya corrió
 * `contracts/script/export-abi.mjs` (genera `web/src/abi/Llave.ts` y `web/src/abi/MockPesos.ts`), se usa el ABI generado;
 * si no, el provisional. Así la lib compila y anda antes y después del export sin cambiar imports.
 */
import { parseAbi } from "viem";

export const llaveAbiProvisional = parseAbi([
  // ── structs ──
  "struct Heredero { address cuenta; uint16 bps; }",
  "struct Config { address dueno; address[] herederos; uint16[] bps; uint64 plazoInactividad; uint64 plazoGracia; }",
  "struct Estado { address dueno; uint8 fase; uint256 saldo; uint64 ultimaSenal; uint64 venceEn; uint64 reclamoIniciadoEn; uint64 graciaTerminaEn; uint64 liberadaEn; uint256 totalLiberado; uint64 plazoInactividad; uint64 plazoGracia; uint16 comisionBps; uint64 ahora; }",
  // ── constantes y estado público ──
  "function MAX_HEREDEROS() view returns (uint8)",
  "function BPS_TOTAL() view returns (uint16)",
  "function COMISION_MAX_BPS() view returns (uint16)",
  "function ROL_AGENTE() view returns (uint8)",
  "function token() view returns (address)",
  "function periodoMinimo() view returns (uint64)",
  "function comisionBps() view returns (uint16)",
  "function tesoreria() view returns (address)",
  "function dueno() view returns (address)",
  "function ultimaSenal() view returns (uint64)",
  "function plazoInactividad() view returns (uint64)",
  "function plazoGracia() view returns (uint64)",
  "function reclamoIniciadoEn() view returns (uint64)",
  "function liberadaEn() view returns (uint64)",
  "function totalLiberado() view returns (uint256)",
  // ── dueño (cada movimiento reinicia el reloj y cancela un reclamo abierto) ──
  "function estoyBien()",
  "function depositar(uint256 monto)",
  "function retirar(address a, uint256 monto)",
  "function configurar(Config c)",
  "function transferirDueno(address nuevo)",
  // ── agente KUMPLY tier 5 ──
  "function iniciarReclamo()",
  "function liberar()",
  // ── lecturas ──
  "function fase() view returns (uint8)",
  "function estado() view returns (Estado)",
  "function herederos() view returns (Heredero[])",
  "function esHeredero(address cuenta) view returns (bool es, uint16 bps)",
  "function parteDe(address heredero) view returns (uint256)",
  "function venceEn() view returns (uint64)",
  "function graciaTerminaEn() view returns (uint64)",
  // ── heredadas de KumplyGated ──
  "function kumply() view returns (address)",
  "function isPersonAtLeast(address who, uint32 level) view returns (bool)",
  "function isBusiness(address who) view returns (bool)",
  "function isAgent(address who) view returns (bool)",
  // ── eventos ──
  "event Configurada(address indexed dueno, address[] herederos, uint16[] bps, uint64 plazoInactividad, uint64 plazoGracia)",
  "event SenalDeVida(address indexed dueno, uint64 cuando)",
  "event Depositado(address indexed de, uint256 monto)",
  "event Retirado(address indexed a, uint256 monto)",
  "event DuenoTransferido(address indexed anterior, address indexed nuevo)",
  "event VerificadoKumply(address indexed cuenta, uint32 tier, uint8 rol)",
  "event ReclamoIniciado(address indexed agente, uint64 graciaTerminaEn)",
  "event ReclamoCancelado(uint64 cuando)",
  "event HerenciaEnviada(address indexed heredero, uint256 monto)",
  "event ComisionCobrada(address indexed tesoreria, uint256 monto)",
  "event Liberada(address indexed agente, uint256 total, uint256 comision)",
  // ── errores de Llave ──
  "error NoEsDueno(address quien)",
  "error PorcentajesInvalidos(uint256 suma)",
  "error CantidadHerederosInvalida(uint256 cantidad)",
  "error DireccionInvalida(address cuenta)",
  "error PlazoInvalido(uint64 plazo, uint64 minimo)",
  "error ComisionInvalida(uint16 bps)",
  "error MontoInvalido()",
  "error SaldoInsuficiente(uint256 pedido, uint256 disponible)",
  "error SigueVivo(uint64 venceEn)",
  "error ReclamoYaIniciado(uint64 iniciadoEn)",
  "error SinReclamo()",
  "error GraciaEnCurso(uint64 terminaEn)",
  "error YaLiberada(uint64 liberadaEn)",
  "error SinSaldo()",
  // ── errores de KumplyGated ──
  "error KumplyStoreInvalid(address store)",
  "error InvalidPersonLevel(uint32 level)",
  "error NotPerson(address who, uint32 tier, uint32 minLevel)",
  "error NotBusiness(address who, uint32 tier)",
  "error NotAgent(address who, uint32 tier)",
  // ── ReentrancyGuard (OZ v5) ──
  "error ReentrancyGuardReentrantCall()",
]);

/** MockPesos (ERC20 de OZ v5, 18 decimales) + faucet sin límite (testnet). */
export const pesosAbiProvisional = parseAbi([
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

/** AttestationStore de KUMPLY (misma firma que `IKumplyAttestationStore.verify`). Solo `verify`, nunca la deprecada. */
export const kumplyStoreAbi = parseAbi([
  "function verify(address subject) view returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry)",
]);

// ABI generado por P1 (`web/src/abi/`): si existe, manda en runtime; los tipos los da el provisional.
const generados = import.meta.glob(["../abi/Llave.ts", "../abi/MockPesos.ts"], { eager: true }) as Record<
  string,
  { llaveAbi?: unknown; pesosAbi?: unknown }
>;
export const ABI_GENERADO = Boolean(generados["../abi/Llave.ts"]?.llaveAbi);
export const llaveAbi = (generados["../abi/Llave.ts"]?.llaveAbi ?? llaveAbiProvisional) as typeof llaveAbiProvisional;
export const pesosAbi = (generados["../abi/MockPesos.ts"]?.pesosAbi ?? pesosAbiProvisional) as typeof pesosAbiProvisional;
