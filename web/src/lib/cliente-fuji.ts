/**
 * Cliente real contra Fuji (`VITE_MODO=fuji`): lecturas con viem por el RPC público y escrituras del dueño
 * patrocinadas desde la smart account de 0xGasless. Implementa `LlaveCliente` (tipos.ts) igual que el mock de P3.
 *
 * Escrituras: SIEMPRE `simulateContract` con `account` = SA antes de mandar. Si revierte, el error se traduce
 * (errores.ts) y se devuelve `ok:false` SIN mandar nada al bundler. Si pasa, va en una userOp patrocinada y se mide
 * el tiempo hasta el receipt (`ms`). En Avalanche la inclusión es la finalidad: `msFinal` = 0.
 *
 * `iniciarReclamo()` y `liberar()` NO se llaman desde la web: las manda el agente KUMPLY tier 5 (`agente/`, P1).
 */
import { encodeFunctionData, getContract, type Address, type ContractFunctionArgs, type ContractFunctionName } from "viem";
import { llaveAbi, pesosAbi } from "./abi-llave";
import { aliasDe, config, direccionAgente, direccionLlave, direccionPesos, urlTx } from "./config";
import { interpretarError, mensajeDe, MENSAJE_SIN_SESION, MENSAJE_SOLO_DUENA, type ContextoError } from "./errores";
import { entrar, enviar, salir, sesion } from "./gasless";
import { verificar } from "./kumply";
import { clientePublico } from "./rpc";
import {
  FASES,
  type AgenteVista,
  type ConfigLlave,
  type EstadoLlave,
  type EventoLlave,
  type HerederoVista,
  type LlaveCliente,
  type ResultadoTx,
  type Verificacion,
} from "./tipos";

type Escritura = ContractFunctionName<typeof llaveAbi, "nonpayable" | "payable">;
type Args<N extends Escritura> = ContractFunctionArgs<typeof llaveAbi, "nonpayable" | "payable", N>;

/** Métodos extra del cliente Fuji (no están en `LlaveCliente`; el mock no los necesita). */
export interface ExtrasFuji {
  direccion(): Address;
  /** 1.ª tx patrocinada (P2-3): `MockPesos.faucet()` desde la SA. Solo necesita la dirección de MockPesos. */
  faucet(): Promise<ResultadoTx>;
  /** userOp vacía (la SA se llama a sí misma): sirve para probar el patrocinio antes de tener contratos. */
  pruebaPatrocinio(): Promise<ResultadoTx>;
  transferirDueno(nuevo: Address): Promise<ResultadoTx>;
  /** P2-8: ¿la SA de la sesión es la dueña de la Llave? (única cuenta que opera desde la web) */
  puedeOperar(): Promise<boolean>;
  /** último `estado()` leído (para no esperar al próximo poll) */
  ultimoEstado(): EstadoLlave | null;
  agente(): Promise<AgenteVista | null>;
  aliasDe(cuenta: Address): string;
}

interface InfoToken {
  direccion: Address;
  decimales: number;
  simbolo: string;
}

const CERO = "0x0000000000000000000000000000000000000000";

export function crearClienteFuji(opciones: { llave?: Address } = {}): LlaveCliente & ExtrasFuji {
  const pc = clientePublico();
  let direccion: Address | undefined = opciones.llave;
  const requerirDireccion = (): Address => {
    direccion ??= direccionLlave();
    if (!direccion) {
      throw new Error("No hay dirección de la Llave: usá ?llave=0x…, VITE_LLAVE_ADDRESS o deployments.fuji.json (llave.A).");
    }
    return direccion;
  };
  const llave = () => getContract({ address: requerirDireccion(), abi: llaveAbi, client: pc });

  let token: InfoToken | null = null;
  let ultimo: EstadoLlave | null = null;
  let tesoreria: Address | undefined;

  async function infoToken(): Promise<InfoToken> {
    if (token) return token;
    const t = await llave().read.token();
    const [decimales, simbolo] = await Promise.all([
      pc.readContract({ address: t, abi: pesosAbi, functionName: "decimals" }),
      pc.readContract({ address: t, abi: pesosAbi, functionName: "symbol" }),
    ]);
    token = { direccion: t, decimales: Number(decimales), simbolo };
    return token;
  }

  /** Dirección de MockPesos aunque todavía no haya Llave (P2-3). */
  async function pesos(): Promise<Address> {
    return direccionPesos() ?? (await infoToken()).direccion;
  }

  // ───────────── lecturas ─────────────

  async function estado(): Promise<EstadoLlave> {
    const l = llave();
    const [e, t] = await Promise.all([l.read.estado(), infoToken()]);
    if (tesoreria === undefined) tesoreria = await l.read.tesoreria().catch(() => CERO as Address);
    ultimo = {
      direccion: l.address,
      dueno: e.dueno,
      fase: FASES[Number(e.fase)] ?? "Activa",
      saldo: e.saldo,
      decimales: t.decimales,
      simbolo: t.simbolo,
      ultimaSenal: Number(e.ultimaSenal),
      venceEn: Number(e.venceEn),
      reclamoIniciadoEn: Number(e.reclamoIniciadoEn),
      graciaTerminaEn: Number(e.graciaTerminaEn),
      liberadaEn: Number(e.liberadaEn),
      totalLiberado: e.totalLiberado,
      plazoInactividad: Number(e.plazoInactividad),
      plazoGracia: Number(e.plazoGracia),
      comisionBps: Number(e.comisionBps),
      ahoraCadena: Number(e.ahora),
      tesoreria: tesoreria && tesoreria !== CERO ? tesoreria : undefined,
    };
    return ultimo;
  }

  async function herederos(): Promise<HerederoVista[]> {
    const l = llave();
    const lista = await l.read.herederos();
    return Promise.all(
      lista.map(async (h) => {
        const [parte, verificacion] = await Promise.all([l.read.parteDe([h.cuenta]), verificar(h.cuenta)]);
        return { cuenta: h.cuenta, alias: aliasDe(h.cuenta), bps: Number(h.bps), parte, verificacion };
      }),
    );
  }

  async function saldoDe(cuenta: Address): Promise<bigint> {
    return pc.readContract({ address: await pesos(), abi: pesosAbi, functionName: "balanceOf", args: [cuenta] });
  }

  function verificacion(cuenta: Address): Promise<Verificacion> {
    return verificar(cuenta);
  }

  async function agente(): Promise<AgenteVista | null> {
    const cuenta = direccionAgente();
    if (!cuenta) return null;
    return { cuenta, alias: aliasDe(cuenta) || "Agente", verificacion: await verificar(cuenta) };
  }

  /** Polling de logs cada `pollMs` desde el bloque actual (solo eventos nuevos). */
  function escucharEventos(cb: (e: EventoLlave) => void): () => void {
    const address = requerirDireccion();
    let activo = true;
    let desde: bigint | null = null;
    const vistos = new Set<string>();
    const tiempos = new Map<bigint, number>();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const ciclo = async () => {
      try {
        const ultimoBloque = await pc.getBlockNumber();
        if (desde === null) desde = ultimoBloque;
        if (ultimoBloque >= desde) {
          const logs = await pc.getContractEvents({ address, abi: llaveAbi, fromBlock: desde, toBlock: ultimoBloque });
          for (const l of logs) {
            const clave = `${l.transactionHash}:${l.logIndex}`;
            if (vistos.has(clave)) continue;
            vistos.add(clave);
            let cuando = tiempos.get(l.blockNumber);
            if (cuando === undefined) {
              cuando = Number((await pc.getBlock({ blockNumber: l.blockNumber })).timestamp);
              tiempos.set(l.blockNumber, cuando);
            }
            cb({
              nombre: l.eventName,
              args: { ...(l.args as Record<string, unknown>) },
              hash: l.transactionHash,
              url: urlTx(l.transactionHash),
              cuando,
            });
          }
          desde = ultimoBloque + 1n;
        }
      } catch (e) {
        console.warn("[fuji] eventos:", e);
      }
      if (activo) timer = setTimeout(ciclo, config.pollMs);
    };
    timer = setTimeout(ciclo, 0);
    return () => {
      activo = false;
      if (timer) clearTimeout(timer);
    };
  }

  // ───────────── escrituras (solo la dueña, desde la smart account) ─────────────

  const fallo = (nombre: string, mensaje: string): ResultadoTx => ({ ok: false, error: { nombre, mensaje } });

  async function contexto(): Promise<ContextoError> {
    const e = ultimo ?? (await estado().catch(() => null));
    return { ahora: e?.ahoraCadena, decimales: e?.decimales, simbolo: e?.simbolo };
  }

  /** P2-8: política en el cliente. No es un paymaster: evita mandar userOps que la Llave rechazaría con NoEsDueno. */
  async function esDuena(cuenta: Address): Promise<boolean> {
    if (!config.politicaPatrocinio) return true;
    const dueno = ultimo?.dueno ?? (await llave().read.dueno().catch(() => undefined));
    return !dueno || dueno.toLowerCase() === cuenta.toLowerCase();
  }

  async function ejecutar<N extends Escritura>(functionName: N, args: Args<N>): Promise<ResultadoTx> {
    try {
      const s = sesion();
      if (!s) return fallo("SinSesion", MENSAJE_SIN_SESION);
      if (functionName !== "depositar" && !(await esDuena(s.cuenta))) return fallo("NoEsDueno", MENSAJE_SOLO_DUENA);
      const address = requerirDireccion();
      // 1) simular con account = SA: si revierte, el error sale en castellano y NO se manda nada
      await pc.simulateContract({ address, abi: llaveAbi, functionName, args, account: s.cuenta } as never);
      // 2) mandar por la SA con gas patrocinado
      const data = encodeFunctionData({ abi: llaveAbi, functionName, args } as never);
      const r = await enviar([{ to: address, data }]);
      return { ok: true, hash: r.hash, url: r.url, ms: r.ms, msFinal: 0, userOpHash: r.userOpHash, patrocinada: true };
    } catch (e) {
      const err = interpretarError(e, await contexto());
      console.warn(`[fuji] ${functionName} → ${err.nombre}`, err.crudo ?? "");
      return fallo(err.nombre, err.mensaje);
    }
  }

  async function cargarPesosDePrueba(monto: bigint): Promise<ResultadoTx> {
    try {
      const s = sesion();
      if (!s) return fallo("SinSesion", MENSAJE_SIN_SESION);
      if (monto <= 0n) return fallo("MontoInvalido", mensajeDe("MontoInvalido"));
      const address = requerirDireccion();
      const t = await infoToken();
      // El batch (3 llamadas en una userOp) no se simula como una sola llamada en el RPC público.
      // Se valida lo que se puede antes de mandar: faucet() simulado, saldo final suficiente y Llave no liberada.
      const [montoFaucet, saldo, e] = await Promise.all([
        pc.readContract({ address: t.direccion, abi: pesosAbi, functionName: "MONTO_FAUCET" }).catch(() => 0n),
        saldoDe(s.cuenta),
        estado(),
      ]);
      await pc.simulateContract({ address: t.direccion, abi: pesosAbi, functionName: "faucet", account: s.cuenta });
      if (saldo + montoFaucet < monto) {
        return fallo("SaldoInsuficiente", mensajeDe("SaldoInsuficiente", [monto, saldo + montoFaucet], await contexto()));
      }
      if (e.fase === "Liberada") return fallo("YaLiberada", mensajeDe("YaLiberada"));
      const r = await enviar([
        { to: t.direccion, data: encodeFunctionData({ abi: pesosAbi, functionName: "faucet" }) },
        { to: t.direccion, data: encodeFunctionData({ abi: pesosAbi, functionName: "approve", args: [address, monto] }) },
        { to: address, data: encodeFunctionData({ abi: llaveAbi, functionName: "depositar", args: [monto] }) },
      ]);
      return { ok: true, hash: r.hash, url: r.url, ms: r.ms, msFinal: 0, userOpHash: r.userOpHash, patrocinada: true };
    } catch (e) {
      const err = interpretarError(e, await contexto());
      console.warn(`[fuji] cargarPesosDePrueba → ${err.nombre}`, err.crudo ?? "");
      return fallo(err.nombre, err.mensaje);
    }
  }

  async function configurar(c: ConfigLlave): Promise<ResultadoTx> {
    const s = sesion();
    if (!s) return fallo("SinSesion", MENSAJE_SIN_SESION);
    if (c.herederos.length !== c.bps.length || c.herederos.length === 0) {
      return fallo("CantidadHerederosInvalida", mensajeDe("CantidadHerederosInvalida"));
    }
    const suma = c.bps.reduce((a, b) => a + b, 0);
    if (suma !== 10_000) return fallo("PorcentajesInvalidos", mensajeDe("PorcentajesInvalidos", [BigInt(suma)]));
    return ejecutar("configurar", [
      {
        dueno: s.cuenta,
        herederos: c.herederos,
        bps: c.bps,
        plazoInactividad: BigInt(c.plazoInactividad),
        plazoGracia: BigInt(c.plazoGracia),
      },
    ]);
  }

  async function faucet(): Promise<ResultadoTx> {
    try {
      const s = sesion();
      if (!s) return fallo("SinSesion", MENSAJE_SIN_SESION);
      const t = await pesos();
      await pc.simulateContract({ address: t, abi: pesosAbi, functionName: "faucet", account: s.cuenta });
      const r = await enviar([{ to: t, data: encodeFunctionData({ abi: pesosAbi, functionName: "faucet" }) }]);
      return { ok: true, hash: r.hash, url: r.url, ms: r.ms, msFinal: 0, userOpHash: r.userOpHash, patrocinada: true };
    } catch (e) {
      const err = interpretarError(e);
      console.warn(`[fuji] faucet → ${err.nombre}`, err.crudo ?? "");
      return fallo(err.nombre, err.mensaje);
    }
  }

  async function pruebaPatrocinio(): Promise<ResultadoTx> {
    try {
      const s = sesion();
      if (!s) return fallo("SinSesion", MENSAJE_SIN_SESION);
      const r = await enviar([{ to: s.cuenta, data: "0x", value: 0n }]);
      return { ok: true, hash: r.hash, url: r.url, ms: r.ms, msFinal: 0, userOpHash: r.userOpHash, patrocinada: true };
    } catch (e) {
      const err = interpretarError(e);
      console.warn(`[fuji] pruebaPatrocinio → ${err.nombre}`, err.crudo ?? "");
      return fallo(err.nombre, err.mensaje);
    }
  }

  return {
    // lecturas
    estado,
    herederos,
    saldoDe,
    verificacion,
    escucharEventos,
    agente,
    aliasDe,
    // sesión
    sesion,
    entrar: (email: string) => entrar(email ? email.split("@")[0] : undefined),
    salir,
    // escrituras de la dueña (todas patrocinadas)
    estoyBien: () => ejecutar("estoyBien", []),
    cargarPesosDePrueba,
    depositar: (monto) => ejecutar("depositar", [monto]),
    retirar: (a, monto) => ejecutar("retirar", [a, monto]),
    configurar,
    // extras
    direccion: requerirDireccion,
    faucet,
    pruebaPatrocinio,
    transferirDueno: (nuevo) => ejecutar("transferirDueno", [nuevo]),
    puedeOperar: async () => {
      const s = sesion();
      return s ? esDuena(s.cuenta) : false;
    },
    ultimoEstado: () => ultimo,
  };
}
