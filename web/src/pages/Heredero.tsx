// Pantalla del heredero: SOLO LECTURA (la parte se envía sola cuando el agente libera la Llave).
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Address } from "viem";
import { cliente } from "../lib";
import { aliasDe as aliasLib } from "../lib/config";
import { Aviso } from "../components/Aviso";
import { Chip } from "../components/Chip";
import { CuentaRegresiva } from "../components/CuentaRegresiva";
import { Encabezado } from "../components/Encabezado";
import { LineaDeFases, NOMBRE_FASE } from "../components/LineaDeFases";
import { Modulo } from "../components/Modulo";
import { Monto } from "../components/Monto";
import { Tile } from "../components/Tile";
import { TxLink } from "../components/TxLink";
import { acortar, formatearMonto, mismaCuenta, porcentaje } from "../components/formato";
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
      <>
        <Encabezado titulo="Mi herencia" descripcion={<>Conectá tu cuenta con tu email para ver tu parte, o abrí esta pantalla con <code>?cuenta=0x…</code>.</>} />
        <div><Link className="btn btn-primario" to="/">Conectar</Link></div>
      </>
    );
  }
  if (!datos) return <p className="muted">Cargando la Llave…</p>;

  const { estado } = datos;
  const yo = datos.herederos.find((h) => mismaCuenta(h.cuenta, cuenta));
  const duena = cliente.aliasDe?.(estado.dueno) ?? aliasLib(estado.dueno);
  if (!yo) {
    return (
      <>
        <Encabezado titulo="Mi herencia" />
        <Aviso tono="mal" titulo="Esta cuenta no es heredera de esta Llave.">Cuenta: {acortar(cuenta)}</Aviso>
      </>
    );
  }

  const liberada = estado.liberadaEn > 0;
  const comision = estado.comisionBps;
  const miEnvio = eventos.find((e) => e.nombre === "HerenciaEnviada" && mismaCuenta(String(e.args.heredero ?? ""), cuenta));
  const base = liberada ? estado.totalLiberado : estado.saldo;

  return (
    <>
      <Encabezado
        titulo={`Mi herencia · ${yo.alias}`}
        descripcion={<>Tu parte de la Llave de {duena}. No tenés que hacer nada: cuando corresponda, se te envía sola.</>}
        acciones={<Chip tono="ok">Sin trámites</Chip>}
      />

      <Modulo titulo="Resumen">
        <div className="tiles">
          <Tile etiqueta={liberada ? "Recibiste" : "Te corresponde hoy"} valor={<Monto valor={yo.parte} decimales={estado.decimales} />} nota={liberada ? "Ya está en tu cuenta" : "Sobre lo que haya en la bóveda al liberarse"} destacado />
          <Tile etiqueta="Tu porcentaje" valor={porcentaje(yo.bps)} chico nota={`de ${formatearMonto(base, estado.decimales)}`} />
          <Tile etiqueta="Comisión Llave" valor={comision > 0 ? porcentaje(comision) : "Sin comisión"} chico nota="Al liberar, ya descontada" />
          <Tile etiqueta="Estado" valor={NOMBRE_FASE[estado.fase]} chico nota={estado.fase === "Activa" ? <>{duena} dio señales de vida</> : estado.fase === "Liberada" ? "Herencia enviada" : "El agente está actuando"} />
        </div>
      </Modulo>

      <Modulo titulo="Etapas" descripcion="El recorrido completo, desde la señal de vida hasta el envío.">
        <LineaDeFases estado={estado} leidoEn={datos.leidoEn} />
      </Modulo>

      <Modulo titulo="Qué pasa ahora">
        {liberada ? (
          <Aviso tono="ok" titulo="Tu parte ya se te envió.">
            {miSaldo !== null && <>Tenés <Monto valor={miSaldo} decimales={estado.decimales} /> en tu cuenta. </>}
            {miEnvio && <TxLink hash={miEnvio.hash} url={miEnvio.url} ms={miEnvio.ms} />}
          </Aviso>
        ) : (
          <Aviso tono="info" titulo="Tu parte se te envía sola: no tenés que hacer nada.">
            {estado.fase === "Activa" && <>{duena} dio señales de vida. Si deja de darlas, en{" "}
              <CuentaRegresiva objetivo={estado.venceEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} /> un agente verificado le avisa y abre una espera por si fue un olvido.</>}
            {estado.fase === "Vencida" && <>{duena} no dio señales en el plazo. El agente verificado está por avisarle y abrir la espera.</>}
            {estado.fase === "EnGracia" && <>El agente avisó. {duena} todavía puede cancelar tocando «Estoy bien». Si no lo hace, en{" "}
              <CuentaRegresiva objetivo={estado.graciaTerminaEn} ahoraCadena={estado.ahoraCadena} leidoEn={datos.leidoEn} margen={0} /> la plata llega a tu cuenta.</>}
            {estado.fase === "Ejecutable" && <>Terminó la espera. El agente verificado está liberando la herencia: en segundos llega a tu cuenta.</>}
          </Aviso>
        )}
      </Modulo>

      <Modulo titulo="Detalle">
        <dl className="detalle">
          <div><dt>Tu cuenta</dt><dd className="mono" title={cuenta}>{acortar(cuenta)}</dd></div>
          <div><dt>Dueña de la Llave</dt><dd>{duena}</dd></div>
          <div><dt>Quién libera</dt><dd>Un agente con identidad verificada por KUMPLY</dd></div>
          <div><dt>Costo para vos</dt><dd>$0 · las comisiones de red las cubre 0xGasless</dd></div>
        </dl>
      </Modulo>
    </>
  );
}
