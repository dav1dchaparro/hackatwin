import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Entrar } from "./pages/Entrar";
import { Dueno } from "./pages/Dueno";
import { PanelIntegracion } from "./lib/dev/PanelIntegracion";

export default function App() {
  return (
    <Routes>
      {/* Conectar es una pantalla completa, sin barra lateral */}
      <Route path="/" element={<Entrar />} />
      <Route element={<Layout />}>
        <Route path="/dueno" element={<Dueno />} />
      </Route>
      {/* P2: panel de integración contra Fuji (sin diseño). P3 puede sacarlo cuando las pantallas estén conectadas. */}
      <Route path="/integracion" element={<PanelIntegracion />} />
    </Routes>
  );
}
