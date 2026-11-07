// Tema claro/oscuro: respeta el sistema salvo que la persona elija; la elección se guarda en localStorage.
import { useCallback, useEffect, useState } from "react";

export type Tema = "light" | "dark";
const CLAVE = "llave.tema";

export function temaGuardado(): Tema | null {
  try { const t = localStorage.getItem(CLAVE); return t === "dark" || t === "light" ? t : null; } catch { return null; }
}
function temaSistema(): Tema {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function aplicarTema(t: Tema | null) {
  const raiz = document.documentElement;
  if (t) raiz.setAttribute("data-theme", t); else raiz.removeAttribute("data-theme");
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => temaGuardado() ?? temaSistema());
  useEffect(() => { aplicarTema(temaGuardado()); }, []);
  const alternar = useCallback(() => {
    const nuevo: Tema = tema === "dark" ? "light" : "dark";
    setTema(nuevo);
    try { localStorage.setItem(CLAVE, nuevo); } catch { /* sin storage */ }
    aplicarTema(nuevo);
  }, [tema]);
  return { tema, alternar };
}
