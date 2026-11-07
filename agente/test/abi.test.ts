/**
 * Consistencia del subconjunto `llaveAbi` (escrito a mano) contra el ABI completo del contrato.
 * Referencia, en orden: contracts/out/Llave.sol/Llave.json (lo que genera `forge build`, lo más fresco) y, si no se
 * compiló (clon limpio, CI que solo corre `npm test`), web/src/abi/Llave.ts (generado por export-abi y versionado).
 * Solo se saltea si no existe ninguno de los dos; con `CI` definido, en ese caso falla en vez de saltearse.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Abi, AbiParameter } from "viem";
import { describe, expect, it } from "vitest";
import { parseAbiItem } from "viem";
import { llaveAbi } from "../src/abi.js";

const RUTA_OUT = fileURLToPath(new URL("../../contracts/out/Llave.sol/Llave.json", import.meta.url));
const RUTA_WEB = fileURLToPath(new URL("../../web/src/abi/Llave.ts", import.meta.url));

async function cargarReferencia(): Promise<{ abi: Abi; origen: string } | undefined> {
  if (existsSync(RUTA_OUT)) {
    return { abi: (JSON.parse(readFileSync(RUTA_OUT, "utf8")) as { abi: Abi }).abi, origen: "contracts/out" };
  }
  if (existsSync(RUTA_WEB)) {
    // Import dinámico por URL: vitest transpila el .ts; tsc no lo sigue (no es un literal) y no exige extensiones .ts.
    const mod = (await import(pathToFileURL(RUTA_WEB).href)) as { llaveAbi: Abi };
    return { abi: mod.llaveAbi, origen: "web/src/abi/Llave.ts" };
  }
  return undefined;
}

const referencia = await cargarReferencia();

if (!referencia && process.env.CI) {
  throw new Error("No hay ABI de referencia (ni contracts/out ni web/src/abi/Llave.ts): correr forge build o export-abi");
}

type ItemConFirma = Extract<Abi[number], { type: "function" | "event" | "error" }>;

/** Tipo canónico de un parámetro: expande tuplas a "(t1 nombre1,…)" y ignora `internalType`. */
function tipo(p: AbiParameter): string {
  if (p.type.startsWith("tuple")) {
    const componentes = "components" in p ? p.components : [];
    return `(${componentes.map((c) => `${tipo(c)} ${c.name ?? ""}`).join(",")})${p.type.slice("tuple".length)}`;
  }
  return p.type;
}

function parametros(ps: readonly AbiParameter[] | undefined, conNombre: boolean): string {
  return (ps ?? [])
    .map((p) => `${tipo(p)}${"indexed" in p && p.indexed ? " indexed" : ""}${conNombre ? ` ${p.name ?? ""}` : ""}`)
    .join(",");
}

/** Firma completa: tipo, nombre, entradas (con nombres e indexed), mutabilidad y salidas. */
function firma(item: ItemConFirma): string {
  const base = `${item.type} ${item.name}(${parametros(item.inputs, true)})`;
  if (item.type !== "function") return base;
  return `${base} ${item.stateMutability} returns (${parametros(item.outputs, false)})`;
}

describe.skipIf(!referencia)(`ABI del agente vs ${referencia?.origen ?? "(sin referencia)"}`, () => {
  const completo = referencia?.abi ?? [];
  const firmas = new Set(
    completo
      .filter((i): i is ItemConFirma => i.type === "function" || i.type === "event" || i.type === "error")
      .map(firma),
  );

  it("detecta una firma distinta (control negativo)", () => {
    expect(firmas).not.toContain(firma(parseAbiItem("error SigueVivo(uint256 venceEn)")));
    expect(firmas).not.toContain(
      firma(parseAbiItem("event Liberada(address agente, uint256 total, uint256 comision)")),
    );
  });

  for (const item of llaveAbi) {
    if (item.type !== "function" && item.type !== "event" && item.type !== "error") continue;
    it(`${item.type} ${item.name} existe con la misma firma`, () => {
      expect(firmas).toContain(firma(item));
    });
  }
});
