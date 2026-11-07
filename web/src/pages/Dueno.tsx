// Mi Llave: consola de la dueña (gestora de la herencia). Conectar → señal de vida y período → herederos y
// destinos → mi plata. Todo lo que se guarda "en la cadena" pasa por `configurar`; emails y nombres quedan en el dispositivo.
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Address } from "viem";
import { cliente } from "../lib";
import type { ConfigLlave, ResultadoTx } from "../lib";
import { Aviso } from "../components/Aviso";
import { BotonTx } from "../components/BotonTx";
import { Chip } from "../components/Chip";
import { CuentaRegresiva } from "../components/CuentaRegresiva";
import { Encabezado } from "../components/Encabezado";
import { IcoCorazon, IcoMas, IcoX } from "../components/Iconos";
import { NOMBRE_FASE } from "../components/LineaDeFases";
import { Modulo } from "../components/Modulo";
import { Tile } from "../components/Tile";
import { acortar, bpsIguales, haceX, horaDe, mismaCuenta, mmss, porcentaje } from "../components/formato";
import { cargarMeta, cargarRecordatorio, guardarMeta, guardarRecordatorio, NOMBRE_TIPO } from "../components/metaDestinos";
import type { MetaDestino, TipoDestino } from "../components/metaDestinos";
import { useLlave } from "../components/useLlave";
import type { DatosLlave } from "../components/useLlave";
import { useReloj } from "../components/useReloj";
import { useSesion } from "../components/useSesion";

const DIA = 86_400;
const PERIODOS = [
  { seg: 30 * DIA, etiqueta: "30 días" },
  { seg: 90 * DIA, etiqueta: "90 días" },
  { seg: 180 * DIA, etiqueta: "180 días" },
];
const GRACIAS = [
  { seg: 7 * DIA, etiqueta: "7 días" },
  { seg: 15 * DIA, etiqueta: "15 días" },
  { seg: 30 * DIA, etiqueta: "30 días" },
];
const ES_CUENTA = /^0x[0-9a-fA-F]{40}$/;

export function Dueno() {
  const { sesion } = useSesion();
  const { datos, recargar } = useLlave();
  const ahora = useReloj(datos?.estado.ahoraCadena ?? 0, datos?.leidoEn ?? Date.now(), 1000);

  if (!sesion) return <Conectar />;
  if (!datos) return <p className="muted">Cargando tu Llave…</p>;

  const { estado } = datos;
  const esDuena = mismaCuenta(sesion.cuenta, estado.dueno);
  const fase = estado.fase;
  const liberada = estado.liberadaEn > 0;

  return (
    <>
      <Encabezado
        titulo="Mi Llave"
        descripcion="Mientras das señales de vida, tu plata es tuya. Si dejás de darlas, un agente verificado avisa, espera y la reparte como vos dijiste. Cuánto hay en tu bóveda lo sabés solo vos."
        acciones={
          <BotonTx texto="Estoy bien" icono={<IcoCorazon tam={18} />} variante="ok" tamano="grande" accion={() => cliente.estoyBien()}
            onResultado={() => void recargar()} deshabilitado={!esDuena || liberada} />
        }
      />

      {!esDuena && <Aviso tono="mal" titulo="Esta cuenta no es la del dueño de esta Llave.">Solo el dueño puede entrar. Salí y conectate con tu email. Cuenta: {acortar(sesion.cuenta)}</Aviso>}
      {fase === "EnGracia" && (
        <Aviso tono="mal" role="alert" titulo="El agente avisó que no respondés.">
          Tocá «Estoy bien» para cancelarlo. Te quedan <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />.
        </Aviso>
      )}
      {fase === "Ejecutable" && <Aviso tono="mal" role="alert" titulo="Terminó la espera.">El agente está por liberar tu herencia. Si estás bien, tocá «Estoy bien» ahora mismo.</Aviso>}
      {fase === "Vencida" && <Aviso tono="alerta" titulo="Pasó el plazo sin señales.">Tocá «Estoy bien» antes de que el agente avise a tus herederos.</Aviso>}
      {liberada && <Aviso tono="info" titulo="Tu Llave ya se liberó.">La plata se envió a tus herederos. Esta Llave no acepta más cambios.</Aviso>}

      <Modulo titulo="Señal de vida" descripcion="Cada movimiento tuyo cuenta como señal. Elegí cada cuánto querés darla.">
        <div className="tiles">
          <Tile etiqueta={fase === "Activa" ? "Vence en" : fase === "EnGracia" ? "Se libera en" : "Estado"}
            valor={fase === "Activa"
              ? <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />
              : fase === "EnGracia"
                ? <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />
                : NOMBRE_FASE[fase]}
            chico destacado nota={fase === "Activa" ? `Cada ${etiquetaPeriodo(estado.plazoInactividad)} sin señales` : NOMBRE_FASE[fase]} />
          <Tile etiqueta="Última señal" valor={haceX(estado.ultimaSenal, ahora)} chico nota={horaDe(estado.ultimaSenal)} />
          <Tile etiqueta="Espera para cancelar" valor={etiquetaPeriodo(estado.plazoGracia)} chico nota="Después del aviso del agente" />
        </div>
        <PeriodoConfig datos={datos} esDuena={esDuena} email={sesion.email} alRecargar={() => void recargar()} />
      </Modulo>

      <Modulo titulo="Herederos y destinos" descripcion="Cada persona con su email y su porcentaje. Si querés, parte va a un fondo común o a una donación. Los emails quedan en tu dispositivo; a la cadena van solo cuentas y porcentajes.">
        <DestinosEditor datos={datos} esDuena={esDuena} alRecargar={() => void recargar()} />
      </Modulo>

    </>
  );
}

function etiquetaPeriodo(seg: number): string {
  const p = PERIODOS.find((x) => x.seg === seg) ?? GRACIAS.find((x) => x.seg === seg);
  if (p) return p.etiqueta;
  if (seg >= DIA) return `${Math.round(seg / DIA)} días`;
  return mmss(seg);
}

/* ───────────── Conectar (sin sesión) ───────────── */
function Conectar() {
  const { entrar } = useSesion();
  const [email, setEmail] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Escribí un email válido."); return; }
    setOcupado(true); setError(null);
    try { await entrar(email.trim()); } catch (err) { setError(err instanceof Error ? err.message : "No se pudo conectar. Probá de nuevo."); } finally { setOcupado(false); }
  }
  return (
    <>
      <Encabezado titulo="Mi Llave" descripcion="Conectá tu cuenta con tu email. No instalás nada, no comprás nada y no pagás comisiones de red." />
      <form className="tarjeta tarjeta-angosta" onSubmit={onSubmit}>
        <div><h3>Conectar mi cuenta</h3><p className="descripcion">Tu cuenta se crea con tu email y queda protegida por tu acceso. Nadie más la puede usar.</p></div>
        <label className="campo"><span>Email</span><input id="email-conectar" type="email" inputMode="email" autoComplete="email" placeholder="vos@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <button type="submit" className="btn btn-primario btn-grande" disabled={ocupado}>{ocupado ? <><span className="spinner" aria-hidden /> Conectando…</> : "Conectar"}</button>
        {error && <p className="tx-error" role="alert">{error}</p>}
        <div className="chips"><Chip title="La cuenta la crea 0xGasless a partir de tu email">0xGasless</Chip><Chip title="Red de prueba Fuji de Avalanche">Avalanche Fuji</Chip></div>
      </form>
    </>
  );
}

/* ───────────── Período y recordatorio ───────────── */
function PeriodoConfig({ datos, esDuena, email, alRecargar }: { datos: DatosLlave; esDuena: boolean; email: string; alRecargar: () => void }) {
  const { estado, herederos } = datos;
  const [periodo, setPeriodo] = useState(estado.plazoInactividad);
  const [gracia, setGracia] = useState(estado.plazoGracia);
  const guardado = cargarRecordatorio();
  const [recordar, setRecordar] = useState(guardado?.activo ?? true);
  const [emailRec, setEmailRec] = useState(guardado?.email ?? email);
  const [diasAntes, setDiasAntes] = useState(guardado?.diasAntes ?? 3);
  const liberada = estado.liberadaEn > 0;
  const cambio = periodo !== estado.plazoInactividad || gracia !== estado.plazoGracia;
  const periodosVisibles = PERIODOS.filter((p) => p.seg >= estado.plazoInactividad || p.seg >= 60);
  const graciasVisibles = GRACIAS;

  async function guardar(): Promise<ResultadoTx> {
    guardarRecordatorio({ activo: recordar, email: emailRec.trim(), diasAntes });
    if (!cambio) return { ok: true };
    if (!cliente.configurar) return { ok: false, error: { nombre: "NoDisponible", mensaje: "Guardar en la cadena llega con la conexión real." } };
    const config: ConfigLlave = { herederos: herederos.map((h) => h.cuenta), bps: herederos.map((h) => h.bps), plazoInactividad: periodo, plazoGracia: gracia };
    return cliente.configurar(config);
  }

  return (
    <div className="tarjeta">
      <div className="tarjeta-cab"><div><h3>Cada cuánto das señal de vida</h3><p className="descripcion">Si pasa este tiempo sin ninguna señal tuya, el agente avisa y abre la espera.</p></div></div>
      <div className="segmentado" role="group" aria-label="Período sin señales">
        {periodosVisibles.map((p) => (
          <button key={p.seg} type="button" className={periodo === p.seg ? "activo" : ""} onClick={() => setPeriodo(p.seg)}>{p.etiqueta}</button>
        ))}
      </div>
      <label className="campo">
        <span>Espera para cancelar, después del aviso</span>
        <div className="segmentado" role="group" aria-label="Espera para cancelar">
          {graciasVisibles.map((g) => (
            <button key={g.seg} type="button" className={gracia === g.seg ? "activo" : ""} onClick={() => setGracia(g.seg)}>{g.etiqueta}</button>
          ))}
        </div>
      </label>
      <div className="separador" />
      <label className="campo campo-linea">
        <input id="recordar" type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
        <span>Recordame por email antes de que venza</span>
      </label>
      {recordar && (
        <div className="grilla-2">
          <label className="campo"><span>Email</span><input id="email-recordatorio" type="email" value={emailRec} onChange={(e) => setEmailRec(e.target.value)} /></label>
          <label className="campo"><span>Días antes</span><input id="dias-antes" inputMode="numeric" value={diasAntes} onChange={(e) => setDiasAntes(parseInt(e.target.value, 10) || 0)} /></label>
        </div>
      )}
      <BotonTx texto={cambio ? "Guardar en la cadena" : "Guardar"} accion={guardar} onResultado={alRecargar} deshabilitado={!esDuena || liberada}
        nota={cambio ? "El nuevo período queda escrito en el contrato y cuenta como señal de vida." : "El recordatorio se guarda en este dispositivo."} />
    </div>
  );
}

/* ───────────── Herederos y destinos (tabla editable) ───────────── */
type Preset = "iguales" | "porcentajes" | "uno";
interface FilaDestino { id: number; tipo: TipoDestino; email: string; nombre: string; cuenta: string; cuentaManual: string; pct: string; resolviendo: boolean }

function DestinosEditor({ datos, esDuena, alRecargar }: { datos: DatosLlave; esDuena: boolean; alRecargar: () => void }) {
  const { estado, herederos } = datos;
  const [preset, setPreset] = useState<Preset>("porcentajes");
  const [filas, setFilas] = useState<FilaDestino[]>([]);
  const inicializado = useRef(false);
  const siguienteId = useRef(1);
  const liberada = estado.liberadaEn > 0;

  useEffect(() => {
    if (inicializado.current || herederos.length === 0) return;
    inicializado.current = true;
    const meta = cargarMeta();
    setFilas(herederos.map((h) => {
      const m = meta[h.cuenta.toLowerCase()];
      return { id: siguienteId.current++, tipo: m?.tipo ?? "persona", email: m?.email ?? "", nombre: m?.nombre ?? h.alias, cuenta: h.cuenta, cuentaManual: m && m.tipo !== "persona" ? h.cuenta : "", pct: (h.bps / 100).toString(), resolviendo: false };
    }));
  }, [herederos]);

  const bps: number[] = preset === "iguales" ? bpsIguales(filas.length)
    : preset === "uno" ? filas.map((_, i) => (i === 0 ? 10_000 : 0))
    : filas.map((f) => Math.round((parseFloat(f.pct.replace(",", ".")) || 0) * 100));
  const suma = bps.reduce((a, b) => a + b, 0);
  const sumaOk = suma === 10_000 && bps.every((b) => b > 0);
  const cuentasOk = filas.length > 0 && filas.length <= 5 && filas.every((f) => ES_CUENTA.test(f.cuenta.trim()) && !f.resolviendo);
  const repetidas = new Set(filas.map((f) => f.cuenta.toLowerCase())).size !== filas.length;
  const sinCambios = filas.length === herederos.length && filas.every((f, i) => mismaCuenta(f.cuenta, herederos[i]?.cuenta) && bps[i] === herederos[i]?.bps);

  const actualizar = (id: number, cambios: Partial<FilaDestino>) => setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  const agregar = (tipo: TipoDestino) => setFilas((fs) => [...fs, { id: siguienteId.current++, tipo, email: "", nombre: "", cuenta: "", cuentaManual: "", pct: "0", resolviendo: false }]);
  const quitar = (id: number) => setFilas((fs) => fs.filter((f) => f.id !== id));
  const elegirPreset = (p: Preset) => {
    setPreset(p);
    if (p === "iguales") setFilas((fs) => fs.map((f, i) => ({ ...f, pct: (bpsIguales(fs.length)[i] / 100).toString() })));
    if (p === "uno") setFilas((fs) => fs.map((f, i) => ({ ...f, pct: i === 0 ? "100" : "0" })));
  };
  /** Persona: la cuenta sale de su email. Fondo o donación: la plataforma crea una cuenta a partir del nombre. */
  async function resolverCuenta(f: FilaDestino) {
    if (f.tipo !== "persona" && ES_CUENTA.test(f.cuentaManual.trim())) { actualizar(f.id, { cuenta: f.cuentaManual.trim(), resolviendo: false }); return; }
    const clave = f.tipo === "persona" ? f.email.trim() : (f.nombre.trim() ? `${f.tipo}+${f.nombre.trim().toLowerCase().replace(/\s+/g, "-")}@llave.local` : "");
    if (!clave.includes("@") || !cliente.cuentaDeEmail) return;
    actualizar(f.id, { resolviendo: true });
    try { const cuenta = await cliente.cuentaDeEmail(clave); actualizar(f.id, { cuenta, resolviendo: false }); }
    catch { actualizar(f.id, { resolviendo: false }); }
  }
  async function guardar(): Promise<ResultadoTx> {
    if (!cliente.configurar) return { ok: false, error: { nombre: "NoDisponible", mensaje: "Guardar en la cadena llega con la conexión real." } };
    const meta = cargarMeta();
    for (const f of filas) {
      const m: MetaDestino = f.tipo === "persona" ? { tipo: "persona", email: f.email.trim() } : { tipo: f.tipo, nombre: f.nombre.trim() || NOMBRE_TIPO[f.tipo] };
      meta[f.cuenta.trim().toLowerCase()] = m;
    }
    guardarMeta(meta);
    const config: ConfigLlave = { herederos: filas.map((f) => f.cuenta.trim() as Address), bps, plazoInactividad: estado.plazoInactividad, plazoGracia: estado.plazoGracia };
    return cliente.configurar(config);
  }

  return (
    <div className="pila">
      <div className="resumen-reparto">
        <div className="segmentado" role="group" aria-label="Forma de reparto">
          <button type="button" className={preset === "iguales" ? "activo" : ""} onClick={() => elegirPreset("iguales")}>Partes iguales</button>
          <button type="button" className={preset === "porcentajes" ? "activo" : ""} onClick={() => elegirPreset("porcentajes")}>Porcentajes</button>
          <button type="button" className={preset === "uno" ? "activo" : ""} onClick={() => elegirPreset("uno")}>Un solo destino</button>
        </div>
        <div className="chips">
          {sinCambios ? <Chip tono="ok">Guardado en la cadena</Chip> : <Chip tono="alerta">Cambios sin guardar</Chip>}
          <Chip>{filas.length} de 5 destinos</Chip>
        </div>
      </div>

      <div className="filas">
        <div className="fila fila-destino fila-cab"><span>Tipo</span><span>Quién</span><span>Cuenta</span><span>Porcentaje</span><span /></div>
        {filas.length === 0 && <div className="fila"><span className="muted">Todavía no hay destinos. Agregá una persona, un fondo común o una donación.</span></div>}
        {filas.map((f, i) => (
          <div key={f.id} className="fila fila-destino">
            <select aria-label="Tipo de destino" value={f.tipo} onChange={(e) => actualizar(f.id, { tipo: e.target.value as TipoDestino, cuenta: "" })}>
              <option value="persona">Persona</option>
              <option value="fondo">Fondo común</option>
              <option value="donacion">Donación</option>
            </select>
            {f.tipo === "persona" ? (
              <input type="email" inputMode="email" placeholder="email del heredero" aria-label="Email del heredero" value={f.email}
                onChange={(e) => actualizar(f.id, { email: e.target.value, cuenta: "" })} onBlur={() => void resolverCuenta(f)} />
            ) : (
              <input placeholder={f.tipo === "fondo" ? "Nombre del fondo (ej. Familia Pérez)" : "A quién donás (ej. Fundación Sí)"} aria-label="Nombre del destino" value={f.nombre}
                onChange={(e) => actualizar(f.id, { nombre: e.target.value, cuenta: "" })} onBlur={() => void resolverCuenta(f)} />
            )}
            {f.tipo === "persona" ? (
              <span className="cuenta" title={f.cuenta}>{f.resolviendo ? "buscando cuenta…" : f.cuenta ? acortar(f.cuenta) : "se completa con el email"}</span>
            ) : (
              <span className="pila pila-chica">
                <input className="mono" placeholder="0x… (opcional)" aria-label="Cuenta del destino (opcional)" value={f.cuentaManual} spellCheck={false}
                  onChange={(e) => actualizar(f.id, { cuentaManual: e.target.value, cuenta: "" })} onBlur={() => void resolverCuenta(f)} />
                <small className="cuenta" title={f.cuenta}>{f.resolviendo ? "creando cuenta…" : f.cuentaManual.trim() && !ES_CUENTA.test(f.cuentaManual.trim()) ? "esa cuenta no es válida (0x + 40 caracteres)" : f.cuenta ? (ES_CUENTA.test(f.cuentaManual.trim()) ? "usa la cuenta que pusiste" : `creada sola: ${acortar(f.cuenta)}`) : "si la dejás vacía, se crea con el nombre"}</small>
              </span>
            )}
            <span className="num pct">
              <input inputMode="decimal" aria-label="Porcentaje" value={preset === "porcentajes" ? f.pct : ((bps[i] ?? 0) / 100).toString()} disabled={preset !== "porcentajes"}
                onChange={(e) => actualizar(f.id, { pct: e.target.value })} /> %
            </span>
            <button type="button" className="btn btn-fantasma btn-icono" onClick={() => quitar(f.id)} aria-label="Quitar destino" title="Quitar"><IcoX tam={16} /></button>
          </div>
        ))}
      </div>

      <div className="fila-acciones">
        <button type="button" className="btn btn-secundario btn-chico" onClick={() => agregar("persona")} disabled={filas.length >= 5}><IcoMas tam={14} /> Persona</button>
        <button type="button" className="btn btn-secundario btn-chico" onClick={() => agregar("fondo")} disabled={filas.length >= 5}><IcoMas tam={14} /> Fondo común</button>
        <button type="button" className="btn btn-secundario btn-chico" onClick={() => agregar("donacion")} disabled={filas.length >= 5}><IcoMas tam={14} /> Donación</button>
        <span className={sumaOk ? "tx-ok" : "tx-error"}>Total: {(suma / 100).toLocaleString("es-AR")}% {sumaOk ? "" : "(tiene que dar 100%)"}</span>
        {repetidas && <span className="tx-error">Hay dos destinos con la misma cuenta.</span>}
      </div>

      <div className="tarjeta">
        <div className="tarjeta-cab"><div><h3>Guardar el reparto en la cadena</h3><p className="descripcion">Comisión Llave: {porcentaje(estado.comisionBps)} al liberar.</p></div></div>
        <BotonTx texto="Guardar en la cadena" accion={guardar} onResultado={alRecargar}
          deshabilitado={!esDuena || liberada || !sumaOk || !cuentasOk || repetidas || sinCambios}
          nota={!cuentasOk && filas.length > 0 ? "Falta el email de alguna persona, o el nombre de algún fondo o donación (la cuenta se completa sola al salir del campo; si ponés una, tiene que ser válida)." : "Guardar también cuenta como señal de vida."} />
      </div>
    </div>
  );
}
