/** Canal 'consola': siempre activo, para ver los avisos en la terminal del agente durante la demo. */
import type { Log } from "../log.js";
import type { Canal, Mensaje } from "./canal.js";

export function crearCanalConsola(log: Log): Canal {
  return {
    nombre: "consola",
    aplica: () => true,
    enviar: async (m: Mensaje) => {
      log.info(`📣 Aviso ${m.a === "dueno" ? "al dueño" : "a los herederos"} — ${m.asunto}\n    ${m.texto}`);
    },
  };
}
