/**
 * Panel de integración de P2 (provisional, sin diseño), en la ruta /integracion: sirve para P2-1 (smart account por
 * email), P2-3 (1.ª tx patrocinada), P2-4/P2-5 (lecturas y escrituras de la dueña con errores en castellano) y
 * P2-6 (semáforo KUMPLY, incluido el agente tier 5). P3 arma las pantallas reales en web/src/pages.
 */
import { useCallback, useEffect, useState } from "react";
import { formatUnits, parseUnits, type Address } from "viem";
import { ABI_GENERADO } from "../abi-llave";
import { crearClienteFuji } from "../cliente-fuji";
import { aliasDe, config, direccionAgente, direccionLlave, direccionPesos, urlCuenta } from "../config";
import { hayApiKey, onSesion, reconectar, saldoAvax, sesion as sesionGuardada } from "../gasless";
import { FIXTURES_KUMPLY, fuenteKumply, verificar } from "../kumply";
import type { AgenteVista, EstadoLlave, EventoLlave, HerederoVista, ResultadoTx, Sesion, Verificacion } from "../tipos";

const cliente = crearClienteFuji();

const json = (x: unknown) => JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2);
const hora = () => new Date().toLocaleTimeString("es-AR", { hour12: false });

interface Linea {
  hora: string;
  accion: string;
  r: ResultadoTx;
}

function Badge({ v }: { v: Verificacion }) {
  const texto = v.esAgente
    ? "🤖 Agente verificado ✓ (tier 5)"
    : v.esEmpresa
      ? "🏢 Empresa verificada (tier 4)"
      : v.esPersona
        ? `🟢 Identidad verificada ✓ (tier ${v.tier})`
        : "🔴 Sin verificar";
  return (
    <span>
      {texto} · fuente {v.fuente}
    </span>
  );
}

export function PanelIntegracion() {
  const [sesion, setSesion] = useState<Sesion | null>(sesionGuardada());
  const [avax, setAvax] = useState<string>("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [estado, setEstado] = useState<EstadoLlave | null>(null);
  const [herederos, setHerederos] = useState<HerederoVista[]>([]);
  const [agente, setAgente] = useState<AgenteVista | null>(null);
  const [eventos, setEventos] = useState<EventoLlave[]>([]);
  const [errorLectura, setErrorLectura] = useState<string>("");
  const [cuentaVerificar, setCuentaVerificar] = useState<string>("");
  const [verif, setVerif] = useState<Verificacion | null>(null);
  const [montoPesos, setMontoPesos] = useState("200000");
  const [destinoRetiro, setDestinoRetiro] = useState("");
  const [herederosInput, setHerederosInput] = useState("");
  const [bpsInput, setBpsInput] = useState("6000,4000");
  const [plazoInactividad, setPlazoInactividad] = useState("60");
  const [plazoGracia, setPlazoGracia] = useState("30");
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
      const [e, h, a] = await Promise.all([cliente.estado(), cliente.herederos(), cliente.agente()]);
      setEstado(e);
      setHerederos(h);
      setAgente(a);
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
  const faltan = estado ? estado.venceEn - estado.ahoraCadena : null;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 980, margin: "0 auto", padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ fontSize: 20 }}>Llave · panel de integración (P2)</h1>

      <section>
        <h2 style={{ fontSize: 16 }}>Configuración</h2>
        <ul>
          <li>modo: <b>{config.modo}</b> · chain {config.chainId} · RPC {config.rpcUrl} · ABI {ABI_GENERADO ? "generado por P1" : "provisional"}</li>
          <li>llave: {llave ? <a href={urlCuenta(llave)} target="_blank" rel="noreferrer">{llave}</a> : <i>sin dirección (usá ?llave=0x…)</i>}</li>
          <li>pesos: {direccionPesos() ?? <i>sin dirección (VITE_PESOS_ADDRESS o fuji.json)</i>}</li>
          <li>agente: {direccionAgente() ?? <i>sin dirección (VITE_AGENTE_ADDRESS o fuji.json → cuentas.agente)</i>}</li>
          <li>KUMPLY store: {config.kumplyStore} · fuente: <b>{fk.fuente}</b>{fk.motivo ? ` (fallback: ${fk.motivo})` : ""}</li>
          <li>0xGasless API key: <b>{hayApiKey() ? "presente" : "FALTA (web/.env.local → VITE_OXGASLESS_API_KEY)"}</b> · bundler {config.oxgasless.bundlerUrl}</li>
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
            <li>smart account: <a href={urlCuenta(sesion.cuenta)} target="_blank" rel="noreferrer">{sesion.cuenta}</a> ← la que ve el contrato (dueña de la Llave)</li>
            <li>EOA (KMS, no se usa para firmar tx): {sesion.eoa}</li>
            <li>AVAX de la smart account: <b>{avax === "" ? "…" : `${avax} wei`}</b> (tiene que ser 0)</li>
            <li>¿es la dueña de esta Llave? <button onClick={async () => alert((await cliente.puedeOperar()) ? "sí" : "no")}>consultar</button></li>
          </ul>
        ) : (
          <p>Sin sesión. Entrá con el email de Marta (dueña). Los herederos no necesitan cuenta: reciben la plata en su dirección.</p>
        )}
        <button onClick={entrar} disabled={ocupado !== null || !hayApiKey() || !!sesion}>Entrar con email</button>{" "}
        <button onClick={salir} disabled={ocupado !== null || !sesion}>Salir</button>
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>Transacciones patrocinadas de la dueña (todas salen de la smart account)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {b("pruebaPatrocinio (userOp vacía)", () => cliente.pruebaPatrocinio())}
          {b("faucet() 1.ª tx (P2-3)", () => cliente.faucet(), !direccionPesos() && !llave)}
          {b("estoyBien", () => cliente.estoyBien(), !llave)}
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
          <input value={herederosInput} onChange={(e) => setHerederosInput(e.target.value)} placeholder="0x…,0x… herederos" size={60} />{" "}
          <input value={bpsInput} onChange={(e) => setBpsInput(e.target.value)} placeholder="6000,4000" size={12} />{" "}
          inactividad <input value={plazoInactividad} onChange={(e) => setPlazoInactividad(e.target.value)} size={5} /> s{" "}
          gracia <input value={plazoGracia} onChange={(e) => setPlazoGracia(e.target.value)} size={5} /> s{" "}
          {b(
            "configurar",
            () =>
              cliente.configurar({
                herederos: herederosInput.split(",").map((x) => x.trim()).filter(Boolean) as Address[],
                bps: bpsInput.split(",").map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x)),
                plazoInactividad: Number(plazoInactividad),
                plazoGracia: Number(plazoGracia),
              }),
            !llave,
          )}
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
        {direccionAgente() && <button onClick={() => verificarCuenta(direccionAgente()!)}>agente (tier 5)</button>}{" "}
        <button onClick={() => verificarCuenta(FIXTURES_KUMPLY.persona3)}>fixture persona (tier 3)</button>{" "}
        <button onClick={() => verificarCuenta(FIXTURES_KUMPLY.empresa)}>fixture empresa (tier 4)</button>{" "}
        <button onClick={() => verificarCuenta(FIXTURES_KUMPLY.sinVerificar)}>fixture sin verificar</button>{" "}
        {sesion && <button onClick={() => verificarCuenta(sesion.cuenta)}>mi smart account</button>}
        {verif && (
          <p>
            <Badge v={verif} /> · tier {verif.tier}
          </p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>Estado de la Llave {estado ? `· dueña ${aliasDe(estado.dueno)} · fase ${estado.fase}` : ""}</h2>
        {errorLectura && <p style={{ color: "crimson" }}>{errorLectura}</p>}
        {estado && (
          <p>
            saldo {formatUnits(estado.saldo, estado.decimales)} {estado.simbolo} · vence en {faltan} s (reloj de la cadena) · gracia{" "}
            {estado.graciaTerminaEn ? `termina en ${estado.graciaTerminaEn - estado.ahoraCadena} s` : "sin reclamo"} · comisión{" "}
            {estado.comisionBps / 100}% · {estado.liberadaEn ? `liberada (${formatUnits(estado.totalLiberado, estado.decimales)})` : "no liberada"}
          </p>
        )}
        {agente && (
          <p>
            agente {agente.alias} {agente.cuenta}: <Badge v={agente.verificacion} />
          </p>
        )}
        <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{json({ estado, herederos })}</pre>
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
