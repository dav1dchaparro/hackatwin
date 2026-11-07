# PLAN DE CONSTRUCCIÓN: Tesorero con Correa (sáb 7/11, 10:30 → entrega 18:00)

Track: **solo Blockchain (Avalanche), todo en Fuji 43113.** Este plan reemplaza al de "Mandato" de `DECISION_TRACKS.md`, que era para ir a los dos tracks.
Se apoya en tres piezas que arman otras tareas y que acá no se rediseñan: el contrato base `KumplyGated`, el esqueleto del repo (`contracts/` con Foundry, `web/` con React+Vite+viem) y la interfaz base (login 0xGasless, badge KUMPLY, links a Snowtrace).
Lo que no está verificado va marcado **[SIN VERIFICAR]**.

---

## 1. La idea en 5 líneas
1. Marcela administra una pyme y deja que un **agente de IA pague las facturas de los proveedores**. La plata no la tiene el agente: está en un contrato en Fuji, en **ARGt (mock en Fuji)**.
2. En cada pago el contrato chequea tres cosas: que el agente sea **KYA** (tier 5), que la pyme dueña sea **KYB** (tier 4) y que el proveedor sea **KYB** (tier 4). Si un pago pasa el umbral o el tope diario, queda en espera hasta que Marcela lo apruebe desde el celular, con su email y sin gas.
3. **La correa empieza antes del contrato.** El gas del agente lo paga el paymaster conjunto KUMPLY+0xGasless, que solo patrocina tier 5. A un bot sin KYA ni siquiera le pagan el gas.
4. La **finalidad de Avalanche** es la idempotencia del agente: marca la factura como pagada con una sola confirmación y nunca reintenta. El contrato además rechaza la misma `facturaId` dos veces.
5. Aunque al agente lo engañen con un mail trucho, al contrato no: el agente puede equivocarse, pero la regla no se negocia.

**Cambios del panel**
- **Adoptados:** (a) el paymaster conjunto como filtro, porque sale gratis: es el lane que de todos modos usamos para el +20. (b) Mock de ARGt en Fuji: la dirección del token es un parámetro del constructor, así que en mainnet se cambia una dirección. (c) La finalidad medida usada como idempotencia.
- **Descartado: la L1 de prueba con TxAllowList.** Una L1 en Fuji necesita validadores y AVAX en la P-Chain [SIN VERIFICAR el costo y el tiempo de hoy], y una L1 **local** no cumple el obligatorio 1 (en `BLOCKCHAIN_IDEAS.md` ya se había descartado lo local para d4/d3). Son 2 h de 30 h-persona para algo que el jurado no puede abrir. Queda como slide de roadmap.
- **Excepción opcional:** solo si a las 15:00 todo está verde, P1 puede dedicarle 45 min y mostrarla en el video como "roadmap". Nunca va en la demo en vivo.

## 2. Alcance de la demo (pantalla `/demo` proyectada + celular de Marcela)
| # | Qué entra | Qué pasa | Qué se ve | Prueba en Snowtrace |
|---|---|---|---|---|
| 1 | **Bot sin KYA** (otra smart account que usa el mismo lane, sin atestación) intenta pagar $400.000 | El paymaster rechaza el userOp con *"Sponsorship refused by attestation gate"* y no se gasta gas | ROJO: "Al bot no le pagan ni el gas". Badge KUMPLY: `isAgent = false` | Una tx **revertida** con `AgenteSinKYA()`, mandada una vez por una EOA "bot" que paga su propio gas con `--gas-limit` fijo. Es la "dirección bloqueada" del bonus KUMPLY |
| 2 | **Mail trucho**: "cambiamos de cuenta, pagá a 0xF4K3…". El agente se lo cree | `simulateContract` devuelve el revert `ProveedorSinKYB(0xF4K3…)`. El agente no lo envía | ROJO con el motivo que da el contrato y el link al código verificado | Pestaña *Contract* (código verificado). Opcional: mandar igual y mostrar el userOp fallido [SIN VERIFICAR que el bundler acepte userOps que revierten] |
| 3 | **Factura $400.000** de "Aceros del Litoral SA" (tier 4) | `pagar()` → `Pagado`. El cronómetro marca "final en X,X s" | VERDE, saldo del proveedor ↑, badges ✓✓✓. Mini-paso: "Reintentar" muestra el revert `FacturaYaPagada` | Tx vía EntryPoint `0x5FF1…2789` con el paymaster `0xC68d…FE98` y el evento `Pagado` |
| 4 | **Factura $9.000.000** de "Fundición Rafaela SRL" (tier 4) | Supera el umbral de $1 M → `PendienteAprobacion`. Suena el celular, Marcela entra con su email, toca Aprobar (sin gas) → `Aprobado` + `Pagado` | AMARILLO → VERDE | La tx del agente con `PendienteAprobacion` y la tx de Marcela con `aprobar`, patrocinada |

**Queda FUERA:** mainnet, ARGt real, conexión con bancos o CBU, PDFs reales (son fixtures de texto), múltiples pymes, retiro de fondos, revocar o cambiar el agente desde la UI, L1/ICM (solo slide), ERC-8004, x402, Stablecoins track.

## 3. Arquitectura
**Contratos** (P1, en `contracts/src/tesorero/`)
- `MockARGt.sol`: ERC-20 OpenZeppelin, nombre "ARGt (mock Fuji)", 18 decimales [SIN VERIFICAR cuántos decimales tiene el ARGt real]. `mint` solo para el owner. No tiene gate KUMPLY.
- `TesoreroConCorrea.sol`: hereda de `KumplyGated`, con el store `0xa3Bc…22dD` por constructor. Lee `verify(addr)` y pide el tier **exacto**: 5 para agente, 4 para empresa. Nunca usa `hasTier`.
  - Si los helpers de `KumplyGated` tienen otros nombres, P1 se adapta sin cambiar el diseño.
  - Constructor: `(store, token, duenia, agente, umbral = 1_000_000e18, topeDiario = 15_000_000e18)`.
  - `pagar(address proveedor, uint256 monto, bytes32 facturaId)`.
    - Gates: `msg.sender == agente` y es tier 5, `duenia` es tier 4, `proveedor` es tier 4, y `facturaId` no fue usada.
    - Si `monto <= umbral` y `pagadoHoy + monto <= topeDiario`, transfiere y emite `Pagado`.
    - Si no, guarda el pago pendiente y emite `PendienteAprobacion`.
  - `aprobar(bytes32 facturaId)`. Gates: `msg.sender == duenia` y es tier 4. Vuelve a chequear que el proveedor sea tier 4, transfiere y emite `Aprobado` + `Pagado`.
  - `rechazar(bytes32 facturaId)`: lo llama `duenia` y emite `Rechazado`.
  - Vistas: `pendiente(id)` y `politica()`, que devuelve umbral, tope, pagadoHoy, agente y saldo.
  - Errores: `AgenteSinKYA`, `NoEsElAgente`, `DueniaSinKYB`, `ProveedorSinKYB(address)`, `FacturaYaPagada(bytes32)`, `NoEsLaDuenia`, `NoPendiente`.
  - Eventos: `Pagado(id, proveedor, monto, porAprobacion)`, `PendienteAprobacion(id, proveedor, monto)`, `Aprobado(id)`, `Rechazado(id)`.
- **OJO:** `agente` y `duenia` son direcciones de **smart account**, porque `msg.sender` es la SA. Las atestaciones van sobre esas direcciones, no sobre las EOAs firmantes.

**Agente** (P2, en `agent/`: Node 18+, TS con tsx, corre en la laptop de la demo, `localhost:8787`)
- **Cuenta:** `@0xgasless/smart-account@0.0.13` con `createSmartAccountClient` y las direcciones de Fuji explícitas (factory, implementation, fallback, módulo ECDSA, de la referencia de 0xGasless). Usa `paymasterUrl` = lane KUMPLY (`https://paymaster.0xgasless.com/v1/43113/rpc/<key>`, la key la da KUMPLY) y `PaymasterMode.SPONSORED`.
- Con un segundo firmante crea la SA del **bot** (sin atestación) sobre el mismo lane.
- **Cómo decide:**
  1. Extrae `{proveedor, cuit, monto, nroFactura, dirección destino}` del texto. Usa un LLM si hay key; si no, fixtures fijos por intento, y la demo no depende del LLM.
  2. Arma `facturaId = keccak256(cuit, nroFactura, sufijoEnsayo)`.
  3. Corre `simulateContract` desde la SA. Si revierte, decodifica el custom error, lo muestra y **no envía**.
  4. Si pasa, hace `sendTransaction` → `waitForTxHash` → `wait`, mide los ms y recién con el receipt marca la factura "pagada".
  5. **Nunca reenvía** si ya tiene un hash: solo reintenta errores de red previos al hash.
- **API:** `POST /intento/:n` (1-4) y `GET /log`. La web consulta `/log` cada 1 s.
- Para el badge usa `@kumply/sdk@1.3.0` (`isAgent` / `isBusiness`), solo como información. **La regla la aplica el contrato.**

**Web** (P3, en `web/`, sobre la interfaz base)
- `/demo` (proyector):
  - Cabecera con la política leída del contrato (umbral, tope, saldo y link al código verificado).
  - Bandeja con 4 tarjetas de facturas/mails y el botón "Mandar al agente".
  - Log del agente en vivo, semáforo, cronómetro de finalidad, badges KUMPLY de agente, dueña y proveedor, y link a la tx en Snowtrace.
- `/aprobar` (celular de Marcela):
  - Login con email (`@0xgasless/core@1.3.0`, `OxGasClient` → `login()` → `setupSmartAccount()`).
  - Escucha `PendienteAprobacion` con viem (polling de 1 s) y avisa con sonido y vibración.
  - Botones Aprobar/Rechazar: `sendTransaction({to, value: 0, data: encodeFunctionData(aprobar)})`, patrocinada con la API key del dashboard.

```
 Mail/factura ──► AGENTE (Node, laptop) ──userOp──► Bundler 0xGasless ──► Paymaster LANE KUMPLY
                    │ simulateContract                                   │ verify(sender)==tier5 ? firma : RECHAZA (intento 1)
                    ▼                                                    ▼
 WEB /demo ◄─ /log ─┘            Fuji C-Chain:  EntryPoint ──► TesoreroConCorrea.pagar() ──► MockARGt.transfer ──► Proveedor
    │  lee eventos ─────────────────────────────────►  │ gates: agente=5, dueña=4, proveedor=4 (AttestationStore KUMPLY)
 WEB /aprobar (celu, email 0xGasless core) ──userOp patrocinado──► aprobar(id) ──► Pagado
```

## 4. Reparto (rama `feature/*` desde `develop` → PR a `develop`; cada persona toca SOLO su carpeta)
| Persona | Rama / carpeta | Tareas en orden (horas) |
|---|---|---|
| **P1 Contratos** | `feature/contrato-tesorero`: `contracts/src/tesorero/`, `contracts/test/`, `contracts/script/`, `deployments/` | 10:30 publicar `ITesorero.sol` (firmas y eventos) para que P2 y P3 arranquen · 10:45 `MockARGt` · 11:00 `TesoreroConCorrea` y tests con un store mock (8 casos: 3 gates, umbral, tope, aprobar, rechazar, idempotencia) · 11:45 script de deploy (lee direcciones del `.env`), deploy y verify en Fuji, seed (mint de 50 M mARGt al Tesorero) · 12:15 escribe `deployments/fuji.json` y `deployments/abi/*.json`, de donde importan P2 y P3 · 12:30 tx revertida del bot EOA · 13:00 plan B del store si hace falta · 13:30-15:00 integración con P2, gas y casos borde · 15:00 opcional L1 (ver §1) o soporte · 16:30 README técnico (instalación, despliegue, verificación) |
| **P2 Agente** | `feature/agente`: `agent/` | 10:30 scaffold, firmantes del agente y del bot (`.env` en `.gitignore`), cálculo de las direcciones SA con `getAccountAddress()` → a P4 **antes de las 10:50** · 11:00 dry-run con el lane: el bot da rechazo (evidencia del intento 1) y el agente también, hasta que llegue el tier 5 · 11:30 fixtures de los 4 intentos y parser (LLM opcional, máx. 30 min) · 12:15 `simulateContract` y decodificación de errores con la ABI de P1 · 13:00 intentos 3 y 4 de punta a punta **por CLI** en Fuji, con cronómetro · 14:00 API HTTP + CORS, integración con P3 · 15:00 robustez y sufijo de ensayo para las facturaIds · 16:30 sección "Agente" del README y soporte del video |
| **P3 Web** | `feature/web-tesorero`: `web/` | 10:30 crear proyecto y API key en dashboard.0xgasless.com (autoservicio), login con el email "Marcela" → dirección SA a P4 **antes de las 11:00** · 11:00 `/demo` con datos mock (semáforo, badges `@kumply/sdk`, log) · 12:30 `/aprobar` mobile: eventos, sonido, `aprobar` patrocinado · 14:00 conexión al agente real y a las direcciones reales, links Snowtrace · 15:00 deploy público de la web [SIN VERIFICAR qué hosting trae el esqueleto] · 15:30 pulido · 16:30 capturas para el README y grabación del video |
| **P4 Producto/Sponsors** | `feature/docs`: `README.md`, `docs/` | 10:30 a los stands de KUMPLY y 0xGasless con los pedidos de la §6 · 10:40 crea 2 EOAs de proveedores y la del bot (`cast wallet new`), más 0xF4K3 (opcional `cast wallet vanity --starts-with f4`) · 10:50-11:15 pasa a KUMPLY la lista completa de direcciones (`docs/direcciones.md`) · 11:15-13:00 README con los 6 obligatorios, "Por qué Avalanche", negocio y "Hecho hoy vs. reutilizado" · cada 30 min `cast call 0xa3Bc…22dD "verify(address)"` sobre las 4 direcciones · 13:00 decide el corte de atestaciones · 13:30 slides (6) y guion · 15:00 QA "como jurado" y tabla de links/hashes · 16:30-18:00 video, pitch, repo público y entrega |

**Merges a `develop`:** 12:15 (contratos), 14:00, 15:30 (freeze) y 17:15. **Release:** PR `develop → main` a las 17:30. Solo P1 escribe `deployments/`; nadie edita la carpeta de otro.

## 5. Hora por hora, con cortes duros
| Hora | Hito de control | Si NO se cumple |
|---|---|---|
| 10:30 | Kickoff de 10 min, ramas creadas, P4 ya en los stands | — |
| **11:15** | Las 6 direcciones (SA del agente, SA del bot, SA de Marcela, Prov A, Prov B, EOA del bot) entregadas a KUMPLY. URL del lane y API key del dashboard en mano. AVAX de Fuji en el deployer y en la EOA del bot | Sin lane URL: P4 insiste y P2 sigue con el paymaster del dashboard. Sin AVAX: pedirle a Team1 o usar otro faucet |
| **12:15** | **Contratos desplegados y VERIFICADOS en Snowtrace**, con `deployments/fuji.json` mergeado | Se recortan `rechazar` y el tope diario. P4 ayuda con el verify vía API de Routescan (`--verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan` [SIN VERIFICAR]) o Sourcify. **Corte final 12:45**: sin contrato verificado no hay elegibilidad, así que todos ayudan a P1 |
| **13:00** | **Atestaciones KUMPLY:** `verify()` da tier 5 para la SA del agente y tier 4 para la SA de Marcela, Prov A y Prov B | **Plan B:** P1 despliega `DemoAttestationStore` propio (misma firma de `verify`, escrito de cero, 20 min) y redespliega el Tesorero apuntando a él. El agente pasa al paymaster del dashboard (se pierde el combo y queda 0xGasless). Se declara en el README. Si las atestaciones reales llegan **antes de las 15:00**, se redespliega al store oficial (1 comando) |
| 13:00-13:30 | Almuerzo escalonado (nunca se van P1 y P2 juntos) | — |
| **14:00** | Intentos 3 y 4 de punta a punta por CLI en Fuji, con hashes en Snowtrace | Se corta el LLM (quedan los fixtures). El intento 2 queda solo con simulación |
| **15:00** | Los 4 intentos desde `/demo`, y aprobación desde el celular con el email | Plan B para la aprobación: botón en `/demo` con la misma SA de Marcela, logueada en la laptop |
| **15:30** | **FREEZE** de features: solo bugs | — |
| 15:30-16:30 | 3 ensayos completos con facturaIds nuevas. Se guardan los hashes buenos en `docs/evidencias.md` | — |
| 16:30-17:15 | README final, capturas, **video de respaldo** (≤3 min, grabación de pantalla de los 4 intentos) | — |
| 17:15-17:45 | Último merge, `develop → main`, repo **público**, revisión del checklist (§7) | — |
| **17:45** | **ENTREGA** (15 min de margen) | — |

## 6. Dependencias humanas: pedirlas YA (P4)
- **Staff KUMPLY**
  - (1) La URL del lane KUMPLY+0xGasless de Fuji, que trae la API key.
  - (2) **Tier 5** sobre la **SA del agente**. Es la dirección de `getAccountAddress()`, no la EOA.
  - (3) **Tier 4** sobre la **SA de Marcela** (sale del login de `@0xgasless/core`) y sobre las EOAs de **Prov A** y **Prov B**.
  - (4) Que el bot y 0xF4K3 queden **sin** atestación.
  - (5) ¿Aceptan un store propio declarado como plan B?
  - (6) ¿Hay presupuesto suficiente en el lane? El error `InsufficientBalance` aparece cuando el lane se queda sin presupuesto.
- **0xGasless**
  - ¿El paymaster de un proyecto del dashboard en Fuji patrocina sin depósito previo? [SIN VERIFICAR]
  - ¿El bundler acepta userOps cuya llamada interna revierte? [SIN VERIFICAR]
- **Faucet o Team1:** AVAX de Fuji para el deployer (P1) y para la EOA del bot (~0,5 AVAX en total [SIN VERIFICAR cuánto gas hace falta]).
- **Organización:** confirmar que la entrega de Blockchain es a las 18:00 [SIN CONFIRMAR] y dónde se sube.

## 7. Checklist de entrega (link o tx que lo prueba)
| Requisito | Prueba |
|---|---|
| 1. Contrato verificado en Avalanche | Snowtrace de `TesoreroConCorrea` y `MockARGt` (pestaña Contract verificada) |
| 2. Interfaz web conectada | URL pública de la web, video y tx de `aprobar` hecha desde `/aprobar` |
| 3. "Por qué Avalanche" en el repo | `README.md#por-que-avalanche` (los 3 argumentos de la §8) |
| 4. Modelo de negocio | `README.md#negocio`: problema, cliente (pyme con 20-50 proveedores), ingresos (abono por agente US$20-50/mes [SIN VERIFICAR] + plus por volumen), canal (estudios contables), ventaja (KYA + política on-chain verificable) |
| 5. Repo público con instalación, despliegue y arquitectura | README: `forge build/test`, script de deploy+verify, `.env.example`, `npm run dev` de la web y del agente, diagrama de la §3 |
| 6. README separa lo hecho hoy | Sección "Hecho en el evento (7/11, desde 9:12)" vs. "Dependencias externas" (OpenZeppelin, `@kumply/sdk`, `@0xgasless/*`), más `git log` |
| KUMPLY básico +5 | `@kumply/sdk` en la web + gate on-chain. **Pasa:** tx del intento 3. **Bloqueada:** tx revertida `AgenteSinKYA` del bot EOA + `ProveedorSinKYB` del intento 2. Nota en el README: "atestaciones de Fuji de demo, sin verificación real" |
| KUMPLY core +10 | KYA (`tier 5`) es la verificación central del producto: sin agente KYA no hay pago ni gas |
| 0xGasless básico/core +10 | Tx del intento 3 (userOp patrocinado) y tx de `aprobar` de Marcela: **ni el agente ni la dueña tienen AVAX** (mostrar saldo 0 en Snowtrace) |
| Combo (paymaster que solo patrocina verificados) | Intento 3 patrocinado por el lane (paymaster `0xC68d…FE98`) vs. intento 1 rechazado (captura del error del lane en el log). Si se cae al plan B, se pierde y no se reclama |

## 8. Por qué Avalanche (sin humo) y pitch de 3 min
1. **Finalidad determinística.** Una tx aceptada no se revierte por reorg, así que el agente marca "pagado" con 1 confirmación y nunca reintenta: no hay doble pago, y el proveedor libera la mercadería en el acto.
   - Lo **medimos** en vivo. La cifra que se muestra es la nuestra [SIN VERIFICAR hasta medir; incluye la latencia del bundler].
2. **Infraestructura de cumplimiento que ya existe en Fuji.** El AttestationStore de KUMPLY (KYB/KYA on-chain, lectura gratis) y el lane de 0xGasless que **solo** patrocina agentes KYA.
   - Con eso la política se cumple en dos capas: el gas y el contrato. Sin estas piezas habría que construirlas.
   - Es ecosistema, no protocolo, y en el pitch lo decimos así.
3. **Camino a una L1 de tesorerías.** Avalanche permite L1s propias con allowlists de transacciones, para una red donde solo operan empresas KYB.
   - KUMPLY ya registró su "Compliance L1" en Fuji, sin validadores por ahora según su propio SDK.
   - Hoy C-Chain; mañana la misma política en una L1. Es roadmap: que KUMPLY se lea por ICM está [SIN VERIFICAR].
   - En mainnet, el token se cambia por el ARGt de C-Chain (`0x2E4e…703B` [SIN VERIFICAR]).

**Pitch (3 min):**
- **0:00 Dolor.** "Marcela paga 30 proveedores los viernes a la noche. Un mail con un CBU cambiado y la plata se fue." El dato del Observatorio PyME, solo si tenemos la fuente con link [SIN VERIFICAR].
- **0:25 Idea.** Un agente paga por ella, pero con correa on-chain: solo empresas KYB, con tope, y lo grande lo aprueba ella.
- **0:45 Demo, intentos 1 y 2.** El bot sin KYA no consigue ni gas. El mail trucho engaña al agente, pero el contrato dice que no.
- **1:30 Demo, intentos 3 y 4.** $400.000 en verde, final en X s, con Snowtrace. $9 M en amarillo: suena el celu, aprueba con su email y sin gas.
- **2:20 Por qué Avalanche + sponsors.** Finalidad = idempotencia, KYA de KUMPLY + gas de 0xGasless solo para agentes verificados, y roadmap hacia una L1.
- **2:40 Negocio.** Abono por agente, canal de estudios contables, cada proveedor KYB trae a la próxima pyme. Cierre: "El agente se puede equivocar. La correa, no."

## 9. Riesgos top 5 y plan B
| Riesgo | Plan B |
|---|---|
| KUMPLY no emite tier 5/4 antes de las 13:00 | `DemoAttestationStore` propio + paymaster del dashboard, declarado en el README. Se vuelve al oficial si llega antes de las 15:00 |
| El lane falla (`InsufficientBalance`, URL o el SDK 0.0.13 con overrides de Fuji) | El agente usa el paymaster del dashboard. Último recurso: el agente como EOA con AVAX (se pierde el combo y se conserva la demo) |
| El login de `@0xgasless/core` o su paymaster no anda en Fuji | Marcela aprueba con una SA de `@0xgasless/smart-account` armada en el browser con su firmante, o con una EOA con AVAX (se pierde el core +10 de 0xGasless) |
| La verificación en Snowtrace falla o se atrasa el contrato | Corte duro a las 12:45: todos con P1. Probar Routescan, Sourcify o flatten. Contrato mínimo (sin tope ni rechazar) |
| Wi-Fi o Fuji lentos en el demo day | Video de respaldo, hashes de los ensayos en `docs/evidencias.md` y cronómetro con dos números (envío→hash, hash→receipt) para no prometer una cifra que en vivo no salga |

---
**Resumen (5 líneas)**
1. d4 final: un agente KYA paga a proveedores KYB en mock-ARGt desde `TesoreroConCorrea` (hereda de `KumplyGated`). Sobre el umbral o el tope, aprueba la dueña desde el celu, con email y sin gas.
2. Se adoptan el paymaster conjunto como filtro, el mock de ARGt y la finalidad como idempotencia. La L1 con TxAllowList queda descartada: es local o cara, no cumple el obligatorio y queda como roadmap.
3. Los 4 intentos son: bot rechazado por el paymaster + tx revertida, mail trucho revertido por el contrato, $400 k en verde y $9 M en amarillo → aprobado. Todo tiene link a Snowtrace.
4. P1 contratos, P2 agente (`@0xgasless/smart-account` + lane KUMPLY), P3 web (`/demo` + `/aprobar` con `@0xgasless/core`), P4 sponsors, README y pitch. Cortes: direcciones 11:15, contrato verificado 12:15/12:45, atestaciones 13:00, punta a punta 14:00, web 15:00, freeze 15:30.
5. Lo crítico es pedir YA a KUMPLY la URL del lane, tier 5 para la SA del agente y tier 4 para la SA de Marcela + 2 proveedores. Plan B: store propio declarado.
