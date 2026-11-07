# EVAL DUAL – ¿un producto para los dos tracks? (sáb 7/11, ~9:45, quedan ~8 h)

Rigen `REGLAS_TRACKS.md`. Puntajes = **estimación mía** con los criterios nuevos (no son del jurado).
Mecánica dual (igual para todas): **un solo contrato, dos deploys.** Fuji = token de prueba + gate KUMPLY + 0xGasless (Blockchain). Avalanche C-Chain mainnet = mismo contrato con **ARGt real** (0x2E4e…703B, confirmar) y 1 tx real con hash (Stablecoins; Avalanche es chain elegible). En mainnet el gate KUMPLY va apagado o con store propio (KUMPLY mainnet es beta de solo lectura).

| Idea | ¿8 h? Blockchain / Stable | Dual: qué se agrega y costo | Dependencias humanas → plan B | Riesgo "dos a medias" | Avax est. (100 + bonus) | Twin est. (/20) |
|---|---|---|---|---|---|---|
| **Al contrato no lo chamuyan (Mandato), recortada** | Sí, si se corta ERC-8004 y x402 / Sí | Deploy mainnet + selector de red en el front + 1 pago ARGt real: **~1,5 h** | Nivel 5 (agente) y 4 (farmacia) de KUMPLY → store propio en Fuji; ARGt de Twin → pedirlo a las 10:00; API key 0xGasless → tx patrocinada simple | MEDIO (con recorte) | 72 + **20** (combo nativo: el lane KUMPLY+0xGasless patrocina tier 5 = el agente) ≈ **92** | **17** (es el disparador #1 de Twin: pagos agénticos con límites del usuario; ARGt es el núcleo) |
| Seña Segura | Sí / Sí | Igual: **~1 h** (contrato chico) | KYC 2 real → store propio; ARGt → Twin | BAJO | 76 + ~15 (KUMPLY core pero no KYA) ≈ 91 | 15 (Idea floja: "escrow" ya existe en Airbnb/Alohar → choca con "no versiones onchain de productos existentes") |
| Cuota Blindada | Justo / Justo | ~1,5 h + `ARGtDemo` duplicado con permit | 5 billeteras nivel 4 → store propio | ALTO (5 vistas) | 70 + ~15 ≈ 85 | 15 |
| Pallet compartido | Justo / Justo | ~1,5 h | KYB 4 que KUMPLY no emite hoy; ~15 billeteras | ALTO (contrato más grande) | 64 + ~12 ≈ 76 | 15 (calza con "pago al mayorista") |
| Comanda con dueño | Riesgoso / Sí | ~1,5 h | x402 en Fuji sin verificar [SIN VERIFICAR] | MUY ALTO | 64 + 20 ≈ 84 | 13 (no hay usuario hoy) |

- **Mandato:** la única que pega en el centro de los dos jurados (KYA prioridad de KUMPLY + disparador #1 de Twin); el combo +20 sale solo.
- **Seña:** la más segura de construir, pero en Twin pierde en "Idea" y en Avalanche no toca la prioridad KYA. Es el paracaídas.
- **Cuota:** buen problema, demasiadas vistas para dos tracks.
- **Pallet:** depende de un KYB que hoy no existe en Fuji.
- **Comanda:** x402 en Fuji sin verificar; no apostar el día a eso.
- Ronda 1: ninguna eliminada supera a Mandato con las reglas nuevas (Legajo/capital de trabajo calza con Twin pero Morpho solo está en Arbitrum → no es dual en Avalanche).

## Recomendación: **DUAL SÍ, con Mandato recortado**
**Alcance mínimo:** `Mandato.sol` (tope por pago, tope diario, lista de comercios, cola con veto) + agente con guion fijo + panel de Diego + pantalla del comercio que escucha el evento `Pagado`. **Fuera:** ERC-8004 propio (usar `RegistroAgentes` mínimo si hace falta) y el servidor 402 de la farmacia.
**Reparto:** P1 contrato + tests + deploy Fuji verificado. P2 agente + 0xGasless + KUMPLY/store propio. P3 front. P4 pide ARGt a Twin y KUMPLY nivel 5 **ya**, deploy en mainnet + tx ARGt, README ("por qué Avalanche", negocio, hecho hoy), pitch y video.
**Cortes duros:**
- 10:00: preguntar a la organización si un mismo proyecto puede ir a los dos tracks [SIN CONFIRMAR]. Si dicen que no → **solo Avalanche** (6 obligatorios cubiertos + combo +20).
- 12:00: si no hay verde/rojo en Fuji → pasar a **Seña Segura** (misma mecánica dual, ~1 h).
- 15:00: si a esa hora no hay ARGt real o AVAX de mainnet → se abandona Stablecoins, todo a Avalanche.
- 17:00: video de respaldo.
**Regla anti-medias:** Stablecoins es un deploy más (P4, ≤1,5 h) y nunca le saca horas a P1-P3.
