/**
 * Cliente real contra Fuji (`VITE_MODO=fuji`): lecturas con viem por el RPC público y escrituras patrocinadas
 * desde la smart account de 0xGasless. Implementa `LlaveCliente` (tipos.ts) igual que el mock de P3.
 *
 * Escrituras: SIEMPRE `simulateContract` con `account` = SA antes de mandar. Si revierte, el error se traduce
 * (errores.ts) y se devuelve `ok:false` SIN mandar nada al bundler. Si pasa, va en una userOp patrocinada y se mide
 * el tiempo hasta el receipt (`ms`). En Avalanche la inclusión es la finalidad: `msFinal` = 0.
 */
import { encodeFunctionData, getContract, type Address, type ContractFunctionArgs, type ContractFunctionName } from "viem";
import { llaveAbi, pesosAbi } from "./abi-llave";
import { aliasDe, config, direccionLlave, direccionPesos, urlTx } from "./config";
import { interpretarError, mensajeDe, MENSAJE_SIN_GAS, MENSAJE_SIN_SESION, type ContextoError } from "./errores";
import { entrar, enviar, salir, sesion } from "./gasless";
import { verificar } from "./kumply";
import { clientePublico } from "./rpc";
import {
  FASES,
  type EmergenciaVista,
  type EstadoLlave,
  type EventoLlave,
  type GuardianVista,
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
  depositar(monto: bigint): Promise<ResultadoTx>;
  /** mejora 4: lista blanca de destinos de emergencia (solo dueño). */
  permitirDestino(destino: Address, permitido: boolean): Promise<ResultadoTx>;
  /** P2-8: ¿la SA de la sesión puede operar sin gas? (es la dueña o pasa isPersonAtLeast(sa, 2)) */
  puedeOperarSinGas(): Promise<boolean>;
  /** último `estado()` leído (para no esperar al próximo poll) */
  ultimoEstado(): EstadoLlave | null;
}

interface InfoToken {
  direccion: Address;
  decimales: number;
  simbolo: string;
}

export function crearClienteFuji(opciones: { llave?: Address } = {}): LlaveCliente & ExtrasFuji {
  const pc = clientePublico();
  let direccion: Address | undefined = opciones.llave;
  const requerirDireccion = (): Address => {
    direccion ??= direccionLlave();
    if (!direccion) {
      throw new Error("No hay dirección de la llave: usá ?llave=0x…, VITE_LLAVE_ADDRESS o deployments.fuji.json (llave.A).");
    }
    return direccion;
  };
  const llave = () => getContract({ address: requerirDireccion(), abi: llaveAbi, client: pc });

  let token: InfoToken | null = null;
  let ultimo: EstadoLlave | null = null;
  /** ABI v2 (A1): `comisionBps()` / `tesoreria()` existen */
  let comisionSoportada: boolean | null = null;
  /** mejoras 2/17: `emergenciaVigente(id)` existe */
  let vigenteSoportado: boolean | null = null;

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

  /** Dirección de MockPesos aunque todavía no haya llave (P2-3). */
  async function pesos(): Promise<Address> {
    const directa = direccionPesos();
    if (directa) return directa;
    return (await infoToken()).direccion;
  }

  // ───────────── lecturas ─────────────

  async function estado(): Promise<EstadoLlave> {
    const l = llave();
    const [e, t] = await Promise.all([l.read.estado(), infoToken()]);
    let comisionBps: number | undefined;
    let tesoreria: Address | undefined;
    if (comisionSoportada !== false) {
      try {
        const [c, ts] = await Promise.all([l.read.comisionBps(), l.read.tesoreria()]);
        comisionBps = Number(c);
        tesoreria = ts;
        comisionSoportada = true;
      } catch {
        comisionSoportada = false; // ABI v1: A1 todavía no está en el contrato
      }
    }
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
      foto: e.foto,
      emergenciaDisponible: e.emergenciaDisponible,
      cantidadEmergencias: Number(e.cantidadEmergencias),
      ahoraCadena: Number(e.ahora),
      comisionBps,
      tesoreria,
    };
    return ultimo;
  }

  async function herederos(): Promise<HerederoVista[]> {
    const l = llave();
    const lista = await l.read.herederos();
    return Promise.all(
      lista.map(async (h) => {
        const [parte, cobro, verificacion] = await Promise.all([
          l.read.parteDe([h.cuenta]),
          l.read.cobro([h.cuenta]),
          verificar(h.cuenta),
        ]);
        return { cuenta: h.cuenta, alias: aliasDe(h.cuenta), bps: Number(h.bps), parte, cobro, verificacion };
      }),
    );
  }

  async function guardianes(): Promise<GuardianVista[]> {
    const g = await llave().read.guardianes();
    return Promise.all(
      [...g].map(async (cuenta) => ({ cuenta, alias: aliasDe(cuenta), verificacion: await verificar(cuenta) })),
    );
  }

  async function emergencias(): Promise<EmergenciaVista[]> {
    const l = llave();
    const n = Number(await l.read.cantidadEmergencias());
    const yo = sesion()?.cuenta;
    const ids = Array.from({ length: n }, (_, i) => i);
    return Promise.all(
      ids.map(async (id) => {
        const [e, yoVote] = await Promise.all([
          l.read.emergencia([BigInt(id)]),
          yo ? l.read.voto([BigInt(id), yo]) : Promise.resolve(false),
        ]);
        let vigente: boolean | undefined;
        if (vigenteSoportado !== false) {
          try {
            vigente = await l.read.emergenciaVigente([BigInt(id)]);
            vigenteSoportado = true;
          } catch {
            vigenteSoportado = false;
          }
        }
        return {
          id,
          proponente: e.proponente,
          destino: e.destino,
          aliasDestino: aliasDe(e.destino),
          monto: e.monto,
          motivo: e.motivo,
          propuestaEn: Number(e.propuestaEn),
          aprobadaEn: Number(e.aprobadaEn),
          votos: Number(e.votos),
          ejecutada: e.ejecutada,
          vetada: e.vetada,
          yoVote,
          vigente,
        };
      }),
    );
  }

  async function saldoDe(cuenta: Address): Promise<bigint> {
    return pc.readContract({ address: await pesos(), abi: pesosAbi, functionName: "balanceOf", args: [cuenta] });
  }

  function verificacion(cuenta: Address): Promise<Verificacion> {
    return verificar(cuenta);
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

  // ───────────── escrituras ─────────────

  const fallo = (nombre: string, mensaje: string): ResultadoTx => ({ ok: false, error: { nombre, mensaje } });

  async function contexto(): Promise<ContextoError> {
    const e = ultimo ?? (await estado().catch(() => null));
    return { ahora: e?.ahoraCadena, decimales: e?.decimales, simbolo: e?.simbolo };
  }

  /** P2-8: política de patrocinio en el cliente. No es un paymaster: evita mandar userOps que el contrato rechazaría. */
  async function puedeOperarSinGasCuenta(cuenta: Address): Promise<boolean> {
    if (!config.politicaPatrocinio) return true;
    const dueno = ultimo?.dueno ?? (await llave().read.dueno().catch(() => undefined));
    if (dueno && dueno.toLowerCase() === cuenta.toLowerCase()) return true;
    return (await verificar(cuenta)).esPersona;
  }

  async function ejecutar<N extends Escritura>(functionName: N, args: Args<N>): Promise<ResultadoTx> {
    try {
      const s = sesion();
      if (!s) return fallo("SinSesion", MENSAJE_SIN_SESION);
      if (!(await puedeOperarSinGasCuenta(s.cuenta))) return fallo("SinPatrocinio", MENSAJE_SIN_GAS);
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
      if (!(await puedeOperarSinGasCuenta(s.cuenta))) return fallo("SinPatrocinio", MENSAJE_SIN_GAS);
      const address = requerirDireccion();
      const t = await infoToken();
      // El batch (3 llamadas en una userOp) no se puede simular como una sola llamada en el RPC público.
      // Se valida lo que se puede antes de mandar: faucet() simulado, saldo final suficiente y fase ≠ Repartiendo.
      const [montoFaucet, saldo, e] = await Promise.all([
        pc.readContract({ address: t.direccion, abi: pesosAbi, functionName: "MONTO_FAUCET" }).catch(() => 0n),
        saldoDe(s.cuenta),
        estado(),
      ]);
      await pc.simulateContract({ address: t.direccion, abi: pesosAbi, functionName: "faucet", account: s.cuenta });
      if (saldo + montoFaucet < monto) {
        return fallo("SaldoInsuficiente", mensajeDe("SaldoInsuficiente", [monto, saldo + montoFaucet], await contexto()));
      }
      if (e.fase === "Repartiendo") return fallo("RepartoEnCurso", mensajeDe("RepartoEnCurso"));
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
    guardianes,
    emergencias,
    saldoDe,
    verificacion,
    escucharEventos,
    // sesión
    sesion,
    entrar: (email: string) => entrar(email ? email.split("@")[0] : undefined),
    salir,
    // escrituras (todas patrocinadas)
    estoyBien: () => ejecutar("estoyBien", []),
    cargarPesosDePrueba,
    retirar: (a, monto) => ejecutar("retirar", [a, monto]),
    iniciarReclamo: () => ejecutar("iniciarReclamo", []),
    cobrar: () => ejecutar("cobrar", []),
    proponerEmergencia: (destino, monto, motivo) => ejecutar("proponerEmergencia", [destino, monto, motivo]),
    aprobarEmergencia: (id) => ejecutar("aprobarEmergencia", [BigInt(id)]),
    ejecutarEmergencia: (id) => ejecutar("ejecutarEmergencia", [BigInt(id)]),
    vetarEmergencia: (id) => ejecutar("vetarEmergencia", [BigInt(id)]),
    // extras
    direccion: requerirDireccion,
    faucet,
    pruebaPatrocinio,
    depositar: (monto) => ejecutar("depositar", [monto]),
    permitirDestino: (destino, permitido) => ejecutar("permitirDestino", [destino, permitido]),
    puedeOperarSinGas: async () => {
      const s = sesion();
      return s ? puedeOperarSinGasCuenta(s.cuenta) : false;
    },
    ultimoEstado: () => ultimo,
  };
}
