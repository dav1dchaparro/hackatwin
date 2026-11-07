import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cliente } from "../lib";
import { config } from "../lib/config";
import { Chip } from "../components/Chip";
import { acortar, mismaCuenta } from "../components/formato";
import { useLlave } from "../components/useLlave";
import { useSesion } from "../components/useSesion";
import { PERSONAS_DEMO } from "../mock/cliente-mock";

type Rol = "dueña" | "heredero" | "agente";

export function Entrar() {
  const { sesion, entrar } = useSesion();
  const { datos } = useLlave(5000);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function rolesDe(cuenta: string): Rol[] {
    if (!datos) return [];
    const r: Rol[] = [];
    if (mismaCuenta(cuenta, datos.estado.dueno)) r.push("dueña");
    if (datos.herederos.some((h) => mismaCuenta(h.cuenta, cuenta))) r.push("heredero");
    if (datos.agente && mismaCuenta(datos.agente.cuenta, cuenta)) r.push("agente");
    return r;
  }

  async function enviar(correo: string) {
    if (!correo.includes("@")) { setError("Escribí un email válido."); return; }
    setOcupado(true); setError(null);
    try {
      const s = await entrar(correo);
      const [estado, herederos] = await Promise.all([cliente.estado(), cliente.herederos()]);
      if (mismaCuenta(s.cuenta, estado.dueno)) nav("/dueno");
      else if (herederos.some((h) => mismaCuenta(h.cuenta, s.cuenta))) nav("/heredero");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo entrar. Probá de nuevo.");
    } finally {
      setOcupado(false);
    }
  }
  function onSubmit(e: FormEvent) { e.preventDefault(); void enviar(email.trim()); }

  return (
    <section className="pagina pagina-angosta">
      <h1>Tu plata, protegida si te pasa algo</h1>
      <p className="intro">
        Tu Llave guarda tus ahorros en pesos digitales con reglas que nadie puede saltear. Cada tanto tocás
        <strong> «Estoy bien»</strong>. Si dejás de hacerlo, un agente con identidad verificada te avisa, espera un tiempo
        por si cancelás, y después la plata <strong>llega sola</strong> a quienes vos elegiste, en los porcentajes que pusiste.
      </p>

      {sesion ? (
        <div className="tarjeta">
          <h2>Entraste como {sesion.alias}</h2>
          <p><small title={sesion.cuenta}>Tu cuenta: {acortar(sesion.cuenta)}</small></p>
          <p className="chips">
            {rolesDe(sesion.cuenta).map((r) => <Chip key={r} tono="info">{r}</Chip>)}
            {datos && rolesDe(sesion.cuenta).length === 0 && <Chip>sin rol en esta Llave</Chip>}
          </p>
          <p className="acciones">
            {rolesDe(sesion.cuenta).includes("dueña") && <Link className="btn btn-primario" to="/dueno">Mi Llave</Link>}
            {rolesDe(sesion.cuenta).includes("heredero") && <Link className="btn btn-primario" to="/heredero">Mi herencia</Link>}
            <Link className="btn btn-secundario" to="/demo">Ver el panel</Link>
          </p>
        </div>
      ) : (
        <form className="tarjeta" onSubmit={onSubmit}>
          <h2>Entrá con tu email</h2>
          <p><small>No instalás nada, no comprás nada y no pagás comisiones de red.</small></p>
          <label className="campo">
            <span>Email</span>
            <input type="email" inputMode="email" autoComplete="email" placeholder="vos@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primario btn-grande" disabled={ocupado}>{ocupado ? "Entrando…" : "Entrar"}</button>
          {error && <p className="tx-error" role="alert">{error}</p>}
          {config.modo === "mock" && (
            <div className="demo-accesos">
              <p><small>Modo ensayo: entrá como una de las personas de la demo.</small></p>
              <div className="chips">
                {PERSONAS_DEMO.map((p) => (
                  <button key={p.cuenta} type="button" className="btn btn-secundario btn-chico" disabled={ocupado}
                    onClick={() => { const correo = `${p.alias.split(" ")[0].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}@llave.demo`; setEmail(correo); void enviar(correo); }}>
                    {p.alias} · {p.rol}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      <p className="chips chips-sponsors">
        <Chip title="La identidad del agente la verifica KUMPLY">KUMPLY</Chip>
        <Chip title="Las comisiones de red las cubre 0xGasless">0xGasless</Chip>
        <Chip title="Avalanche Fuji (red de prueba)">Avalanche</Chip>
      </p>
    </section>
  );
}
