/**
 * Memoria persistente del agente en agente/estado/memoria.json (ignorado por git).
 *
 * Guarda los avisos ya enviados (para no repetirlos si el agente se reinicia), el último bloque cuyos logs ya se
 * leyeron y el comprobante de la liberación. Es por Llave: si cambia LLAVE_ADDRESS, arranca de cero.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Address, Hash } from "viem";
import type { MemoriaDecision } from "./tipos.js";

export const RUTA_MEMORIA = fileURLToPath(new URL("../estado/memoria.json", import.meta.url));

/** Tope de claves guardadas (las más viejas se descartan); alcanza para años de recordatorios. */
const MAX_AVISOS = 500;

interface ArchivoMemoria {
  version: 1;
  llave: Address;
  avisosEnviados: string[];
  ultimoBloque?: string;
  hashLiberacion?: Hash;
}

export class Memoria implements MemoriaDecision {
  private readonly avisos = new Set<string>();
  ultimoBloque: bigint | undefined;
  hashLiberacion: Hash | undefined;

  /** `ruta` undefined = solo en memoria (tests). */
  constructor(
    readonly llave: Address,
    private readonly ruta?: string,
  ) {}

  get avisosEnviados(): ReadonlySet<string> {
    return this.avisos;
  }

  /** Carga del disco. Archivo ausente, corrupto o de otra Llave = memoria vacía (nunca rompe el arranque). */
  static cargar(llave: Address, ruta: string = RUTA_MEMORIA): Memoria {
    const memoria = new Memoria(llave, ruta);
    try {
      const datos = JSON.parse(readFileSync(ruta, "utf8")) as Partial<ArchivoMemoria>;
      if (datos.version !== 1 || datos.llave?.toLowerCase() !== llave.toLowerCase()) return memoria;
      for (const clave of datos.avisosEnviados ?? []) memoria.avisos.add(clave);
      if (typeof datos.ultimoBloque === "string" && /^\d+$/.test(datos.ultimoBloque)) {
        memoria.ultimoBloque = BigInt(datos.ultimoBloque);
      }
      if (typeof datos.hashLiberacion === "string") memoria.hashLiberacion = datos.hashLiberacion;
    } catch {
      // primera vez o archivo dañado: se empieza vacío
    }
    return memoria;
  }

  yaEnviado(clave: string): boolean {
    return this.avisos.has(clave);
  }

  marcar(clave: string): void {
    this.avisos.add(clave);
    while (this.avisos.size > MAX_AVISOS) {
      const primera = this.avisos.values().next().value;
      if (primera === undefined) break;
      this.avisos.delete(primera);
    }
  }

  /** Escritura atómica (archivo temporal + rename) para no dejar un JSON a medias si se corta. */
  guardar(): void {
    if (this.ruta === undefined) return;
    const datos: ArchivoMemoria = {
      version: 1,
      llave: this.llave,
      avisosEnviados: [...this.avisos],
      ...(this.ultimoBloque !== undefined ? { ultimoBloque: this.ultimoBloque.toString() } : {}),
      ...(this.hashLiberacion !== undefined ? { hashLiberacion: this.hashLiberacion } : {}),
    };
    mkdirSync(dirname(this.ruta), { recursive: true });
    const temporal = `${this.ruta}.tmp`;
    writeFileSync(temporal, `${JSON.stringify(datos, null, 2)}\n`);
    renameSync(temporal, this.ruta);
  }
}
