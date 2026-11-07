// Pantalla del heredero: SOLO LECTURA (alcance v2: la parte se envía sola cuando el agente libera la Llave).
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Address } from "viem";
import { aliasDe as aliasLib, cliente } from "../lib";
import { Chip } from "../components/Chip";
import { CuentaRegresiva } from "../components/CuentaRegresiva";
import { LineaDeFases } from "../components/LineaDeFases";
import { Monto } from "../components/Monto";
import { TxLink } from "../components/TxLink";
import { acortar, mismaCuenta, porcentaje } from "../components/formato";
import { useLlave } from "../components/useLlave";
import { useSesion } from "../components/useSesion";

export function Heredero() {
  const { sesion } = useSesion();
  const [params] = useSearchParams();
  const { datos, eventos } = useLlave();
  const cuentaParam = params.get("cuenta");
  const cuenta = (cuentaParam ?? sesion?.cuenta ?? null) as Address | null;
  const [miSaldo, setMiSaldo] = useState<bigint | null>(null);

  useEffect(() => {
    if (!cuenta) return;
    void cliente.saldoDe(cuenta).then(setMiSaldo).catch(() => undefined);
  }, [cuenta, datos]);

  if (!cuenta) {
    return (
      <section className="pagina pagina-angosta">
        <h1>Mi herencia</h1>
        <p>Entrá con tu email para ver tu parte, o abrí esta pantalla con <code>?cuenta=0x…</code>.</p>
        <Link className="btn btn-primario" to="/">Entrar</Link>
      </section>
    );
  }
  if (!datos) return <section className="pagina"><p>Cargando la Llave…</p></section>;

  const { estado } = datos;
  const yo = datos.herederos.find((h) => mismaCuenta(h.cuenta, cuenta));
  const duena = cliente.aliasDe?.(estado.dueno) ?? aliasLib(estado.dueno);
  if (!yo) {
    return (
      <section className="pagina pagina-angosta">
        <h1>Mi herencia</h1>
        <div className="aviso aviso-mal">Esta cuenta ({acortar(cuenta)}) no es heredera de esta Llave.</div>
      </section>
    );
  }

  const liberada = estado.fase === "Liberada" || estado.fase === "Repartiendo";
  const comision = estado.comisionBps ?? 0;
  const miEnvio = eventos.find((e) => e.nombre === "HerenciaEnviada" && mismaCuenta(String(e.args.heredero ?? ""), cuenta));

  return (
    <section className="pagina pagina-angosta">
      <h1>Hola, {yo.alias}</h1>

      <div className="tarjeta tarjeta-destacada">
        <div className="fila-entre">
          <span>{liberada ? "Recibiste de la Llave de" : "Tu parte de la Llave de"} {duena}</span>
          <Chip tono="ok">Sin trámites</Chip>
        </div>
        <div className="numero-grande"><Monto valor={yo.parte} decimales={estado.decimales} grande /></div>
        <p className="muted">
          {porcentaje(yo.bps)} de lo que haya en la bóveda{liberada ? " al momento de liberarse" : ""}.
          {comision > 0 && <> Comisión Llave: {porcentaje(comision)} al liberar, ya descontada.</>}
        </p>
        <p className="muted"><small>Solo sobre la porción disponible de tu herencia.</small></p>
      </div>

      <LineaDeFases estado={estado} leidoEn={datos.leidoEn} />

      {liberada ? (
        <div className="aviso aviso-ok aviso-grande">
          <strong>Tu parte ya se te envió ✓</strong>
          {miSaldo !== null && <> Tenés <Monto valor={miSaldo} decimales={estado.decimales} /> en tu cuenta.</>}
          {miEnvio && <div><TxLink hash={miEnvio.hash} url={miEnvio.url} ms={miEnvio.ms} /></div>}
        </div>
      ) : (
        <div className="aviso aviso-info">
          <strong>Tu parte se te envía sola: no tenés que hacer nada.</strong>
          <p>
            {estado.fase === "Activa" && <>{duena} dio señales de vida. Si deja de darlas, en{" "}
              <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} /> un agente
              verificado le avisa y abre una espera por si fue un olvido.</>}
            {estado.fase === "Vencida" && <>{duena} no dio señales en el plazo. El agente verificado está por avisarle y abrir la espera.</>}
            {estado.fase === "EnGracia" && <>El agente avisó. {duena} todavía puede cancelar tocando «Estoy bien». Si no lo hace, en{" "}
              <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} /> la plata llega a tu cuenta.</>}
            {estado.fase === "Ejecutable" && <>Terminó la espera. El agente verificado está liberando la herencia: en segundos llega a tu cuenta.</>}
          </p>
          <div className="chips">
            <Chip title="Quien libera es un agente con identidad verificada por KUMPLY (tier 5)">KUMPLY</Chip>
            <Chip title="No pagás comisiones de red: las cubre 0xGasless">costo: $0</Chip>
          </div>
        </div>
      )}

      <p className="muted"><small>Tu cuenta: {acortar(cuenta)}</small></p>
    </section>
  );
}
