/**
 * Semáforo de identidad con `@kumply/sdk` (bonus KUMPLY core, K1).
 * Reglas (las mismas que `KumplyGated` en el contrato): persona = ok && 2 ≤ tier ≤ 3; empresa = ok && tier == 4;
 * **agente = ok && tier == 5** (el gate de `iniciarReclamo()` y `liberar()`). Nunca `hasTier()`.
 * Si el SDK falla, el fallback a `verify()` del store con viem es DECLARADO (mejora 13): `fuente: "contrato"` + warning.
 */
import { KumplyClient, TIER } from "@kumply/sdk";
import type { Address } from "viem";
import { kumplyStoreAbi } from "./abi-llave";
import { config } from "./config";
import { clientePublico } from "./rpc";
import type { Verificacion } from "./tipos";

/**
 * Fixtures públicos del store de Fuji, VERIFICADOS con `@kumply/sdk` el 7/11/2026 14:30:
 * - `0x2260…C599` → tier 3 (persona, vence 17/07/2027).
 * - `0x7Fc6…DaE9` → tier 4 (empresa KYB, vence 17/07/2027).
 * - `0x1F98…F984` (el "tier 2" del plan) HOY NO tiene atestación (verified=false, tier 0): sirve como caso bloqueado.
 * - `0x9f8F…79A2` → tier 5 (agente KYA, vence 17/07/2027): verificado 15:05 con `isAgent`. Es el fixture de
 *   `deployments/fuji.json → fixturesKumply.agenteTier5`; el agente real de la demo es la EOA de `agente/` (P1).
 */
export const FIXTURES_KUMPLY = {
  agente5: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2" as Address,
  persona3: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address,
  empresa: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" as Address,
  sinVerificar: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" as Address,
};

let sdk: KumplyClient | null = null;
let fuenteActiva: Verificacion["fuente"] = "kumply-sdk";
let motivoFallback: string | null = null;
const cache = new Map<string, { v: Verificacion; t: number }>();
const TTL_MS = 15_000;

function kumply(): KumplyClient {
  if (!sdk) {
    sdk = new KumplyClient({ network: "fuji", contractAddress: config.kumplyStore, rpcUrl: config.rpcUrl });
  }
  return sdk;
}

/** Para el chip de la UI: qué fuente está respondiendo y por qué (si hubo fallback). */
export function fuenteKumply(): { fuente: Verificacion["fuente"]; motivo: string | null; store: Address } {
  return { fuente: fuenteActiva, motivo: motivoFallback, store: config.kumplyStore };
}

function armar(ok: boolean, tier: number, fuente: Verificacion["fuente"]): Verificacion {
  return {
    ok,
    tier,
    esPersona: ok && tier >= config.nivelPersona && tier <= 3,
    esEmpresa: ok && tier === 4,
    esAgente: ok && tier === 5,
    fuente,
  };
}

export async function verificar(cuenta: Address, opciones?: { sinCache?: boolean }): Promise<Verificacion> {
  const clave = cuenta.toLowerCase();
  const hit = cache.get(clave);
  if (!opciones?.sinCache && hit && Date.now() - hit.t < TTL_MS) return hit.v;

  let v: Verificacion;
  try {
    const c = kumply();
    const [r, esPersona, esEmpresa, esAgente] = await Promise.all([
      c.verify(cuenta),
      c.isPersonAtLeast(cuenta, TIER.STANDARD),
      c.isBusiness(cuenta),
      c.isAgent(cuenta),
    ]);
    v = { ok: r.verified, tier: r.tier, esPersona, esEmpresa, esAgente, fuente: "kumply-sdk" };
    fuenteActiva = "kumply-sdk";
    motivoFallback = null;
  } catch (e) {
    motivoFallback = e instanceof Error ? e.message : String(e);
    fuenteActiva = "contrato";
    console.warn(`[kumply] @kumply/sdk falló; fallback DECLARADO a verify() del store con viem: ${motivoFallback}`);
    const [ok, tier] = await clientePublico().readContract({
      address: config.kumplyStore,
      abi: kumplyStoreAbi,
      functionName: "verify",
      args: [cuenta],
    });
    v = armar(ok, Number(tier), "contrato");
  }
  cache.set(clave, { v, t: Date.now() });
  return v;
}

export function limpiarCacheKumply(): void {
  cache.clear();
}
