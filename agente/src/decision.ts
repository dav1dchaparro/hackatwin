/**
 * El cerebro del agente: una función PURA que, dado el estado de la Llave y la hora, dice qué hacer.
 *
 * No toca la red, no lee el reloj, no usa LLM: todo entra por parámetro, así se puede testear fase por fase.
 */
import { Fase } from "./abi.js";
import {
  plantillaEnGracia,
  plantillaLiberadaDueno,
  plantillaLiberadaHerederos,
  plantillaRecordatorio,
  plantillaVacia,
  plantillaVencida,
  plantillaVencidaSinAgente,
  UMBRAL_SEGUNDOS_S,
  type DatosLiberacion,
} from "./redaccion.js";
import type {
  Accion,
  AccionAviso,
  ContextoDecision,
  Destinatario,
  EstadoLlave,
  Heredero,
  MemoriaDecision,
} from "./tipos.js";

const BPS_TOTAL = 10_000n;

/**
 * Si se liberó y todavía no conocemos el comprobante (hash), esperamos hasta este margen a que aparezca en los
 * logs antes de avisar sin él.
 */
export const ESPERA_COMPROBANTE_S = 120;

/**
 * Hora de referencia: la mayor entre la del último bloque y la local. La C-Chain no produce bloques si no hay tx,
 * así que `estado.ahora` puede quedar minutos atrás; el reloj local no.
 */
export function relojEfectivo(estado: EstadoLlave, ahoraLocal: number): number {
  return Math.max(estado.ahora, Math.floor(ahoraLocal));
}

/** Misma regla que `Llave.fase()`, pero con el reloj que le pasemos. */
export function faseEfectiva(estado: EstadoLlave, reloj: number): Fase {
  if (estado.liberadaEn !== 0) return Fase.Liberada;
  if (estado.reclamoIniciadoEn !== 0) {
    return reloj >= estado.reclamoIniciadoEn + estado.plazoGracia ? Fase.Ejecutable : Fase.EnGracia;
  }
  if (reloj >= estado.ultimaSenal + estado.plazoInactividad) return Fase.Vencida;
  return Fase.Activa;
}

/**
 * Reparto idéntico a `Llave.liberar()` / `parteDe()`: comisión sobre el total, cada heredero su % del neto y el
 * último se lleva el polvo de redondeo, así que la suma da exactamente `total`.
 */
export function repartir(
  total: bigint,
  comisionBps: number,
  herederos: readonly Heredero[],
): { comision: bigint; partes: Array<{ heredero: Heredero; monto: bigint }> } {
  const comision = (total * BigInt(comisionBps)) / BPS_TOTAL;
  const neto = total - comision;
  let repartido = 0n;
  const partes = herederos.map((heredero, i) => {
    const monto = i === herederos.length - 1 ? neto - repartido : (neto * BigInt(heredero.bps)) / BPS_TOTAL;
    repartido += monto;
    return { heredero, monto };
  });
  return { comision, partes };
}

function aviso(a: Destinatario, clave: string, t: { asunto: string; texto: string }): AccionAviso {
  return { tipo: "aviso", a, clave, asunto: t.asunto, texto: t.texto };
}

/**
 * Umbral que corresponde avisar: el MENOR umbral ya cruzado. Como `restante` solo baja dentro de una época, el
 * umbral elegido también baja, y cada uno se avisa una sola vez (si el agente arranca tarde, no manda los viejos).
 */
function umbralCruzado(restante: number, umbrales: readonly number[]): number | undefined {
  const cruzados = umbrales.filter((u) => restante <= u);
  return cruzados.length > 0 ? Math.min(...cruzados) : undefined;
}

/**
 * Decide las acciones del próximo ciclo.
 *
 * - Activa: un recordatorio por umbral y por época (`ultimaSenal`), con link a `${webUrl}/dueno`.
 * - Vencida: tx `iniciarReclamo` + aviso al dueño con la hora estimada de fin de gracia (si la Llave está vacía,
 *   solo avisa: no hay nada que enviar).
 * - EnGracia: aviso único por reclamo, "cancelalo tocando Estoy bien".
 * - Ejecutable: tx `liberar` (si está vacía, aviso único en lugar de una tx que revertiría con SinSaldo).
 * - Liberada: aviso único al dueño y a los herederos con montos y comprobante.
 *
 * Los avisos cuya `clave` ya está en `memoria.avisosEnviados` no se devuelven.
 */
export function decidir(
  estado: EstadoLlave,
  ahoraLocal: number,
  memoria: MemoriaDecision,
  umbrales: readonly number[],
  ctx: ContextoDecision,
): Accion[] {
  const reloj = relojEfectivo(estado, ahoraLocal);
  const fase = faseEfectiva(estado, reloj);
  const acciones: Accion[] = [];
  const conSegundos = estado.plazoGracia < UMBRAL_SEGUNDOS_S;
  const pendiente = (a: AccionAviso): void => {
    if (!memoria.avisosEnviados.has(a.clave)) acciones.push(a);
  };

  switch (fase) {
    case Fase.Activa: {
      const restante = estado.ultimaSenal + estado.plazoInactividad - reloj;
      const umbral = umbralCruzado(restante, umbrales);
      if (umbral !== undefined) {
        pendiente(
          aviso("dueno", `recordatorio:${estado.ultimaSenal}:${umbral}`, plantillaRecordatorio(restante, ctx.webUrl)),
        );
      }
      break;
    }
    case Fase.Vencida: {
      if (estado.saldo === 0n) {
        pendiente(aviso("dueno", `vacia:${estado.ultimaSenal}`, plantillaVacia(ctx.webUrl)));
        break;
      }
      acciones.push({ tipo: "tx", fn: "iniciarReclamo", clave: `iniciar:${estado.ultimaSenal}` });
      const finGracia = reloj + estado.plazoGracia;
      const texto =
        ctx.agenteEjecuta === false
          ? plantillaVencidaSinAgente(ctx.webUrl)
          : plantillaVencida(finGracia, ctx.webUrl, ctx.zonaHoraria, conSegundos);
      pendiente(aviso("dueno", `vencida:${estado.ultimaSenal}`, texto));
      break;
    }
    case Fase.EnGracia: {
      const finGracia = estado.reclamoIniciadoEn + estado.plazoGracia;
      pendiente(
        aviso(
          "dueno",
          `gracia:${estado.reclamoIniciadoEn}`,
          plantillaEnGracia(finGracia, ctx.webUrl, ctx.zonaHoraria, conSegundos),
        ),
      );
      break;
    }
    case Fase.Ejecutable: {
      if (estado.saldo === 0n) {
        pendiente(aviso("dueno", `vacia:reclamo:${estado.reclamoIniciadoEn}`, plantillaVacia(ctx.webUrl)));
        break;
      }
      acciones.push({ tipo: "tx", fn: "liberar", clave: `liberar:${estado.reclamoIniciadoEn}` });
      break;
    }
    case Fase.Liberada: {
      const sinComprobante = memoria.hashLiberacion === undefined;
      if (sinComprobante && reloj < estado.liberadaEn + ESPERA_COMPROBANTE_S) break; // esperamos el hash
      const { comision, partes } = repartir(estado.totalLiberado, estado.comisionBps, ctx.herederos);
      const datos: DatosLiberacion = {
        total: estado.totalLiberado,
        comision,
        comisionBps: estado.comisionBps,
        partes,
        hash: memoria.hashLiberacion,
        token: ctx.token,
        webUrl: ctx.webUrl,
      };
      pendiente(aviso("dueno", `liberada:${estado.liberadaEn}:dueno`, plantillaLiberadaDueno(datos)));
      pendiente({
        ...aviso("herederos", `liberada:${estado.liberadaEn}:herederos`, plantillaLiberadaHerederos(datos)),
        cuentas: ctx.herederos.map((h) => h.cuenta),
      });
      break;
    }
  }
  return acciones;
}
