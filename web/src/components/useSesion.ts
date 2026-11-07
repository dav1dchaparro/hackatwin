// Sesión compartida entre la barra y las pantallas (useSyncExternalStore sobre cliente.sesion()).
import { useCallback, useSyncExternalStore } from "react";
import { cliente } from "../lib";
import type { Sesion } from "../lib";

const oyentes = new Set<() => void>();
function notificar() { for (const cb of oyentes) cb(); }
function suscribir(cb: () => void) { oyentes.add(cb); return () => { oyentes.delete(cb); }; }
let cache: Sesion | null = cliente.sesion();
let cacheClave = JSON.stringify(cache);
function leer(): Sesion | null {
  const actual = cliente.sesion();
  const clave = JSON.stringify(actual);
  if (clave !== cacheClave) { cache = actual; cacheClave = clave; }
  return cache;
}

export function useSesion() {
  const sesion = useSyncExternalStore(suscribir, leer, () => null);
  const entrar = useCallback(async (email: string) => { const s = await cliente.entrar(email); notificar(); return s; }, []);
  const salir = useCallback(async () => { await cliente.salir(); notificar(); }, []);
  return { sesion, entrar, salir };
}
