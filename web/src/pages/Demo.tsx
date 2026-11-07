// Panel para el proyector: solo lectura, tema oscuro forzado, se actualiza solo cada 2 s, se lee a 5 metros.
// Muestra la cuenta regresiva, el agente verificado (KUMPLY tier 5), el bot rebotado y la herencia enviada.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Address } from "viem";
import { cliente } from "../lib";
import { aliasDe as aliasLib, config } from "../lib/config";
import type { EventoLlave, ResultadoTx } from "../lib";
import { BadgeKumply } from "../components/BadgeKumply";
import { BotonTx } from "../components/BotonTx";
import { Chip } from "../components/Chip";
import { IcoLlave, IcoRobot } from "../components/Iconos";
import { LineaDeFases } from "../components/LineaDeFases";
import { Monto } from "../components/Monto";
import { Tile } from "../components/Tile";
import { TxLink } from "../components/TxLink";
import { acortar, formatearMonto, horaDe } from "../components/formato";
import { useLlave } from "../components/useLlave";
import { useSesion } from "../components/useSesion";
import { aplicarTema, temaGuardado } from "../components/useTema";
import { mockControles } from "../mock/cliente-mock";

const MOCK = config.modo === "mock";

export function Demo() {
  const { datos, eventos, recargar } = useLlave(2000);
  const { sesion } = useSesion();
  const [saldos, setSaldos] = useState<Record<string, bigint>>({});
  const [agenteAuto, setAgenteAuto] = useState(true);
  const [rebote, setRebote] = useState<ResultadoTx | null>(null);
  const actuando = useRef(false);

  // El proyector siempre en oscuro; al salir vuelve al tema elegido.
  useEffect(() => { aplicarTema("dark"); return () => aplicarTema(temaGuardado()); }, []);

  useEffect(() => {
    if (!datos) return;
    const cuentas = datos.herederos.map((h) => h.cuenta);
    void Promise.all(cuentas.map((c) => cliente.saldoDe(c).then((s) => [c.toLowerCase(), s] as const)))
      .then((pares) => setSaldos(Object.fromEntries(pares))).catch(() => undefined);
  }, [datos]);

  // Agente simulado (solo mock): hace lo que en Fuji hace el keeper de P2 con su wallet tier 5.
  useEffect(() => {
    if (!MOCK || !agenteAuto || !datos || actuando.current) return;
    const fase = datos.estado.fase;
    if (fase !== "Vencida" && fase !== "Ejecutable") return;
    actuando.current = true;
    const accion = fase === "Vencida" ? mockControles.agente.iniciarReclamo() : mockControles.agente.liberar();
    void accion.finally(() => { actuando.current = false; void recargar(); });
  }, [datos, agenteAuto, recargar]);

  if (!datos) return <main className="demo"><p className="muted">Cargando…</p></main>;
  const { estado, herederos, agente, bot } = datos;
  const dec = estado.decimales;
  const alias = (c: Address) => cliente.aliasDe?.(c) ?? aliasLib(c);
  const duena = alias(estado.dueno);
  const yaLiberada = estado.liberadaEn > 0;
  const liberada = eventos.find((e) => e.nombre === "Liberada");
  const envios = liberada ? eventos.filter((e) => e.nombre === "HerenciaEnviada" && e.hash === liberada.hash) : [];
  const comision = liberada ? eventos.find((e) => e.nombre === "ComisionCobrada" && e.hash === liberada.hash) : undefined;

  return (
    <main className="demo">
      <header className="demo-cab">
        <Link to="/" className="marca"><span className="marca-icono"><IcoLlave tam={18} /></span><span>Llave · panel en vivo</span></Link>
        <div className="chips">
          <Chip tono="info" title="Red de prueba Fuji de Avalanche">Avalanche Fuji</Chip>
          <Chip tono="ok" title="La identidad del agente la verifica KUMPLY en la misma operación">KUMPLY · agente verificado</Chip>
          <Chip tono="ok" title="Las comisiones de red las cubre 0xGasless">0xGasless · {duena} pagó $0</Chip>
          {MOCK && <Chip tono="alerta"><i className="punto" />Modo ensayo</Chip>}
        </div>
      </header>

      <LineaDeFases estado={estado} leidoEn={datos.leidoEn} grande />

      <section className="demo-tiles" aria-label="Saldos y cuentas">
        <Tile className="tile-principal" etiqueta={`Bóveda de ${duena}`} valor={<Monto valor={estado.saldo} decimales={dec} />}
          nota={yaLiberada ? `Se repartieron ${formatearMonto(estado.totalLiberado, dec)}` : `${estado.simbolo} · pesos de prueba`} destacado />
        {herederos.map((h) => (
          <Tile key={h.cuenta} etiqueta={`${h.alias} · heredero ${porcentajeCorto(h.bps)}`} valor={<Monto valor={saldos[h.cuenta.toLowerCase()] ?? 0n} decimales={dec} />}
            nota={yaLiberada ? <Chip tono="ok">Recibió</Chip> : <>Le corresponde {formatearMonto(h.parte, dec)}</>} />
        ))}
        {agente && (
          <Tile className="tile-agente" etiqueta="Agente que vigila, avisa y libera" valor={<span className="tile-texto">{agente.alias}</span>}
            nota={<><BadgeKumply v={agente.verificacion} rol="agente" /><span className="mono" title={agente.cuenta}>{acortar(agente.cuenta)}</span><span>· gas por 0xGasless</span></>} />
        )}
        {bot && (
          <div className="tile tile-bot">
            <span className="tile-etiqueta">Cualquier otro bot</span>
            <span className="tile-valor"><span className="tile-texto"><IcoRobot tam={20} /> {bot.alias}</span></span>
            <span className="tile-nota"><BadgeKumply v={bot.verificacion} rol="agente" /><span className="mono" title={bot.cuenta}>{acortar(bot.cuenta)}</span></span>
            {rebote && !rebote.ok && <span className="tx-error"><strong>Rebotado: {rebote.error?.mensaje}</strong><code>{rebote.error?.nombre}</code></span>}
            {rebote?.ok && <span className="tx-ok">Pasó (esta cuenta sí es agente) <TxLink hash={rebote.hash} url={rebote.url} ms={rebote.ms} /></span>}
            <BotonTx texto="Intenta liberar" icono={<IcoRobot tam={16} />} variante="peligro" tamano="chico"
              accion={() => (MOCK ? mockControles.bot.liberar() : cliente.liberar ? cliente.liberar() : Promise.resolve({ ok: false, error: { nombre: "NoDisponible", mensaje: "El cliente real todavía no expone liberar()." } }))}
              onResultado={(r) => { setRebote(r); void recargar(); }}
              deshabilitado={!MOCK && !sesion}
              nota={!MOCK && !sesion ? "Entrá con un email cualquiera (sin verificar) para probar." : undefined} />
          </div>
        )}
      </section>

      {liberada && (
        <section className="recibo" aria-label="Herencia enviada">
          <div className="recibo-titulo"><span>✓</span><span>Herencia enviada: {formatearMonto(BigInt(String(liberada.args.total ?? 0)), dec)}</span></div>
          <dl className="recibo-datos">
            {envios.map((e) => <div key={String(e.args.heredero)}><dt>{alias(e.args.heredero as Address)} recibió</dt><dd>{formatearMonto(BigInt(String(e.args.monto ?? 0)), dec)}</dd></div>)}
            {comision && <div><dt>Comisión Llave</dt><dd>{formatearMonto(BigInt(String(comision.args.monto ?? 0)), dec)}<small>1%, escrito en el contrato</small></dd></div>}
            <div><dt>Enviado → incluido</dt><dd>{typeof liberada.ms === "number" ? `${liberada.ms} ms` : "—"}<small>pasa por 0xGasless</small></dd></div>
            <div><dt>Definitivo</dt><dd>al incluirse<small>en Avalanche, incluido = final</small></dd></div>
            <div><dt>Costo para {duena}</dt><dd>$0<small>la red la cubre 0xGasless</small></dd></div>
            <div><dt>Comprobante</dt><dd><TxLink hash={liberada.hash} url={liberada.url} /></dd></div>
          </dl>
        </section>
      )}

      <section className="modulo" aria-label="En vivo">
        <div className="modulo-cab"><div><h2>En vivo</h2><p>Cada operación con su comprobante, apenas queda incluida.</p></div></div>
        <ul className="feed">
          {eventos.length === 0 && <li className="feed-vacio">Todavía no pasó nada. Cuando {duena} toque «Estoy bien», aparece acá.</li>}
          {eventos.slice(0, 12).map((e, i) => (
            <li key={`${e.hash}-${e.nombre}-${i}`}>
              <span className="hora">{horaDe(e.cuando)}</span>
              <span className="frase">{fraseDe(e, dec, alias)}</span>
              <TxLink hash={e.hash} url={e.url} ms={e.ms} />
            </li>
          ))}
        </ul>
      </section>

      {MOCK && (
        <footer className="demo-controles">
          <span>Controles de ensayo (no existen en Fuji):</span>
          <label><input id="agente-auto" type="checkbox" checked={agenteAuto} onChange={(e) => setAgenteAuto(e.target.checked)} /> agente simulado vigilando</label>
          <button type="button" className="btn btn-chico btn-secundario" onClick={() => { mockControles.saltar(30); void recargar(); }}>⏩ +30 s</button>
          <button type="button" className="btn btn-chico btn-secundario" onClick={() => { mockControles.saltar(60); void recargar(); }}>⏩ +60 s</button>
          <button type="button" className="btn btn-chico btn-peligro" onClick={() => { if (confirm("¿Reiniciar la demo? Se pierde todo lo simulado.")) { mockControles.reiniciar(); location.reload(); } }}>Reiniciar demo</button>
        </footer>
      )}
    </main>
  );
}

function porcentajeCorto(bps: number): string { return `${bps / 100}%`; }

function fraseDe(e: EventoLlave, dec: number, alias: (c: Address) => string): string {
  const a = e.args;
  const m = (v: unknown) => formatearMonto(BigInt(String(v ?? 0)), dec);
  const quien = (v: unknown) => (typeof v === "string" ? alias(v as Address) : "alguien");
  switch (e.nombre) {
    case "SenalDeVida": return `${quien(a.dueno)} tocó «Estoy bien». Plazo reiniciado.`;
    case "Depositado": return `${quien(a.de)} cargó ${m(a.monto)} en la bóveda.`;
    case "Retirado": return `Se mandaron ${m(a.monto)} a ${quien(a.a)}.`;
    case "Configurada": return `${quien(a.dueno)} actualizó su Llave.`;
    case "VerificadoKumply": return `KUMPLY verificó al agente ${quien(a.cuenta)}.`;
    case "ReclamoIniciado": return `${quien(a.agente)} avisó que la dueña no responde. Si no responde, se libera a las ${horaDe(Number(a.graciaTerminaEn ?? 0))}.`;
    case "ReclamoCancelado": return "La dueña dio señales: aviso cancelado.";
    case "HerenciaEnviada": return `${quien(a.heredero)} recibió ${m(a.monto)}.`;
    case "ComisionCobrada": return `Comisión Llave: ${m(a.monto)}.`;
    case "Liberada": return `${quien(a.agente)} liberó la herencia: ${m(a.total)} repartidos.`;
    case "DuenoTransferido": return `La Llave pasó a ${quien(a.nuevo)}.`;
    default: return e.nombre;
  }
}
