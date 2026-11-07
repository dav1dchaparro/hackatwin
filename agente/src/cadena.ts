/**
 * Todo lo que habla con Avalanche Fuji (C-Chain 43113) vía viem. El agente firma con una EOA propia
 * (privateKeyToAccount), sin 0xGasless: es la dirección que KUMPLY atestigua con tier 5.
 */
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
} from "viem";
import type { PrivateKeyAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { Fase, kumplyStoreAbi, llaveAbi, tokenAbi } from "./abi.js";
import type { EstadoLlave, FuncionAgente, Heredero, InfoToken } from "./tipos.js";

export const CHAIN_ID_FUJI = avalancheFuji.id; // 43113

export interface Clientes {
  publico: PublicClient;
  billetera?: WalletClient;
  cuenta?: PrivateKeyAccount;
}

export function crearClientes(rpcUrl: string, cuenta?: PrivateKeyAccount): Clientes {
  const transporte = http(rpcUrl, { timeout: 15_000, retryCount: 2 });
  // cacheTime corto: por defecto viem cachea el número de bloque 4 s y los eventos llegarían tarde.
  const publico = createPublicClient({ chain: avalancheFuji, transport: transporte, cacheTime: 1_000 });
  if (cuenta === undefined) return { publico };
  const billetera = createWalletClient({ account: cuenta, chain: avalancheFuji, transport: transporte });
  return { publico, billetera, cuenta };
}

/** Lo que devuelve viem para `estado()` (uint64 → bigint, uint8/uint16 → number). */
export interface EstadoCrudo {
  dueno: Address;
  fase: number;
  saldo: bigint;
  ultimaSenal: bigint;
  venceEn: bigint;
  reclamoIniciadoEn: bigint;
  graciaTerminaEn: bigint;
  liberadaEn: bigint;
  totalLiberado: bigint;
  plazoInactividad: bigint;
  plazoGracia: bigint;
  comisionBps: number;
  ahora: bigint;
}

function aFase(n: number): Fase {
  if (n < Fase.Activa || n > Fase.Liberada) throw new Error(`Fase desconocida: ${n}`);
  return n as Fase;
}

export function normalizarEstado(e: EstadoCrudo): EstadoLlave {
  return {
    dueno: e.dueno,
    fase: aFase(e.fase),
    saldo: e.saldo,
    ultimaSenal: Number(e.ultimaSenal),
    venceEn: Number(e.venceEn),
    reclamoIniciadoEn: Number(e.reclamoIniciadoEn),
    graciaTerminaEn: Number(e.graciaTerminaEn),
    liberadaEn: Number(e.liberadaEn),
    totalLiberado: e.totalLiberado,
    plazoInactividad: Number(e.plazoInactividad),
    plazoGracia: Number(e.plazoGracia),
    comisionBps: e.comisionBps,
    ahora: Number(e.ahora),
  };
}

export async function leerEstado(publico: PublicClient, llave: Address): Promise<EstadoLlave> {
  const crudo = await publico.readContract({ address: llave, abi: llaveAbi, functionName: "estado" });
  return normalizarEstado(crudo);
}

export async function leerHerederos(publico: PublicClient, llave: Address): Promise<Heredero[]> {
  const lista = await publico.readContract({ address: llave, abi: llaveAbi, functionName: "herederos" });
  return lista.map((h) => ({ cuenta: h.cuenta, bps: h.bps }));
}

/** Símbolo y decimales del token; si el token no los expone, cae a "PESOS" con 18. */
export async function leerToken(publico: PublicClient, llave: Address): Promise<InfoToken> {
  const token = await publico.readContract({ address: llave, abi: llaveAbi, functionName: "token" });
  const [simbolo, decimales] = await Promise.all([
    publico.readContract({ address: token, abi: tokenAbi, functionName: "symbol" }).catch(() => "PESOS"),
    publico.readContract({ address: token, abi: tokenAbi, functionName: "decimals" }).catch(() => 18),
  ]);
  return { simbolo, decimales };
}

/** Tier KUMPLY de `cuenta` según el store que usa la Llave (0 si no hay atestación válida). */
export async function leerTier(publico: PublicClient, store: Address, cuenta: Address): Promise<number> {
  const [ok, tier] = await publico.readContract({
    address: store,
    abi: kumplyStoreAbi,
    functionName: "verify",
    args: [cuenta],
  });
  return ok ? tier : 0;
}

// ───────────── Errores del contrato ─────────────

export interface RevertDecodificado {
  nombre: string;
  args: readonly unknown[];
}

/** Busca dentro del error de viem el revert del contrato ya decodificado con `llaveAbi`. */
export function decodificarRevert(error: unknown): RevertDecodificado | undefined {
  if (!(error instanceof BaseError)) return undefined;
  const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(revert instanceof ContractFunctionRevertedError) || revert.data === undefined) return undefined;
  return { nombre: revert.data.errorName, args: revert.data.args ?? [] };
}

// ───────────── Puerto de escritura (inyectable en tests) ─────────────

export interface ReciboTx {
  hash: Hash;
  exitosa: boolean;
  bloque: bigint;
}

export interface PuertoCadena {
  /** Simula la llamada como el agente; tira el error de viem si revierte. */
  simular(fn: FuncionAgente): Promise<void>;
  /** Manda la tx. Con `gas`, no estima (sirve cuando la estimación usa un bloque con timestamp viejo). */
  enviar(fn: FuncionAgente, gas?: bigint): Promise<Hash>;
  esperar(hash: Hash): Promise<ReciboTx>;
}

export function crearPuertoCadena(clientes: Clientes, llave: Address): PuertoCadena | undefined {
  const { publico, billetera, cuenta } = clientes;
  if (billetera === undefined || cuenta === undefined) return undefined;
  return {
    simular: async (fn) => {
      await publico.simulateContract({ address: llave, abi: llaveAbi, functionName: fn, account: cuenta });
    },
    enviar: (fn, gas) =>
      billetera.writeContract({
        address: llave,
        abi: llaveAbi,
        functionName: fn,
        account: cuenta,
        chain: avalancheFuji,
        ...(gas !== undefined ? { gas } : {}),
      }),
    esperar: async (hash) => {
      const recibo = await publico.waitForTransactionReceipt({ hash, timeout: 60_000 });
      return { hash, exitosa: recibo.status === "success", bloque: recibo.blockNumber };
    },
  };
}
