/**
 * Canal mail vía Resend (https://api.resend.com/emails). Al dueño, a EMAIL_DUENO; a los herederos, un mail por
 * cada uno de EMAILS_HEREDEROS (así nadie ve el mail de los demás), filtrado por los herederos on-chain que trae
 * el mensaje: un mail configurado de alguien que ya no es heredero no recibe nada.
 */
import type { ConfigEmail } from "../config.js";
import type { Canal, Mensaje } from "./canal.js";
import { ErrorEnvio, TIMEOUT_CANAL_MS } from "./canal.js";

export function crearCanalEmail(config: ConfigEmail, hacerFetch: typeof fetch = fetch): Canal {
  const destinos = (m: Mensaje): string[] => {
    if (m.a === "dueno") return config.dueno !== undefined ? [config.dueno] : [];
    if (m.cuentas === undefined) return [...config.herederos.values()];
    const vigentes = new Set(m.cuentas.map((c) => c.toLowerCase()));
    return [...config.herederos].filter(([cuenta]) => vigentes.has(cuenta.toLowerCase())).map(([, mail]) => mail);
  };

  async function mandarUno(para: string, m: Mensaje): Promise<void> {
    const respuesta = await hacerFetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_CANAL_MS),
      headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ from: config.de, to: [para], subject: m.asunto, text: m.texto }),
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => "");
      throw new Error(`Resend respondió ${respuesta.status} para ${para}: ${detalle.slice(0, 200)}`);
    }
  }

  return {
    nombre: "mail",
    aplica: (a) => destinos({ a, asunto: "", texto: "" }).length > 0,
    enviar: async (m: Mensaje) => {
      const resultados = await Promise.allSettled(destinos(m).map((para) => mandarUno(para, m)));
      const fallas = resultados.filter((r): r is PromiseRejectedResult => r.status === "rejected");
      if (fallas.length > 0) {
        const detalle = fallas.map((f) => (f.reason instanceof Error ? f.reason.message : String(f.reason))).join("; ");
        // Si a alguno le llegó, no reintentamos (duplicaría el mail a los que sí lo recibieron).
        throw new ErrorEnvio(detalle, fallas.length < resultados.length);
      }
    },
  };
}
