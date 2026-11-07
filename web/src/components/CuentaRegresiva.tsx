import { useEffect } from "react";
import { mmss } from "./formato";
import { useReloj } from "./useReloj";

/**
 * Cuenta regresiva hasta `objetivo` (segundos unix de la cadena). Corrige el reloj local con `ahoraCadena`
 * y deja `margen` segundos extra para que el botón no se habilite antes de que la cadena lo permita.
 */
export function CuentaRegresiva({ objetivo, ahoraCadena, leidoEn, margen = 2, prefijo = "", grande = false, alTerminar }:
  { objetivo: number; ahoraCadena: number; leidoEn: number; margen?: number; prefijo?: string; grande?: boolean; alTerminar?: () => void }) {
  const ahora = useReloj(ahoraCadena, leidoEn);
  const faltan = Math.max(0, Math.ceil(objetivo + margen - ahora));
  const termino = faltan === 0;
  useEffect(() => { if (termino) alTerminar?.(); }, [termino, alTerminar]);
  return (
    <span className={`regresiva${grande ? " regresiva-grande" : ""}${termino ? " regresiva-cero" : ""}`}>
      {prefijo}<strong>{mmss(faltan)}</strong>
    </span>
  );
}

/** true cuando la cadena ya pasó `objetivo` + margen (para habilitar botones). */
export function usePaso(objetivo: number, ahoraCadena: number, leidoEn: number, margen = 2): boolean {
  const ahora = useReloj(ahoraCadena, leidoEn, 500);
  return ahora >= objetivo + margen;
}
