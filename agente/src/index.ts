/**
 * Agente KUMPLY de la Llave. La blockchain no tiene cron: alguien tiene que mirar el reloj, avisar al dueño y, si
 * no da señales, abrir la gracia y enviar la herencia. Ese alguien es este proceso, firmando con una EOA que
 * KUMPLY verificó como agente (tier 5). Un bot sin verificar no puede: el contrato revierte con NotAgent.
 *
 * Uso: `npm start` (lee agente/.env si existe). Ctrl+C para apagarlo limpio.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Address, PublicClient } from "viem";
import { NOMBRE_FASE, llaveAbi } from "./abi.js";
import { crearNotificador, type Notificador } from "./avisos/notificador.js";
import {
  CHAIN_ID_FUJI,
  crearClientes,
  crearPuertoCadena,
  leerEstado,
  leerHerederos,
  leerTier,
  leerToken,
} from "./cadena.js";
import { cargarConfig, ErrorConfig, type Config } from "./config.js";
import { decidir, faseEfectiva, relojEfectivo } from "./decision.js";
import { Ejecutor } from "./ejecutor.js";
import { logConsola as log, mensajeDe } from "./log.js";
import { formatHora, formatMonto } from "./redaccion.js";
import { Memoria } from "./memoria.js";
import type { Accion, InfoToken } from "./tipos.js";

/** Error esperado de arranque: se muestra el mensaje en castellano, sin stack trace. */
class ErrorArranque extends Error {}

/** Fuji limita eth_getLogs; leemos de a tramos. */
const TRAMO_LOGS = 2_000n;

function cargarEnvLocal(): void {
  const ruta = fileURLToPath(new URL("../.env", import.meta.url));
  if (existsSync(ruta)) process.loadEnvFile(ruta);
}

async function verificarRed(publico: PublicClient, config: Config): Promise<void> {
  let chainId: number;
  try {
    chainId = await publico.getChainId();
  } catch (error) {
    throw new ErrorArranque(`No me pude conectar al RPC (${config.rpcUrl}): ${mensajeDe(error)}`);
  }
  if (chainId !== CHAIN_ID_FUJI) {
    throw new ErrorArranque(`FUJI_RPC_URL apunta a la red ${chainId}, no a Avalanche Fuji (${CHAIN_ID_FUJI}).`);
  }
}

async function leerKumply(publico: PublicClient, llave: Address): Promise<Address> {
  try {
    return await publico.readContract({ address: llave, abi: llaveAbi, functionName: "kumply" });
  } catch {
    throw new ErrorArranque(
      `No encontré un contrato Llave en ${llave} (Fuji). Revisá LLAVE_ADDRESS: tiene que ser la de deployments/fuji.json.`,
    );
  }
}

/** Lee los eventos nuevos desde el último bloque visto y los loguea. Guarda el comprobante de la liberación. */
async function leerEventos(publico: PublicClient, config: Config, memoria: Memoria, token: InfoToken): Promise<void> {
  const ultimo = await publico.getBlockNumber();
  let desde =
    memoria.ultimoBloque !== undefined ? memoria.ultimoBloque + 1n : ultimo > TRAMO_LOGS ? ultimo - TRAMO_LOGS : 0n;
  while (desde <= ultimo) {
    const hasta = desde + TRAMO_LOGS - 1n < ultimo ? desde + TRAMO_LOGS - 1n : ultimo;
    const logs = await publico.getContractEvents({
      address: config.llave,
      abi: llaveAbi,
      fromBlock: desde,
      toBlock: hasta,
    });
    for (const evento of logs) {
      switch (evento.eventName) {
        case "ReclamoIniciado":
          log.info(
            `Evento: se abrió la gracia (agente ${evento.args.agente}). Termina el ${formatHora(Number(evento.args.graciaTerminaEn ?? 0n), undefined, true)}.`,
          );
          break;
        case "ReclamoCancelado":
          log.info("Evento: el dueño dio señales y canceló el reclamo.");
          break;
        case "SenalDeVida":
          log.info("Evento: señal de vida del dueño.");
          break;
        case "HerenciaEnviada":
          log.info(
            `Evento: herencia enviada a ${evento.args.heredero} (${formatMonto(evento.args.monto ?? 0n, token)}).`,
          );
          break;
        case "Liberada":
          memoria.hashLiberacion = evento.transactionHash;
          log.info(`Evento: Llave liberada. Comprobante ${evento.transactionHash}.`);
          break;
        default:
          break;
      }
    }
    memoria.ultimoBloque = hasta;
    desde = hasta + 1n;
  }
}

async function procesar(
  acciones: Accion[],
  estado: Awaited<ReturnType<typeof leerEstado>>,
  ejecutor: Ejecutor,
  notificador: Notificador,
  memoria: Memoria,
  agenteEjecuta: boolean,
): Promise<boolean> {
  let ejecuta = agenteEjecuta;
  for (const accion of acciones) {
    if (accion.tipo === "aviso") {
      if (memoria.yaEnviado(accion.clave)) continue;
      if (await notificador.enviar(accion)) memoria.marcar(accion.clave);
      continue;
    }
    const resultado = await ejecutor.ejecutar(accion, estado);
    if (resultado.tipo === "no-agente") ejecuta = false;
    if (resultado.tipo === "enviada") ejecuta = true;
    if (resultado.tipo === "enviada" && resultado.fn === "liberar") memoria.hashLiberacion = resultado.hash;
    if (resultado.tipo === "no-agente" && resultado.aviso !== undefined && !memoria.yaEnviado(resultado.aviso.clave)) {
      if (await notificador.enviar(resultado.aviso)) memoria.marcar(resultado.aviso.clave);
    }
  }
  return ejecuta;
}

async function main(): Promise<void> {
  cargarEnvLocal();
  const config = cargarConfig();
  for (const a of config.advertencias) log.aviso(a);

  const clientes = crearClientes(config.rpcUrl, config.cuenta);
  const { publico } = clientes;
  await verificarRed(publico, config);
  const store = await leerKumply(publico, config.llave);
  const token = await leerToken(publico, config.llave);

  log.info(`Llave ${config.llave} · KUMPLY ${store} · token ${token.simbolo}`);
  // ¿Hoy el agente puede abrir la gracia y liberar? Se corrige sobre la marcha con lo que devuelva el ejecutor.
  let agenteEjecuta = false;
  if (config.cuenta === undefined) {
    log.aviso("Modo solo avisos: DRY_RUN sin AGENTE_PRIVATE_KEY (no se simula ni se firma nada).");
  } else {
    const tier = await leerTier(publico, store, config.cuenta.address);
    agenteEjecuta = tier === 5 && !config.dryRun;
    if (tier === 5) log.info(`Agente verificado tier 5: ${config.cuenta.address}`);
    else log.aviso(`Modo solo avisos: ${config.cuenta.address} tiene tier ${tier} en KUMPLY (hace falta tier 5).`);
    const avax = await publico.getBalance({ address: config.cuenta.address });
    if (avax === 0n)
      log.aviso("La cuenta del agente no tiene AVAX para pagar el gas en Fuji (faucet: https://faucet.avax.network).");
  }
  if (config.dryRun) log.aviso("DRY_RUN=true: el agente simula y avisa, pero no manda transacciones.");

  const memoria = Memoria.cargar(config.llave);
  const notificador = crearNotificador(config, log);
  const ejecutor = new Ejecutor({ cadena: crearPuertoCadena(clientes, config.llave), dryRun: config.dryRun, log });
  log.info(
    `Canales: ${notificador.nombresCanales.join(", ")} · cada ${config.pollMs} ms · umbrales ${config.umbralesS.join(", ")} s`,
  );

  // Apagado limpio: corta la espera, termina el ciclo en curso y guarda la memoria.
  const corte = new AbortController();
  const apagar = (senal: string): void => {
    if (corte.signal.aborted) return;
    log.info(`${senal} recibido: apagando el agente…`);
    corte.abort();
  };
  process.once("SIGINT", () => apagar("SIGINT"));
  process.once("SIGTERM", () => apagar("SIGTERM"));

  let faseAnterior: string | undefined;
  while (!corte.signal.aborted) {
    try {
      const [estado, herederos] = await Promise.all([
        leerEstado(publico, config.llave),
        leerHerederos(publico, config.llave),
      ]);
      try {
        await leerEventos(publico, config, memoria, token);
      } catch (error) {
        log.aviso(`No se pudieron leer los eventos (se reintenta): ${mensajeDe(error)}`);
      }
      const ahoraLocal = Date.now() / 1000;
      const fase = NOMBRE_FASE[faseEfectiva(estado, relojEfectivo(estado, ahoraLocal))];
      if (fase !== faseAnterior) {
        log.info(`Fase: ${fase} (según la cadena: ${NOMBRE_FASE[estado.fase]}).`);
        faseAnterior = fase;
      }
      const acciones = decidir(estado, ahoraLocal, memoria, config.umbralesS, {
        webUrl: config.webUrl,
        token,
        herederos,
        agenteEjecuta,
      });
      agenteEjecuta = await procesar(acciones, estado, ejecutor, notificador, memoria, agenteEjecuta);
      memoria.guardar();
    } catch (error) {
      log.aviso(`Ciclo con error (se reintenta): ${mensajeDe(error)}`);
    }
    await new Promise<void>((resolver) => {
      const t = setTimeout(resolver, config.pollMs);
      corte.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(t);
          resolver();
        },
        { once: true },
      );
    });
  }
  memoria.guardar();
  log.info("Agente detenido. Memoria guardada.");
}

main().catch((error: unknown) => {
  if (error instanceof ErrorConfig) {
    log.error(error.message);
    log.error("Copiá agente/.env.example a agente/.env y completalo (ver agente/README.md).");
  } else if (error instanceof ErrorArranque) {
    log.error(error.message);
  } else {
    log.error(`Error inesperado: ${mensajeDe(error)}`);
  }
  process.exitCode = 1;
});
