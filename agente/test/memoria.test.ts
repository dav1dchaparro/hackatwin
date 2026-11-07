import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Memoria } from "../src/memoria.js";
import { LLAVE } from "./ayudas.js";

const OTRA = "0x5555555555555555555555555555555555555555";

describe("Memoria", () => {
  it("persiste avisos, último bloque y comprobante", () => {
    const ruta = join(mkdtempSync(join(tmpdir(), "llave-agente-")), "estado", "memoria.json");
    const m = new Memoria(LLAVE, ruta);
    m.marcar("recordatorio:1000:30");
    m.ultimoBloque = 123n;
    m.hashLiberacion = `0x${"ab".repeat(32)}`;
    m.guardar();

    const otra = Memoria.cargar(LLAVE, ruta);
    expect(otra.yaEnviado("recordatorio:1000:30")).toBe(true);
    expect(otra.ultimoBloque).toBe(123n);
    expect(otra.hashLiberacion).toBe(m.hashLiberacion);
    expect(JSON.parse(readFileSync(ruta, "utf8")).llave).toBe(LLAVE);
  });

  it("si cambia la Llave o el archivo está roto, arranca vacía", () => {
    const ruta = join(mkdtempSync(join(tmpdir(), "llave-agente-")), "memoria.json");
    const m = new Memoria(LLAVE, ruta);
    m.marcar("a");
    m.guardar();
    expect(Memoria.cargar(OTRA, ruta).avisosEnviados.size).toBe(0);
    writeFileSync(ruta, "{roto");
    expect(Memoria.cargar(LLAVE, ruta).avisosEnviados.size).toBe(0);
  });
});
