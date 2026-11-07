import { NavLink, Outlet } from "react-router-dom";
import { config } from "../lib";
import { acortar } from "./formato";
import { useSesion } from "./useSesion";

export function Layout() {
  const { sesion, salir } = useSesion();
  return (
    <div className="app">
      <header className="barra">
        <NavLink to="/" className="marca">🔑 Llave</NavLink>
        <nav>
          <NavLink to="/dueno">Dueña</NavLink>
          <NavLink to="/heredero">Heredero</NavLink>
          <NavLink to="/demo">Panel</NavLink>
        </nav>
        <div className="barra-sesion">
          {config.modo === "mock" && <span className="chip chip-alerta" title="Datos simulados, sin cadena">modo ensayo</span>}
          {sesion ? (
            <>
              <span title={sesion.cuenta}>Entraste como <strong>{sesion.alias}</strong> <small>{acortar(sesion.cuenta)}</small></span>
              <button type="button" className="btn btn-texto" onClick={() => void salir()}>Salir</button>
            </>
          ) : (
            <NavLink to="/" className="btn btn-texto">Entrar</NavLink>
          )}
        </div>
      </header>
      <main className="contenido"><Outlet /></main>
    </div>
  );
}
