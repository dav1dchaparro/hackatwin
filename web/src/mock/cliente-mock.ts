// Cliente simulado (P3-2), alcance v2-herencia (PR #2 14:32): misma máquina de estados que contracts/src/Llave.sol
// con reloj real (60 s de inactividad, 30 s de gracia), $1.000.000 en la bóveda, las cuentas de la demo,
// ~1,5 s por "transacción" y comprobantes falsos. El agente KUMPLY (tier 5) es el único que puede
// `iniciarReclamo()` y `liberar()`; un bot sin atestación rebota con `NotAgent`.
//
// El estado vive en localStorage para que varias pestañas (Marta, Lucía, el panel) compartan la misma bóveda,
// y la sesión en sessionStorage para que cada pestaña sea una persona distinta.
import type { Address, Hash } from "viem";
import type {
  AgenteVista, ConfigLlave, EstadoLlave, EventoLlave, Fase, HerederoVista, LlaveCliente, ResultadoTx, Sesion, Verificacion,
} from "../lib/tipos";
import { formatearMonto, mmss } from "../components/formato";

export const UNO = 10n ** 18n;
export const TIER_AGENTE = 5;
const BPS_TOTAL = 10_000n;
const EXPLORER = "https://testnet.snowtrace.io";
const CLAVE_ESTADO = "llave.mock.v3";
const CLAVE_SESION = "llave.mock.sesion";

export interface PersonaDemo { alias: string; cuenta: Address; tier: number; rol: string }
export const CUENTAS = {
  gonzalo:   { alias: "Gonzalo", cuenta: "0x1000000000000000000000000000000000000001" as Address, tier: 0, rol: "dueño de la Llave" },
  lucia:     { alias: "Lucía",   cuenta: "0x1000000000000000000000000000000000000002" as Address, tier: 0, rol: "heredera 60%" },
  tomas:     { alias: "Tomás",   cuenta: "0x1000000000000000000000000000000000000003" as Address, tier: 0, rol: "heredero 40%" },
  agente:    { alias: "Agente Llave", cuenta: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2" as Address, tier: 5, rol: "agente verificado (KUMPLY tier 5)" },
  bot:       { alias: "Bot sin verificar", cuenta: "0x000000000000000000000000000000000000dEaD" as Address, tier: 0, rol: "bot sin verificar (rebota)" },
  tesoreria: { alias: "Tesorería Llave", cuenta: "0x1000000000000000000000000000000000000009" as Address, tier: 0, rol: "cobra la comisión" },
} satisfies Record<string, PersonaDemo>;
export const LLAVE_MOCK: Address = "0x100000000000000000000000000000000000000a";
export const PERSONAS_DEMO: PersonaDemo[] = [CUENTAS.gonzalo];
/** Todas las cuentas conocidas (para resolver emails como lucia@… o tomas@…) */
const CONOCIDAS: PersonaDemo[] = [CUENTAS.gonzalo, CUENTAS.lucia, CUENTAS.tomas, CUENTAS.agente, CUENTAS.bot];

interface EstadoMock {
  desfase: number;                       // segundos que se "adelantó" el reloj (controles de la demo)
  dueno: Address;
  herederos: { cuenta: Address; bps: number }[];
  plazoInactividad: number; plazoGracia: number; comisionBps: number; periodoMinimo: number;
  saldo: bigint; ultimaSenal: number; reclamoIniciadoEn: number; liberadaEn: number; totalLiberado: bigint;
  saldos: Record<string, bigint>;        // cuenta (minúscula) -> saldo fuera de la bóveda
  atestaciones: Record<string, number>;  // cuenta (minúscula) -> tier KUMPLY (0 = sin atestación)
  aliases: Record<string, string>;       // cuenta (minúscula) -> nombre
  eventos: EventoLlave[];                // más nuevo primero, máximo 60
}

// ───────────── Persistencia ─────────────
const k = (a: string) => a.toLowerCase();
function serializar(s: EstadoMock): string {
  return JSON.stringify(s, (_, v) => (typeof v === "bigint" ? { __big: v.toString() } : v));
}
function deserializar(texto: string): EstadoMock {
  return JSON.parse(texto, (_, v) => (v && typeof v === "object" && "__big" in v ? BigInt(v.__big) : v));
}
function inicial(): EstadoMock {
  const ahora = Math.floor(Date.now() / 1000);
  const atestaciones: Record<string, number> = {};
  const aliases: Record<string, string> = {};
  for (const p of Object.values(CUENTAS)) { atestaciones[k(p.cuenta)] = p.tier; aliases[k(p.cuenta)] = p.alias; }
  return {
    desfase: 0,
    dueno: CUENTAS.gonzalo.cuenta,
    herederos: [{ cuenta: CUENTAS.lucia.cuenta, bps: 6000 }, { cuenta: CUENTAS.tomas.cuenta, bps: 4000 }],
    plazoInactividad: 90 * 86_400, plazoGracia: 7 * 86_400, comisionBps: 100, periodoMinimo: 1,
    saldo: 1_000_000n * UNO, ultimaSenal: ahora, reclamoIniciadoEn: 0, liberadaEn: 0, totalLiberado: 0n,
    saldos: {}, atestaciones, aliases, eventos: [],
  };
}
function cargar(): EstadoMock {
  try {
    const t = localStorage.getItem(CLAVE_ESTADO);
    if (t) return deserializar(t);
  } catch { /* sin storage: estado en memoria */ }
  const s = inicial();
  guardar(s);
  return s;
}
function guardar(s: EstadoMock) {
  try { localStorage.setItem(CLAVE_ESTADO, serializar(s)); } catch { /* ignorar */ }
}

// ───────────── Reloj y utilidades ─────────────
const ahoraDe = (s: EstadoMock) => Math.floor(Date.now() / 1000) + s.desfase;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
function hashFalso(): Hash {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
function cuentaDesdeTexto(texto: string): Address {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (const ch of texto) { h1 = Math.imul(h1 ^ ch.charCodeAt(0), 16777619) >>> 0; h2 = Math.imul(h2 + ch.charCodeAt(0), 2246822519) >>> 0; }
  const hex = (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).repeat(3).slice(0, 40);
  return `0x${hex}` as Address;
}
const sinAcentos = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

class Revert extends Error {
  nombre: string; mensaje: string;
  constructor(nombre: string, mensaje: string) { super(nombre); this.nombre = nombre; this.mensaje = mensaje; }
}
const $ = (v: bigint) => formatearMonto(v, 18);

// Mensajes en castellano (misma tabla que web/src/lib/errores.ts de P2).
const err = {
  sinSesion: () => new Revert("SinSesion", "Primero entrá con tu email."),
  notAgent: (quien: Address, tier: number) => new Revert(`NotAgent(${quien}, ${tier})`, "Esta cuenta no es un agente verificado en KUMPLY."),
  noEsDueno: () => new Revert("NoEsDueno", "Esta cuenta no es la dueña de esta Llave."),
  sigueVivo: (venceEn: number, ahora: number) => new Revert(`SigueVivo(${venceEn})`, `Todavía no venció el plazo: faltan ${mmss(venceEn - ahora)}.`),
  graciaEnCurso: (termina: number, ahora: number) => new Revert(`GraciaEnCurso(${termina})`, `Período de gracia: la dueña todavía puede cancelar. Faltan ${mmss(termina - ahora)}.`),
  reclamoYaIniciado: () => new Revert("ReclamoYaIniciado", "Ya hay un reclamo en curso."),
  sinReclamo: () => new Revert("SinReclamo", "Primero el agente tiene que iniciar el reclamo."),
  yaLiberada: () => new Revert("YaLiberada", "La Llave ya se liberó: la plata ya se envió a los herederos."),
  sinSaldo: () => new Revert("SinSaldo", "La bóveda está vacía."),
  montoInvalido: () => new Revert("MontoInvalido", "El monto tiene que ser mayor a cero."),
  saldoInsuficiente: (p: bigint, d: bigint) => new Revert(`SaldoInsuficiente(${p}, ${d})`, `No hay saldo suficiente. Disponible: ${$(d)}.`),
  direccionInvalida: () => new Revert("DireccionInvalida", "Hay una cuenta inválida (vacía, repetida o la de la dueña)."),
  porcentajes: (suma: number) => new Revert(`PorcentajesInvalidos(${suma})`, "Los porcentajes tienen que sumar 100%."),
  cantidadHerederos: () => new Revert("CantidadHerederosInvalida", "Tiene que haber entre 1 y 5 herederos."),
  plazoInvalido: () => new Revert("PlazoInvalido", "Un plazo es menor al mínimo permitido."),
};

// ───────────── Lecturas puras ─────────────
function tierDe(s: EstadoMock, cuenta: Address): number { return s.atestaciones[k(cuenta)] ?? 0; }
function verificacionDe(s: EstadoMock, cuenta: Address): Verificacion {
  const tier = tierDe(s, cuenta);
  return { ok: tier > 0, tier, esPersona: tier >= 2 && tier <= 3, esEmpresa: tier === 4, esAgente: tier === TIER_AGENTE, fuente: "mock" };
}
function requiereAgente(s: EstadoMock, cuenta: Address): number {
  const tier = tierDe(s, cuenta);
  if (tier !== TIER_AGENTE) throw err.notAgent(cuenta, tier);
  return tier;
}
const venceEnDe = (s: EstadoMock) => s.ultimaSenal + s.plazoInactividad;
const graciaTerminaDe = (s: EstadoMock) => (s.reclamoIniciadoEn > 0 ? s.reclamoIniciadoEn + s.plazoGracia : 0);
function faseDe(s: EstadoMock): Fase {
  const ahora = ahoraDe(s);
  if (s.liberadaEn > 0) return "Liberada";
  if (s.reclamoIniciadoEn > 0) return ahora >= graciaTerminaDe(s) ? "Ejecutable" : "EnGracia";
  if (ahora >= venceEnDe(s)) return "Vencida";
  return "Activa";
}
/** Misma cuenta que `Llave._repartir`: comisión sobre el total; el último heredero recibe el polvo. */
function repartir(s: EstadoMock, base: bigint): { comision: bigint; montos: bigint[] } {
  const comision = (base * BigInt(s.comisionBps)) / BPS_TOTAL;
  const neto = base - comision;
  const n = s.herederos.length;
  const montos: bigint[] = new Array(n).fill(0n);
  let repartido = 0n;
  for (let i = 0; i + 1 < n; i++) { montos[i] = (neto * BigInt(s.herederos[i].bps)) / BPS_TOTAL; repartido += montos[i]; }
  if (n > 0) montos[n - 1] = neto - repartido;
  return { comision, montos };
}
function parteDe(s: EstadoMock, cuenta: Address): bigint {
  const i = s.herederos.findIndex((h) => k(h.cuenta) === k(cuenta));
  if (i < 0) return 0n;
  const base = s.liberadaEn > 0 ? s.totalLiberado : s.saldo;
  return repartir(s, base).montos[i];
}
function aliasDe(s: EstadoMock, cuenta: Address): string {
  return s.aliases[k(cuenta)] ?? `${cuenta.slice(0, 6)}…${cuenta.slice(-4)}`;
}

// ───────────── Efectos (devuelven los eventos que emiten) ─────────────
type Ev = { nombre: string; args: Record<string, unknown> };
function senal(s: EstadoMock): Ev[] {
  const evs: Ev[] = [];
  const ahora = ahoraDe(s);
  s.ultimaSenal = ahora;
  if (s.reclamoIniciadoEn > 0) { s.reclamoIniciadoEn = 0; evs.push({ nombre: "ReclamoCancelado", args: { cuando: ahora } }); }
  evs.push({ nombre: "SenalDeVida", args: { dueno: s.dueno, cuando: ahora } });
  return evs;
}
function sumarSaldo(s: EstadoMock, cuenta: Address, monto: bigint) { s.saldos[k(cuenta)] = (s.saldos[k(cuenta)] ?? 0n) + monto; }

// ───────────── Eventos a los oyentes (misma pestaña y otras pestañas) ─────────────
const oyentes = new Set<(e: EventoLlave) => void>();
const vistos = new Set<string>();
const claveEv = (e: EventoLlave) => `${e.hash}:${e.nombre}:${JSON.stringify(e.args, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`;
function avisar(e: EventoLlave) {
  const c = claveEv(e);
  if (vistos.has(c)) return;
  vistos.add(c);
  for (const cb of oyentes) cb(e);
}
if (typeof window !== "undefined") {
  window.addEventListener("storage", (ev) => {
    if (ev.key !== CLAVE_ESTADO || !ev.newValue) return;
    const s = deserializar(ev.newValue);
    for (const e of [...s.eventos].reverse()) avisar(e);
  });
}

// ───────────── Transacción simulada ─────────────
async function tx(simular: (s: EstadoMock) => void, aplicar: (s: EstadoMock) => Ev[]): Promise<ResultadoTx> {
  const t0 = performance.now();
  const ms = () => Math.round(performance.now() - t0);
  const fallo = (e: unknown): ResultadoTx => {
    if (e instanceof Revert) return { ok: false, ms: ms(), error: { nombre: e.nombre, mensaje: e.mensaje } };
    return { ok: false, ms: ms(), error: { nombre: "Desconocido", mensaje: "No se pudo mandar. Probá de nuevo." } };
  };
  try { simular(cargar()); } catch (e) { return fallo(e); }           // simulación: si revierte, no se manda
  await dormir(900 + Math.random() * 700);                             // viaje por 0xGasless + inclusión en bloque
  const s = cargar();
  try { simular(s); } catch (e) { return fallo(e); }                   // el estado pudo cambiar mientras viajaba
  const hash = hashFalso();
  const url = `${EXPLORER}/tx/${hash}`;
  const cuando = ahoraDe(s);
  const evs = aplicar(s).map<EventoLlave>((e) => ({ ...e, hash, url, cuando, ms: ms() }));
  s.eventos = [...evs.slice().reverse(), ...s.eventos].slice(0, 60);
  guardar(s);
  for (const e of evs) avisar(e);
  return { ok: true, hash, url, ms: ms(), msFinal: 0, patrocinada: true };
}

// ───────────── Acciones del agente (reutilizadas por la sesión y por los controles de ensayo) ─────────────
function iniciarReclamoComo(quien: Address) {
  return tx(
    (s) => {
      requiereAgente(s, quien);
      if (s.liberadaEn > 0) throw err.yaLiberada();
      if (s.reclamoIniciadoEn > 0) throw err.reclamoYaIniciado();
      if (ahoraDe(s) < venceEnDe(s)) throw err.sigueVivo(venceEnDe(s), ahoraDe(s));
    },
    (s) => {
      s.reclamoIniciadoEn = ahoraDe(s);
      return [
        { nombre: "VerificadoKumply", args: { cuenta: quien, tier: TIER_AGENTE, rol: 3 } },
        { nombre: "ReclamoIniciado", args: { agente: quien, graciaTerminaEn: graciaTerminaDe(s) } },
      ];
    },
  );
}
function liberarComo(quien: Address) {
  return tx(
    (s) => {
      requiereAgente(s, quien);
      if (s.liberadaEn > 0) throw err.yaLiberada();
      if (s.reclamoIniciadoEn === 0) throw err.sinReclamo();
      if (ahoraDe(s) < graciaTerminaDe(s)) throw err.graciaEnCurso(graciaTerminaDe(s), ahoraDe(s));
      if (s.saldo === 0n) throw err.sinSaldo();
    },
    (s) => {
      const base = s.saldo;
      s.liberadaEn = ahoraDe(s);
      s.totalLiberado = base;
      const { comision, montos } = repartir(s, base);
      const evs: Ev[] = [{ nombre: "VerificadoKumply", args: { cuenta: quien, tier: TIER_AGENTE, rol: 3 } }];
      if (comision > 0n) { sumarSaldo(s, CUENTAS.tesoreria.cuenta, comision); evs.push({ nombre: "ComisionCobrada", args: { tesoreria: CUENTAS.tesoreria.cuenta, monto: comision } }); }
      s.herederos.forEach((h, i) => { sumarSaldo(s, h.cuenta, montos[i]); evs.push({ nombre: "HerenciaEnviada", args: { heredero: h.cuenta, monto: montos[i] } }); });
      s.saldo = 0n;
      evs.push({ nombre: "Liberada", args: { agente: quien, total: base, comision } });
      return evs;
    },
  );
}

// ───────────── Sesión (por pestaña) ─────────────
function leerSesion(): Sesion | null {
  try { const t = sessionStorage.getItem(CLAVE_SESION); return t ? (JSON.parse(t) as Sesion) : null; } catch { return null; }
}
function escribirSesion(s: Sesion | null) {
  try { s ? sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s)) : sessionStorage.removeItem(CLAVE_SESION); } catch { /* ignorar */ }
}
function requiereSesion(): Sesion {
  const s = leerSesion();
  if (!s) throw err.sinSesion();
  return s;
}

// ───────────── Controles solo para ensayar (no existen en Fuji) ─────────────
export const mockControles = {
  /** Adelanta el reloj de la bóveda (todas las pestañas) */
  saltar(segundos: number) { const s = cargar(); s.desfase += segundos; guardar(s); },
  /** Vuelve la bóveda al estado inicial de la demo */
  reiniciar() { guardar(inicial()); vistos.clear(); },
  /** Emite o quita una atestación KUMPLY de demo */
  atestar(cuenta: Address, tier: number) { const s = cargar(); s.atestaciones[k(cuenta)] = tier; guardar(s); },
  /** El agente verificado actúa (lo que en Fuji hace el keeper de P2 con su wallet tier 5) */
  agente: {
    iniciarReclamo: () => iniciarReclamoComo(CUENTAS.agente.cuenta),
    liberar: () => liberarComo(CUENTAS.agente.cuenta),
  },
  /** El bot sin atestación intenta lo mismo: rebota con NotAgent (la evidencia "bloqueada" del bonus KUMPLY) */
  bot: {
    iniciarReclamo: () => iniciarReclamoComo(CUENTAS.bot.cuenta),
    liberar: () => liberarComo(CUENTAS.bot.cuenta),
  },
};

// ───────────── Cliente ─────────────
export function crearClienteMock(): LlaveCliente {
  return {
    // lecturas
    async estado(): Promise<EstadoLlave> {
      const s = cargar();
      return {
        direccion: LLAVE_MOCK, dueno: s.dueno, fase: faseDe(s),
        saldo: s.saldo, decimales: 18, simbolo: "mPESO",
        ultimaSenal: s.ultimaSenal, venceEn: venceEnDe(s),
        reclamoIniciadoEn: s.reclamoIniciadoEn, graciaTerminaEn: graciaTerminaDe(s),
        liberadaEn: s.liberadaEn, totalLiberado: s.totalLiberado,
        plazoInactividad: s.plazoInactividad, plazoGracia: s.plazoGracia, comisionBps: s.comisionBps,
        ahoraCadena: ahoraDe(s), tesoreria: CUENTAS.tesoreria.cuenta,
      };
    },
    async herederos(): Promise<HerederoVista[]> {
      const s = cargar();
      return s.herederos.map((h) => ({
        cuenta: h.cuenta, alias: aliasDe(s, h.cuenta), bps: h.bps, parte: parteDe(s, h.cuenta),
        verificacion: verificacionDe(s, h.cuenta),
      }));
    },
    async agente(): Promise<AgenteVista> {
      const s = cargar();
      return { cuenta: CUENTAS.agente.cuenta, alias: CUENTAS.agente.alias, verificacion: verificacionDe(s, CUENTAS.agente.cuenta) };
    },
    async bot(): Promise<AgenteVista> {
      const s = cargar();
      return { cuenta: CUENTAS.bot.cuenta, alias: CUENTAS.bot.alias, verificacion: verificacionDe(s, CUENTAS.bot.cuenta) };
    },
    async saldoDe(cuenta: Address): Promise<bigint> {
      const s = cargar();
      if (k(cuenta) === k(LLAVE_MOCK)) return s.saldo;
      return s.saldos[k(cuenta)] ?? 0n;
    },
    async verificacion(cuenta: Address): Promise<Verificacion> { return verificacionDe(cargar(), cuenta); },
    escucharEventos(cb) {
      oyentes.add(cb);
      return () => { oyentes.delete(cb); };
    },
    aliasDe(cuenta: Address) { return aliasDe(cargar(), cuenta); },
    async eventosRecientes(): Promise<EventoLlave[]> { return cargar().eventos; },
    async cuentaDeEmail(email: string): Promise<Address> {
      const local = sinAcentos(email.split("@")[0] ?? "");
      const persona = CONOCIDAS.find((p) => local.includes(sinAcentos(p.alias.split(" ")[0])));
      if (persona) return persona.cuenta;
      const cuenta = cuentaDesdeTexto(email.trim().toLowerCase());
      const s = cargar();
      if (!s.aliases[k(cuenta)]) { s.aliases[k(cuenta)] = local ? local[0].toUpperCase() + local.slice(1) : "Invitado"; guardar(s); }
      return cuenta;
    },

    // sesión
    sesion() { return leerSesion(); },
    async entrar(email: string): Promise<Sesion> {
      await dormir(600);
      const local = sinAcentos(email.split("@")[0] ?? "");
      const persona = CONOCIDAS.find((p) => local.includes(sinAcentos(p.alias.split(" ")[0])));
      const s = cargar();
      let sesion: Sesion;
      if (persona) {
        sesion = { email, cuenta: persona.cuenta, alias: persona.alias };
      } else {
        const cuenta = cuentaDesdeTexto(email.toLowerCase());
        const alias = local ? local[0].toUpperCase() + local.slice(1) : "Invitado";
        s.aliases[k(cuenta)] = alias;
        guardar(s);
        sesion = { email, cuenta, alias };
      }
      escribirSesion(sesion);
      return sesion;
    },
    async salir() { escribirSesion(null); },

    // escrituras de la dueña (cada una cuenta como "Estoy bien")
    estoyBien() {
      const yo = requiereSesion();
      return tx(
        (s) => { if (k(yo.cuenta) !== k(s.dueno)) throw err.noEsDueno(); if (s.liberadaEn > 0) throw err.yaLiberada(); },
        (s) => senal(s),
      );
    },
    cargarPesosDePrueba(monto: bigint) {
      const yo = requiereSesion();
      return tx(
        (s) => { if (monto <= 0n) throw err.montoInvalido(); if (s.liberadaEn > 0) throw err.yaLiberada(); },
        (s) => {
          s.saldo += monto;
          const evs: Ev[] = [{ nombre: "Depositado", args: { de: yo.cuenta, monto } }];
          if (k(yo.cuenta) === k(s.dueno)) evs.push(...senal(s));
          return evs;
        },
      );
    },
    depositar(monto: bigint) { return this.cargarPesosDePrueba(monto); },
    retirar(a: Address, monto: bigint) {
      const yo = requiereSesion();
      return tx(
        (s) => {
          if (k(yo.cuenta) !== k(s.dueno)) throw err.noEsDueno();
          if (s.liberadaEn > 0) throw err.yaLiberada();
          if (!/^0x[0-9a-fA-F]{40}$/.test(a) || /^0x0{40}$/.test(a)) throw err.direccionInvalida();
          if (monto <= 0n) throw err.montoInvalido();
          if (monto > s.saldo) throw err.saldoInsuficiente(monto, s.saldo);
        },
        (s) => { s.saldo -= monto; sumarSaldo(s, a, monto); return [{ nombre: "Retirado", args: { a, monto } }, ...senal(s)]; },
      );
    },
    configurar(c: ConfigLlave) {
      const yo = requiereSesion();
      const validar = (s: EstadoMock) => {
        if (k(yo.cuenta) !== k(s.dueno)) throw err.noEsDueno();
        if (s.liberadaEn > 0) throw err.yaLiberada();
        if (c.herederos.length < 1 || c.herederos.length > 5 || c.herederos.length !== c.bps.length) throw err.cantidadHerederos();
        const suma = c.bps.reduce((a, b) => a + b, 0);
        if (suma !== 10_000 || c.bps.some((b) => b <= 0)) throw err.porcentajes(suma);
        const invalida = (a: string) => !/^0x[0-9a-f]{40}$/.test(k(a)) || /^0x0{40}$/.test(a) || k(a) === k(s.dueno) || k(a) === k(LLAVE_MOCK);
        if (c.herederos.some(invalida)) throw err.direccionInvalida();
        if (new Set(c.herederos.map(k)).size !== c.herederos.length) throw err.direccionInvalida();
        if (c.plazoInactividad < s.periodoMinimo || c.plazoGracia < s.periodoMinimo) throw err.plazoInvalido();
      };
      return tx(validar, (s) => {
        s.herederos = c.herederos.map((cuenta, i) => ({ cuenta, bps: c.bps[i] }));
        s.plazoInactividad = c.plazoInactividad; s.plazoGracia = c.plazoGracia;
        return [{ nombre: "Configurada", args: { dueno: s.dueno, herederos: c.herederos, bps: c.bps, plazoInactividad: c.plazoInactividad, plazoGracia: c.plazoGracia } }, ...senal(s)];
      });
    },

    // agente (tier 5): desde la sesión de la pestaña. Una cuenta sin atestación rebota con NotAgent.
    iniciarReclamo() { return iniciarReclamoComo(requiereSesion().cuenta); },
    liberar() { return liberarComo(requiereSesion().cuenta); },
  };
}
