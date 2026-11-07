import { ContractFunctionExecutionError, ContractFunctionRevertedError, encodeErrorResult, type Hash } from "viem";
import { describe, expect, it, vi } from "vitest";
import { llaveAbi } from "../src/abi.js";
import type { PuertoCadena } from "../src/cadena.js";
import { decodificarRevert } from "../src/cadena.js";
import { Ejecutor, GAS_FIJO, PAUSA_FORZADA_MS, PAUSA_NOT_AGENT_MS } from "../src/ejecutor.js";
import { logMudo } from "../src/log.js";
import type { AccionTx, FuncionAgente } from "../src/tipos.js";
import { estadoBase, LLAVE } from "./ayudas.js";

const HASH = `0x${"cd".repeat(32)}` as Hash;

type ErrorLlave = "NotAgent" | "SigueVivo" | "GraciaEnCurso" | "YaLiberada" | "SinReclamo";

/** Error de viem igual al que tira simulateContract cuando el contrato revierte con un error custom. */
function revertDe(fn: FuncionAgente, errorName: ErrorLlave, args: readonly unknown[]): ContractFunctionExecutionError {
  const data = encodeErrorResult({ abi: llaveAbi, errorName, args } as Parameters<typeof encodeErrorResult>[0]);
  const causa = new ContractFunctionRevertedError({ abi: llaveAbi, data, functionName: fn });
  return new ContractFunctionExecutionError(causa, { abi: llaveAbi, functionName: fn, contractAddress: LLAVE });
}

function puerto(simular: PuertoCadena["simular"]): PuertoCadena & {
  enviar: ReturnType<typeof vi.fn>;
  simular: ReturnType<typeof vi.fn>;
} {
  return {
    simular: vi.fn(simular),
    enviar: vi.fn(async () => HASH),
    esperar: vi.fn(async (hash: Hash) => ({ hash, exitosa: true, bloque: 123n })),
  };
}

const INICIAR: AccionTx = { tipo: "tx", fn: "iniciarReclamo", clave: "iniciar:1000" };
const LIBERAR: AccionTx = { tipo: "tx", fn: "liberar", clave: "liberar:1065" };

describe("decodificarRevert", () => {
  it("saca nombre y argumentos del error custom", () => {
    expect(decodificarRevert(revertDe("iniciarReclamo", "NotAgent", [LLAVE, 4]))).toEqual({
      nombre: "NotAgent",
      args: [LLAVE, 4],
    });
    expect(decodificarRevert(new Error("red caída"))).toBeUndefined();
  });
});

describe("Ejecutor", () => {
  it("simula y manda cuando corresponde", async () => {
    const cadena = puerto(async () => {});
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo });
    const r = await ej.ejecutar(INICIAR, estadoBase());
    expect(r).toEqual({ tipo: "enviada", fn: "iniciarReclamo", hash: HASH, forzada: false });
    expect(cadena.enviar).toHaveBeenCalledWith("iniciarReclamo", undefined);
  });

  it("NotAgent: avisa una vez con el tier y no reintenta en loop", async () => {
    let ahora = 1_000_000;
    const cadena = puerto(async () => {
      throw revertDe("iniciarReclamo", "NotAgent", [LLAVE, 0]);
    });
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => ahora });

    const r1 = await ej.ejecutar(INICIAR, estadoBase());
    expect(r1.tipo).toBe("no-agente");
    if (r1.tipo !== "no-agente") throw new Error("inesperado");
    expect(r1.tier).toBe(0);
    expect(r1.aviso?.clave).toBe("no-agente:0");
    expect(r1.aviso?.texto).toContain("el agente no está verificado por KUMPLY (tier 0");

    for (let i = 0; i < 10; i++) {
      ahora += 5_000; // diez ciclos de POLL_MS
      expect((await ej.ejecutar(INICIAR, estadoBase())).tipo).toBe("omitida");
    }
    expect(cadena.simular).toHaveBeenCalledTimes(1);
    expect(cadena.enviar).not.toHaveBeenCalled();

    ahora += PAUSA_NOT_AGENT_MS; // pasada la pausa vuelve a probar (por si lo verificaron)
    await ej.ejecutar(INICIAR, estadoBase());
    expect(cadena.simular).toHaveBeenCalledTimes(2);
  });

  it("SigueVivo con el reloj local pasado (+2 s): manda igual con gas fijo 200k", async () => {
    const cadena = puerto(async () => {
      throw revertDe("iniciarReclamo", "SigueVivo", [1_060n]);
    });
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => 1_062_000 });
    const r = await ej.ejecutar(INICIAR, estadoBase());
    expect(r).toMatchObject({ tipo: "enviada", forzada: true });
    expect(cadena.enviar).toHaveBeenCalledWith("iniciarReclamo", GAS_FIJO.iniciarReclamo);
    expect(GAS_FIJO.iniciarReclamo).toBe(200_000n);
  });

  it("SigueVivo dentro del margen: no manda", async () => {
    const cadena = puerto(async () => {
      throw revertDe("iniciarReclamo", "SigueVivo", [1_060n]);
    });
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => 1_061_000 });
    expect(await ej.ejecutar(INICIAR, estadoBase())).toEqual({
      tipo: "omitida",
      fn: "iniciarReclamo",
      motivo: "SigueVivo",
    });
    expect(cadena.enviar).not.toHaveBeenCalled();
  });

  it("GraciaEnCurso con el reloj local pasado: liberar con gas fijo 600k", async () => {
    const cadena = puerto(async () => {
      throw revertDe("liberar", "GraciaEnCurso", [1_095n]);
    });
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => 1_100_000 });
    await ej.ejecutar(LIBERAR, estadoBase({ reclamoIniciadoEn: 1_065, graciaTerminaEn: 1_095 }));
    expect(cadena.enviar).toHaveBeenCalledWith("liberar", 600_000n);
  });

  it("YaLiberada u otros reverts: no manda", async () => {
    const cadena = puerto(async () => {
      throw revertDe("liberar", "YaLiberada", [1_100n]);
    });
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => 9_999_000 });
    expect((await ej.ejecutar(LIBERAR, estadoBase())).tipo).toBe("omitida");
    expect(cadena.enviar).not.toHaveBeenCalled();
  });

  it("DRY_RUN: simula pero nunca manda", async () => {
    const cadena = puerto(async () => {});
    const ej = new Ejecutor({ cadena, dryRun: true, log: logMudo });
    expect(await ej.ejecutar(LIBERAR, estadoBase())).toEqual({ tipo: "dry-run", fn: "liberar", forzada: false });
    expect(cadena.simular).toHaveBeenCalledTimes(1);
    expect(cadena.enviar).not.toHaveBeenCalled();
  });

  it("DRY_RUN sin clave: no simula ni manda, y loguea una sola vez por época", async () => {
    const info = vi.fn();
    const ej = new Ejecutor({ cadena: undefined, dryRun: true, log: { ...logMudo, info } });
    await ej.ejecutar(INICIAR, estadoBase());
    await ej.ejecutar(INICIAR, estadoBase());
    expect(info).toHaveBeenCalledTimes(1);
  });

  it("si la tx revierte on-chain lo informa", async () => {
    const cadena = puerto(async () => {});
    cadena.esperar = vi.fn(async (hash: Hash) => ({ hash, exitosa: false, bloque: 5n }));
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo });
    expect(await ej.ejecutar(LIBERAR, estadoBase())).toEqual({ tipo: "revertida", fn: "liberar", hash: HASH });
  });

  it("tx forzada que revierte on-chain (reloj adelantado): no la vuelve a forzar en cada ciclo", async () => {
    let ahora = 1_062_000;
    const cadena = puerto(async () => {
      throw revertDe("iniciarReclamo", "SigueVivo", [1_060n]);
    });
    cadena.esperar = vi.fn(async (hash: Hash) => ({ hash, exitosa: false, bloque: 7n }));
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => ahora });

    expect((await ej.ejecutar(INICIAR, estadoBase())).tipo).toBe("revertida");
    for (let i = 0; i < 5; i++) {
      ahora += 5_000; // ciclos de POLL_MS con el reloj local todavía adelantado
      expect(await ej.ejecutar(INICIAR, estadoBase())).toMatchObject({ tipo: "omitida", fn: "iniciarReclamo" });
    }
    expect(cadena.enviar).toHaveBeenCalledTimes(1);

    ahora = 1_062_000 + PAUSA_FORZADA_MS; // pasada la pausa vuelve a intentar una vez
    await ej.ejecutar(INICIAR, estadoBase());
    expect(cadena.enviar).toHaveBeenCalledTimes(2);
  });

  it("tras una forzada revertida, si la simulación pasa manda normal sin esperar la pausa", async () => {
    let pasa = false;
    const cadena = puerto(async () => {
      if (!pasa) throw revertDe("iniciarReclamo", "SigueVivo", [1_060n]);
    });
    cadena.esperar = vi.fn(async (hash: Hash) => ({ hash, exitosa: pasa, bloque: 7n }));
    const ej = new Ejecutor({ cadena, dryRun: false, log: logMudo, ahoraMs: () => 1_062_000 });
    expect((await ej.ejecutar(INICIAR, estadoBase())).tipo).toBe("revertida");
    pasa = true;
    expect(await ej.ejecutar(INICIAR, estadoBase())).toMatchObject({ tipo: "enviada", forzada: false });
  });
});
