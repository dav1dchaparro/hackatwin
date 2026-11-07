import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Entrar } from "./pages/Entrar";
import { Dueno } from "./pages/Dueno";
import { Heredero } from "./pages/Heredero";

export default function App() {
  return (
    <Routes>
      {/* Conectar es una pantalla completa, sin barra lateral */}
      <Route path="/" element={<Entrar />} />
      <Route element={<Layout />}>
        <Route path="/dueno" element={<Dueno />} />
        <Route path="/heredero" element={<Heredero />} />
      </Route>
    </Routes>
  );
}
