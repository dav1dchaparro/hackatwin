// Panel para el proyector: solo lectura, se actualiza solo cada 2 s, se lee a 5 metros.
// Muestra la cuenta regresiva, el agente verificado (KUMPLY tier 5), el bot rebotado y la herencia enviada.
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { cliente } from "../lib";
import { aliasDe as aliasLib, config } from "../lib/config";
import type { EventoLlave, ResultadoTx } from "../lib";
import { BadgeKumply } from "../components/BadgeKumply";
import { BotonTx } from "../components/BotonTx";
import { Chip } from "../components/Chip";
import { LineaDeFases } from "../components/LineaDeFases";
import { Monto } from "../components/Monto";
import { TxLink } from "../components/TxLink";
import { acortar, formatearMonto, horaDe } from "../components/formato";
import { useLlave } from "../components/useLlave";
import { useSesion } from "../components/useSesion";
import { mockControles } from "../mock/cliente-mock";

const MOCK = config.modo === "mock";

export function Demo() {
  const { datos, eventos, recargar } = useLlave(2000);
  const { sesion } = useSesion();
  const [saldos, setSaldos] = useState<Record<string, bigint>>({});
  const [agenteAuto, setAgenteAuto] = useState(true);
  const [rebote, setRebote] = useState<ResultadoTx | null>(null);
  const actuando = useRef(false);

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

  if (!datos) return <main className="demo"><p>Cargando…</p></main>;
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
      <header className="demo-cabecera">
        <h1>🔑 Llave</h1>
        <div className="chips">
          <Chip tono="info" title="Red de prueba Fuji de Avalanche">Avalanche Fuji</Chip>
          <Chip tono="ok" title="La identidad del agente la verifica KUMPLY en la misma operación">KUMPLY · agente verificado</Chip>
          <Chip tono="ok" title="Las comisiones de red las cubre 0xGasless">0xGasless · nadie paga comisiones</Chip>
          <Chip tono="alerta">{duena} pagó $0</Chip>
          {MOCK && <Chip tono="alerta">modo ensayo</Chip>}
        </div>
      </header>

      <LineaDeFases estado={estado} leidoEn={datos.leidoEn} grande />

      <section className="demo-tiles">
        <div className="tile tile-principal">
          <span>Bóveda de {duena}</span>
          <strong><Monto valor={estado.saldo} decimales={dec} /></strong>
          {yaLiberada && <small>Se repartieron {formatearMonto(estado.totalLiberado, dec)}</small>}
        </div>
        {herederos.map((h) => (
          <div key={h.cuenta} className="tile">
            <span>{h.alias} · heredero {h.bps / 100}%</span>
            <strong><Monto valor={saldos[h.cuenta.toLowerCase()] ?? 0n} decimales={dec} /></strong>
            <small>{yaLiberada ? "recibió ✓" : <>le corresponde {formatearMonto(h.parte, dec)}</>}</small>
          </div>
        ))}
        {agente && (
          <div className="tile tile-agente">
            <span>Agente que vigila, avisa y libera</span>
            <strong className="tile-texto">{agente.alias}</strong>
            <BadgeKumply v={agente.verificacion} rol="agente" />
            <small title={agente.cuenta}>{acortar(agente.cuenta)} · KUMPLY tier 5 · gas por 0xGasless</small>
          </div>
        )}
        {bot && (
          <div className="tile tile-bot">
            <span>Cualquier otro bot</span>
            <strong className="tile-texto">{bot.alias}</strong>
            <BadgeKumply v={bot.verificacion} rol="agente" />
            {rebote && !rebote.ok && <small className="tx-error">Rebotado: {rebote.error?.mensaje} <code>{rebote.error?.nombre}</code></small>}
            {rebote?.ok && <small className="tx-ok">Pasó (esta cuenta sí es agente) <TxLink hash={rebote.hash} url={rebote.url} ms={rebote.ms} /></small>}
            <BotonTx texto="Intenta liberar" variante="peligro" className="boton-chico"
              accion={() => (MOCK ? mockControles.bot.liberar() : cliente.liberar ? cliente.liberar() : Promise.resolve({ ok: false, error: { nombre: "NoDisponible", mensaje: "El cliente real todavía no expone liberar()." } }))}
              onResultado={(r) => { setRebote(r); void recargar(); }}
              deshabilitado={!MOCK && !sesion}
              nota={!MOCK && !sesion ? "Entrá con un email cualquiera (sin verificar) para probar." : undefined} />
          </div>
        )}
      </section>

      {liberada && (
        <section className="recibo" aria-label="Herencia enviada">
          <div className="recibo-titulo"><span>✅</span><strong>Herencia enviada: {formatearMonto(BigInt(String(liberada.args.total ?? 0)), dec)}</strong></div>
          <div className="recibo-datos">
            {envios.map((e) => <span key={String(e.args.heredero)}>{alias(e.args.heredero as Address)} recibió {formatearMonto(BigInt(String(e.args.monto ?? 0)), dec)}</span>)}
            {comision && <span>Comisión Llave {formatearMonto(BigInt(String(comision.args.monto ?? 0)), dec)} <small>1%, escrito en el contrato</small></span>}
            <span>{typeof liberada.ms === "number" ? `${liberada.ms} ms` : "—"} <small>enviado → incluido (pasa por 0xGasless)</small></span>
            <span>definitivo al incluirse <small>en Avalanche, incluido = final</small></span>
            <span>costo de red ≈ centavos <small>lo cubre 0xGasless</small></span>
            <span>{duena} pagó $0</span>
            <TxLink hash={liberada.hash} url={liberada.url} etiqueta="ver comprobante" />
          </div>
        </section>
      )}

      <section className="demo-feed">
        <h2>En vivo</h2>
        {eventos.length === 0 && <p className="muted">Todavía no pasó nada. Cuando {duena} toque «Estoy bien», aparece acá.</p>}
        <ul>
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
          <span className="muted">Controles de ensayo (no existen en Fuji):</span>
          <label className="chip chip-info"><input type="checkbox" checked={agenteAuto} onChange={(e) => setAgenteAuto(e.target.checked)} /> agente simulado vigilando</label>
          <button type="button" className="btn btn-chico btn-secundario" onClick={() => { mockControles.saltar(30); void recargar(); }}>⏩ +30 s</button>
          <button type="button" className="btn btn-chico btn-secundario" onClick={() => { mockControles.saltar(60); void recargar(); }}>⏩ +60 s</button>
          <button type="button" className="btn btn-chico btn-peligro" onClick={() => { if (confirm("¿Reiniciar la demo? Se pierde todo lo simulado.")) { mockControles.reiniciar(); location.reload(); } }}>Reiniciar demo</button>
        </footer>
      )}
    </main>
  );
}

function fraseDe(e: EventoLlave, dec: number, alias: (c: Address) => string): string {
  const a = e.args;
  const m = (v: unknown) => formatearMonto(BigInt(String(v ?? 0)), dec);
  const quien = (v: unknown) => (typeof v === "string" ? alias(v as Address) : "alguien");
  switch (e.nombre) {
    case "SenalDeVida": return `${quien(a.dueno)} tocó «Estoy bien». Plazo reiniciado.`;
    case "Depositado": return `${quien(a.de)} cargó ${m(a.monto)} en la bóveda.`;
    case "Retirado": return `Se mandaron ${m(a.monto)} a ${quien(a.a)}.`;
    case "Configurada": return `${quien(a.dueno)} actualizó su Llave.`;
    case "VerificadoKumply": return `KUMPLY verificó al agente ${quien(a.cuenta)} ✓`;
    case "ReclamoIniciado": return `${quien(a.agente)} avisó que la dueña no responde. Si no responde, se libera a las ${horaDe(Number(a.graciaTerminaEn ?? 0))}.`;
    case "ReclamoCancelado": return "La dueña dio señales: aviso cancelado.";
    case "HerenciaEnviada": return `${quien(a.heredero)} recibió ${m(a.monto)}.`;
    case "ComisionCobrada": return `Comisión Llave: ${m(a.monto)}.`;
    case "Liberada": return `${quien(a.agente)} liberó la herencia: ${m(a.total)} repartidos.`;
    case "DuenoTransferido": return `La Llave pasó a ${quien(a.nuevo)}.`;
    default: return e.nombre;
  }
}
