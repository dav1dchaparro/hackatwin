import { NavLink, Outlet } from "react-router-dom";
import { config } from "../lib/config";
import { acortar, mismaCuenta } from "./formato";
import { useLlave } from "./useLlave";
import { IcoCasa, IcoHerencia, IcoLlave, IcoLuna, IcoSalir, IcoSol } from "./Iconos";
import { useSesion } from "./useSesion";
import { useTema } from "./useTema";

/** Shell de la app: barra lateral (desktop) o barra superior (celular) + contenido. */
export function Layout() {
  const { sesion, salir } = useSesion();
  const { tema, alternar } = useTema();
  const { datos } = useLlave(5000);
  const inicial = sesion?.alias?.[0]?.toUpperCase() ?? "?";
  // Cada rol ve solo su pantalla: la dueña "Mi Llave", el heredero "Mi herencia".
  const esDuena = !!sesion && !!datos && mismaCuenta(sesion.cuenta, datos.estado.dueno);
  const esHeredero = !!sesion && !!datos && datos.herederos.some((h) => mismaCuenta(h.cuenta, sesion.cuenta));
  const sinRol = !!sesion && !!datos && !esDuena && !esHeredero;
  return (
    <div className="shell">
      <aside className="lateral">
        <NavLink to="/" className="marca"><span className="marca-icono"><IcoLlave tam={16} /></span><span>Llave</span></NavLink>
        <div className="nav-seccion">Pantallas</div>
        <nav className="nav" aria-label="Principal">
          {(esDuena || sinRol) && <NavLink to="/dueno" className="nav-item"><IcoCasa /><span>Mi Llave</span></NavLink>}
          {(esHeredero || sinRol) && <NavLink to="/heredero" className="nav-item"><IcoHerencia /><span>Mi herencia</span></NavLink>}
        </nav>
        <div className="lateral-pie">
          {config.modo === "mock" && <span className="badge badge-alerta" title="Datos simulados, sin cadena"><i className="punto" /><span>Modo ensayo</span></span>}
          <button type="button" className="btn btn-fantasma btn-chico tema" onClick={alternar} aria-label="Cambiar tema">
            {tema === "dark" ? <IcoSol /> : <IcoLuna />}<span>{tema === "dark" ? "Tema claro" : "Tema oscuro"}</span>
          </button>
          {sesion ? (
            <div className="sesion-tarjeta">
              <span className="avatar">{inicial}</span>
              <span className="sesion-texto"><strong>{sesion.alias}</strong><small className="mono" title={sesion.cuenta}>{acortar(sesion.cuenta)}</small></span>
              <button type="button" className="btn btn-fantasma btn-icono" onClick={() => void salir()} aria-label="Salir" title="Salir"><IcoSalir /></button>
            </div>
          ) : (
            <NavLink to="/" className="btn btn-secundario">Conectar</NavLink>
          )}
        </div>
      </aside>
      <main className="contenido"><div className="contenido-interno"><Outlet /></div></main>
    </div>
  );
}
