import { formatearMonto } from "./formato";

/** Monto en pesos con puntos de miles, en tipografía mono para que los dígitos alineen. */
export function Monto({ valor, decimales = 18, centavos = false, className = "" }:
  { valor: bigint; decimales?: number; centavos?: boolean; className?: string }) {
  return <span className={`monto ${className}`.trim()}>{formatearMonto(valor, decimales, centavos)}</span>;
}
