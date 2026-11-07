import { formatearMonto } from "./formato";

export function Monto({ valor, decimales = 18, grande = false, centavos = false, className = "" }:
  { valor: bigint; decimales?: number; grande?: boolean; centavos?: boolean; className?: string }) {
  return <span className={`monto${grande ? " monto-grande" : ""} ${className}`.trim()}>{formatearMonto(valor, decimales, centavos)}</span>;
}
