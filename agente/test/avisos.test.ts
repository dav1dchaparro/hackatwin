import { describe, expect, it, vi } from "vitest";
import { ErrorEnvio, type Canal } from "../src/avisos/canal.js";
import { crearCanalEmail } from "../src/avisos/email.js";
import { crearNotificador, Notificador } from "../src/avisos/notificador.js";
import { crearCanalTelegram } from "../src/avisos/telegram.js";
import { cargarConfig } from "../src/config.js";
import { logMudo } from "../src/log.js";
import type { AccionAviso } from "../src/tipos.js";

const AVISO: AccionAviso = { tipo: "aviso", a: "dueno", clave: "x", asunto: "Asunto", texto: "Hola" };

function canal(nombre: string, enviar: Canal["enviar"], aplica: Canal["aplica"] = () => true): Canal {
  return { nombre, aplica, enviar: vi.fn(enviar) };
}

describe("Notificador", () => {
  it("sin credenciales solo usa la consola y da el aviso por enviado", async () => {
    const config = cargarConfig({
      FUJI_RPC_URL: "https://rpc.example",
      LLAVE_ADDRESS: "0x4444444444444444444444444444444444444444",
      DRY_RUN: "true",
    });
    const info = vi.fn();
    const n = crearNotificador(config, { ...logMudo, info });
    expect(n.nombresCanales).toEqual(["consola"]);
    expect(await n.enviar(AVISO)).toBe(true);
    expect(info.mock.calls.some(([m]) => String(m).includes("Hola"))).toBe(true);
  });

  it("un canal que falla no rompe a los demás", async () => {
    const malo = canal("telegram", async () => {
      throw new Error("caído");
    });
    const bueno = canal("mail", async () => {});
    const n = new Notificador([canal("consola", async () => {}), malo, bueno], logMudo);
    expect(await n.enviar(AVISO)).toBe(true);
    expect(bueno.enviar).toHaveBeenCalled();
  });

  it("si fallan todos los canales externos, se reintenta (false)", async () => {
    const n = new Notificador(
      [canal("consola", async () => {}), canal("telegram", async () => Promise.reject(new Error("x")))],
      logMudo,
    );
    expect(await n.enviar(AVISO)).toBe(false);
  });

  it("una falla parcial cuenta como enviado (no duplica mails)", async () => {
    const n = new Notificador([canal("mail", async () => Promise.reject(new ErrorEnvio("uno falló", true)))], logMudo);
    expect(await n.enviar(AVISO)).toBe(true);
  });

  it("usa el reescritor si hay, y si no la plantilla", async () => {
    const consola = canal("consola", async () => {});
    const n = new Notificador([consola], logMudo, async (t) => `${t}!`);
    await n.enviar(AVISO);
    expect(consola.enviar).toHaveBeenCalledWith({ a: "dueno", asunto: "Asunto", texto: "Hola!" });
  });
});

describe("canales HTTP", () => {
  it("Telegram llama a sendMessage con el chat del dueño y solo aplica al dueño", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ ok: true })));
    const tg = crearCanalTelegram({ token: "123:abc", chatIdDueno: "42" }, f as unknown as typeof fetch);
    expect(tg.aplica("herederos")).toBe(false);
    await tg.enviar({ a: "dueno", asunto: "A", texto: "T" });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    expect(JSON.parse(String(init.body))).toMatchObject({ chat_id: "42", text: "A\n\nT" });
  });

  it("Telegram con error no expone el token en el mensaje", async () => {
    const f = vi.fn(
      async () => new Response(JSON.stringify({ ok: false, description: "chat not found" }), { status: 400 }),
    );
    const tg = crearCanalTelegram({ token: "123:secreto", chatIdDueno: "42" }, f as unknown as typeof fetch);
    await expect(tg.enviar({ a: "dueno", asunto: "A", texto: "T" })).rejects.toThrow(/chat not found/);
    await expect(tg.enviar({ a: "dueno", asunto: "A", texto: "T" })).rejects.not.toThrow(/secreto/);
  });

  it("Resend manda un mail por heredero", async () => {
    const f = vi.fn(async () => new Response("{}"));
    const mail = crearCanalEmail(
      {
        apiKey: "re_x",
        de: "avisos@llave.example",
        herederos: new Map([
          ["0x2222222222222222222222222222222222222222", "lucia@example.com"],
          ["0x3333333333333333333333333333333333333333", "tomas@example.com"],
        ]),
      },
      f as unknown as typeof fetch,
    );
    expect(mail.aplica("dueno")).toBe(false); // no hay EMAIL_DUENO
    await mail.enviar({ a: "herederos", asunto: "A", texto: "T" });
    expect(f).toHaveBeenCalledTimes(2);
    const destinos = f.mock.calls.map((c) => JSON.parse(String((c as unknown as [string, RequestInit])[1].body)).to[0]);
    expect(destinos).toEqual(["lucia@example.com", "tomas@example.com"]);
  });

  it("Resend solo le escribe a los herederos que siguen on-chain (el que el dueño sacó no recibe nada)", async () => {
    const f = vi.fn(async () => new Response("{}"));
    const mail = crearCanalEmail(
      {
        apiKey: "re_x",
        de: "avisos@llave.example",
        herederos: new Map([
          ["0x2222222222222222222222222222222222222222", "lucia@example.com"],
          ["0x3333333333333333333333333333333333333333", "tomas@example.com"],
          ["0x5555555555555555555555555555555555555555", "exheredero@example.com"],
        ]),
      },
      f as unknown as typeof fetch,
    );
    await mail.enviar({
      a: "herederos",
      asunto: "A",
      texto: "T",
      // en minúsculas a propósito: la comparación no depende del checksum
      cuentas: ["0x2222222222222222222222222222222222222222", "0x3333333333333333333333333333333333333333"],
    });
    const destinos = f.mock.calls.map((c) => JSON.parse(String((c as unknown as [string, RequestInit])[1].body)).to[0]);
    expect(destinos).toEqual(["lucia@example.com", "tomas@example.com"]);
  });
});
