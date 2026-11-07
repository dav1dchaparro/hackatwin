# Plan completo: Llave de Emergencia (Blockchain Track, Avalanche Fuji)

Fecha: sáb 7/11/2026, 12:45 (Buenos Aires). **Entrega 18:00.** Equipo: P1 dav1dchaparro · P2 Gabosawn · P3 ramiro-monllor · P4 facundo-monllor (si alguien prefiere otro rol, se cambia en los primeros 5 min y no se vuelve a discutir).
Base técnica reutilizada: `PLAN_TAREA2_KUMPLY_GATE.md` (contrato `KumplyGated`, Foundry, solc 0.8.28, evm cancun, verificación en Routescan). Reglas: `REGLAS_TRACKS.md` sección A.
Lo marcado [SIN VERIFICAR] no se confirmó hoy: no decirlo en el pitch como hecho.

---

## 1. La idea
1. Tu plata en dólares o pesos digitales vive en una **bóveda** tuya en Avalanche, no en una app que se puede caer o congelar.
2. Una vez por período tocás **"Estoy bien"** (1 clic, entrás con tu email, no pagás nada).
3. Si dejás de tocarlo, después de un aviso y un período de gracia (en el que podés cancelar), la plata **pasa sola a tus herederos**, en los porcentajes que elegiste.
4. Solo cobra un heredero **con identidad verificada** (KUMPLY). Si no está verificado, queda bloqueado y su parte lo espera.
5. Para una urgencia en vida (internación, viaje), **2 de tus 3 familiares de confianza** pueden sacar una parte con tope (ej. 20%), y nada más.

**Frase de pitch:** *"Si te pasa algo, tu plata no se congela: llega a quien vos elegiste, y nadie más la puede tocar."*

## 2. El problema
Datos fuertes (fuentes periodísticas y de estudios, no hay estadística judicial oficial):
- **Lento:** una sucesión simple en CABA tarda en promedio **4 a 5 meses** hasta la declaratoria; con disputas, **6 meses a 2 años o más**. [iProfesional](https://www.iprofesional.com/legales/441805-heredar-en-argentina-como-se-tramita-cuanto-demora-y-cuanto-sale-completar-una-sucesion) · [abogados.com.ar](https://abogados.com.ar/sucesiones-pasos-tiempos-y-costos-del-proceso-en-argentina/38051)
- **Caro:** entre **6% y 15%** del valor de los bienes sumando honorarios, tasa de justicia y gastos (varía por jurisdicción y fuente). [hacecuentas](https://hacecuentas.com/calculadora-sucesion-costo) · [Cronista](https://www.cronista.com/economia-politica/cuanto-cuesta-una-sucesion-en-2026-ley-nacional-de-honorarios-y-gastos-ocultos/)
- **Se congela cuando más hace falta:** el banco bloquea la cuenta al enterarse de la muerte; en billeteras virtuales acceder es todavía más difícil. [Canal26](https://www.canal26.com/economia/2025/05/31/fallecimiento-de-un-titular-bancario-que-deben-hacer-los-familiares-para-acceder-a-los-fondos-de-la-cuenta/) · [Cronista](https://www.cronista.com/informacion-gral/por-cambios-en-ley-de-sucesiones-que-pasa-con-las-billeteras-virtuales-y-cuentas-comitentes-cuando-alguien-fallece)
- **Cripto sin claves = cripto perdida:** Chainalysis estimó (2017-2018) que ~20% de los BTC (2,78 a 3,79 M) están perdidos (no separa cuánto por muerte). [CriptoNoticias](https://www.criptonoticias.com/mercados/3-7-millones-de-bitcoins-podrian-estar-perdidos-segun-chainalysis)
- **Mercado grande y en stablecoins:** ~19,8% de los argentinos usa cripto (reporte 2025 citado por prensa); según Bitso, el **85%** de lo que compraron sus clientes argentinos en el 1er semestre de 2025 fueron stablecoins. [iProUP](https://www.iproup.com/economia-digital/63496-criptomonedas-crece-el-uso-en-argentina-y-el-pais-lidera-ranking) · [Mercado](https://mercado.com.ar/tendencias/bitso-stablecoins-dominan-compra-y-bitcoin-crece-en-carteras-durante-2025)
- **Emergencia en vida:** si la persona queda incapacitada, la familia necesita un juicio de capacidad o un curador. Caso real: un juez de Bariloche tuvo que autorizar el retiro de USD 5.000 para pagar una internación de urgencia en España. [Diario Judicial](https://www.diariojudicial.com/news-6177-hay-cosas-que-no-pueden-esperar)

**Usuaria (inventada):** **Marta, 67, jubilada en Córdoba.** Ahorra unos USD 8.000 en dólares digitales en una billetera del celular. Su hija **Lucía** vive en CABA y su hijo **Tomás** en Madrid. Marta no anotó en ningún lado cómo entrar a su billetera. Si mañana la internan, nadie puede pagar la clínica con esa plata. Si se muere, sus hijos ven que la plata existe y no la pueden mover, o esperan meses de sucesión.

## 3. Cómo funciona (sin palabras cripto)
**Armar la llave (Marta, 3 minutos, una sola vez):**
1. Entra con su email. No instala nada ni compra nada para "pagar comisiones".
2. Carga su plata en la bóveda.
3. Elige herederos y porcentajes: Lucía 60%, Tomás 40%.
4. Elige 3 personas de confianza: Lucía, su cuñado Pablo y su vecina Rosa. Tienen que tener identidad verificada.
5. Elige los tiempos: "si no doy señales en **6 meses**, avisar y esperar **30 días** más". Y el tope de urgencia: **20%** cada 30 días.

**Día a día:** le llega un recordatorio y toca **"Estoy bien"**. Eso reinicia el reloj. Si quiere sacar plata, la saca cuando quiere (también cuenta como "estoy bien").

**Herencia automática:**
1. Pasan 6 meses sin señal. Lucía entra y toca **"Iniciar reclamo"**. Arranca la gracia de 30 días (y a Marta le llegan avisos).
2. Si Marta estaba bien, toca "Estoy bien" y el reclamo se cancela.
3. Si termina la gracia, cada heredero toca **"Cobrar mi parte"**. El sistema revisa en ese momento que esté verificado. Lucía cobra su 60%. Si Tomás todavía no verificó su identidad, no cobra: su 40% lo espera hasta que lo haga.

**Acceso de emergencia (Marta viva pero internada):**
1. Lucía pide "USD 1.500 para la clínica" y pone el destino.
2. Pablo (o Rosa) aprueba. Con 2 de 3, la plata va directo a la clínica.
3. Si alguien pide más del 20%, o pide de nuevo antes de 30 días, no se puede.

## 4. ¿Por qué blockchain? ¿Por qué Avalanche?
**La prueba "¿se puede saltar?":** en una app o un banco, la regla la aplica una empresa que puede cerrar, congelar, equivocarse o cambiar la regla. Acá las reglas (quién cobra, cuánto, cuándo, con qué verificación) **viven en el mismo contrato que guarda la plata**. Si alguien arma otra web, o llama directo al contrato, se topa con las mismas reglas. Ni nosotros podemos sacar la plata: el contrato no tiene función de administrador. Y todo queda auditable: cada "estoy bien", reclamo y cobro es público en Snowtrace.

**Por qué Avalanche (argumentos defendibles):**
- **Finalidad de menos de 1 segundo en la C-Chain** (la medimos hoy): el "Estoy bien" queda firme al instante, y la demo de herencia + emergencia entra en 3 minutos en vivo.
- **KUMPLY vive en Avalanche:** el contrato lee la verificación de identidad (`AttestationStore` en Fuji `0xa3Bc…22dD`) **en la misma transacción** del cobro. Sin oráculos ni servidores nuestros en el medio.
- **Sin gas para el usuario:** 0xGasless corre en Fuji: Marta, Lucía y los guardianes entran con email y nunca compran AVAX.
- **Costo:** un "estoy bien" por mes tiene que costar centavos para que el negocio cierre (comisión en Fuji [SIN VERIFICAR en mainnet hoy]; medir y anotar en el README).
- **Visión (no se construye hoy):** versión institucional en una **L1 propia de Avalanche** para un banco o exchange (lista de direcciones permitidas, cumplimiento), conectada a la C-Chain por ICM. Y usar pesos digitales reales: ARGt de Twin existe en la C-Chain de mainnet (`0x2E4e93eCA2E16E4989b894e188B7F7fC0175703B`, según el repo de referencia; [SIN VERIFICAR]).

## 5. Bonus
**KUMPLY (+10 core):** la verificación es el corazón del producto (sin ella cualquiera reclama la herencia).
- `claim()` usa `_requirePersonAtLeast(msg.sender, 2)`; `configure`, `requestEmergency` y `approveEmergency` usan lo mismo sobre cada guardián. **Nunca `hasTier`.**
- **Pasa:** la smart account de Lucía (tier 2 pedido al staff) cobra → tx en Snowtrace. En lectura: `isPersonAtLeast(0x1F98431c8aD98523631AE4a59f267346ea31F984, 2) = true` (fixture tier 2).
- **Bloqueada:** Tomás = EOA del deployer sin atestación → `claim()` revierte `NotPerson(addr, 0, 2)` (tx fallida forzada con `--gas-limit`, link en Snowtrace). Lectura: `isPersonAtLeast(0x…dEaD, 2) = false`. Y una **empresa** (`0x7Fc6…DaE9`, tier 4) tampoco pasa como persona.
- README: "Las atestaciones de KUMPLY en Fuji son de DEMO, emitidas por el staff, sin KYC real".

**0xGasless (+10 core):** está en el flujo principal: **ni el dueño, ni los herederos, ni los guardianes pagan gas nunca**. Login con email (`@0xgasless/core`: `OxGasClient`, `setupSmartAccount`, `sendTransaction`) con **nuestra API key del dashboard** en Fuji 43113. Ojo: el "lane" KUMPLY+0xGasless de Fuji solo patrocina tier 5 (agentes); nuestros usuarios son personas, así que usamos nuestra key propia (que patrocine cualquier tx: [SIN VERIFICAR], P2 lo prueba antes de las 13:30). `msg.sender` = smart account: **las atestaciones se piden sobre las direcciones de las smart accounts**.

## 6. Arquitectura
```
 [Web: React + viem + @0xgasless/core]                       Avalanche Fuji C-Chain (43113)
  Marta (email) ──login──► smart account ─┐                ┌──────────────────────────────┐
  Lucía / Pablo (email) ─► smart accounts ├─ userOp ─► 0xGasless ─► EmergencyVault (verificado)
  Tomás (EOA sin KYC) ───────────────────┘   (paga el gas)   │  is KumplyGated               │
                                                             │  reglas + plata (ARSd)        │──verify(addr)──► KUMPLY AttestationStore
  Panel: cuenta regresiva ◄── lee lastPing, deadlines ───────│                               │                 0xa3Bc…22dD
                                                             └──────────┬───────────────────┘
                                                                        └── transfer ──► PesoDemo (ARSd, ERC-20 mock)
```
**Contratos** (`contracts/`, Foundry):
- `src/kumply/IKumplyAttestationStore.sol`, `src/kumply/KumplyGated.sol`: copiados tal cual del plan de tarea 2.
- `src/PesoDemo.sol`: ERC-20 "Peso Demo (ARSd)", 18 decimales, `mint` libre (solo testnet). Se usa el mock y no USDC: Circle puede bloquear direcciones y no hay que conseguir USDC de faucet. USDC Fuji (`0x5425…Bc65`) queda como opción por constructor.
- `src/EmergencyVault.sol is KumplyGated, ReentrancyGuard` (OZ fijado a una versión, `SafeERC20`). Una bóveda por dueño. MVP: se despliega con el `owner` (la smart account de Marta) en el constructor. Stretch: `VaultFactory.create()`.

| Estado | |
|---|---|
| `owner`, `IERC20 token` (immutable), `minPeriod` (immutable: 1 s en demo, 30 días en prod) | |
| `address[] heirs; uint16[] bps` (suman 10000) · `address[3] guardians` | |
| `uint64 inactivityPeriod, gracePeriod, lastPing, claimStartedAt` | |
| `uint16 emergencyBps` (≤ 2000) · `uint64 emergencyCooldown, lastEmergencyAt` | |
| `uint256 snapshot` (saldo fijado en el 1er cobro; ≠0 = reparto en curso) · `mapping(address=>bool) claimed` | |
| `EmergencyReq[]` con `to, amount, createdAt, approvals, done` + `mapping(uint256=>mapping(address=>bool)) voted` | |

| Función | Quién | Regla |
|---|---|---|
| `configure(heirs, bps, guardians, inactivity, grace, emergencyBps, cooldown)` | owner | bps suman 10000; períodos ≥ `minPeriod`; **cada guardián `_requirePersonAtLeast(g,2)`**; herederos NO se chequean acá (pueden verificar después; la UI muestra verde/rojo). Cuenta como ping. Revierte si `snapshot != 0`. |
| `ping()` | owner | `lastPing = now`; si había reclamo abierto, lo cancela (`ClaimCancelled`). Revierte si `snapshot != 0`. |
| `deposit(amount)` / `withdraw(to, amount)` | owner | `SafeERC20`. `withdraw` cuenta como ping y revierte si `snapshot != 0`. (Cargar también se puede con un `transfer` directo al contrato.) |
| `startClaim()` | heredero | `now > lastPing + inactivity`; heredero verificado (`_requirePersonAtLeast(msg.sender,2)`); fija `claimStartedAt`. |
| `claim()` | heredero | `claimStartedAt != 0` y `now > claimStartedAt + grace`; **re-chequea KUMPLY en ese momento**; `snapshot` se fija una sola vez; marca `claimed` y después transfiere `snapshot*bps/10000` (CEI + `nonReentrant`). |
| `requestEmergency(to, amount)` | guardián | verificado; sin reparto en curso; `now ≥ lastEmergencyAt + cooldown`; `amount ≤ balance*emergencyBps/10000`. El pedido cuenta como 1er voto. |
| `approveEmergency(id)` | otro guardián | verificado, no votó; con 2 votos **re-chequea tope y cooldown** y transfiere a `to` (fijo en el pedido). |
| Lecturas | todos | `status()` (deadlines, saldo, fase), `heirsInfo()`, más `isPersonAtLeast/isBusiness/isAgent` heredados. |

- **Eventos:** `Configured`, `Pinged(at)`, `Deposited`, `Withdrawn`, `ClaimStarted(by, graceEnds)`, `ClaimCancelled`, `Claimed(heir, amount)`, `EmergencyRequested(id, by, to, amount)`, `EmergencyApproved(id, by)`, `EmergencyExecuted(id, to, amount)`.
- **Errores:** `NotOwner`, `NotHeir`, `NotGuardian`, `StillAlive(deadline)`, `GraceNotOver(deadline)`, `NoActiveClaim`, `AlreadyClaimed`, `AlreadyVoted`, `ExceedsEmergencyCap(amount, cap)`, `CooldownActive(until)`, `BadShares`, `BadPeriods`, `Settling` + los de `KumplyGated` (`NotPerson(who, tier, min)`, etc.).
- **Seguridad:** sin `tx.origin`; sin función de admin; la parte de un heredero sin KYC **no** se reparte entre los demás (así nadie gana dejando a otro sin verificar); la emergencia queda bloqueada durante el reparto (para no romper la foto del saldo).
- **Tests mínimos** (`test/EmergencyVault.t.sol` con `MockAttestationStore` + `vm.warp`): reclamo antes de tiempo revierte; ping cancela; reparto 60/40 exacto; no verificado → `NotPerson` y su parte queda; KYC vencido entre `startClaim` y `claim` → bloquea; empresa (tier 4) no pasa como persona; emergencia 2-de-3 OK, 3er voto/voto doble revierte, tope y cooldown; guardián sin KYC en `configure` revierte. Test fork opcional con las direcciones fixture.

**Web** (`web/`, propuesta Vite + React + viem; si P2 maneja mejor Next.js, Next.js):
1. **Entrar** (email → 0xGasless → smart account; muestra la dirección para pedir la atestación).
2. **Dueño:** saldo, herederos y guardianes con semáforo KUMPLY (verde = verificado, rojo = falta), botón grande **"Estoy bien"**, formulario de configuración, sacar plata.
3. **Panel con cuenta regresiva** (público): "Faltan 0:42 para que se habilite el reclamo" → "Gracia: 0:18 para que se libere". Calcula con los deadlines del contrato + reloj local + 5 s de margen.
4. **Heredero:** "Iniciar reclamo" / "Cobrar mi parte", con el error decodificado en castellano (`NotPerson` → "Tenés que verificar tu identidad para cobrar").
5. **Guardianes:** pedir emergencia (monto, destino, motivo) y aprobar; muestra tope disponible y cooldown.
6. Cada acción muestra el link a Snowtrace (`https://testnet.snowtrace.io/tx/<hash>`) y el tiempo de confirmación medido.

## 7. Demo de 3 minutos
Preparado antes (P1, 16:00-16:30): bóveda de demo **desplegada y verificada** con `minPeriod = 1`, configurada con **inactividad 60 s, gracia 30 s, emergencia 20%, cooldown 60 s**; 1.000.000 ARSd adentro; herederos Lucía (60%, smart account con tier 2) y Tomás (40%, EOA sin atestación); guardianes Lucía, Pablo (smart accounts con tier 2) y `0x2260…C599` (fixture tier 3). Tx ya grabadas: cancelación de un reclamo por ping y el `claim` bloqueado de Tomás.

| t | Qué se ve | Tx en Snowtrace |
|---|---|---|
| 0:00 | Marta entra con su email. Saldo, herederos (Lucía verde, Tomás rojo), guardianes verdes. Toca **"Estoy bien"**: confirma en <1 s, sin gas. | `Pinged` (patrocinada por 0xGasless) |
| 0:20 | **Emergencia:** Lucía pide 150.000 ARSd para "Clínica" (15%). Pablo aprueba → la plata llega. Lucía intenta otra → "en cooldown" / pedir 300.000 → "supera el 20%". | `EmergencyRequested`, `EmergencyApproved`, `EmergencyExecuted` |
| 1:05 | Marta "deja de dar señales". El panel cuenta hasta 0. Lucía toca **"Iniciar reclamo"**. | `ClaimStarted` |
| 1:15 | Durante la gracia: "Marta podría cancelar acá". Se muestra el link de la cancelación grabada. | `ClaimCancelled` (grabada) |
| 1:45 | Termina la gracia. **Tomás (sin KYC) intenta cobrar → BLOQUEADO** (`NotPerson`, en pantalla y en Snowtrace). | tx fallida grabada + simulación en vivo |
| 2:00 | **Lucía cobra su 60%** de lo que quedaba. Saldo de Tomás: sigue en la bóveda esperándolo. | `Claimed(Lucía, …)` |
| 2:20 | Snowtrace: contrato verificado, pestaña de eventos, la línea que llama a KUMPLY `verify()`. | página del contrato |
| 2:45 | Cierre: "Ni nosotros podemos sacar esta plata. Las reglas están en el contrato". | |

Si algo falla en vivo: pasar al video de respaldo (16:30) en ese mismo minuto, sin pelearla.

## 8. Negocio
- **Cliente B2C:** personas y familias que ahorran en stablecoins (Marta, o su hija que le arma la llave). **Cliente B2B (el que escala):** exchanges, billeteras y bancos digitales que ya tienen a esos usuarios y su KYC.
- **Ingresos (propuesta, a validar):**
  - Gratis con 1 heredero y 1 guardián. **Plan Familia: USD 2/mes** (o 0,3% anual del saldo, lo que sea menor).
  - **1% al liberar** la herencia, con tope (ej. USD 100). Contra 6-15% de una sucesión, se entiende solo; y **no la reemplaza**.
  - **B2B marca blanca:** USD 0,50 por bóveda activa por mes. La billetera lo ofrece como "plan de continuidad" (retención y confianza).
  - El gas patrocinado es nuestro costo: va dentro del plan.
- **Competencia:** Casa Inheritance (multisig BTC/ETH/USDC, pago, para EE.UU., desde ~USD 250/año [SIN VERIFICAR]); Vault12 Guard (libera un backup de secretos, no mueve plata, USD 29,99-49,99/mes [SIN VERIFICAR]); Sarcophagus (libera datos cifrados, no plata; wallet y token propios); Safe Delay / Candide / Cometh / Argent (recuperan la cuenta, para devs; sin herencia por %, sin tope de emergencia, sin KYC del que reclama); Google / Apple legado (datos y fotos, no plata); bancos (plata congelada hasta la sucesión).
- **Ventaja:** nadie junta (1) plata en stablecoins que se mueve sola por inactividad, (2) herederos con identidad verificada on-chain, (3) retiro de emergencia 2-de-3 con tope y (4) entrar con email sin gas. Pensado para Argentina/LATAM.
- **Validación temprana (P4, si hay tiempo):** 5 mensajes a conocidos con padres que ahorran en dólares digitales: "¿pagarías USD 2/mes?". Poner el resultado real, aunque sea chico, en el README.

## 9. Reparto
| Quién | Hace | Rama | Carpeta |
|---|---|---|---|
| **P1** dav1dchaparro | `KumplyGated` + `EmergencyVault` + `PesoDemo` + tests + deploy + verificación + tx grabadas + ABI | `feature/contracts-vault` | `contracts/` |
| **P2** Gabosawn | Web base, login 0xGasless, smart accounts (las 3 direcciones antes de 12:55), pantallas del dueño, "Estoy bien", cliente del contrato | `feature/web-owner-gasless` | `web/src/lib/`, `web/src/pages/owner/` |
| **P3** ramiro-monllor | Pantallas de heredero y guardianes, panel con cuenta regresiva, errores en castellano, links a Snowtrace | `feature/web-heir-guardian` | `web/src/pages/heir/`, `web/src/pages/guardian/`, `web/src/components/` |
| **P4** facundo-monllor | Pedido y seguimiento de atestaciones KUMPLY, AVAX de faucet, README (6 obligatorios), "por qué Avalanche", negocio, pitch, video de respaldo | `feature/docs-readme-pitch` | `README.md`, `docs/` |

- Todo por PR a `develop`, commits convencionales (commitlint): `feat(contracts): …`, `feat(web): …`, `docs: …`, `test: …`.
- **Contrato entre partes:** P1 publica el ABI en `web/src/abi/EmergencyVault.json` y la dirección en `web/.env.example` (`VITE_VAULT=…`). P2 es el único que toca `web/src/lib/`. P3 importa de ahí y no lo edita.
- Nada de claves privadas ni API keys en el repo (`.env` en `.gitignore`).

## 10. Plan hora por hora
| Hora | P1 contrato | P2 web/gasless | P3 heredero/guardianes | P4 KUMPLY/docs |
|---|---|---|---|---|
| 12:45 | Leer plan, `forge init`, copiar `KumplyGated` | Login 0xGasless con 3 emails (Marta, Lucía, Pablo) → direcciones | Scaffold de pantallas con datos falsos | Pedir AVAX de Fuji; preparar mensaje a KUMPLY |
| **13:00** | **CORTE: P4 manda a KUMPLY las direcciones (Lucía, Pablo, + 1 de reserva) pidiendo tier 2** | | | |
| 13:00-14:00 | `EmergencyVault` + `PesoDemo`, tests clave | Probar 1 tx patrocinada en Fuji con key propia (13:30) | Cuenta regresiva + estados | README esqueleto, por qué Avalanche, negocio |
| **14:00** | **CORTE: contrato desplegado y VERIFICADO en Fuji** (aunque falten tests) | Cliente viem + ABI | Conectar lecturas reales | Seguir a KUMPLY (¿llegaron?) |
| 14:00-15:00 | Resto de tests, tx bloqueada grabada | "Estoy bien" + configurar por gasless | Reclamo + cobro + emergencia | Guion de pitch |
| **15:00** | **CORTE: flujo punta a punta en Fuji desde la web** (ping → reclamo → cobro) | | | |
| 15:00-16:00 | Test fork, arreglos | Pulir login y errores | Errores en castellano, links Snowtrace | README con links reales |
| **16:00** | **FREEZE de features.** Solo bugs. P1 despliega la bóveda de demo final y graba tx | | | |
| 16:00-16:30 | Ensayo de demo x2 (todos) | | | |
| **16:30** | **Video de respaldo grabado** + README completo | | | |
| 16:30-17:30 | Merge a `develop` (y a `main` si es el flujo), revisar los 6 obligatorios, ensayar pitch con reloj | | | |
| **17:30** | **Repo PÚBLICO + entrega del formulario.** 17:30-18:00 = colchón, no se toca código | | | |

## 11. Checklist de entrega
**Obligatorios (si falta uno, no es elegible):**
- [ ] 1. `EmergencyVault` en Fuji **verificado** (link Snowtrace/Routescan con `#code`). También `PesoDemo`.
- [ ] 2. Web conectada al contrato (no CLI), con link desplegado o instrucciones para correrla.
- [ ] 3. Sección "Por qué Avalanche" en el README (finalidad medida, KUMPLY on-chain, gasless, visión L1/ICM).
- [ ] 4. Modelo de negocio: problema, cliente, ingresos, ventaja (+ validación si la hubo).
- [ ] 5. Repo **público** con instalación, despliegue (`forge script …`) y arquitectura (el diagrama).
- [ ] 6. README que separe **qué se hizo hoy** (todo, con commits del 7/11) y qué es reutilizado (`KumplyGated` del plan de la mañana, librerías).

**Bonus KUMPLY:** [ ] `@kumply/sdk` en la web (semáforo de verificación) · [ ] gate on-chain `isPersonAtLeast` en `claim`/guardianes · [ ] dirección que pasa (link) · [ ] dirección bloqueada (link tx fallida) · [ ] sin `hasTier` · [ ] aviso "atestaciones de Fuji = demo".
**Bonus 0xGasless:** [ ] `@0xgasless/core` con login con email · [ ] todas las tx del flujo patrocinadas (ping, reclamo, cobro, emergencia) · [ ] links de tx patrocinadas en el README.
**Extra:** [ ] aclaración legal en el README · [ ] video de respaldo · [ ] tests en verde en CI.

## 12. Riesgos top 5 y plan B
1. **Las atestaciones de KUMPLY no llegan a tiempo.** Plan B: guardianes y heredero "que pasa" con direcciones fixture (`0x1F98…F984` tier 2, `0x2260…C599` tier 3); se muestra con `cast call --from` y el test fork; la tx real que pasa queda como "pendiente de atestación". Bloqueo real igual se muestra (no necesita atestación).
2. **0xGasless no patrocina en Fuji con nuestra key, o falla el SDK.** Si a las 14:30 no hay tx patrocinada: la web firma con una wallet normal (Core/MetaMask) y AVAX de faucet, y se deja **una** tx patrocinada para el bonus básico (+5). Ojo: cambia `msg.sender`, hay que pedir atestaciones sobre esas EOAs.
3. **La verificación del contrato falla.** Planes B 1-3 del plan de tarea 2 (`--verifier custom`, sufijo `/etherscan/api`, flatten y subida a mano). Sin verificación no hay elegibilidad: P1 no sigue con otra cosa hasta resolverlo.
4. **La demo con tiempos reales se desincroniza** (reloj local vs `block.timestamp`, tx que tarda). Plan B: margen de 5 s en la UI, tx grabadas con links, y video de respaldo listo a las 16:30.
5. **Legal y confianza ("¿esto es legal?", "¿y si los guardianes se roban la plata?").** Respuesta y README: **no reemplaza la sucesión**. En Argentina hay herederos forzosos con legítima (2/3 si hay descendientes, art. 2445 CCyC [SIN VERIFICAR hoy]); una transferencia que la ignore se puede impugnar y los bienes igual entran en la sucesión e impuestos. Lo encuadramos como **plan de continuidad y acceso**: la emergencia es un mandato que el dueño da en vida, con tope y cooldown; la herencia es una **transferencia programada** para que la plata no se pierda sin claves y la familia tenga liquidez **mientras** sale la sucesión. No es asesoramiento legal. Contra guardianes de acuerdo: como mucho 20% por período, el dueño ve todo y los puede cambiar.

## 13. Pitch de 3 minutos
- **(0:00-0:25) Gancho:** "Marta tiene sus ahorros en dólares digitales. Si mañana la internan, nadie puede pagar la clínica. Si se muere, sus hijos ven la plata y no la pueden tocar, o esperan meses de sucesión que se llevan entre 6 y 15%."
- **(0:25-0:45) Problema con datos:** sucesión 4-5 meses en CABA (hasta 2 años con disputas), cuentas congeladas, ~20% de los BTC perdidos, 85% de las compras cripto en Argentina son stablecoins.
- **(0:45-2:00) Demo** (versión corta de la sección 7): "Estoy bien" sin gas → emergencia 2 de 3 → reclamo → Tomás sin verificar **bloqueado** → Lucía cobra.
- **(2:00-2:25) Por qué Avalanche:** las reglas viven en el contrato que guarda la plata (no se pueden saltar), finalidad <1 s, KUMPLY leído en la misma tx, 0xGasless: nadie paga gas. Visión: L1 para bancos.
- **(2:25-2:50) Negocio:** USD 2/mes o 1% al liberar, y marca blanca para billeteras y exchanges que ya tienen el KYC de sus usuarios.
- **(2:50-3:00) Cierre:** "Llave de Emergencia: si te pasa algo, tu plata llega a quien vos elegiste. Y nadie más la puede tocar."

**Preguntas difíciles:**
1. **"¿Esto es legal? ¿No se saltea la sucesión?"** → No la reemplaza y lo decimos en el README. Es un plan de continuidad: da liquidez rápida y evita que la plata se pierda sin claves; los bienes igual se declaran en la sucesión y se respeta la legítima. La emergencia es un mandato que el dueño firma en vida.
2. **"¿Y si Marta se olvida de tocar 'Estoy bien' o pierde el email?"** → En producción el período es de meses, con recordatorios y una gracia en la que cancela con 1 clic (también sacar plata cuenta como señal). Si de verdad perdió el acceso, la herencia corre igual (es la idea) y los guardianes pueden cubrir una urgencia. Rotar el dueño con 2-de-3 y demora es lo siguiente del roadmap.
3. **"¿Por qué confiar en esto y no en un banco? ¿Y si se ponen de acuerdo dos guardianes?"** → Porque ni nosotros podemos mover la plata: no hay función de administrador y las reglas son públicas y verificadas en Snowtrace. Dos guardianes de acuerdo sacan como mucho el tope (20%) por período, a un destino fijo que queda registrado; el dueño lo ve y los cambia. En un banco, la regla la cambia el banco.
