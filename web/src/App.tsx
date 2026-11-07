import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Entrar } from "./pages/Entrar";
import { Dueno } from "./pages/Dueno";
import { Heredero } from "./pages/Heredero";
import { Demo } from "./pages/Demo";

export default function App() {
  return (
    <Routes>
      {/* Entrar es una pantalla completa, sin barra lateral */}
      <Route path="/" element={<Entrar />} />
      <Route element={<Layout />}>
        <Route path="/dueno" element={<Dueno />} />
        <Route path="/heredero" element={<Heredero />} />
      </Route>
      {/* El panel del proyector tampoco lleva barra: va a pantalla completa y en tema oscuro */}
      <Route path="/demo" element={<Demo />} />
    </Routes>
  );
}
