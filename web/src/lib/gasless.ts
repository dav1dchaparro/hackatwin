/**
 * Sesión con email y transacciones patrocinadas: embedded wallet de 0xGasless + smart account ERC-4337 (SA).
 *
 * Reglas (mejora 13, bonus 0xGasless core):
 * - TODA tx del usuario sale de la SA con gas patrocinado por el paymaster de 0xGasless. La web nunca firma con una EOA.
 * - La dirección que ve el contrato (msg.sender) y la que atesta KUMPLY es la SA, no la EOA del KMS.
 * - La API key vive en `web/.env.local` (VITE_OXGASLESS_API_KEY), nunca en el repo.
 *
 * Sesión persistida: el widget de 0xGasless recuerda el login dentro de su iframe; nosotros guardamos
 * {email, SA, alias} en localStorage para que la UI arranque al instante y `reconectar()` re-arme el cliente tras un F5.
 */
import { OxGasClient } from "@0xgasless/core";
import type { Address, Hash, Hex } from "viem";
import { aliasDe, config, urlTx } from "./config";
import { clientePublico } from "./rpc";
import type { Sesion } from "./tipos";

export interface Llamada {
  to: Address;
  data?: Hex;
  value?: bigint;
}

export interface Envio {
  hash: Hash;
  url: string;
  /** ms desde que se mandó hasta el receipt (incluye el bundler) */
  ms: number;
  userOpHash?: Hash;
}

const CLAVE_SESION = "llave.sesion";
/** id del iframe que inyecta el SDK (constants.IFRAME_ID) */
const IFRAME_ID = "oxgas-auth-iframe";
/** cuánto esperamos a que el widget restaure solo la sesión antes de mostrarlo */
const ESPERA_SILENCIOSA_MS = 2500;

interface Conexion {
  cuenta: Address;
  eoa: Address;
  email: string;
}

let cliente: OxGasClient | null = null;
let conectando: Promise<Conexion> | null = null;
const oyentes = new Set<(s: Sesion | null) => void>();

export function hayApiKey(): boolean {
  return config.oxgasless.apiKey.length > 0;
}

/** Cliente único de 0xGasless (se crea recién cuando hace falta: el iframe solo aparece al entrar). */
export function clienteGasless(): OxGasClient {
  if (!cliente) {
    if (!hayApiKey()) {
      throw new Error("Falta VITE_OXGASLESS_API_KEY en web/.env.local (se crea en el dashboard de 0xGasless).");
    }
    cliente = new OxGasClient({
      apiKey: config.oxgasless.apiKey,
      chainId: config.chainId,
      bundlerUrl: config.oxgasless.bundlerUrl,
      paymasterUrl: config.oxgasless.paymasterUrl,
      rpcUrl: config.rpcUrl,
      debug: config.oxgasless.debug,
    });
  }
  return cliente;
}

/** Sesión guardada (sobrevive a F5). No garantiza que el widget esté conectado: para eso, `reconectar()`. */
export function sesion(): Sesion | null {
  try {
    const crudo = localStorage.getItem(CLAVE_SESION);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}

function guardar(s: Sesion | null): void {
  try {
    if (s) localStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* sin localStorage (modo privado): la sesión vive solo en memoria del widget */
  }
  for (const cb of oyentes) cb(s);
}

/** Avisa cuando cambia la sesión (entrar / salir / reconectar). Devuelve "desuscribir". */
export function onSesion(cb: (s: Sesion | null) => void): () => void {
  oyentes.add(cb);
  return () => {
    oyentes.delete(cb);
  };
}

function iframeWidget(): HTMLIFrameElement | null {
  return typeof document === "undefined" ? null : (document.getElementById(IFRAME_ID) as HTMLIFrameElement | null);
}

/**
 * login() del widget + setupSmartAccount(). Si `silencioso`, oculta el iframe mientras el widget restaura la
 * sesión guardada y solo lo muestra si pasado un rato sigue esperando al usuario.
 */
async function conectar(silencioso: boolean): Promise<Conexion> {
  if (conectando) return conectando;
  conectando = (async () => {
    const c = clienteGasless();
    let mostrar: ReturnType<typeof setTimeout> | undefined;
    try {
      // login() inyecta el iframe de forma sincrónica antes de su primer await: podemos ocultarlo acá mismo.
      const promesaLogin = c.login();
      if (silencioso) {
        const f = iframeWidget();
        if (f) f.style.display = "none";
        mostrar = setTimeout(() => {
          const g = iframeWidget();
          if (g) g.style.display = "block";
        }, ESPERA_SILENCIOSA_MS);
      }
      const w = await promesaLogin;
      const cuenta = await c.setupSmartAccount();
      return { cuenta, eoa: w.address, email: w.email };
    } finally {
      if (mostrar) clearTimeout(mostrar);
      conectando = null;
    }
  })();
  return conectando;
}

function armarSesion(x: Conexion): Sesion {
  const alias = aliasDe(x.cuenta);
  return {
    email: x.email,
    cuenta: x.cuenta,
    eoa: x.eoa,
    alias: alias && !alias.includes("…") ? alias : x.email.split("@")[0],
  };
}

/**
 * Entrar con email: abre el widget de 0xGasless (email + código), deriva la smart account y guarda la sesión.
 * El email lo pide el widget; el parámetro queda solo como alias sugerido si la cuenta no está en fuji.json.
 */
export async function entrar(aliasSugerido?: string): Promise<Sesion> {
  const s = armarSesion(await conectar(false));
  if (aliasSugerido && s.alias === s.email.split("@")[0]) s.alias = aliasSugerido;
  guardar(s);
  return s;
}

/** Tras un F5: si había sesión guardada, re-arma el cliente con el login que el widget recuerda. */
export async function reconectar(): Promise<Sesion | null> {
  const previa = sesion();
  if (!previa || !hayApiKey()) return previa;
  try {
    const nueva = armarSesion(await conectar(true));
    if (previa.alias && nueva.alias === nueva.email.split("@")[0]) nueva.alias = previa.alias;
    if (nueva.cuenta !== previa.cuenta || nueva.email !== previa.email || nueva.alias !== previa.alias) guardar(nueva);
    return nueva;
  } catch (e) {
    console.warn("[gasless] no se pudo restaurar la sesión:", e);
    guardar(null);
    return null;
  }
}

export async function salir(): Promise<void> {
  try {
    if (cliente) await cliente.logout();
  } finally {
    guardar(null);
  }
}

/** Smart account activa (conecta si hace falta). */
export async function cuentaActiva(): Promise<Address> {
  const c = clienteGasless();
  if (c.smartAccountAddress) return c.smartAccountAddress;
  return (await conectar(sesion() !== null)).cuenta;
}

/** AVAX de la smart account: tiene que ser 0 siempre (captura para el README, bonus G1). */
export async function saldoAvax(): Promise<bigint> {
  await cuentaActiva();
  return clienteGasless().getNativeBalance();
}

/**
 * Manda una o varias llamadas en UNA userOp patrocinada y espera el receipt.
 * Una llamada → `sendTransaction`; varias → `sendBatchTransactions` (ej. faucet + approve + depositar).
 */
export async function enviar(llamadas: Llamada[]): Promise<Envio> {
  if (llamadas.length === 0) throw new Error("Nada que enviar.");
  await cuentaActiva();
  const c = clienteGasless();
  // `ms` mide desde que el usuario FIRMÓ (no desde el clic): el tiempo humano en el widget no cuenta.
  let t0 = performance.now();
  const offFirma = c.auth.on("signatureComplete", () => {
    t0 = performance.now();
  });
  let resp: Awaited<ReturnType<OxGasClient["sendTransaction"]>>;
  try {
    resp = llamadas.length === 1 ? await c.sendTransaction(llamadas[0]) : await c.sendBatchTransactions(llamadas);
  } finally {
    offFirma();
  }
  if (resp.error) {
    throw new Error(`0xGasless rechazó la operación: ${resp.error.message} (código ${resp.error.code})`);
  }
  // `wait()` del SDK consulta el receipt cada 5 s: infla la medición. Pedimos el hash apenas el bundler lo tiene
  // (`waitForTxHash`, cada 0,5 s) y esperamos la inclusión con viem cada 300 ms. Si el bundler no lo soporta, `wait()`.
  let hash: Hash | undefined;
  try {
    const estado = await resp.waitForTxHash();
    hash = (estado?.transactionHash ?? estado?.userOperationReceipt?.receipt?.transactionHash) as Hash | undefined;
  } catch (e) {
    console.warn("[gasless] waitForTxHash no disponible, uso wait():", e);
  }
  if (hash) {
    const recibo = await clientePublico().waitForTransactionReceipt({ hash, pollingInterval: 300 });
    const ms = Math.round(performance.now() - t0);
    if (recibo.status === "reverted") throw new Error(`La operación se incluyó pero revirtió (${urlTx(hash)})`);
    return { hash, url: urlTx(hash), ms, userOpHash: (resp.userOpHash ?? undefined) as Hash | undefined };
  }
  const rec = await resp.wait();
  const ms = Math.round(performance.now() - t0);
  const recibo = (rec?.receipt ?? {}) as { transactionHash?: Hash; hash?: Hash };
  hash = recibo.transactionHash ?? recibo.hash;
  if (String(rec?.success) === "false") {
    throw new Error(
      `La operación se incluyó pero revirtió${rec.reason ? `: ${rec.reason}` : ""}${hash ? ` (${urlTx(hash)})` : ""}`,
    );
  }
  if (!hash) throw new Error("0xGasless no devolvió el hash de la transacción.");
  return { hash, url: urlTx(hash), ms, userOpHash: (resp.userOpHash ?? undefined) as Hash | undefined };
}
