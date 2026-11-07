// Lee la Llave cada 2 s (un ciclo = estado + herederos + agente + bot) y escucha los eventos.
import { useCallback, useEffect, useRef, useState } from "react";
import { cliente } from "../lib";
import type { AgenteVista, EstadoLlave, EventoLlave, HerederoVista } from "../lib";

export interface DatosLlave {
  estado: EstadoLlave; herederos: HerederoVista[];
  agente: AgenteVista | null;   // el que debería pasar (KUMPLY tier 5)
  bot: AgenteVista | null;      // el impostor sin atestación (rebota con NotAgent)
  leidoEn: number;              // Date.now() de la lectura, para corregir el reloj local con `ahoraCadena`
}

export function useLlave(intervaloMs = 2000) {
  const [datos, setDatos] = useState<DatosLlave | null>(null);
  const [eventos, setEventos] = useState<EventoLlave[]>([]);
  const [error, setError] = useState<string | null>(null);
  const leyendo = useRef(false);

  const recargar = useCallback(async () => {
    if (leyendo.current) return;
    leyendo.current = true;
    try {
      const [estado, herederos, agente, bot] = await Promise.all([
        cliente.estado(),
        cliente.herederos(),
        cliente.agente?.().catch(() => null) ?? Promise.resolve(null),
        cliente.bot?.().catch(() => null) ?? Promise.resolve(null),
      ]);
      setDatos({ estado, herederos, agente, bot, leidoEn: Date.now() });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      leyendo.current = false;
    }
  }, []);

  useEffect(() => {
    void recargar();
    void cliente.eventosRecientes?.().then((evs) => setEventos((prev) => (prev.length ? prev : evs.slice(0, 50)))).catch(() => undefined);
    const id = setInterval(() => void recargar(), intervaloMs);
    const parar = cliente.escucharEventos((e) => {
      setEventos((prev) => [e, ...prev].slice(0, 50));
      void recargar();
    });
    return () => { clearInterval(id); parar(); };
  }, [intervaloMs, recargar]);

  return { datos, eventos, error, recargar };
}
