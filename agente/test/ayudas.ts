/** Datos de prueba compartidos por los tests. */
import type { Address } from "viem";
import { Fase } from "../src/abi.js";
import type { ContextoDecision, EstadoLlave, MemoriaDecision } from "../src/tipos.js";

export const DUENO: Address = "0x1111111111111111111111111111111111111111";
export const LUCIA: Address = "0x2222222222222222222222222222222222222222";
export const TOMAS: Address = "0x3333333333333333333333333333333333333333";
export const LLAVE: Address = "0x4444444444444444444444444444444444444444";

export const PESOS = 10n ** 18n;

/** Llave de demo: señal en t=1000, plazo 60 s, gracia 30 s, 1.000.000 pesos, comisión 1%. */
export function estadoBase(cambios: Partial<EstadoLlave> = {}): EstadoLlave {
  const base: EstadoLlave = {
    dueno: DUENO,
    fase: Fase.Activa,
    saldo: 1_000_000n * PESOS,
    ultimaSenal: 1_000,
    venceEn: 1_060,
    reclamoIniciadoEn: 0,
    graciaTerminaEn: 0,
    liberadaEn: 0,
    totalLiberado: 0n,
    plazoInactividad: 60,
    plazoGracia: 30,
    comisionBps: 100,
    ahora: 1_000,
  };
  return { ...base, ...cambios };
}

export const CTX: ContextoDecision = {
  webUrl: "https://llave.example",
  token: { simbolo: "PESOS", decimales: 18 },
  herederos: [
    { cuenta: LUCIA, bps: 6000 },
    { cuenta: TOMAS, bps: 4000 },
  ],
  zonaHoraria: "UTC",
};

export function memoriaVacia(): MemoriaDecision {
  return { avisosEnviados: new Set<string>() };
}
