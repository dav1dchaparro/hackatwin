import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Address } from "viem";
import { cliente } from "../lib";
import type { ConfigLlave } from "../lib";
import { BotonTx } from "../components/BotonTx";
import { Chip } from "../components/Chip";
import { CuentaRegresiva } from "../components/CuentaRegresiva";
import { LineaDeFases } from "../components/LineaDeFases";
import { Monto } from "../components/Monto";
import { acortar, bpsIguales, haceX, mismaCuenta, parsearMonto, porcentaje } from "../components/formato";
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
  const ahora = useReloj(datos?.estado.ahoraCadena ?? 0, datos?.leidoEn ?? Date.now(), 1000);

  if (!sesion) {
    return (
      <section className="pagina pagina-angosta">
        <h1>Tu Llave</h1>
        <p>Entrá con tu email para ver tu Llave.</p>
        <Link className="btn btn-primario" to="/">Entrar</Link>
      </section>
    );
  }
  if (!datos) return <section className="pagina"><p>Cargando tu Llave…</p></section>;

  const { estado, herederos } = datos;
  const esDuena = mismaCuenta(sesion.cuenta, estado.dueno);
  const fase = estado.fase;
  const liberada = estado.liberadaEn > 0;
  const montoBig = parsearMonto(monto, estado.decimales);
  const mandarOk = esDuena && /^0x[0-9a-fA-F]{40}$/.test(destino.trim()) && montoBig !== null && montoBig > 0n && !liberada;

  return (
    <section className="pagina">
      <div className="fila-entre">
        <h1>Tu Llave</h1>
        <Chip title="Pesos de prueba en la red Fuji de Avalanche">pesos de prueba</Chip>
      </div>
      {!esDuena && <div className="aviso aviso-mal">Esta cuenta ({acortar(sesion.cuenta)}) no es la dueña de esta Llave. Podés mirar, no operar.</div>}

      {fase === "EnGracia" && (
        <div className="aviso aviso-mal aviso-grande" role="alert">
          <strong>El agente avisó que no respondés.</strong> Tocá «Estoy bien» para cancelarlo: te quedan{" "}
          <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />.
        </div>
      )}
      {fase === "Ejecutable" && (
        <div className="aviso aviso-mal aviso-grande" role="alert">
          <strong>Terminó la espera.</strong> El agente está por liberar tu herencia. Si estás bien, tocá «Estoy bien» ahora mismo.
        </div>
      )}
      {fase === "Vencida" && <div className="aviso aviso-alerta aviso-grande"><strong>Pasó el plazo sin señales.</strong> Tocá «Estoy bien» antes de que el agente avise.</div>}
      {liberada && <div className="aviso aviso-info aviso-grande">Tu Llave ya se liberó: la plata se envió a tus herederos. Esta Llave no acepta más cambios.</div>}

      <div className="tarjeta tarjeta-destacada">
        <span>En tu bóveda</span>
        <div className="numero-grande"><Monto valor={estado.saldo} decimales={estado.decimales} grande /></div>
        <p className="muted">
          Última señal: {haceX(estado.ultimaSenal, ahora)}.
          {fase === "Activa" && <> Próximo vencimiento en <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} />.</>}
        </p>
      </div>

      <div className="grilla-2 acciones-principales">
        <form className="tarjeta" onSubmit={(e) => e.preventDefault()}>
          <h2>Mandar plata</h2>
          <p className="muted"><small>Usás tu plata cuando quieras, sin costo. Mandar también cuenta como señal de vida.</small></p>
          <label className="campo"><span>A la cuenta</span><input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="0x…" spellCheck={false} /></label>
          <label className="campo"><span>Monto</span><input inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="50.000" /></label>
          <BotonTx texto="Mandar plata" grande accion={() => cliente.retirar(destino.trim() as Address, montoBig ?? 0n)}
            onResultado={(r) => { if (r.ok) { setMonto(""); } void recargar(); }} deshabilitado={!mandarOk} />
        </form>
        <div className="tarjeta tarjeta-centrada">
          <h2>¿Todo bien?</h2>
          <p className="muted"><small>Un toque reinicia el plazo y cancela cualquier aviso. No pagás nada.</small></p>
          <BotonTx texto="Estoy bien" grande className="boton-estoy-bien" accion={() => cliente.estoyBien()} onResultado={() => void recargar()}
            deshabilitado={!esDuena || liberada} />
          <BotonTx texto="Cargar $1.000.000 de prueba" variante="secundario" accion={() => cliente.cargarPesosDePrueba(1_000_000n * UNO)}
            onResultado={() => void recargar()} deshabilitado={liberada} />
        </div>
      </div>

      <LineaDeFases estado={estado} leidoEn={datos.leidoEn} />

      <div className="tarjeta">
        <h2>Herederos</h2>
        <p className="muted"><small>Si dejás de dar señales, un agente con identidad verificada avisa, espera y después les envía la plata. Ellos no tienen que hacer nada.</small></p>
        <ul className="lista">
          {herederos.map((h) => (
            <li key={h.cuenta} className="item fila-entre">
              <span><strong>{h.alias}</strong> <small className="muted">{acortar(h.cuenta)}</small></span>
              <span><strong>{porcentaje(h.bps)}</strong> · <Monto valor={h.parte} decimales={estado.decimales} />{liberada ? " · recibido ✓" : ""}</span>
            </li>
          ))}
        </ul>
        {(estado.comisionBps ?? 0) > 0 && <p className="muted"><small>Comisión Llave: {porcentaje(estado.comisionBps ?? 0)} al liberar, ya descontada de cada parte. Mandar plata ahora no tiene costo.</small></p>}
      </div>

      <Configuracion datos={datos} esDuena={esDuena} alRecargar={() => void recargar()} />
    </section>
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
    setPlazos({ inactividad: String(estado.plazoInactividad ?? estado.venceEn - estado.ultimaSenal), gracia: String(estado.plazoGracia ?? 30) });
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
    <details className="tarjeta">
      <summary><h2>Configurar mi Llave</h2></summary>
      <p className="muted"><small>Herederos, porcentajes y plazos. Guardar también cuenta como señal de vida.</small></p>

      <div className="chips presets">
        <span className="muted">Reparto:</span>
        <button type="button" className={`btn btn-chico ${preset === "iguales" ? "btn-primario" : "btn-secundario"}`} onClick={() => elegirPreset("iguales")}>Partes iguales</button>
        <button type="button" className={`btn btn-chico ${preset === "porcentajes" ? "btn-primario" : "btn-secundario"}`} onClick={() => elegirPreset("porcentajes")}>Porcentajes</button>
        <button type="button" className={`btn btn-chico ${preset === "uno" ? "btn-primario" : "btn-secundario"}`} onClick={() => elegirPreset("uno")}>Un solo destino</button>
      </div>
      {preset === "uno" && <p className="muted"><small>El 100% va a una sola persona de confianza.</small></p>}

      <ul className="lista">
        {filasVisibles.map((f, i) => (
          <li key={i} className="item fila-config">
            <input className="ancho" value={f.cuenta} onChange={(e) => setFilas((fs) => fs.map((x, j) => (j === i ? { ...x, cuenta: e.target.value } : x)))} placeholder="0x… (cuenta del heredero)" spellCheck={false} />
            <span className="pct">
              <input inputMode="decimal" value={preset === "porcentajes" ? f.pct : ((bps[i] ?? 0) / 100).toString()} disabled={preset !== "porcentajes"}
                onChange={(e) => setFilas((fs) => fs.map((x, j) => (j === i ? { ...x, pct: e.target.value } : x)))} /> %
            </span>
            {preset !== "uno" && filasVisibles.length > 1 && <button type="button" className="btn btn-texto" onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))}>quitar</button>}
          </li>
        ))}
      </ul>
      {preset !== "uno" && filas.length < 5 && <button type="button" className="btn btn-texto" onClick={() => setFilas((fs) => [...fs, { cuenta: "", pct: "0" }])}>+ agregar heredero</button>}
      <p className={sumaOk ? "tx-ok" : "tx-error"}>Suma: {suma.toLocaleString("es-AR")} de 10.000 {sumaOk ? "✓" : "(tiene que dar 100%)"}</p>
      <p className="muted"><small>Solo sobre la porción disponible de tu herencia.</small></p>

      <h3>Plazos</h3>
      <div className="grilla-2">
        <label className="campo"><span>Sin señales (segundos)</span><input inputMode="numeric" value={plazos.inactividad} onChange={(e) => setPlazos({ ...plazos, inactividad: e.target.value })} /></label>
        <label className="campo"><span>Espera para cancelar (segundos)</span><input inputMode="numeric" value={plazos.gracia} onChange={(e) => setPlazos({ ...plazos, gracia: e.target.value })} /></label>
      </div>

      {cliente.configurar ? (
        <BotonTx texto="Guardar cambios" accion={() => cliente.configurar!(config)} onResultado={alRecargar} deshabilitado={!esDuena || !sumaOk || !cuentasOk || liberada} />
      ) : (
        <p className="muted"><small>Guardar desde la web llega con la conexión real; hoy el reparto se fija al crear la Llave.</small></p>
      )}
    </details>
  );
}
