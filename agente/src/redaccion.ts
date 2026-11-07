/**
 * Redacción de los avisos: plantillas en castellano, sin jerga cripto ("tu Llave", "comprobante", "cuenta").
 *
 * Las plantillas son funciones puras: `decidir()` las usa para armar el texto de cada aviso. La reescritura con
 * Claude (`reescribir`) es OPCIONAL y cosmética: corre después de decidir, solo si hay ANTHROPIC_API_KEY, con
 * timeout de 5 s, y ante cualquier problema vuelve a la plantilla. Ninguna decisión depende del LLM.
 */
import { formatUnits, type Address, type Hash } from "viem";
import type { Heredero, InfoToken } from "./tipos.js";

/** Explorador de Fuji donde el comprobante (la tx) se puede ver sin cuenta. */
export const EXPLORADOR_TX = "https://testnet.snowtrace.io/tx/";

export interface TextoAviso {
  asunto: string;
  texto: string;
}

// ───────────── Formateo ─────────────

function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

/** 90061 → "1 día y 1 hora"; 75 → "1 minuto y 15 segundos"; 25 → "25 segundos". Máximo dos unidades. */
export function formatDuracion(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const unidades: Array<[number, string, string]> = [
    [86_400, "día", "días"],
    [3_600, "hora", "horas"],
    [60, "minuto", "minutos"],
    [1, "segundo", "segundos"],
  ];
  const partes: string[] = [];
  let resto = s;
  for (const [tam, sing, plu] of unidades) {
    const n = Math.floor(resto / tam);
    if (n > 0 && partes.length < 2) {
      partes.push(plural(n, sing, plu));
      resto -= n * tam;
    } else if (partes.length > 0) {
      break; // solo unidades contiguas: "1 día y 1 hora", nunca "1 día y 3 segundos"
    }
  }
  if (partes.length === 0) return "0 segundos";
  return partes.join(" y ");
}

/**
 * Segundos UNIX → "07/11 18:00" (o "07/11 18:00:30" con `conSegundos`, útil en la demo de plazos cortos) en la
 * zona horaria pedida o la del sistema.
 */
export function formatHora(segundosUnix: number, zonaHoraria?: string, conSegundos = false): string {
  const opciones: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  };
  if (zonaHoraria !== undefined) opciones.timeZone = zonaHoraria;
  // Se arma a mano con las partes: el formato de "es-AR" cambia entre versiones de ICU (con o sin cero a la izquierda).
  const partes = new Intl.DateTimeFormat("es-AR", opciones).formatToParts(new Date(segundosUnix * 1000));
  const p = (tipo: Intl.DateTimeFormatPartTypes): string =>
    (partes.find((x) => x.type === tipo)?.value ?? "00").padStart(2, "0");
  return `${p("day")}/${p("month")} ${p("hour")}:${p("minute")}${conSegundos ? `:${p("second")}` : ""}`;
}

/** 594000 × 10^18 → "594.000 PESOS". Hasta 2 decimales, separador de miles con punto. */
export function formatMonto(monto: bigint, token: InfoToken): string {
  const [entero = "0", decimales = ""] = formatUnits(monto, token.decimales).split(".");
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dec = decimales.slice(0, 2).replace(/0+$/, "");
  return `${conMiles}${dec.length > 0 ? `,${dec}` : ""} ${token.simbolo}`;
}

/** 0x1234…abcd → "cuenta terminada en abcd". */
export function describirCuenta(cuenta: Address): string {
  return `cuenta terminada en ${cuenta.slice(-4).toLowerCase()}`;
}

/** 100 bps → "1%"; 50 → "0,5%". */
export function formatPorcentaje(bps: number): string {
  return `${(bps / 100).toLocaleString("es-AR", { maximumFractionDigits: 2 })}%`;
}

// ───────────── Plantillas ─────────────

export function plantillaRecordatorio(restanteSeg: number, webUrl: string): TextoAviso {
  return {
    asunto: "Tu Llave: tocá «Estoy bien»",
    texto:
      `Hola. Te quedan ${formatDuracion(restanteSeg)} para tocar "Estoy bien" en tu Llave. ` +
      `Si no lo hacés, empieza un período de gracia antes de que la plata se envíe a tus herederos. ` +
      `Entrá acá: ${webUrl}/dueno`,
  };
}

/** Con plazos de demo (menos de una hora) las horas se muestran con segundos. */
export const UMBRAL_SEGUNDOS_S = 3_600;

export function plantillaVencida(
  finGracia: number,
  webUrl: string,
  zonaHoraria?: string,
  conSegundos = false,
): TextoAviso {
  return {
    asunto: "Tu Llave venció: período de gracia",
    texto:
      `Venció el plazo de tu Llave sin señales tuyas. Se abre un período de gracia que termina el ` +
      `${formatHora(finGracia, zonaHoraria, conSegundos)}. Si estás bien, tocá "Estoy bien" y no se envía nada: ${webUrl}/dueno`,
  };
}

/** Vencida, pero el agente hoy no puede abrir la gracia (no es tier 5 o corre en DRY_RUN). */
export function plantillaVencidaSinAgente(webUrl: string): TextoAviso {
  return {
    asunto: "Tu Llave venció",
    texto: `Venció el plazo de tu Llave sin señales tuyas. Si estás bien, tocá "Estoy bien" para reiniciarlo: ${webUrl}/dueno`,
  };
}

export function plantillaEnGracia(
  finGracia: number,
  webUrl: string,
  zonaHoraria?: string,
  conSegundos = false,
): TextoAviso {
  return {
    asunto: "Tu Llave está en período de gracia",
    texto:
      `Tu Llave está en período de gracia hasta el ${formatHora(finGracia, zonaHoraria, conSegundos)}. ` +
      `Si estás bien, cancelalo tocando "Estoy bien": ${webUrl}/dueno. ` +
      `Cuando termine la gracia, la plata se envía sola a tus herederos.`,
  };
}

export function plantillaVacia(webUrl: string): TextoAviso {
  return {
    asunto: "Tu Llave venció, pero está vacía",
    texto:
      `Venció el plazo de tu Llave, pero no tiene saldo: no hay nada para enviar a tus herederos. ` +
      `Podés revisarla acá: ${webUrl}/dueno`,
  };
}

export interface DatosLiberacion {
  total: bigint;
  comision: bigint;
  comisionBps: number;
  partes: ReadonlyArray<{ heredero: Heredero; monto: bigint }>;
  hash?: Hash | undefined;
  token: InfoToken;
  webUrl: string;
}

function lineasLiberacion(d: DatosLiberacion): string {
  const partes = d.partes
    .map((p) => `${describirCuenta(p.heredero.cuenta)}: ${formatMonto(p.monto, d.token)}`)
    .join("; ");
  const comision =
    d.comision > 0n
      ? ` Comisión del servicio (${formatPorcentaje(d.comisionBps)}): ${formatMonto(d.comision, d.token)}.`
      : "";
  const comprobante =
    d.hash !== undefined ? ` Comprobante: ${EXPLORADOR_TX}${d.hash}` : ` Podés ver el detalle en ${d.webUrl}`;
  return `Total: ${formatMonto(d.total, d.token)}.${comision} Recibieron: ${partes}.${comprobante}`;
}

export function plantillaLiberadaDueno(d: DatosLiberacion): TextoAviso {
  return {
    asunto: "Tu Llave envió la herencia",
    texto: `Terminó el período de gracia y tu Llave envió la herencia a tus herederos. ${lineasLiberacion(d)}`,
  };
}

export function plantillaLiberadaHerederos(d: DatosLiberacion): TextoAviso {
  return {
    asunto: "Recibiste una herencia de una Llave",
    texto:
      `Hola. Una Llave en la que figurás como heredero envió la herencia; la plata ya está en tu cuenta, ` +
      `no tenés que hacer nada. ${lineasLiberacion(d)}`,
  };
}

export function plantillaAgenteNoVerificado(tier: number): TextoAviso {
  return {
    asunto: "Aviso técnico de tu Llave",
    texto:
      `Aviso técnico: el agente no está verificado por KUMPLY (tier ${tier}; hace falta tier 5). ` +
      `Mientras tanto solo puede avisar: no puede abrir el período de gracia ni enviar la herencia.`,
  };
}

// ───────────── Reescritura opcional con Claude ─────────────

/** Modelo para la reescritura (ver skill claude-api). Es cosmético: si falla, queda la plantilla. */
export const MODELO_REESCRITURA = "claude-opus-5-5";
export const TIMEOUT_REESCRITURA_MS = 5_000;

const INSTRUCCIONES_REESCRITURA =
  "Reescribí el aviso que te paso para que suene cálido y claro, en castellano rioplatense, en no más de 4 " +
  "oraciones. Es para una persona sin conocimientos técnicos: no uses palabras como blockchain, cripto, wallet, " +
  "token, hash, smart contract ni transacción. Conservá EXACTAMENTE todos los números, montos, fechas, horas, " +
  "links y nombres que aparecen. No agregues información nueva. Respondé solo con el texto del aviso.";

export interface OpcionesReescritura {
  apiKey: string;
  timeoutMs?: number;
  /** Inyectable para tests. */
  fetch?: typeof fetch;
}

const RE_LINK = /https?:\/\/\S+?(?=[\s.,;]*(?:\s|$))/g;

/** Fragmentos que la reescritura tiene que conservar sí o sí: links y números. */
function fragmentosObligatorios(texto: string): string[] {
  const links = texto.match(RE_LINK) ?? [];
  const numeros = texto.match(/\d[\d.,:/]*\d|\d/g) ?? [];
  return [...links, ...numeros];
}

/**
 * Fragmentos "de destino" (links, dominios sueltos y direcciones 0x) que la reescritura NO puede inventar: un aviso
 * de herencia con un link o una cuenta que no estaba en la plantilla sería un vector de phishing.
 */
function destinos(texto: string): string[] {
  const links = texto.match(RE_LINK) ?? [];
  const dominios = texto.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi) ?? [];
  const cuentas = texto.match(/0x[0-9a-fA-F]{6,}/g) ?? [];
  return [...links, ...dominios, ...cuentas].map((f) => f.toLowerCase());
}

/** `true` si `nuevo` trae algún link, dominio o dirección 0x que no aparece en la plantilla `original`. */
export function agregaDestinos(original: string, nuevo: string): boolean {
  const permitidos = new Set(destinos(original));
  const enOriginal = original.toLowerCase();
  return destinos(nuevo).some((f) => !permitidos.has(f) && !enOriginal.includes(f));
}

interface RespuestaMessages {
  stop_reason?: string | null;
  content?: Array<{ type: string; text?: string }>;
}

/**
 * Reescribe `texto` con la Messages API. Devuelve la plantilla original si no hay respuesta en `timeoutMs`, si
 * la API falla o rechaza, si el resultado perdió algún link o número, o si agregó un link, dominio o dirección 0x
 * que no estaba en la plantilla.
 */
export async function reescribir(texto: string, opciones: OpcionesReescritura): Promise<string> {
  const hacerFetch = opciones.fetch ?? fetch;
  try {
    const respuesta = await hacerFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(opciones.timeoutMs ?? TIMEOUT_REESCRITURA_MS),
      headers: {
        "content-type": "application/json",
        "x-api-key": opciones.apiKey,
        "anthropic-version": "2026-10-21",
        "anthropic-beta": "server-side-fallback-2026-07-01",
      },
      body: JSON.stringify({
        model: MODELO_REESCRITURA,
        max_tokens: 1024,
        output_config: { effort: "low" },
        fallbacks: "default",
        system: INSTRUCCIONES_REESCRITURA,
        messages: [{ role: "user", content: texto }],
      }),
    });
    if (!respuesta.ok) return texto;
    const cuerpo = (await respuesta.json()) as RespuestaMessages;
    if (cuerpo.stop_reason === "refusal" || cuerpo.stop_reason === "max_tokens") return texto;
    const nuevo = (cuerpo.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("")
      .trim();
    if (nuevo.length === 0) return texto;
    const falta = fragmentosObligatorios(texto).some((f) => !nuevo.includes(f));
    return falta || agregaDestinos(texto, nuevo) ? texto : nuevo;
  } catch {
    return texto; // timeout, red, JSON inválido: la plantilla siempre alcanza
  }
}
