/**
 * Reparte cada aviso por todos los canales que aplican. Un canal sin credenciales directamente no existe (se
 * avisa una vez al arrancar); un canal que falla se loguea y no rompe a los demás.
 */
import type { Config } from "../config.js";
import { mensajeDe, type Log } from "../log.js";
import { reescribir } from "../redaccion.js";
import type { AccionAviso } from "../tipos.js";
import { ErrorEnvio, type Canal, type Mensaje } from "./canal.js";
import { crearCanalConsola } from "./consola.js";
import { crearCanalEmail } from "./email.js";
import { crearCanalTelegram } from "./telegram.js";

export type Reescritor = (texto: string) => Promise<string>;

export class Notificador {
  constructor(
    private readonly canales: readonly Canal[],
    private readonly log: Log,
    private readonly reescritor?: Reescritor,
  ) {}

  get nombresCanales(): string[] {
    return this.canales.map((c) => c.nombre);
  }

  /**
   * Manda el aviso. Devuelve `true` si hay que darlo por enviado: cuando no hay canales externos para ese
   * destinatario (queda la consola) o cuando al menos uno lo entregó. Si TODOS los externos fallan devuelve
   * `false`, y el próximo ciclo se reintenta.
   */
  async enviar(accion: AccionAviso): Promise<boolean> {
    const texto = this.reescritor !== undefined ? await this.reescritor(accion.texto) : accion.texto;
    const mensaje: Mensaje = {
      a: accion.a,
      asunto: accion.asunto ?? "Aviso de tu Llave",
      texto,
      ...(accion.cuentas !== undefined ? { cuentas: accion.cuentas } : {}),
    };
    let externos = 0;
    let entregados = 0;
    for (const canal of this.canales) {
      if (!canal.aplica(accion.a)) continue;
      const esExterno = canal.nombre !== "consola";
      if (esExterno) externos++;
      try {
        await canal.enviar(mensaje);
        if (esExterno) entregados++;
      } catch (error) {
        if (error instanceof ErrorEnvio && error.parcial) entregados++;
        this.log.aviso(`No se pudo avisar por ${canal.nombre}: ${mensajeDe(error)}`);
      }
    }
    return externos === 0 || entregados > 0;
  }
}

/** Arma el notificador según la config: consola siempre; Telegram y mail solo si tienen credenciales. */
export function crearNotificador(config: Config, log: Log): Notificador {
  const canales: Canal[] = [crearCanalConsola(log)];
  if (config.telegram !== undefined) canales.push(crearCanalTelegram(config.telegram));
  else log.info("Telegram sin credenciales: se saltea (los avisos salen por consola).");
  if (config.email !== undefined) canales.push(crearCanalEmail(config.email));
  else log.info("Mail sin credenciales: se saltea (los avisos salen por consola).");

  const apiKey = config.anthropicApiKey;
  const reescritor: Reescritor | undefined =
    apiKey !== undefined ? (texto) => reescribir(texto, { apiKey }) : undefined;
  if (reescritor !== undefined) log.info("Redacción: plantillas + reescritura opcional con Claude (5 s máx.).");
  return new Notificador(canales, log, reescritor);
}
