import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app">
      <header className="barra">
        <NavLink to="/" className="marca">🔑 Llave de Emergencia</NavLink>
        <nav>
          <NavLink to="/dueno">Dueña</NavLink>
          <NavLink to="/heredero">Heredero</NavLink>
          <NavLink to="/guardian">Guardianes</NavLink>
          <NavLink to="/demo">Panel</NavLink>
        </nav>
      </header>
      <main className="contenido"><Outlet /></main>
    </div>
  );
}
