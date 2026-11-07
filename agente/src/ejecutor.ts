/**
 * Ejecuta las tx que pide `decidir()`: simula primero, decodifica el revert y decide si mandar.
 *
 * - SigueVivo / GraciaEnCurso con el reloj local ya pasado (plazo + 2 s): la simulación usó el último bloque, cuyo
 *   timestamp puede ser viejo (la C-Chain no produce bloques sin tx). Se manda igual con gas fijo; el bloque nuevo
 *   trae la hora real. Si esa tx forzada igual revierte (reloj del host adelantado respecto de la cadena), no se
 *   vuelve a forzar la misma acción con el mismo plazo hasta PAUSA_FORZADA_MS después: así un desfase de reloj no
 *   quema AVAX en una tx fallida por ciclo. Mientras tanto, si la simulación pasa (la cadena alcanzó el plazo), se
 *   manda normal.
 * - NotAgent: el agente no es tier 5. Se avisa UNA vez por tier y no se reintenta en loop (pausa de 5 minutos).
 * - DRY_RUN: simula y loguea, pero no manda nada.
 */
import type { Hash } from "viem";
import { decodificarRevert, type PuertoCadena } from "./cadena.js";
import { mensajeDe, type Log } from "./log.js";
import { plantillaAgenteNoVerificado } from "./redaccion.js";
import type { AccionAviso, AccionTx, EstadoLlave, FuncionAgente } from "./tipos.js";

/** Gas fijo cuando no se puede estimar (la estimación revierte por un timestamp viejo). */
export const GAS_FIJO: Record<FuncionAgente, bigint> = {
  iniciarReclamo: 200_000n,
  liberar: 600_000n,
};

/** Margen sobre el plazo antes de mandar "a ciegas" (el próximo bloque tiene que superar el plazo). */
export const MARGEN_RELOJ_S = 2;

/** Pausa tras un NotAgent antes de volver a probar (por si KUMPLY atestigua al agente mientras corre). */
export const PAUSA_NOT_AGENT_MS = 5 * 60_000;

/** Pausa tras una tx forzada que revirtió on-chain, antes de volver a forzar la misma acción con el mismo plazo. */
export const PAUSA_FORZADA_MS = 60_000;

export type ResultadoTx =
  | { tipo: "enviada"; fn: FuncionAgente; hash: Hash; forzada: boolean }
  | { tipo: "revertida"; fn: FuncionAgente; hash: Hash }
  | { tipo: "dry-run"; fn: FuncionAgente; forzada: boolean }
  | { tipo: "no-agente"; fn: FuncionAgente; tier: number; aviso?: AccionAviso }
  | { tipo: "omitida"; fn: FuncionAgente; motivo: string }
  | { tipo: "error"; fn: FuncionAgente; mensaje: string };

export interface OpcionesEjecutor {
  /** `undefined` = sin clave (DRY_RUN sin AGENTE_PRIVATE_KEY): no se puede ni simular como el agente. */
  cadena: PuertoCadena | undefined;
  dryRun: boolean;
  log: Log;
  /** Reloj local en ms (inyectable en tests). */
  ahoraMs?: () => number;
}

export class Ejecutor {
  private pausaNotAgentHasta = 0;
  /** `fn:limite` → ms hasta los que no se fuerza de nuevo (una tx forzada con ese plazo ya revirtió on-chain). */
  private readonly pausaForzada = new Map<string, number>();
  private readonly logsDryRun = new Set<string>();
  private readonly ahoraMs: () => number;

  constructor(private readonly o: OpcionesEjecutor) {
    this.ahoraMs = o.ahoraMs ?? Date.now;
  }

  async ejecutar(accion: AccionTx, estado: EstadoLlave): Promise<ResultadoTx> {
    const { fn } = accion;
    const { cadena, log } = this.o;

    if (cadena === undefined) {
      this.logUnaVez(accion, `[DRY_RUN] Correspondería ${fn}(), pero no hay AGENTE_PRIVATE_KEY: no se simula.`);
      return { tipo: "dry-run", fn, forzada: false };
    }
    if (this.ahoraMs() < this.pausaNotAgentHasta) {
      return { tipo: "omitida", fn, motivo: "agente no verificado (en pausa)" };
    }

    let forzada = false;
    let claveForzada: string | undefined;
    try {
      await cadena.simular(fn);
    } catch (error) {
      const revert = decodificarRevert(error);
      if (revert === undefined) {
        log.aviso(`No se pudo simular ${fn}(): ${mensajeDe(error)}`);
        return { tipo: "error", fn, mensaje: mensajeDe(error) };
      }
      if (revert.nombre === "NotAgent") {
        const tier = Number(revert.args[1] ?? 0);
        this.pausaNotAgentHasta = this.ahoraMs() + PAUSA_NOT_AGENT_MS;
        log.error(`El agente no está verificado por KUMPLY (tier ${tier}); no puede ejecutar ${fn}().`);
        const t = plantillaAgenteNoVerificado(tier);
        return {
          tipo: "no-agente",
          fn,
          tier,
          aviso: { tipo: "aviso", a: "dueno", clave: `no-agente:${tier}`, asunto: t.asunto, texto: t.texto },
        };
      }
      const limite = this.limiteDe(revert.nombre, revert.args, estado);
      if (limite === undefined || Math.floor(this.ahoraMs() / 1000) < limite + MARGEN_RELOJ_S) {
        log.info(`${fn}() todavía no corresponde (${revert.nombre}); se reintenta en el próximo ciclo.`);
        return { tipo: "omitida", fn, motivo: revert.nombre };
      }
      claveForzada = `${fn}:${limite}`;
      if (this.ahoraMs() < (this.pausaForzada.get(claveForzada) ?? 0)) {
        return { tipo: "omitida", fn, motivo: `${revert.nombre} (tx forzada ya revirtió; en pausa)` };
      }
      forzada = true;
    }

    if (this.o.dryRun) {
      this.logUnaVez(accion, `[DRY_RUN] Mandaría ${fn}()${forzada ? " con gas fijo" : ""}. No se envía nada.`);
      return { tipo: "dry-run", fn, forzada };
    }

    try {
      if (forzada) log.info(`El bloque de la simulación es viejo; mando ${fn}() con gas fijo (${GAS_FIJO[fn]}).`);
      const hash = await cadena.enviar(fn, forzada ? GAS_FIJO[fn] : undefined);
      log.info(`Tx ${fn}() enviada: ${hash}. Esperando confirmación…`);
      const recibo = await cadena.esperar(hash);
      if (!recibo.exitosa) {
        log.aviso(`La tx ${fn}() revirtió en el bloque ${recibo.bloque}: ${hash}`);
        if (claveForzada !== undefined) {
          this.pausaForzada.set(claveForzada, this.ahoraMs() + PAUSA_FORZADA_MS);
          log.aviso(`El reloj local parece adelantado respecto de la cadena; no fuerzo ${fn}() por ${PAUSA_FORZADA_MS / 1000} s.`);
        }
        return { tipo: "revertida", fn, hash };
      }
      if (claveForzada !== undefined) this.pausaForzada.delete(claveForzada);
      log.info(`✔ ${fn}() confirmada en el bloque ${recibo.bloque}.`);
      return { tipo: "enviada", fn, hash, forzada };
    } catch (error) {
      log.aviso(`No se pudo mandar ${fn}(): ${mensajeDe(error)}`);
      return { tipo: "error", fn, mensaje: mensajeDe(error) };
    }
  }

  /**
   * Plazo (en s) del revert que puede deberse solo a un bloque simulado viejo: SigueVivo(venceEn) y
   * GraciaEnCurso(terminaEn). Para cualquier otro revert, `undefined` (nunca se fuerza). Se fuerza solo si el reloj
   * local ya pasó ese plazo por al menos MARGEN_RELOJ_S.
   */
  private limiteDe(nombre: string, args: readonly unknown[], estado: EstadoLlave): number | undefined {
    if (nombre === "SigueVivo") return Number(args[0] ?? estado.venceEn);
    if (nombre === "GraciaEnCurso") return Number(args[0] ?? estado.graciaTerminaEn);
    return undefined;
  }

  private logUnaVez(accion: AccionTx, mensaje: string): void {
    const clave = `${accion.fn}:${accion.clave ?? ""}`;
    if (this.logsDryRun.has(clave)) return;
    this.logsDryRun.add(clave);
    this.o.log.info(mensaje);
  }
}
