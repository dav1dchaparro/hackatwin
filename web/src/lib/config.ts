/**
 * Configuración de la web: env, chain Fuji de viem, direcciones y alias.
 * Prioridad de la dirección de la llave: `?llave=0x…` en la URL > `VITE_LLAVE_ADDRESS` > `deployments.fuji.json → llave.A`.
 * Así cada ensayo con una instancia nueva no recompila la web.
 */
import type { Address, Hash } from "viem";
import { avalancheFuji } from "viem/chains";
import { DEPLOYMENTS } from "@kumply/sdk";

/** Forma de `deployments/fuji.json` (P1 es la única fuente de verdad; `export-abi.mjs` lo copia a web/src/abi/). */
export interface Deployments {
  chainId?: number;
  actualizado?: string;
  kumplyStore?: string;
  attestationStoreEnUso?: string;
  mockPesos?: string;
  llave?: { A?: string; B?: string };
  demo?: {
    periodoMinimo?: number;
    plazoInactividad?: number;
    plazoGracia?: number;
    topeEmergenciaBps?: number;
    demoraVeto?: number;
  };
  tesoreria?: string;
  comisionBps?: number;
  /** EOA del agente ejecutor (KUMPLY tier 5) */
  agente?: { cuenta: string; tier?: number; tipo?: string };
  cuentas?: Record<string, { rol: string; cuenta: string; tipo?: string; tier?: number; bps?: number }>;
  fixturesKumply?: Record<string, string>;
}

// P1 genera web/src/abi/deployments.fuji.json. Mientras no exista, el glob devuelve {} y la web compila igual.
const globDeployments = import.meta.glob("../abi/deployments.fuji.json", {
  eager: true,
  import: "default",
}) as Record<string, Deployments>;
export const deployments: Deployments = Object.values(globDeployments)[0] ?? {};

const env = import.meta.env;
const CERO = "0x0000000000000000000000000000000000000000";

export function esDireccion(a: unknown): a is Address {
  return typeof a === "string" && /^0x[0-9a-fA-F]{40}$/.test(a);
}
function noCero(a: unknown): Address | undefined {
  return esDireccion(a) && a.toLowerCase() !== CERO ? a : undefined;
}
function param(nombre: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get(nombre) ?? undefined;
}

const apiKey: string = String(env.VITE_OXGASLESS_API_KEY ?? "").trim();
const chainId = Number(env.VITE_CHAIN_ID ?? 43113);

export const config = {
  modo: (env.VITE_MODO === "fuji" ? "fuji" : "mock") as "mock" | "fuji",
  chainId,
  rpcUrl: String(env.VITE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"),
  explorer: String(env.VITE_EXPLORER || "https://testnet.snowtrace.io").replace(/\/$/, ""),
  /** AttestationStore de KUMPLY en Fuji (o el DemoAttestationStore del plan B, vía fuji.json → attestationStoreEnUso). */
  kumplyStore:
    noCero(env.VITE_KUMPLY_STORE) ??
    noCero(deployments.attestationStoreEnUso) ??
    noCero(deployments.kumplyStore) ??
    (DEPLOYMENTS.fuji.attestationStore as Address),
  oxgasless: {
    apiKey,
    bundlerUrl: String(env.VITE_OXGASLESS_BUNDLER_URL || `https://bundler.0xgasless.com/${chainId}`),
    /** Paymaster por defecto del dashboard. `VITE_PAYMASTER_URL` (plan §8.2) lo pisa si el staff habilita un lane. [SIN VERIFICAR el formato de la URL por defecto] */
    paymasterUrl: String(
      env.VITE_PAYMASTER_URL ||
        env.VITE_OXGASLESS_PAYMASTER_URL ||
        `https://paymaster.0xgasless.com/v1/${chainId}/rpc/${apiKey}`,
    ),
    debug: env.VITE_OXGASLESS_DEBUG === "true" || env.DEV === true,
  },
  /** P2-8: política de patrocinio en el cliente (solo manda userOps si la SA es la dueña o pasa isPersonAtLeast(sa, 2)). `VITE_POLITICA_PATROCINIO=off` la apaga. */
  politicaPatrocinio: env.VITE_POLITICA_PATROCINIO !== "off",
  /** lecturas: un `estado()` por ciclo */
  pollMs: 2000,
  /** NIVEL_PERSONA del contrato */
  nivelPersona: 2,
  /** margen para la cuenta regresiva (reloj local vs block.timestamp) */
  margenSegundos: 2,
};

export const chain = {
  ...avalancheFuji,
  id: config.chainId,
  rpcUrls: { default: { http: [config.rpcUrl] } },
};

export function direccionLlave(): Address | undefined {
  return noCero(param("llave")) ?? noCero(env.VITE_LLAVE_ADDRESS) ?? noCero(deployments.llave?.A);
}
export function direccionPesos(): Address | undefined {
  return noCero(param("pesos")) ?? noCero(env.VITE_PESOS_ADDRESS) ?? noCero(deployments.mockPesos);
}
/** EOA del agente ejecutor (KUMPLY tier 5): `VITE_AGENTE_ADDRESS` > `deployments.fuji.json → agente.cuenta`. */
export function direccionAgente(): Address | undefined {
  return (
    noCero(env.VITE_AGENTE_ADDRESS) ?? noCero(deployments.agente?.cuenta) ?? noCero(deployments.cuentas?.agente?.cuenta)
  );
}

export function urlTx(hash: Hash | string): string {
  return `${config.explorer}/tx/${hash}`;
}
export function urlCuenta(cuenta: Address | string): string {
  return `${config.explorer}/address/${cuenta}`;
}
export function acortar(a: string): string {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

/**
 * Alias humano de una cuenta: `deployments.fuji.json → cuentas` (Marta, Lucía…), después
 * `localStorage["llave.alias"]` = {"0x…": "Marta"} (para ensayos sin recompilar), y si no, la dirección acortada.
 */
export function aliasDe(cuenta: Address | string | null | undefined): string {
  if (!cuenta) return "";
  const c = cuenta.toLowerCase();
  if (deployments.agente?.cuenta?.toLowerCase() === c) return "Agente";
  for (const [alias, info] of Object.entries(deployments.cuentas ?? {})) {
    if (info?.cuenta?.toLowerCase() === c) return alias.charAt(0).toUpperCase() + alias.slice(1);
  }
  try {
    const locales = JSON.parse(localStorage.getItem("llave.alias") ?? "{}") as Record<string, string>;
    const k = Object.keys(locales).find((x) => x.toLowerCase() === c);
    if (k) return locales[k];
  } catch {
    /* sin localStorage */
  }
  return acortar(cuenta);
}
