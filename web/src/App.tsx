import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Entrar } from "./pages/Entrar";
import { Dueno } from "./pages/Dueno";
import { Heredero } from "./pages/Heredero";
import { Guardian } from "./pages/Guardian";
import { Demo } from "./pages/Demo";
import { PanelIntegracion } from "./lib/dev/PanelIntegracion";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Entrar />} />
        <Route path="/dueno" element={<Dueno />} />
        <Route path="/heredero" element={<Heredero />} />
        <Route path="/guardian" element={<Guardian />} />
      </Route>
      {/* El panel del proyector no lleva barra de navegación */}
      <Route path="/demo" element={<Demo />} />
      {/* P2: panel de integración contra Fuji (sin diseño). P3 puede sacarlo cuando las pantallas estén conectadas. */}
      <Route path="/integracion" element={<PanelIntegracion />} />
    </Routes>
  );
}
