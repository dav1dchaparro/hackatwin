// Provisional (P2): P3 reemplaza este archivo con el router y las pantallas (Entrar, Dueno, Heredero, Guardian, Demo).
import { useEffect, useState } from "react";
import { entrar, hayApiKey, onSesion, reconectar, saldoAvax, salir, sesion as sesionGuardada } from "./lib/gasless";
import type { Sesion } from "./lib/tipos";

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(sesionGuardada());
  const [avax, setAvax] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const off = onSesion(setSesion);
    if (hayApiKey()) reconectar().then(setSesion);
    return off;
  }, []);

  useEffect(() => {
    if (sesion) saldoAvax().then((b) => setAvax(b.toString())).catch(() => setAvax("?"));
  }, [sesion]);

  async function accion(f: () => Promise<unknown>) {
    setOcupado(true);
    try {
      await f();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20 }}>Llave de Emergencia · entrar con email (0xGasless)</h1>
      {sesion ? (
        <ul>
          <li>email: <b>{sesion.email}</b></li>
          <li>smart account: <b>{sesion.cuenta}</b></li>
          <li>AVAX de la smart account: {avax || "…"} wei (tiene que ser 0)</li>
        </ul>
      ) : (
        <p>{hayApiKey() ? "Sin sesión." : "Falta VITE_OXGASLESS_API_KEY en web/.env.local."}</p>
      )}
      <button disabled={ocupado || !hayApiKey() || !!sesion} onClick={() => accion(() => entrar())}>Entrar con email</button>{" "}
      <button disabled={ocupado || !sesion} onClick={() => accion(salir)}>Salir</button>
    </main>
  );
}
