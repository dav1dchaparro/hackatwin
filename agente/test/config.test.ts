import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { cargarConfig, ErrorConfig } from "../src/config.js";

// Clave SOLO de prueba, generada al azar en cada corrida: en el repo no queda ninguna clave literal.
const CLAVE = generatePrivateKey();
const LLAVE = "0x4444444444444444444444444444444444444444";
const RPC = "https://api.avax-test.network/ext/bc/C/rpc";

function problemas(env: Record<string, string>): readonly string[] {
  try {
    cargarConfig(env);
  } catch (error) {
    if (error instanceof ErrorConfig) return error.problemas;
    throw error;
  }
  return [];
}

describe("cargarConfig", () => {
  it("config mínima válida con valores por defecto", () => {
    const c = cargarConfig({ FUJI_RPC_URL: RPC, LLAVE_ADDRESS: LLAVE, AGENTE_PRIVATE_KEY: CLAVE });
    expect(c.pollMs).toBe(5000);
    expect(c.umbralesS).toEqual([30, 10]);
    expect(c.dryRun).toBe(false);
    expect(c.cuenta?.address).toBe(privateKeyToAccount(CLAVE).address);
    expect(c.telegram).toBeUndefined();
    expect(c.email).toBeUndefined();
    // la clave no queda como texto en la config
    expect(JSON.stringify(c, (_k, v: unknown) => (typeof v === "bigint" ? v.toString() : v))).not.toContain(
      CLAVE.slice(2),
    );
  });

  it("junta todos los problemas con mensajes en castellano", () => {
    const p = problemas({ LLAVE_ADDRESS: "0x123", POLL_MS: "10", AVISOS_UMBRALES_S: "30,-1", DRY_RUN: "quizas" });
    expect(p.some((m) => m.includes("Falta FUJI_RPC_URL"))).toBe(true);
    expect(p.some((m) => m.includes("LLAVE_ADDRESS no es una dirección válida"))).toBe(true);
    expect(p.some((m) => m.includes("POLL_MS"))).toBe(true);
    expect(p.some((m) => m.includes("AVISOS_UMBRALES_S"))).toBe(true);
    expect(p.some((m) => m.includes("DRY_RUN"))).toBe(true);
  });

  it("sin DRY_RUN exige la clave; con DRY_RUN=true no", () => {
    expect(problemas({ FUJI_RPC_URL: RPC, LLAVE_ADDRESS: LLAVE }).some((m) => m.includes("AGENTE_PRIVATE_KEY"))).toBe(
      true,
    );
    const c = cargarConfig({ FUJI_RPC_URL: RPC, LLAVE_ADDRESS: LLAVE, DRY_RUN: "true" });
    expect(c.dryRun).toBe(true);
    expect(c.cuenta).toBeUndefined();
  });

  it("una clave mal formada no se repite en el mensaje de error", () => {
    const mala = "0xdeadbeef-secreta";
    const p = problemas({ FUJI_RPC_URL: RPC, LLAVE_ADDRESS: LLAVE, AGENTE_PRIVATE_KEY: mala });
    expect(p.join(" ")).toContain("AGENTE_PRIVATE_KEY");
    expect(p.join(" ")).not.toContain(mala);
  });

  it("canales a medio configurar quedan apagados con advertencia, sin romper", () => {
    const c = cargarConfig({
      FUJI_RPC_URL: RPC,
      LLAVE_ADDRESS: LLAVE,
      DRY_RUN: "true",
      TELEGRAM_BOT_TOKEN: "123:abc",
      RESEND_API_KEY: "re_x",
    });
    expect(c.telegram).toBeUndefined();
    expect(c.email).toBeUndefined();
    expect(c.advertencias.length).toBeGreaterThanOrEqual(2);
  });

  it("parsea EMAILS_HEREDEROS y ordena los umbrales de mayor a menor", () => {
    const c = cargarConfig({
      FUJI_RPC_URL: RPC,
      LLAVE_ADDRESS: LLAVE,
      DRY_RUN: "true",
      AVISOS_UMBRALES_S: "10, 30",
      RESEND_API_KEY: "re_x",
      EMAIL_DE: "Llave <avisos@llave.example>",
      EMAILS_HEREDEROS: "0x2222222222222222222222222222222222222222:lucia@example.com",
    });
    expect(c.umbralesS).toEqual([30, 10]);
    expect([...(c.email?.herederos.values() ?? [])]).toEqual(["lucia@example.com"]);
    expect(
      problemas({ FUJI_RPC_URL: RPC, LLAVE_ADDRESS: LLAVE, DRY_RUN: "true", EMAILS_HEREDEROS: "lucia@example.com" }),
    ).toHaveLength(1);
  });
});
