/**
 * Canal Telegram: Bot API `sendMessage` al chat del dueño. Cómo crear el bot y sacar el chat id: README.md.
 */
import type { ConfigTelegram } from "../config.js";
import type { Canal, Mensaje } from "./canal.js";
import { TIMEOUT_CANAL_MS } from "./canal.js";

interface RespuestaTelegram {
  ok: boolean;
  description?: string;
}

export function crearCanalTelegram(config: ConfigTelegram, hacerFetch: typeof fetch = fetch): Canal {
  return {
    nombre: "telegram",
    // Solo conocemos el chat del dueño; a los herederos se les escribe por mail.
    aplica: (a) => a === "dueno",
    enviar: async (m: Mensaje) => {
      const respuesta = await hacerFetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
        method: "POST",
        signal: AbortSignal.timeout(TIMEOUT_CANAL_MS),
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatIdDueno,
          text: `${m.asunto}\n\n${m.texto}`,
          disable_web_page_preview: true,
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => ({ ok: false }))) as RespuestaTelegram;
      if (!respuesta.ok || !cuerpo.ok) {
        // No incluimos la URL: lleva el token del bot.
        throw new Error(`Telegram respondió ${respuesta.status}: ${cuerpo.description ?? "sin detalle"}`);
      }
    },
  };
}
