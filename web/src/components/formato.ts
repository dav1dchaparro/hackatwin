// Formato es-AR para pantallas: montos con puntos de miles, mm:ss, "hace X", direcciones cortas.

const fmtEntero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const fmtDecimal = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1500000000000000000000000n (18 dec) -> "$ 1.500.000" */
export function formatearMonto(valor: bigint, decimales = 18, conCentavos = false, simbolo = "$"): string {
  const neg = valor < 0n;
  const abs = neg ? -valor : valor;
  const base = 10n ** BigInt(decimales);
  const entero = abs / base;
  const resto = abs % base;
  let texto: string;
  if (conCentavos) {
    const centavos = decimales >= 2 ? resto / 10n ** BigInt(decimales - 2) : resto;
    texto = fmtDecimal.format(Number(entero) + Number(centavos) / 100);
  } else {
    texto = fmtEntero.format(Number(entero));
  }
  return `${neg ? "-" : ""}${simbolo} ${texto}`.trim();
}

/** "150.000" | "150000" | "150000,50" -> bigint con `decimales`. null si no se entiende. */
export function parsearMonto(texto: string, decimales = 18): bigint | null {
  const limpio = texto.replace(/\s|\$/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const [ent, dec = ""] = limpio.split(".");
  const decRecortado = (dec + "0".repeat(decimales)).slice(0, decimales);
  return BigInt(ent) * 10n ** BigInt(decimales) + BigInt(decRecortado || "0");
}

/** 42 -> "0:42" · 125 -> "2:05" · 3725 -> "1 h 02:05" · 90000 -> "1 día 01:00:00" */
export function mmss(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const dias = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dd = (n: number) => n.toString().padStart(2, "0");
  if (dias > 0) return `${dias} ${dias === 1 ? "día" : "días"} ${dd(h)}:${dd(m)}:${dd(seg)}`;
  if (h > 0) return `${h} h ${dd(m)}:${dd(seg)}`;
  return `${m}:${dd(seg)}`;
}

/** Diferencia en segundos -> "hace 12 s" / "hace 3 min" / "hace 2 h" / "hace 4 días" */
export function haceX(desde: number, ahora: number): string {
  const d = Math.max(0, Math.floor(ahora - desde));
  if (d < 60) return `hace ${d} s`;
  if (d < 3600) return `hace ${Math.floor(d / 60)} min`;
  if (d < 86400) return `hace ${Math.floor(d / 3600)} h`;
  const dias = Math.floor(d / 86400);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}

/** 0x1234567890abcdef... -> 0x1234…cdef */
export function acortar(cuenta: string): string {
  if (!cuenta || cuenta.length < 12) return cuenta;
  return `${cuenta.slice(0, 6)}…${cuenta.slice(-4)}`;
}

/** Compara dos cuentas sin importar mayúsculas */
export function mismaCuenta(a?: string | null, b?: string | null): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

/** Hora local hh:mm:ss a partir de segundos unix */
export function horaDe(segundos: number): string {
  return new Date(segundos * 1000).toLocaleTimeString("es-AR", { hour12: false });
}

/** Porcentaje a partir de bps: 6000 -> "60%" · 3334 -> "33,34%" */
export function porcentaje(bps: number): string {
  const p = bps / 100;
  return Number.isInteger(p) ? `${p}%` : `${p.toFixed(2).replace(".", ",")}%`;
}

/** Partes iguales que siempre suman 10.000 (3 herederos -> 3334/3333/3333). */
export function bpsIguales(cantidad: number): number[] {
  if (cantidad <= 0) return [];
  const base = Math.floor(10_000 / cantidad);
  const resto = 10_000 - base * cantidad;
  return Array.from({ length: cantidad }, (_, i) => base + (i < resto ? 1 : 0));
}
