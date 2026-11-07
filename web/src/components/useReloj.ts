// Reloj corregido con la cadena: ahoraCadena (block.timestamp de la última lectura) + lo que pasó desde que se leyó.
import { useEffect, useState } from "react";

export function useReloj(ahoraCadena: number, leidoEn: number, cadaMs = 250): number {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), cadaMs);
    return () => clearInterval(id);
  }, [cadaMs]);
  return ahoraCadena + (Date.now() - leidoEn) / 1000;
}
