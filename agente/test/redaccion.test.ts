import { describe, expect, it, vi } from "vitest";
import {
  formatDuracion,
  formatHora,
  formatMonto,
  plantillaAgenteNoVerificado,
  plantillaEnGracia,
  plantillaRecordatorio,
  reescribir,
} from "../src/redaccion.js";
import { PESOS } from "./ayudas.js";

const PALABRAS_CRIPTO = /blockchain|cripto|wallet|token|hash|smart contract|transacci/i;

describe("formateo", () => {
  it("duraciones en castellano, máximo dos unidades", () => {
    expect(formatDuracion(1)).toBe("1 segundo");
    expect(formatDuracion(25)).toBe("25 segundos");
    expect(formatDuracion(75)).toBe("1 minuto y 15 segundos");
    expect(formatDuracion(180 * 86_400)).toBe("180 días");
    expect(formatDuracion(86_400 + 3_600 + 5)).toBe("1 día y 1 hora");
    expect(formatDuracion(-3)).toBe("0 segundos");
  });

  it("montos con separador de miles y hasta 2 decimales", () => {
    const token = { simbolo: "PESOS", decimales: 18 };
    expect(formatMonto(594_000n * PESOS, token)).toBe("594.000 PESOS");
    expect(formatMonto(1_234_567n * PESOS + PESOS / 2n, token)).toBe("1.234.567,5 PESOS");
    expect(formatMonto(0n, token)).toBe("0 PESOS");
  });

  it("horas en la zona pedida", () => {
    expect(formatHora(Date.UTC(2026, 10, 7, 21, 0) / 1000, "UTC")).toBe("07/11 21:00");
  });
});

describe("plantillas", () => {
  it("hablan de 'tu Llave' y no usan jerga cripto", () => {
    const textos = [
      plantillaRecordatorio(25, "https://llave.example"),
      plantillaEnGracia(1_095, "https://llave.example", "UTC"),
      plantillaAgenteNoVerificado(4),
    ];
    for (const t of textos) {
      expect(t.texto).not.toMatch(PALABRAS_CRIPTO);
      expect(t.asunto.length).toBeGreaterThan(0);
    }
    expect(textos[0]?.texto).toContain("tu Llave");
    expect(textos[2]?.texto).toContain("tier 4");
  });
});

describe("reescribir (Claude, opcional)", () => {
  const base = plantillaRecordatorio(25, "https://llave.example").texto;
  const responder = (cuerpo: unknown, status = 200): typeof fetch =>
    vi.fn(async () => new Response(JSON.stringify(cuerpo), { status })) as unknown as typeof fetch;

  it("usa el texto de Claude si conserva links y números", async () => {
    const nuevo = `¡Hola! Te quedan 25 segundos para avisarnos que estás bien: https://llave.example/dueno`;
    const f = responder({
      stop_reason: "end_turn",
      content: [
        { type: "thinking", thinking: "" },
        { type: "text", text: nuevo },
      ],
    });
    expect(await reescribir(base, { apiKey: "k", fetch: f })).toBe(nuevo);
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(JSON.parse(String(init.body)).model).toBe("claude-opus-5-5");
  });

  it("vuelve a la plantilla si se perdió un número o el link", async () => {
    const f = responder({ stop_reason: "end_turn", content: [{ type: "text", text: "Tocá Estoy bien pronto." }] });
    expect(await reescribir(base, { apiKey: "k", fetch: f })).toBe(base);
  });

  it("vuelve a la plantilla si Claude agrega un link, dominio o cuenta 0x que no estaba (anti-phishing)", async () => {
    const conserva = "Te quedan 25 segundos: https://llave.example/dueno";
    for (const extra of [
      " Más info en https://llave-segura.example/login",
      " Escribinos a soporte.llave.example",
      " Mandá la plata a 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
    ]) {
      const f = responder({ stop_reason: "end_turn", content: [{ type: "text", text: conserva + extra }] });
      expect(await reescribir(base, { apiKey: "k", fetch: f })).toBe(base);
    }
  });

  it("vuelve a la plantilla ante error HTTP, rechazo o timeout", async () => {
    expect(await reescribir(base, { apiKey: "k", fetch: responder({}, 529) })).toBe(base);
    expect(await reescribir(base, { apiKey: "k", fetch: responder({ stop_reason: "refusal", content: [] }) })).toBe(
      base,
    );
    const colgado = ((_: unknown, init?: RequestInit) =>
      new Promise((_r, rechazar) =>
        init?.signal?.addEventListener("abort", () => rechazar(new Error("timeout"))),
      )) as typeof fetch;
    expect(await reescribir(base, { apiKey: "k", fetch: colgado, timeoutMs: 20 })).toBe(base);
  });
});
