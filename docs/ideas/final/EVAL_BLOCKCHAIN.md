# EVAL Blockchain Track (Avalanche) – juez, sáb 7/11 ~9:50

Base: REGLAS_TRACKS.md. Jurado sobre 100 + bonus realista (no el techo). Los puntajes son estimaciones mías [SIN VERIFICAR].
**Techo duro de "Uso de Avalanche":** en 8 h nadie hace L1 propia ni ICM. Lo que queda es: finalidad rápida (sirve si hay alguien esperando en un mostrador o check-in), el ecosistema propio de Fuji (KUMPLY, 0xGasless, x402 de Team1, ERC-8004) y compliance. Un escrow ERC-20 genérico, que corre igual en cualquier EVM, no pasa de ~11/25.

| Idea | Imp 25 | Avax 25 | Fact 20 | Neg 20 | Pres 10 | **Jurado** | Bonus realista | **Total** | 6 oblig. |
|---|---|---|---|---|---|---|---|---|---|
| Mandato (Al contrato no lo chamuyan) | 19 | **17** | 13 | 13 | 8 | **70** | +15 (KUMPLY core KYA +10, 0xGasless +5; techo +20) | **85** | Sí, si a las 12:00 está verde/rojo en Fuji |
| Seña Segura | 20 | 11 | **17** | 14 | 9 | **71** | +10 (0xGasless core +10; KUMPLY +5 solo si llega el KYC) | **81** | Sí; el "por qué Avalanche" es flojo |
| s6 Datos para agentes (ronda-1) | 12 | 18 | 12 | 12 | 7 | 61 | +15 (KYA core +10, x402 +5) | 76 | Sí; idea saturada (ganó en Consensus) |
| Comanda con dueño | 13 | 18 | 9 | 11 | 8 | 59 | +12 | 71 | En riesgo: x402 en Fuji [SIN VERIFICAR] |
| Cuota Blindada | 18 | 10 | 12 | 12 | 8 | 60 | +10 | 70 | Sí; 5 vistas, es mucho front |
| Pallet compartido | 15 | 10 | 11 | 12 | 7 | 55 | +10 | 65 | Sí; el contrato más grande |

## Una línea por idea
- **Mandato:** es la única donde lo de Avalanche es el producto. Usa KYA (`isAgent`, que es la prioridad core de KUMPLY), el lane de 0xGasless que en Fuji patrocina solo tier 5 (agentes) y ERC-8004 en Fuji. Se puede armar el combo +20 tal cual lo describe la regla. Riesgo: las atestaciones tier 5/4 las emite el staff. **Pedirlas YA.**
- **Seña:** la más sólida y fácil de entender. Con login por email de 0xGasless, Andrea nunca paga gas, así que el +10 es creíble. Pero cualquier EVM hace lo mismo. El argumento de Avalanche sería "finalidad <2 s en el check-in" + KUMPLY, y es débil.
- **s6 Datos para agentes:** tiene buen fit con Avalanche (es la slide de Team1 "KUMPLY en x402"), pero el impacto es bajo y la idea ya está vista. No la rescato.
- **Comanda:** mismo fit con Avalanche que s6, pero la demo es la más frágil y hoy no hay usuario.
- **Cuota y Pallet:** son escrows con buen problema, pero tienen Avalanche cosmético. Además, el KYB nivel 4 depende de que el staff lo emita.

## Mejor para este track
**Mandato: ~85 (70 + 15).** Es la única con argumento real de Avalanche (25 pts) y con los dos bonus en su caso core (agentes). **Corte duro a las 12:00:** si no está el verde/rojo en Fuji, pasamos a Seña (~81), que es más segura pero pierde por Avalanche.
**Para los dos tracks:** Mandato puede pagar en ARGt real en C-Chain mainnet (pagos agénticos con límites del usuario, que es disparador explícito de Twin). Seña también lleva ARGt de forma natural. Usar el mismo contrato en Fuji (bonus) y en mainnet (tx con ARGt). Que un proyecto pueda competir en ambos tracks está [SIN CONFIRMAR].
