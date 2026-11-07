import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cliente } from "../lib";
import { config } from "../lib/config";
import { Chip } from "../components/Chip";
import { acortar, mismaCuenta } from "../components/formato";
import { IcoEscudo, IcoFlecha, IcoLlave, IcoRayo, IcoReloj } from "../components/Iconos";
import { useLlave } from "../components/useLlave";
import { useSesion } from "../components/useSesion";
import { PERSONAS_DEMO } from "../mock/cliente-mock";

type Rol = "dueña" | "heredero" | "agente";

export function Entrar() {
  const { sesion, entrar, salir } = useSesion();
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
  const roles = sesion ? rolesDe(sesion.cuenta) : [];

  return (
    <div className="auth">
      <aside className="auth-lado">
        <div>
          <Link to="/" className="marca"><span className="marca-icono"><IcoLlave tam={16} /></span><span>Llave</span></Link>
          <h1 style={{ marginTop: 44 }}>Tu plata, protegida si te pasa algo.</h1>
          <p className="lead">
            Guardás tus ahorros en pesos digitales con reglas que nadie puede saltear. Cada tanto tocás «Estoy bien».
            Si dejás de hacerlo, la plata llega sola a quienes vos elegiste, en los porcentajes que pusiste.
          </p>
          <div className="auth-puntos">
            <div className="auth-punto"><i><IcoReloj tam={15} /></i><div><strong>Un toque cada tanto</strong>Cualquier movimiento tuyo reinicia el plazo. Si te olvidás, hay un aviso y una espera para cancelar.</div></div>
            <div className="auth-punto"><i><IcoEscudo tam={15} /></i><div><strong>Solo un agente verificado libera</strong>Su identidad la verifica KUMPLY en la misma operación. Cualquier otro bot rebota.</div></div>
            <div className="auth-punto"><i><IcoRayo tam={15} /></i><div><strong>Sin comisiones de red</strong>Entrás con tu email, sin instalar nada. Las comisiones de red las cubre 0xGasless.</div></div>
          </div>
        </div>
        <div className="auth-pie">
          <Chip title="Red de prueba Fuji de Avalanche">Avalanche Fuji</Chip>
          <Chip title="Identidad verificada">KUMPLY</Chip>
          <Chip title="Comisiones de red cubiertas">0xGasless</Chip>
        </div>
      </aside>

      <section className="auth-form">
        <div className="auth-caja">
          {sesion ? (
            <>
              <div>
                
                <h2>Hola, {sesion.alias}</h2>
                <p className="descripcion mono" title={sesion.cuenta}>{acortar(sesion.cuenta)}</p>
              </div>
              <div className="chips">
                {roles.map((r) => <Chip key={r} tono="info">{r}</Chip>)}
                {datos && roles.length === 0 && <Chip>sin rol en esta Llave</Chip>}
              </div>
              <div className="pila">
                {roles.includes("dueña") && <Link className="btn btn-primario btn-grande" to="/dueno">Mi Llave <IcoFlecha tam={16} /></Link>}
                {roles.includes("heredero") && <Link className="btn btn-primario btn-grande" to="/heredero">Mi herencia <IcoFlecha tam={16} /></Link>}
                <button type="button" className="btn btn-fantasma" onClick={() => void salir()}>Salir</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2>Conectá tu cuenta con tu email</h2>
                <p className="descripcion">No instalás nada, no comprás nada y no pagás comisiones de red.</p>
              </div>
              <form className="pila" onSubmit={onSubmit}>
                <label className="campo">
                  <span>Email</span>
                  <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="vos@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <button type="submit" className="btn btn-primario btn-grande" disabled={ocupado}>{ocupado ? <><span className="spinner" aria-hidden /> Conectando…</> : "Conectar"}</button>
                {error && <p className="tx-error" role="alert">{error}</p>}
              </form>
              {config.modo === "mock" && (
                <>
                  <div className="divisor">o entrá como alguien de la demo</div>
                  <div className="personas">
                    {PERSONAS_DEMO.map((p) => (
                      <button key={p.cuenta} type="button" className="persona" disabled={ocupado}
                        onClick={() => { const correo = `${p.alias.split(" ")[0].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}@llave.demo`; setEmail(correo); void enviar(correo); }}>
                        <span className="avatar">{p.alias[0]}</span>
                        <span className="persona-texto"><strong>{p.alias}</strong><small>{p.rol}</small></span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
