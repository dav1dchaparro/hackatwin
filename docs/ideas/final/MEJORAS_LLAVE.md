## 🔧 Mejoras para Llave de Emergencia (5 validadores)
Revisaron Avalanche, producto, seguridad, negocio y bonus. Ninguna mejora mueve los cortes (13:30 ABI, 14:30 verificado, 15:30 punta a punta, 16:15 freeze, 16:30 README+video, 17:45 entrega). Regla ⏱: si a las 14:25 P1 no tiene ≥18 tests en verde, lo que tenga ⏱ pasa a la instancia final de las 16:15 (P1-12).

### Hacer YA (entran en el cronograma)
| # | Mejora | Qué hacer | Quién | Min | Suma |
|---|---|---|---|---|---|
| 1 | Una sola `_senal()` (bug) | Toda acción del dueño cancela el reclamo y recalcula la base DESPUÉS de mover la plata | P1 | 10 | Protege Factibilidad (2-4) |
| 2 | `_ejecutar` interno + época ⏱ | Evita revert por reentrancy en aprobar→ejecutar; un "Estoy bien" o `configurar` cierra los pedidos viejos | P1 | 15 | Salva la demo; +0-1 |
| 3 | Evento de compliance KUMPLY | `VerificadoKumply` en cada gate: en Snowtrace, el mismo hash muestra guardián tier 2 + clínica tier 4 KYB | P1 (antes de 13:30) | 15 | +2 Avalanche, +0,5-1 KUMPLY |
| 4 | Lista blanca de destinos ⏱ | Solo la clínica que eligió Marta, no cualquier SRL verificada (cierra la colusión) | P1 + P2 (errores.ts) | 15 | +1-2 |
| 5 | Agente Ejecutor KYA ⏱ | `iniciarReclamoPorAgente()` con tier 5 + `agente/ejecutor.ts`; solo arranca la gracia y no mueve plata. P4 pide el tier 5 YA | P1 (45), P4 (5) | 50 | KUMPLY core: apuesta, +0 a +5 |
| 6 | Recibo de la clínica en /demo | Frases humanas + 3 contadores + tarjeta "La Clínica recibió $150.000 · X ms · costo ≈ ARS N · Marta pagó $0 · ver comprobante", con dos tiempos honestos (envío→incluida vía 0xGasless / incluida = final) | P3 | 20 | +1-2 Avalanche, +1 Presentación |
| 7 | "Estoy bien" sin fricción | En /dueno lo principal es "Mandar plata" (`retirar` ya cuenta como señal); "Última señal: hace X". P1 confirma con un test que reinicia la base | P3 + P1 | 20 | +1-2 Impacto |
| 8 | Lenguaje sin cripto | "tu Llave", "comprobante", "costo: $0", "Avisar que Marta no responde", "Identidad verificada ✓"; KUMPLY y 0xGasless quedan como chips | P3 | 10 | +1 Presentación |
| 9 | Benchmark de finalidad | `scripts/medir-finalidad.sh`: 20 `cast send` + 3 `estoyBien()`, p50/p95 y costo, en `docs/finalidad.md` con hashes | P4 (~15:00) | 15 | +1-2 Avalanche |
| 10 | Guion nuevo | Arranca en la clínica (herencia desde 1:10); 20 s de "por qué Avalanche" señalando los logs y los ms; "con la semilla, Lucía saca el 100% hoy; con la Llave, como mucho el tope y solo a la clínica"; actualizar las respuestas de §13 (ya no hay 20% por período ni cooldown) | P4 | 30 | +2-3 Impacto/Presentación |
| 11 | Validación temprana | En las esperas del stand: 5 asistentes, mentores de billeteras [SIN VERIFICAR que estén] y KUMPLY. Sección "Validación" con números reales para las 16:15 | P4 | 25 | +2-3 Negocio |
| 12 | Negocio y legal en el README | Un modelo B2B2C (USD 0,50 por bóveda/mes marca blanca; Familia USD 2/mes; 1% al liberar NO se cobra en el MVP), unit economics en ARS, "complementa la sucesión", nunca "mandato" (art. 1329 CCyC [SIN VERIFICAR]), tabla de competencia contra semilla/cotitular/Safe. Reemplaza texto de P4-6, no lo agrega | P4 | 40 | +2-4 Negocio |
| 13 | Bonus blindados | `@kumply/sdk` probado a las 13:25 (sin fallback silencioso); todas las tx del usuario por la SA patrocinada; grep `hasTier` = 0; aviso de atestaciones demo; tabla con 3 casos que pasan y 3 bloqueados, con links | P2 (20), P3 (5), P4 (25) | 50 | Protege hasta +20 de bonus |

### Si sobra tiempo (después de las 15:30)
| # | Mejora | Qué hacer | Quién | Min | Suma |
|---|---|---|---|---|---|
| 14 | Bordes de configuración | `demoraVeto ≥ 1 day` si `periodoMinimo > 1`; `motivo` ≤ 140 bytes; tests 30-33 | P1 | 15 | +0-1 Factibilidad |
| 15 | Instancia con USDC de Fuji | Mismo deploy con USDC, verificada, link en el README (la demo sigue con MockPesos) | P1 (USDC: P4) | 10 | +1 Avalanche |
| 16 | Agente por el lane conjunto | Agente con SA de 0xGasless y paymaster KUMPLY+0xGasless tier 5. Límite 16:00; si no anda, EOA y sin reclamar combo [SIN VERIFICAR acceso] | P2 | 30 | Indirecto (techo +20) |
| 17 | "Caducó" en la web | Leer `emergenciaVigente(id)` | P2 | 2 | — |

### Solo para el pitch y el README (roadmap)
- L1 institucional permisionada + ICM: `docs/l1-institucional/genesis.json` (allowlists) + diagrama, rotulado "NO DESPLEGADA" (P4, después de las 16:30).
- Límites conocidos: la parte de quien nunca verifica queda trabada (con test `test_TomasNuncaVerifica_SuParteQuedaEnLaBoveda`); `liberarNoCobrado()`, `cambiarMiCuenta()`; solo tokens estándar.
- Falsos positivos: recordatorios a los 30/15/7 días; `estoyBien` dentro de cada pago de la billetera B2B (sendBatchTransactions [SIN VERIFICAR]).
- Clínicas y prepagas como segundo lado y canal; agentes KYA de la clínica con x402 y AgentRegistry de KUMPLY (planeado).

### Cambios al contrato (para P1)
- `_senal()`: `ultimaSenal=now`; si hay reclamo → `reclamoIniciadoEn=0` + `ReclamoCancelado`; `baseEmergencia=token.balanceOf(this)`; `usadoEmergencia=0`; `epoca++`. Va después de `safeTransfer`. La llaman estoyBien, depositar (dueño), retirar, configurar, transferirDueno, vetarEmergencia y permitirDestino. Tests 22-24 (EnGracia + retirar → Activa; cobrar revierte `SinReclamo`; 1M → retirar 900k → disponible 20k).
- `_ejecutar(id)` interno sin `nonReentrant`, CEI. `uint256 public epoca`, `_epocaDe[id]`, `emergenciaVigente(uint256) view returns (bool)`, `error EmergenciaCerrada(uint256)`. Tests 25-27.
- `event VerificadoKumply(address indexed cuenta, uint32 tier, uint8 rol)` (0 heredero, 1 guardián, 2 destino) + `vm.expectEmit`.
- `destinoPermitido(address)`, `permitirDestino(address,bool)` (onlyDueno, exige `_isBusiness`), `error DestinoNoPermitido(address)` (después de `NotBusiness`), `event DestinoActualizado`. El constructor suma `address[] destinosIniciales` (clínica 0x7Fc6…DaE9). Tests 28-29.
- `iniciarReclamoPorAgente()` con `_requireAgent`, mismas reglas que `iniciarReclamo` salvo ser heredero. 2 tests (pasa / `NotAgent(addr,0)`).
- Dejar listo un `.env` alternativo con herederos/guardianes EOA (plan B = instancia aparte, no `configurar` sobre A).

### Riesgos que vieron los validadores
- Decir "<1 s" y que el cronómetro marque 3-6 s: el tiempo de la web incluye el bundler de 0xGasless [SIN VERIFICAR]. Mostrar los dos tiempos y decir solo cifras medidas en el ensayo de las 15:30.
- Demo frágil: si la primera señal de Marta falla, el tope vale $0 y la clínica muestra "Disponible: $0". Checklist antes de salir (señal hecha, tope $200.000, 3 sesiones logueadas, instancia B abierta, video a mano) y el narrador no maneja dispositivos. Que KUMPLY atestigüe SA (contratos) está [SIN VERIFICAR].
- Cuellos de botella humanos: P4 saturado y atestaciones a mano del staff (5 direcciones con el agente). Si el README pasa de las 16:30 se arriesgan O4-O6. Si a las 16:15 no hay datos, "Validación: pendiente" y se sigue.

### Puntaje esperado
Antes: 71/120 en la tabla estricta (Avalanche 7/25 = 28%) → con las "ya": ~84-88 (Avalanche ~12-13/25 ≈ 50%) → con todas: ~88-91 (Avalanche ~14/25 ≈ 56%). Bonus aparte: KUMPLY core pasa de "no asegurado" a apuesta (+0 a +5). Son estimaciones, no notas del jurado.
