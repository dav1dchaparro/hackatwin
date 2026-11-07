import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Address } from "viem";
import { cliente } from "../lib";
import type { ConfigLlave } from "../lib";
import { Aviso } from "../components/Aviso";
import { BotonTx } from "../components/BotonTx";
import { Chip } from "../components/Chip";
import { CuentaRegresiva } from "../components/CuentaRegresiva";
import { Encabezado } from "../components/Encabezado";
import { IcoCasa, IcoCorazon, IcoEnviar } from "../components/Iconos";
import { LineaDeFases, NOMBRE_FASE } from "../components/LineaDeFases";
import { Modulo } from "../components/Modulo";
import { Monto } from "../components/Monto";
import { Tile } from "../components/Tile";
import { acortar, bpsIguales, haceX, horaDe, mismaCuenta, parsearMonto, porcentaje } from "../components/formato";
import { useLlave } from "../components/useLlave";
import type { DatosLlave } from "../components/useLlave";
import { useReloj } from "../components/useReloj";
import { useSesion } from "../components/useSesion";
import { UNO } from "../mock/cliente-mock";

export function Dueno() {
  const { sesion } = useSesion();
  const { datos, recargar } = useLlave();
  const [destino, setDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [editando, setEditando] = useState(false);
  const ahora = useReloj(datos?.estado.ahoraCadena ?? 0, datos?.leidoEn ?? Date.now(), 1000);

  if (!sesion) {
    return (
      <>
        <Encabezado ceja="Dueña" titulo="Mi Llave" descripcion="Entrá con tu email para ver tu Llave." />
        <div><Link className="btn btn-primario" to="/">Entrar</Link></div>
      </>
    );
  }
  if (!datos) return <p className="muted">Cargando tu Llave…</p>;

  const { estado, herederos } = datos;
  const esDuena = mismaCuenta(sesion.cuenta, estado.dueno);
  const fase = estado.fase;
  const liberada = estado.liberadaEn > 0;
  const montoBig = parsearMonto(monto, estado.decimales);
  const mandarOk = esDuena && /^0x[0-9a-fA-F]{40}$/.test(destino.trim()) && montoBig !== null && montoBig > 0n && !liberada;
  const comision = estado.comisionBps;

  return (
    <>
      <Encabezado
        ceja={<><IcoCasa tam={14} /> Dueña · {sesion.alias}</>}
        titulo="Mi Llave"
        descripcion="Tus ahorros con reglas que nadie puede saltear. Cada movimiento tuyo cuenta como señal de vida."
        acciones={
          <BotonTx texto="Cargar $1.000.000 de prueba" variante="secundario" accion={() => cliente.cargarPesosDePrueba(1_000_000n * UNO)}
            onResultado={() => void recargar()} deshabilitado={liberada} />
        }
      />

      {!esDuena && <Aviso tono="mal" titulo="Esta cuenta no es la dueña de esta Llave.">Podés mirar, no operar. Cuenta: {acortar(sesion.cuenta)}</Aviso>}
      {fase === "EnGracia" && (
        <Aviso tono="mal" role="alert" titulo="El agente avisó que no respondés.">
          Tocá «Estoy bien» para cancelarlo. Te quedan <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />.
        </Aviso>
      )}
      {fase === "Ejecutable" && <Aviso tono="mal" role="alert" titulo="Terminó la espera.">El agente está por liberar tu herencia. Si estás bien, tocá «Estoy bien» ahora mismo.</Aviso>}
      {fase === "Vencida" && <Aviso tono="alerta" titulo="Pasó el plazo sin señales.">Tocá «Estoy bien» antes de que el agente avise a tus herederos.</Aviso>}
      {liberada && <Aviso tono="info" titulo="Tu Llave ya se liberó.">La plata se envió a tus herederos. Esta Llave no acepta más cambios.</Aviso>}

      <Modulo titulo="Resumen">
        <div className="tiles">
          <Tile etiqueta="En tu bóveda" valor={<Monto valor={estado.saldo} decimales={estado.decimales} />} nota={`${estado.simbolo} · pesos de prueba en Fuji`} destacado />
          <Tile etiqueta="Última señal" valor={haceX(estado.ultimaSenal, ahora)} chico nota={horaDe(estado.ultimaSenal)} />
          <Tile
            etiqueta={fase === "Activa" ? "Vence en" : fase === "EnGracia" ? "Se libera en" : "Estado"}
            valor={fase === "Activa"
              ? <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />
              : fase === "EnGracia"
                ? <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />
                : NOMBRE_FASE[fase]}
            chico
            nota={fase === "Activa" ? `Plazo: ${Math.round(estado.plazoInactividad / 60)} min sin señales` : NOMBRE_FASE[fase]}
          />
          <Tile etiqueta="Herederos" valor={String(herederos.length)} chico nota={herederos.map((h) => `${h.alias} ${porcentaje(h.bps)}`).join(" · ")} />
        </div>
      </Modulo>

      <Modulo titulo="Acciones" descripcion="Mandar plata también cuenta como señal de vida. Usás tu plata cuando quieras, sin costo.">
        <div className="grilla-2">
          <div className="tarjeta">
            <div className="tarjeta-cab"><div><h3>¿Todo bien?</h3><p className="descripcion">Un toque reinicia el plazo y cancela cualquier aviso. No pagás nada.</p></div><IcoCorazon /></div>
            <BotonTx texto="Estoy bien" icono={<IcoCorazon tam={20} />} variante="ok" tamano="xl" accion={() => cliente.estoyBien()}
              onResultado={() => void recargar()} deshabilitado={!esDuena || liberada} />
          </div>
          <form className="tarjeta" onSubmit={(e) => e.preventDefault()}>
            <div className="tarjeta-cab"><div><h3>Mandar plata</h3><p className="descripcion">A cualquier cuenta. Es tu plata: sin comisión y sin demora.</p></div><IcoEnviar /></div>
            <label className="campo"><span>A la cuenta</span><input id="destino" className="mono" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="0x…" spellCheck={false} /></label>
            <label className="campo"><span>Monto</span><input id="monto" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="50.000" /></label>
            <BotonTx texto="Mandar plata" icono={<IcoEnviar tam={16} />} tamano="grande" accion={() => cliente.retirar(destino.trim() as Address, montoBig ?? 0n)}
              onResultado={(r) => { if (r.ok) setMonto(""); void recargar(); }} deshabilitado={!mandarOk} />
          </form>
        </div>
      </Modulo>

      <Modulo titulo="Etapas" descripcion="Dónde está tu Llave hoy y qué pasa después si dejás de dar señales.">
        <LineaDeFases estado={estado} leidoEn={datos.leidoEn} />
      </Modulo>

      <Modulo
        titulo="Herederos"
        descripcion="Si dejás de dar señales, un agente con identidad verificada avisa, espera y después les envía la plata. Ellos no hacen nada."
        extra={<button type="button" className="btn btn-chico btn-secundario" onClick={() => setEditando((v) => !v)} disabled={liberada}>{editando ? "Cerrar" : "Editar herederos y plazos"}</button>}
      >
        <div className="filas">
          <div className="fila fila-cab"><span>Heredero</span><span>Porcentaje</span><span>Le corresponde</span><span>Estado</span></div>
          {herederos.map((h) => (
            <div key={h.cuenta} className="fila">
              <span className="nombre">{h.alias}<span className="cuenta" title={h.cuenta}>{acortar(h.cuenta)}</span></span>
              <span className="num">{porcentaje(h.bps)}</span>
              <span className="num"><Monto valor={h.parte} decimales={estado.decimales} /></span>
              {liberada ? <Chip tono="ok">Recibido</Chip> : <Chip>En espera</Chip>}
            </div>
          ))}
        </div>
        {comision > 0 && <p className="descripcion">Comisión Llave: {porcentaje(comision)} al liberar, ya descontada de cada parte. Mandar plata ahora no tiene costo.</p>}
        {editando && <Configuracion datos={datos} esDuena={esDuena} alRecargar={() => { void recargar(); }} />}
      </Modulo>
    </>
  );
}

type Preset = "iguales" | "porcentajes" | "uno";
type Fila = { cuenta: string; pct: string };

function Configuracion({ datos, esDuena, alRecargar }: { datos: DatosLlave; esDuena: boolean; alRecargar: () => void }) {
  const { estado, herederos } = datos;
  const [preset, setPreset] = useState<Preset>("porcentajes");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [plazos, setPlazos] = useState({ inactividad: "60", gracia: "30" });
  const inicializado = useRef(false);

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;
    setFilas(herederos.map((h) => ({ cuenta: h.cuenta, pct: (h.bps / 100).toString() })));
    setPlazos({ inactividad: String(estado.plazoInactividad), gracia: String(estado.plazoGracia) });
  }, [herederos, estado]);

  const filasVisibles = preset === "uno" ? filas.slice(0, 1) : filas;
  const bps: number[] = preset === "iguales" ? bpsIguales(filasVisibles.length)
    : preset === "uno" ? [10_000]
    : filasVisibles.map((f) => Math.round((parseFloat(f.pct.replace(",", ".")) || 0) * 100));
  const suma = bps.reduce((a, b) => a + b, 0);
  const sumaOk = suma === 10_000 && bps.every((b) => b > 0);
  const cuentasOk = filasVisibles.length > 0 && filasVisibles.every((f) => /^0x[0-9a-fA-F]{40}$/.test(f.cuenta.trim()));
  const liberada = estado.liberadaEn > 0;
  const config: ConfigLlave = {
    herederos: filasVisibles.map((f) => f.cuenta.trim() as Address),
    bps,
    plazoInactividad: parseInt(plazos.inactividad, 10) || 0,
    plazoGracia: parseInt(plazos.gracia, 10) || 0,
  };
  const elegirPreset = (p: Preset) => {
    setPreset(p);
    if (p === "iguales") setFilas((fs) => fs.map((f, i) => ({ ...f, pct: (bpsIguales(fs.length)[i] / 100).toString() })));
    if (p === "uno") setFilas((fs) => [{ cuenta: fs[0]?.cuenta ?? "", pct: "100" }]);
  };

  return (
    <div className="tarjeta">
      <div className="tarjeta-cab">
        <div><h3>Herederos y plazos</h3><p className="descripcion">Guardar también cuenta como señal de vida. Solo sobre la porción disponible de tu herencia.</p></div>
        <div className="segmentado" role="group" aria-label="Forma de reparto">
          <button type="button" className={preset === "iguales" ? "activo" : ""} onClick={() => elegirPreset("iguales")}>Partes iguales</button>
          <button type="button" className={preset === "porcentajes" ? "activo" : ""} onClick={() => elegirPreset("porcentajes")}>Porcentajes</button>
          <button type="button" className={preset === "uno" ? "activo" : ""} onClick={() => elegirPreset("uno")}>Un solo destino</button>
        </div>
      </div>
      {preset === "uno" && <p className="descripcion">El 100% va a una sola persona de confianza.</p>}

      <div className="filas">
        {filasVisibles.map((f, i) => (
          <div key={i} className="fila fila-config">
            <input id={`heredero-${i}`} className="mono" value={f.cuenta} onChange={(e) => setFilas((fs) => fs.map((x, j) => (j === i ? { ...x, cuenta: e.target.value } : x)))} placeholder="0x… cuenta del heredero" spellCheck={false} aria-label={`Cuenta del heredero ${i + 1}`} />
            <span className="num">
              <input id={`pct-${i}`} inputMode="decimal" value={preset === "porcentajes" ? f.pct : ((bps[i] ?? 0) / 100).toString()} disabled={preset !== "porcentajes"}
                onChange={(e) => setFilas((fs) => fs.map((x, j) => (j === i ? { ...x, pct: e.target.value } : x)))} aria-label={`Porcentaje del heredero ${i + 1}`} /> %
            </span>
            {preset !== "uno" && filasVisibles.length > 1
              ? <button type="button" className="btn btn-fantasma btn-chico" onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))}>Quitar</button>
              : <span />}
          </div>
        ))}
      </div>
      <div className="fila-acciones">
        {preset !== "uno" && filas.length < 5 && <button type="button" className="btn btn-secundario btn-chico" onClick={() => setFilas((fs) => [...fs, { cuenta: "", pct: "0" }])}>+ Agregar heredero</button>}
        <span className={sumaOk ? "tx-ok" : "tx-error"}>Suma: {suma.toLocaleString("es-AR")} de 10.000{sumaOk ? "" : " (tiene que dar 100%)"}</span>
      </div>

      <div className="separador" />
      <div className="grilla-2">
        <label className="campo"><span>Plazo sin señales (segundos)</span><input id="plazo-inactividad" inputMode="numeric" value={plazos.inactividad} onChange={(e) => setPlazos({ ...plazos, inactividad: e.target.value })} /><small>En la demo 60 s; en producción, meses.</small></label>
        <label className="campo"><span>Espera para cancelar (segundos)</span><input id="plazo-gracia" inputMode="numeric" value={plazos.gracia} onChange={(e) => setPlazos({ ...plazos, gracia: e.target.value })} /><small>Tiempo en el que todavía podés tocar «Estoy bien».</small></label>
      </div>

      {cliente.configurar ? (
        <BotonTx texto="Guardar cambios" accion={() => cliente.configurar(config)} onResultado={alRecargar} deshabilitado={!esDuena || !sumaOk || !cuentasOk || liberada} />
      ) : (
        <p className="descripcion">Guardar desde la web llega con la conexión real; hoy el reparto se fija al crear la Llave.</p>
      )}
    </div>
  );
}
