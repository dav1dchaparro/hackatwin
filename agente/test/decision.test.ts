import { describe, expect, it } from "vitest";
import { Fase } from "../src/abi.js";
import { decidir, ESPERA_COMPROBANTE_S, faseEfectiva, relojEfectivo, repartir } from "../src/decision.js";
import type { Accion, AccionAviso } from "../src/tipos.js";
import { CTX, estadoBase, LUCIA, memoriaVacia, PESOS, TOMAS } from "./ayudas.js";

const UMBRALES = [30, 10];
const HASH = `0x${"ab".repeat(32)}` as const;

function avisos(acciones: Accion[]): AccionAviso[] {
  return acciones.filter((a): a is AccionAviso => a.tipo === "aviso");
}
function txs(acciones: Accion[]): string[] {
  return acciones.flatMap((a) => (a.tipo === "tx" ? [a.fn] : []));
}

describe("faseEfectiva / relojEfectivo", () => {
  it("usa el reloj local cuando el bloque está atrasado", () => {
    const e = estadoBase({ ahora: 1_010 }); // el último bloque es de t=1010
    expect(relojEfectivo(e, 1_070)).toBe(1_070);
    expect(faseEfectiva(e, relojEfectivo(e, 1_070))).toBe(Fase.Vencida);
  });

  it("no retrocede si el reloj local está atrasado respecto del bloque", () => {
    const e = estadoBase({ ahora: 1_070 });
    expect(relojEfectivo(e, 1_000)).toBe(1_070);
  });

  it("calcula las cinco fases igual que Llave.fase()", () => {
    expect(faseEfectiva(estadoBase(), 1_059)).toBe(Fase.Activa);
    expect(faseEfectiva(estadoBase(), 1_060)).toBe(Fase.Vencida);
    expect(faseEfectiva(estadoBase({ reclamoIniciadoEn: 1_065 }), 1_094)).toBe(Fase.EnGracia);
    expect(faseEfectiva(estadoBase({ reclamoIniciadoEn: 1_065 }), 1_095)).toBe(Fase.Ejecutable);
    expect(faseEfectiva(estadoBase({ reclamoIniciadoEn: 1_065, liberadaEn: 1_100 }), 1_200)).toBe(Fase.Liberada);
  });
});

describe("decidir: Activa", () => {
  it("no hace nada si falta más que el umbral mayor", () => {
    expect(decidir(estadoBase(), 1_020, memoriaVacia(), UMBRALES, CTX)).toEqual([]); // faltan 40 s
  });

  it("avisa una vez por umbral, con link a /dueno, y no repite", () => {
    const enviados = new Set<string>();
    const memoria = { avisosEnviados: enviados };
    const primero = decidir(estadoBase(), 1_035, memoria, UMBRALES, CTX); // faltan 25 s → umbral 30
    expect(primero).toHaveLength(1);
    const [aviso] = avisos(primero);
    expect(aviso?.a).toBe("dueno");
    expect(aviso?.clave).toBe("recordatorio:1000:30");
    expect(aviso?.texto).toContain("Te quedan 25 segundos");
    expect(aviso?.texto).toContain("https://llave.example/dueno");
    enviados.add(aviso!.clave);

    expect(decidir(estadoBase(), 1_040, memoria, UMBRALES, CTX)).toEqual([]); // mismo umbral: nada
    const segundo = avisos(decidir(estadoBase(), 1_052, memoria, UMBRALES, CTX)); // faltan 8 s → umbral 10
    expect(segundo.map((a) => a.clave)).toEqual(["recordatorio:1000:10"]);
    enviados.add("recordatorio:1000:10");
    expect(decidir(estadoBase(), 1_055, memoria, UMBRALES, CTX)).toEqual([]);
  });

  it("si arranca tarde manda solo el umbral más urgente", () => {
    const acciones = avisos(decidir(estadoBase(), 1_055, memoriaVacia(), UMBRALES, CTX)); // faltan 5 s
    expect(acciones.map((a) => a.clave)).toEqual(["recordatorio:1000:10"]);
  });

  it("una señal nueva (otra época) vuelve a habilitar los avisos", () => {
    const memoria = { avisosEnviados: new Set(["recordatorio:1000:30", "recordatorio:1000:10"]) };
    const e = estadoBase({ ultimaSenal: 1_050, venceEn: 1_110, ahora: 1_050 });
    expect(avisos(decidir(e, 1_085, memoria, UMBRALES, CTX)).map((a) => a.clave)).toEqual(["recordatorio:1050:30"]);
  });
});

describe("decidir: Vencida", () => {
  it("pide iniciarReclamo y avisa al dueño la hora de fin de gracia", () => {
    const acciones = decidir(estadoBase({ ahora: 1_005 }), 1_061, memoriaVacia(), UMBRALES, CTX);
    expect(txs(acciones)).toEqual(["iniciarReclamo"]);
    const [aviso] = avisos(acciones);
    expect(aviso?.clave).toBe("vencida:1000");
    expect(aviso?.texto).toContain("período de gracia");
    expect(aviso?.texto).toContain("01/01 00:18:11"); // 1061 + 30 s, con segundos porque la gracia es corta
  });

  it("sigue pidiendo la tx aunque el aviso ya se haya mandado", () => {
    const memoria = { avisosEnviados: new Set(["vencida:1000"]) };
    const acciones = decidir(estadoBase(), 1_061, memoria, UMBRALES, CTX);
    expect(acciones).toEqual([{ tipo: "tx", fn: "iniciarReclamo", clave: "iniciar:1000" }]);
  });

  it("con la Llave vacía no manda tx: solo avisa", () => {
    const acciones = decidir(estadoBase({ saldo: 0n }), 1_061, memoriaVacia(), UMBRALES, CTX);
    expect(txs(acciones)).toEqual([]);
    expect(avisos(acciones)[0]?.clave).toBe("vacia:1000");
  });
});

describe("decidir: EnGracia y Ejecutable", () => {
  const conReclamo = estadoBase({ reclamoIniciadoEn: 1_065, graciaTerminaEn: 1_095, ahora: 1_065 });

  it("EnGracia: aviso único que dice cómo cancelar", () => {
    const acciones = decidir(conReclamo, 1_070, memoriaVacia(), UMBRALES, CTX);
    expect(txs(acciones)).toEqual([]);
    const [aviso] = avisos(acciones);
    expect(aviso?.clave).toBe("gracia:1065");
    expect(aviso?.texto).toContain('cancelalo tocando "Estoy bien"');
    const memoria = { avisosEnviados: new Set(["gracia:1065"]) };
    expect(decidir(conReclamo, 1_080, memoria, UMBRALES, CTX)).toEqual([]);
  });

  it("Ejecutable (por reloj local aunque el bloque diga EnGracia): pide liberar", () => {
    const acciones = decidir(conReclamo, 1_096, memoriaVacia(), UMBRALES, CTX);
    expect(acciones).toEqual([{ tipo: "tx", fn: "liberar", clave: "liberar:1065" }]);
  });
});

describe("decidir: Liberada", () => {
  const liberada = estadoBase({
    saldo: 0n,
    reclamoIniciadoEn: 1_065,
    liberadaEn: 1_100,
    totalLiberado: 1_000_000n * PESOS,
    ahora: 1_100,
  });

  it("avisa a dueño y herederos con montos y comprobante", () => {
    const acciones = avisos(
      decidir(liberada, 1_101, { avisosEnviados: new Set(), hashLiberacion: HASH }, UMBRALES, CTX),
    );
    expect(acciones.map((a) => a.a)).toEqual(["dueno", "herederos"]);
    expect(acciones[1]?.cuentas).toEqual([LUCIA, TOMAS]); // el mail se filtra por los herederos on-chain
    for (const a of acciones) {
      expect(a.texto).toContain("594.000 PESOS");
      expect(a.texto).toContain("396.000 PESOS");
      expect(a.texto).toContain("10.000 PESOS");
      expect(a.texto).toContain(`https://testnet.snowtrace.io/tx/${HASH}`);
    }
  });

  it("espera el comprobante un rato antes de avisar sin él", () => {
    expect(decidir(liberada, 1_101, memoriaVacia(), UMBRALES, CTX)).toEqual([]);
    const tarde = avisos(decidir(liberada, 1_100 + ESPERA_COMPROBANTE_S, memoriaVacia(), UMBRALES, CTX));
    expect(tarde).toHaveLength(2);
    expect(tarde[0]?.texto).toContain("https://llave.example");
  });

  it("no repite los avisos de liberación", () => {
    const memoria = {
      avisosEnviados: new Set(["liberada:1100:dueno", "liberada:1100:herederos"]),
      hashLiberacion: HASH,
    };
    expect(decidir(liberada, 2_000, memoria, UMBRALES, CTX)).toEqual([]);
  });
});

describe("repartir", () => {
  it("reproduce el ejemplo A1 (60/40, 1%) y suma exacto", () => {
    const { comision, partes } = repartir(1_000_000n * PESOS, 100, CTX.herederos);
    expect(comision).toBe(10_000n * PESOS);
    expect(partes.map((p) => p.monto)).toEqual([594_000n * PESOS, 396_000n * PESOS]);
  });

  it("el polvo de redondeo va al último heredero", () => {
    const tres = [
      { cuenta: LUCIA, bps: 3333 },
      { cuenta: TOMAS, bps: 3333 },
      { cuenta: LUCIA, bps: 3334 },
    ];
    const { comision, partes } = repartir(100n, 0, tres);
    expect(comision).toBe(0n);
    expect(partes.map((p) => p.monto)).toEqual([33n, 33n, 34n]);
    expect(partes.reduce((s, p) => s + p.monto, 0n)).toBe(100n);
  });
});

describe("decidir: agente sin permiso para ejecutar", () => {
  it("Vencida sin agente tier 5: sigue pidiendo la tx (el ejecutor la frena) pero no promete la gracia", () => {
    const acciones = decidir(estadoBase(), 1_061, memoriaVacia(), UMBRALES, { ...CTX, agenteEjecuta: false });
    expect(txs(acciones)).toEqual(["iniciarReclamo"]);
    const [aviso] = avisos(acciones);
    expect(aviso?.texto).not.toContain("período de gracia");
    expect(aviso?.texto).toContain("https://llave.example/dueno");
  });
});
