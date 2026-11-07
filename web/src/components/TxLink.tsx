import { config } from "../lib/config";

/** Link al comprobante en Snowtrace + tiempo medido. En mock avisa que es simulado. */
export function TxLink({ hash, url, ms, etiqueta = "Ver comprobante" }: { hash?: string; url?: string; ms?: number; etiqueta?: string }) {
  if (!hash) return null;
  return (
    <span className="txlink">
      <a href={url} target="_blank" rel="noreferrer" title={hash}>{etiqueta}</a>
      {typeof ms === "number" && <span className="txlink-meta">{ms} ms</span>}
      {config.modo === "mock" && <span className="txlink-meta">simulado</span>}
    </span>
  );
}
