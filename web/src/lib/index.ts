// Punto de entrada del cliente que usan las pantallas (PLAN_CONSTRUCCION_LLAVE.md §2.7).
// P2 (dueño de web/src/lib/): cuando exista cliente-fuji.ts, dejar:
//   export const cliente: LlaveCliente = MODO === "fuji" ? crearClienteFuji() : crearClienteMock();
import type { LlaveCliente } from "./tipos";
import { crearClienteMock } from "../mock/cliente-mock";

export const MODO: "mock" | "fuji" = import.meta.env.VITE_MODO === "fuji" ? "fuji" : "mock";
export const cliente: LlaveCliente = crearClienteMock();

export * from "./tipos";
