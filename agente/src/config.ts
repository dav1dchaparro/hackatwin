/**
 * Lee y valida el entorno. Junta TODOS los problemas y los informa juntos, en castellano.
 *
 * AGENTE_PRIVATE_KEY se lee solo del entorno, se convierte en una cuenta de viem y no se guarda en ningún lado:
 * la config expone la cuenta (que firma sin mostrar la clave), nunca el string.
 */
import { getAddress, isAddress, type Address } from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";

export interface ConfigTelegram {
  token: string;
  chatIdDueno: string;
}

export interface ConfigEmail {
  apiKey: string;
  de: string;
  dueno?: string;
  /** cuenta heredera (checksum) → mail. */
  herederos: ReadonlyMap<Address, string>;
}

export interface Config {
  rpcUrl: string;
  llave: Address;
  /** Cuenta del agente (EOA atestada tier 5). Ausente solo en DRY_RUN sin clave. */
  cuenta?: PrivateKeyAccount;
  pollMs: number;
  /** Segundos restantes en los que se le recuerda al dueño, de mayor a menor. */
  umbralesS: readonly number[];
  webUrl: string;
  telegram?: ConfigTelegram;
  email?: ConfigEmail;
  anthropicApiKey?: string;
  dryRun: boolean;
  /** Advertencias no fatales (por ejemplo, un canal a medio configurar). */
  advertencias: readonly string[];
}

export class ErrorConfig extends Error {
  constructor(readonly problemas: readonly string[]) {
    super(`Configuración inválida:\n${problemas.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "ErrorConfig";
  }
}

type Entorno = Readonly<Record<string, string | undefined>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function valor(env: Entorno, nombre: string): string | undefined {
  const v = env[nombre]?.trim();
  return v === undefined || v === "" ? undefined : v;
}

export function cargarConfig(env: Entorno = process.env): Config {
  const problemas: string[] = [];
  const advertencias: string[] = [];

  // DRY_RUN
  const dryRunTexto = (valor(env, "DRY_RUN") ?? "false").toLowerCase();
  if (dryRunTexto !== "true" && dryRunTexto !== "false") {
    problemas.push(`DRY_RUN tiene que ser "true" o "false" (vino "${dryRunTexto}").`);
  }
  const dryRun = dryRunTexto === "true";

  // RPC
  const rpcUrl = valor(env, "FUJI_RPC_URL");
  if (rpcUrl === undefined) {
    problemas.push("Falta FUJI_RPC_URL (por ejemplo https://api.avax-test.network/ext/bc/C/rpc).");
  } else if (!/^https?:\/\/\S+$/.test(rpcUrl)) {
    problemas.push("FUJI_RPC_URL tiene que ser una URL http(s).");
  }

  // Llave
  const llaveTexto = valor(env, "LLAVE_ADDRESS");
  let llave: Address | undefined;
  if (llaveTexto === undefined) {
    problemas.push("Falta LLAVE_ADDRESS (la dirección del contrato Llave en Fuji; está en deployments/fuji.json).");
  } else if (!isAddress(llaveTexto, { strict: false })) {
    problemas.push("LLAVE_ADDRESS no es una dirección válida (0x seguido de 40 caracteres hexadecimales).");
  } else {
    llave = getAddress(llaveTexto);
  }

  // Clave del agente: nunca se loguea ni se guarda como texto.
  const clave = valor(env, "AGENTE_PRIVATE_KEY");
  let cuenta: PrivateKeyAccount | undefined;
  if (clave === undefined) {
    if (!dryRun) {
      problemas.push(
        "Falta AGENTE_PRIVATE_KEY (ponela solo en agente/.env, nunca en el repo). Para probar sin clave usá DRY_RUN=true.",
      );
    }
  } else if (!/^0x[0-9a-fA-F]{64}$/.test(clave)) {
    problemas.push("AGENTE_PRIVATE_KEY tiene que ser 0x seguido de 64 caracteres hexadecimales.");
  } else {
    cuenta = privateKeyToAccount(clave as `0x${string}`);
  }

  // POLL_MS
  const pollMs = Number(valor(env, "POLL_MS") ?? "5000");
  if (!Number.isInteger(pollMs) || pollMs < 1000) {
    problemas.push("POLL_MS tiene que ser un entero de al menos 1000 (milisegundos).");
  }

  // Umbrales
  const umbralesTexto = valor(env, "AVISOS_UMBRALES_S") ?? "30,10";
  const umbralesS = umbralesTexto
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number);
  if (umbralesS.some((u) => !Number.isInteger(u) || u <= 0)) {
    problemas.push(
      `AVISOS_UMBRALES_S tiene que ser una lista de segundos positivos, como "30,10" (vino "${umbralesTexto}").`,
    );
  }
  umbralesS.sort((a, b) => b - a);

  // Web
  const webUrl = (valor(env, "WEB_URL") ?? "http://localhost:5173").replace(/\/+$/, "");
  if (!/^https?:\/\/\S+$/.test(webUrl)) problemas.push("WEB_URL tiene que ser una URL http(s).");
  if (valor(env, "WEB_URL") === undefined)
    advertencias.push(`WEB_URL vacía: los links de los avisos apuntan a ${webUrl}.`);

  // Telegram: los dos datos o ninguno.
  const tgToken = valor(env, "TELEGRAM_BOT_TOKEN");
  const tgChat = valor(env, "TELEGRAM_CHAT_ID_DUENO");
  let telegram: ConfigTelegram | undefined;
  if (tgToken !== undefined && tgChat !== undefined) {
    telegram = { token: tgToken, chatIdDueno: tgChat };
  } else if (tgToken !== undefined || tgChat !== undefined) {
    advertencias.push(
      "Telegram a medio configurar (hacen falta TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID_DUENO): queda apagado.",
    );
  }

  // Mail (Resend)
  const resendKey = valor(env, "RESEND_API_KEY");
  const emailDe = valor(env, "EMAIL_DE");
  const emailDueno = valor(env, "EMAIL_DUENO");
  const emailsHerederosTexto = valor(env, "EMAILS_HEREDEROS");
  const herederos = new Map<Address, string>();
  if (emailsHerederosTexto !== undefined) {
    for (const par of emailsHerederosTexto
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")) {
      const separador = par.indexOf(":");
      const cuentaH = par.slice(0, separador).trim();
      const mail = par.slice(separador + 1).trim();
      if (separador < 0 || !isAddress(cuentaH, { strict: false }) || !EMAIL_RE.test(mail)) {
        problemas.push(`EMAILS_HEREDEROS: "${par}" no tiene la forma 0xcuenta:mail.`);
        continue;
      }
      herederos.set(getAddress(cuentaH), mail);
    }
  }
  if (emailDueno !== undefined && !EMAIL_RE.test(emailDueno)) problemas.push("EMAIL_DUENO no es un mail válido.");
  let email: ConfigEmail | undefined;
  const hayDestinos = emailDueno !== undefined || herederos.size > 0;
  if (resendKey !== undefined && emailDe !== undefined && hayDestinos) {
    email = { apiKey: resendKey, de: emailDe, herederos, ...(emailDueno !== undefined ? { dueno: emailDueno } : {}) };
  } else if (resendKey !== undefined || emailDe !== undefined || hayDestinos) {
    advertencias.push(
      "Mail a medio configurar (hacen falta RESEND_API_KEY, EMAIL_DE y EMAIL_DUENO o EMAILS_HEREDEROS): queda apagado.",
    );
  }

  if (problemas.length > 0 || rpcUrl === undefined || llave === undefined) throw new ErrorConfig(problemas);

  const anthropicApiKey = valor(env, "ANTHROPIC_API_KEY");
  return {
    rpcUrl,
    llave,
    pollMs,
    umbralesS,
    webUrl,
    dryRun,
    advertencias,
    ...(cuenta !== undefined ? { cuenta } : {}),
    ...(telegram !== undefined ? { telegram } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(anthropicApiKey !== undefined ? { anthropicApiKey } : {}),
  };
}
