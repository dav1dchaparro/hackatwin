/**
 * Panel de integración de P2 (provisional, sin diseño): sirve para P2-1 (4 SA por email), P2-3 (1.ª tx patrocinada),
 * P2-4/P2-5 (lecturas y los 9 métodos de escritura con errores en castellano) y P2-6 (semáforo KUMPLY).
 * P3 arma las pantallas reales en web/src/pages; este panel puede quedar colgado de una ruta /integracion o borrarse.
 */
import { useCallback, useEffect, useState } from "react";
import { parseUnits, type Address } from "viem";
import { crearClienteFuji } from "../cliente-fuji";
import { aliasDe, clinicaDemo, config, direccionLlave, direccionPesos, urlCuenta } from "../config";
import { hayApiKey, onSesion, reconectar, saldoAvax, sesion as sesionGuardada } from "../gasless";
import { FIXTURES_KUMPLY, fuenteKumply, verificar } from "../kumply";
import type { EmergenciaVista, EstadoLlave, EventoLlave, GuardianVista, HerederoVista, ResultadoTx, Sesion, Verificacion } from "../tipos";

const cliente = crearClienteFuji();

const json = (x: unknown) => JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2);
const hora = () => new Date().toLocaleTimeString("es-AR", { hour12: false });

interface Linea {
  hora: string;
  accion: string;
  r: ResultadoTx;
}

export function PanelIntegracion() {
  const [sesion, setSesion] = useState<Sesion | null>(sesionGuardada());
  const [avax, setAvax] = useState<string>("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [estado, setEstado] = useState<EstadoLlave | null>(null);
  const [herederos, setHerederos] = useState<HerederoVista[]>([]);
  const [guardianes, setGuardianes] = useState<GuardianVista[]>([]);
  const [emergencias, setEmergencias] = useState<EmergenciaVista[]>([]);
  const [eventos, setEventos] = useState<EventoLlave[]>([]);
  const [errorLectura, setErrorLectura] = useState<string>("");
  const [cuentaVerificar, setCuentaVerificar] = useState<string>("");
  const [verif, setVerif] = useState<Verificacion | null>(null);
  const [montoPesos, setMontoPesos] = useState("200000");
  const [destinoRetiro, setDestinoRetiro] = useState("");
  const [destinoEmergencia, setDestinoEmergencia] = useState<string>(clinicaDemo());
  const [montoEmergencia, setMontoEmergencia] = useState("150000");
  const [motivo, setMotivo] = useState("Internación en la Clínica");
  const [idEmergencia, setIdEmergencia] = useState("0");
  const [llaveInput, setLlaveInput] = useState(direccionLlave() ?? "");

  const llave = direccionLlave();
  const decimales = estado?.decimales ?? 18;

  // sesión: restaurar tras F5 y escuchar cambios
  useEffect(() => {
    const off = onSesion(setSesion);
    if (hayApiKey()) {
      reconectar().then((s) => {
        setSesion(s);
        if (s) saldoAvax().then((b) => setAvax(b.toString())).catch(() => setAvax("?"));
      });
    }
    return off;
  }, []);

  // lecturas cada 2 s
  const leer = useCallback(async () => {
    if (!llave) return;
    try {
      const [e, h, g, em] = await Promise.all([
        cliente.estado(),
        cliente.herederos(),
        cliente.guardianes(),
        cliente.emergencias(),
      ]);
      setEstado(e);
      setHerederos(h);
      setGuardianes(g);
      setEmergencias(em);
      setErrorLectura("");
    } catch (e) {
      setErrorLectura(e instanceof Error ? e.message : String(e));
    }
  }, [llave]);

  useEffect(() => {
    if (!llave) return;
    leer();
    const t = setInterval(leer, config.pollMs);
    const off = cliente.escucharEventos((ev) => setEventos((prev) => [ev, ...prev].slice(0, 50)));
    return () => {
      clearInterval(t);
      off();
    };
  }, [llave, leer]);

  async function correr(accion: string, f: () => Promise<ResultadoTx>) {
    setOcupado(accion);
    try {
      const r = await f();
      setLineas((prev) => [{ hora: hora(), accion, r }, ...prev]);
      if (r.ok) {
        leer();
        saldoAvax().then((b) => setAvax(b.toString())).catch(() => undefined);
      }
    } finally {
      setOcupado(null);
    }
  }

  async function entrar() {
    setOcupado("entrar");
    try {
      const s = await cliente.entrar("");
      setSesion(s);
      setAvax((await saldoAvax()).toString());
    } catch (e) {
      alert(`No se pudo entrar: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setOcupado(null);
    }
  }

  async function salir() {
    setOcupado("salir");
    try {
      await cliente.salir();
      setSesion(null);
      setAvax("");
    } finally {
      setOcupado(null);
    }
  }

  async function verificarCuenta(c: string) {
    setCuentaVerificar(c);
    try {
      setVerif(await verificar(c as Address, { sinCache: true }));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  const b = (accion: string, f: () => Promise<ResultadoTx>, deshabilitado = false) => (
    <button key={accion} disabled={ocupado !== null || !sesion || deshabilitado} onClick={() => correr(accion, f)}>
      {ocupado === accion ? "…" : accion}
    </button>
  );

  const fk = fuenteKumply();

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 980, margin: "0 auto", padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ fontSize: 20 }}>Llave de Emergencia · panel de integración (P2)</h1>

      <section>
        <h2 style={{ fontSize: 16 }}>Configuración</h2>
        <ul>
          <li>modo: <b>{config.modo}</b> · chain {config.chainId} · RPC {config.rpcUrl}</li>
          <li>llave: {llave ? <a href={urlCuenta(llave)} target="_blank" rel="noreferrer">{llave}</a> : <i>sin dirección (usá ?llave=0x…)</i>}</li>
          <li>pesos: {direccionPesos() ?? <i>sin dirección (VITE_PESOS_ADDRESS o fuji.json)</i>}</li>
          <li>KUMPLY store: {config.kumplyStore} · fuente: <b>{fk.fuente}</b>{fk.motivo ? ` (fallback: ${fk.motivo})` : ""}</li>
          <li>0xGasless API key: <b>{hayApiKey() ? "presente" : "FALTA (web/.env.local → VITE_OXGASLESS_API_KEY)"}</b> · bundler {config.oxgasless.bundlerUrl}</li>
          <li>política de patrocinio en el cliente (P2-8): {config.politicaPatrocinio ? "activa" : "apagada"}</li>
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const u = new URL(window.location.href);
            u.searchParams.set("llave", llaveInput.trim());
            window.location.href = u.toString();
          }}
        >
          <input value={llaveInput} onChange={(e) => setLlaveInput(e.target.value)} placeholder="0x… instancia" size={48} />{" "}
          <button type="submit">usar ?llave=</button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>Sesión (0xGasless, email)</h2>
        {sesion ? (
          <ul>
            <li>email: <b>{sesion.email}</b> · alias: {sesion.alias}</li>
            <li>smart account: <a href={urlCuenta(sesion.cuenta)} target="_blank" rel="noreferrer">{sesion.cuenta}</a> ← esta es la que atesta KUMPLY y la que ve el contrato</li>
            <li>EOA (KMS, no se usa para firmar tx): {sesion.eoa}</li>
            <li>AVAX de la smart account: <b>{avax === "" ? "…" : `${avax} wei`}</b> (tiene que ser 0)</li>
            <li>¿puede operar sin gas (P2-8)? <button onClick={async () => alert((await cliente.puedeOperarSinGas()) ? "sí" : "no: " + "Tu cuenta tiene que estar verificada para operar sin gas.")}>consultar</button></li>
          </ul>
        ) : (
          <p>Sin sesión. Para P2-1: entrá con cada email (Marta, Lucía, Pablo, Rosa), anotá la smart account y salí.</p>
        )}
        <button onClick={entrar} disabled={ocupado !== null || !hayApiKey() || !!sesion}>Entrar con email</button>{" "}
        <button onClick={salir} disabled={ocupado !== null || !sesion}>Salir</button>
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>Transacciones patrocinadas (todas salen de la smart account)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {b("pruebaPatrocinio (userOp vacía)", () => cliente.pruebaPatrocinio())}
          {b("faucet() 1.ª tx (P2-3)", () => cliente.faucet(), !direccionPesos() && !llave)}
          {b("estoyBien", () => cliente.estoyBien(), !llave)}
          {b("iniciarReclamo", () => cliente.iniciarReclamo(), !llave)}
          {b("cobrar", () => cliente.cobrar(), !llave)}
        </div>
        <div style={{ marginTop: 8 }}>
          <input value={montoPesos} onChange={(e) => setMontoPesos(e.target.value)} size={10} /> pesos{" "}
          {b("cargarPesosDePrueba (faucet+approve+depositar)", () => cliente.cargarPesosDePrueba(parseUnits(montoPesos || "0", decimales)), !llave)}{" "}
          {b("depositar", () => cliente.depositar(parseUnits(montoPesos || "0", decimales)), !llave)}
        </div>
        <div style={{ marginTop: 8 }}>
          <input value={destinoRetiro} onChange={(e) => setDestinoRetiro(e.target.value)} placeholder="0x… destino del retiro" size={46} />{" "}
          {b("retirar", () => cliente.retirar(destinoRetiro as Address, parseUnits(montoPesos || "0", decimales)), !llave)}
        </div>
        <div style={{ marginTop: 8 }}>
          <input value={destinoEmergencia} onChange={(e) => setDestinoEmergencia(e.target.value)} size={46} />{" "}
          <input value={montoEmergencia} onChange={(e) => setMontoEmergencia(e.target.value)} size={10} />{" "}
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} size={28} />{" "}
          {b("proponerEmergencia", () => cliente.proponerEmergencia(destinoEmergencia as Address, parseUnits(montoEmergencia || "0", decimales), motivo), !llave)}{" "}
          {b("permitirDestino", () => cliente.permitirDestino(destinoEmergencia as Address, true), !llave)}
        </div>
        <div style={{ marginTop: 8 }}>
          id <input value={idEmergencia} onChange={(e) => setIdEmergencia(e.target.value)} size={4} />{" "}
          {b("aprobarEmergencia", () => cliente.aprobarEmergencia(Number(idEmergencia)), !llave)}{" "}
          {b("ejecutarEmergencia", () => cliente.ejecutarEmergencia(Number(idEmergencia)), !llave)}{" "}
          {b("vetarEmergencia", () => cliente.vetarEmergencia(Number(idEmergencia)), !llave)}
        </div>
        <ol style={{ fontSize: 13 }}>
          {lineas.map((l, i) => (
            <li key={i}>
              {l.hora} <b>{l.accion}</b> →{" "}
              {l.r.ok ? (
                <>
                  ✅ <a href={l.r.url} target="_blank" rel="noreferrer">{l.r.hash}</a> · {l.r.ms} ms hasta incluida · final = incluida (+{l.r.msFinal} ms)
                </>
              ) : (
                <>
                  ❌ <b>{l.r.error?.mensaje}</b> <small>({l.r.error?.nombre})</small>
                </>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>KUMPLY (semáforo con @kumply/sdk)</h2>
        <input value={cuentaVerificar} onChange={(e) => setCuentaVerificar(e.target.value)} placeholder="0x…" size={46} />{" "}
        <button onClick={() => verificarCuenta(cuentaVerificar)}>verificar</button>{" "}
        <button onClick={() => verificarCuenta(FIXTURES_KUMPLY.persona3)}>fixture persona (tier 3)</button>{" "}
        <button onClick={() => verificarCuenta(FIXTURES_KUMPLY.empresa)}>Clínica (tier 4)</button>{" "}
        <button onClick={() => verificarCuenta(FIXTURES_KUMPLY.sinVerificar)}>fixture sin verificar</button>{" "}
        {sesion && <button onClick={() => verificarCuenta(sesion.cuenta)}>mi smart account</button>}
        {verif && (
          <p>
            {verif.esPersona ? "🟢 Identidad verificada ✓ (persona)" : verif.esEmpresa ? "🏢 Empresa verificada" : "🔴 Sin verificar"} · tier {verif.tier} · fuente {verif.fuente}
          </p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>Estado de la llave {llave ? `(${aliasDe(estado?.dueno)})` : ""}</h2>
        {errorLectura && <p style={{ color: "crimson" }}>{errorLectura}</p>}
        <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{json({ estado, herederos, guardianes, emergencias })}</pre>
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>Eventos (polling cada {config.pollMs / 1000} s)</h2>
        <ul style={{ fontSize: 13 }}>
          {eventos.map((ev, i) => (
            <li key={i}>
              {new Date(ev.cuando * 1000).toLocaleTimeString("es-AR", { hour12: false })} <b>{ev.nombre}</b> {json(ev.args)}{" "}
              <a href={ev.url} target="_blank" rel="noreferrer">tx</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
