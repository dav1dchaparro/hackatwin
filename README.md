# Llave

> *"Si te pasa algo, tu plata no se congela: llega sola a quien vos elegiste, y nadie más la puede tocar."*

HackaTwin 2026 · Blockchain Track (Avalanche) · Fuji C-Chain (43113)

**Demo:** video de respaldo `TODO-link` · web `TODO-link` · pitch `TODO-link`

---

## Qué es

1. La plata vive en una **Llave**: una bóveda en Avalanche sin función de administrador. Ni nosotros la podemos tocar.
2. La dueña entra con su email (sin wallet ni gas), deposita y elige herederos, porcentajes y plazo.
3. Cada movimiento suyo (depositar, retirar, "Estoy bien", configurar) **reinicia el reloj**.
4. Si vence el plazo sin señales, empieza un **período de gracia**: la dueña cancela con un clic.
5. Cuando termina la gracia, **un agente de IA verificado por KUMPLY (KYA, tier 5)** ejecuta la Llave y la plata **llega sola** a todos los herederos en una sola transacción, con 1% de comisión. Un bot sin verificar no puede ejecutarla.

Retirar tu plata es gratis y cuenta como "Estoy bien".

## El problema

- **Lento:** una sucesión simple en CABA tarda en promedio 4 a 5 meses hasta la declaratoria; con disputas, de 6 meses a 2 años o más. [iProfesional](https://www.iprofesional.com/legales/441805-heredar-en-argentina-como-se-tramita-cuanto-demora-y-cuanto-sale-completar-una-sucesion) · [abogados.com.ar](https://abogados.com.ar/sucesiones-pasos-tiempos-y-costos-del-proceso-en-argentina/38051)
- **Caro:** entre 6% y 15% del valor de los bienes, sumando honorarios, tasa de justicia y gastos. [Cronista](https://www.cronista.com/economia-politica/cuanto-cuesta-una-sucesion-en-2026-ley-nacional-de-honorarios-y-gastos-ocultos/)
- **Se congela cuando más hace falta:** el banco bloquea la cuenta al enterarse de la muerte; en billeteras virtuales es todavía más difícil. [Canal26](https://www.canal26.com/economia/2025/05/31/fallecimiento-de-un-titular-bancario-que-deben-hacer-los-familiares-para-acceder-a-los-fondos-de-la-cuenta/) · [Cronista](https://www.cronista.com/informacion-gral/por-cambios-en-ley-de-sucesiones-que-pasa-con-las-billeteras-virtuales-y-cuentas-comitentes-cuando-alguien-fallece)
- **Cripto sin claves = cripto perdida:** Chainalysis estimó que ~20% de los BTC están perdidos (no separa cuántos por muerte). [CriptoNoticias](https://www.criptonoticias.com/mercados/3-7-millones-de-bitcoins-podrian-estar-perdidos-segun-chainalysis)
- **Mercado en stablecoins:** según Bitso, el 85% de lo que compraron sus clientes argentinos en el 1.er semestre de 2025 fueron stablecoins. [Mercado](https://mercado.com.ar/tendencias/bitso-stablecoins-dominan-compra-y-bitcoin-crece-en-carteras-durante-2025)

## Cómo funciona

```
 [ACTIVA] ── la dueña deposita / retira / "Estoy bien" / configura ──► reloj reiniciado
     │
     └─ vence el plazo sin señales ─► agente KYA: iniciarReclamo() ─► [EN GRACIA]
                                                     │   la dueña hace cualquier movimiento → ReclamoCancelado
                                                     └─ termina la gracia ─► agente KYA: liberar()
                                                            · 1% a la tesorería (ComisionCobrada)
                                                            · el resto a TODOS los herederos en la misma tx (HerenciaEnviada)
 Bot sin KYA llama a iniciarReclamo() o liberar() ─► revierte NotAgent(bot, 0)
```

## Arquitectura

Diagrama y responsables por carpeta: [`docs/arquitectura.md`](docs/arquitectura.md).

- `contracts/` (Foundry): `Llave.sol` (hereda de `KumplyGated`), `MockPesos.sol` (token de prueba mPESO), `DemoAttestationStore.sol` (plan B declarado).
- `agente/` (Node + TypeScript + viem): vigila la Llave, avisa por Telegram y mail, y ejecuta `iniciarReclamo` y `liberar`.
- `web/` (Vite + React + viem): login con email y gas patrocinado con `@0xgasless/core`; badge de identidad con `@kumply/sdk`.
- `deployments/fuji.json`: única fuente de verdad de las direcciones.

## Contratos desplegados y verificados (Fuji C-Chain, 43113)

| Contrato | Dirección | Código verificado |
|---|---|---|
| `Llave` A (store oficial de KUMPLY) | `0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA` | [Snowtrace](https://testnet.snowtrace.io/address/0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA#code) |
| `Llave` B (store demo, plan B) | `0xc74d36226ACABb11482455175919fbFF3936de37` | [Snowtrace](https://testnet.snowtrace.io/address/0xc74d36226ACABb11482455175919fbFF3936de37#code) |
| `MockPesos` (mPESO) | `0x866FD7C4B1c5d356c11840550483Ef3e415FA66E` | [Snowtrace](https://testnet.snowtrace.io/address/0x866FD7C4B1c5d356c11840550483Ef3e415FA66E#code) |
| `DemoAttestationStore` (plan B) | `0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513` | [Snowtrace](https://testnet.snowtrace.io/address/0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513#code) |
| KUMPLY `AttestationStore` (de KUMPLY, no nuestro) | `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` | [Snowtrace](https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD) |

Demo: 60 s de inactividad, 30 s de gracia, comisión 1% (`comisionBps = 100`), 1.000.000 mPESO en cada Llave.

**Por qué hay dos Llaves:** la A lee el `AttestationStore` oficial de KUMPLY; la B lee un store de demo nuestro (`DemoAttestationStore`, mismo `verify()`), que usamos si KUMPLY no emite a tiempo el tier 5 para nuestro agente. `TODO` (15:30): indicar cuál se usa en la demo.

## Por qué Avalanche

1. **Compliance on-chain en la misma transacción.** `Llave` lee el `AttestationStore` de KUMPLY dentro de `iniciarReclamo` y `liberar`, sin oráculos de por medio: si quien ejecuta no es un agente verificado (KYA, tier 5), la plata no se mueve. Avalanche tiene hoy esa infraestructura de identidad (KYC, KYB y KYA) desplegada en Fuji.
2. **Finalidad medida.** Una señal de vida o una liberación confirmadas no se revierten. Medido hoy en Fuji: `TODO` p50 / `TODO` p95 ([`docs/finalidad.md`](docs/finalidad.md)). Solo publicamos cifras medidas.
3. **Gas patrocinado en Fuji.** Con 0xGasless, la dueña y su familia nunca compran AVAX.
4. **Reloj correcto para un contrato de inactividad.** La C-Chain produce bloques solo cuando hay transacciones y Ava Labs recomienda usar `block.timestamp` en vez del número de bloque ([coreth](https://github.com/ava-labs/coreth/blob/master/README.md)). `Llave` mide los plazos con `block.timestamp` y expone `ahora` en `estado()` para que la web corrija su reloj; el aviso previo lo hace el agente, off-chain.
5. **Visión (roadmap, NO DESPLEGADA):** una L1 institucional permisionada para bancos y billeteras, conectada a la C-Chain por Interchain Messaging (ICM).

## Bonus KUMPLY (core: KYA)

- **La verificación es el corazón del producto:** solo un **agente con KYA** (`isAgent`, tier 5 exacto) puede iniciar el reclamo y liberar la herencia. Es el caso que KUMPLY prioriza: "agentes de IA con operador verificado".
- Gate on-chain en `Llave.sol` (`_requireAgent` de `KumplyGated`), con el evento `VerificadoKumply` en cada ejecución.
- `@kumply/sdk` en la web: badge "agente verificado" (`isAgent`).
- **Pasa:** el agente `0x8739…CfCb` ejecuta `liberar()` → `TODO-link`.
- **Bloqueada:** un bot sin KYA llama a `liberar()` → revierte `NotAgent(bot, 0)` → `TODO-link`.
- No usamos `hasTier()`.
- **Las atestaciones de KUMPLY en Fuji son de DEMO, emitidas por el staff, sin verificación KYC real.** `TODO`: si la demo usa la Llave B, aclarar que el tier 5 del agente sale de nuestro `DemoAttestationStore` y no de KUMPLY.

## Bonus 0xGasless (core)

- Componente: `@0xgasless/core` (embedded wallet con login por email + smart account + paymaster).
- Por qué: la dueña nunca compra AVAX. Está en el flujo principal: ninguna acción de la usuaria paga gas.
- Política del paymaster en el dashboard: solo contratos permitidos (`Llave` A, `Llave` B y `MockPesos`). `TODO`: confirmar con P2.
- Tx patrocinadas: `SenalDeVida` `TODO-link` · `Depositado` `TODO-link` · `Configurada` `TODO-link`.
- Saldo de AVAX de la smart account de la dueña: 0 (`TODO` captura).
- **Combo +20:** `TODO`. Solo se reclama si el agente opera por el paymaster conjunto KUMPLY+0xGasless (que patrocina solo tier 5). Si no, no se reclama.

## Evidencias

Tabla completa (acción → hash → link): [`docs/evidencias.md`](docs/evidencias.md).

## Instalación y despliegue

- Contratos y agente (build, tests, deploy y verificación): [`contracts/README.md`](contracts/README.md) y [`agente/README.md`](agente/README.md).
- Web (instalación, variables y `npm run dev`): [`web/README.md`](web/README.md).
- Cuentas de prueba (solo direcciones públicas): [`docs/cuentas.md`](docs/cuentas.md).

```bash
git clone https://github.com/dav1dchaparro/hackatwin.git && cd hackatwin
git submodule update --init --recursive
# contratos
cd contracts && forge build && forge test
# web
cd ../web && npm ci && cp .env.example .env.local && npm run dev
```

## Modelo de negocio

- **Problema:** la plata en dólares o pesos digitales se congela cuando el dueño muere o queda incapacitado; la sucesión tarda meses y cuesta entre 6% y 15% del patrimonio; sin claves, la cripto se pierde.
- **Cliente:** B2C, personas y familias que ahorran en stablecoins (o la hija que le arma la Llave a su madre). B2B (el que escala): billeteras, exchanges y bancos digitales que ya tienen a esos usuarios y su KYC.
- **Ingresos:**
  1. **1% al liberar la herencia**, cobrado por el contrato (`comisionBps`, immutable, visible en Snowtrace en la misma tx que reparte).
  2. Plan Familia USD 2/mes (más herederos, avisos por WhatsApp).
  3. Marca blanca B2B: USD 0,50 por Llave activa por mes.
  - **El gas lo pagamos nosotros** (0xGasless): un "Estoy bien" por mes cuesta centavos [medido en `docs/finalidad.md`].
- **Ventaja:** nadie junta (1) stablecoins que se mueven solas por inactividad, (2) un ejecutor que es un agente de IA con identidad verificada on-chain, (3) reparto a todos los herederos en una sola tx y (4) alta con email sin gas. Comparables: Vault12 USD 49,99/mes, Casa desde USD 250/año, Kresus USD 99,99/año, Nunchuk 0,3% al reclamar.

### ¿Y si retiro mi plata antes?

Retirás cuando quieras, sin costo. Retirar también cuenta como "Estoy bien". No cobramos por sacar tu plata: sería una cláusula abusiva (Ley 24.240, art. 37) y nos convertiría en custodios. Cobramos solo cuando el servicio hizo su trabajo: 1% al liberar la herencia, escrito en el contrato.

## Validación

`TODO`: resultados reales de las conversaciones del evento. Si no hay datos: "Validación: pendiente".

## Hecho en el evento vs. reutilizado

- **Hecho en el evento (sáb 7/11/2026, desde las 9:12):** todo el código de `contracts/`, `agente/`, `web/`, `scripts/` y `docs/`. Se puede comprobar con `git log` (el primer commit del repo es de ese día).
- **Reutilizado:** OpenZeppelin Contracts, forge-std, `@0xgasless/core`, `@kumply/sdk`, viem, Vite y React. `KumplyGated` se diseñó también hoy, en el plan de la mañana.

## Límites conocidos y roadmap

- La inactividad no prueba la muerte: por eso hay plazo, aviso previo y gracia, y cualquier movimiento de la dueña cancela el reclamo.
- Si un heredero perdió su cuenta, su parte igual se le envía a esa dirección.
- Roadmap: alta de herederos por invitación con email · liberación con confirmación (acta o firma de un familiar) · señal de vida por firma EIP-712 relayada · avisos por WhatsApp · registro de agentes de KUMPLY (`AgentRegistry`) · mainnet con ARGt de Twin como medio de pago (nunca rendimiento) · L1 institucional + ICM.

## Aviso legal

Llave **no reemplaza la sucesión ni un testamento**: es un plan de continuidad y liquidez para que la plata no se pierda sin claves y la familia tenga acceso mientras sale la sucesión. En Argentina existen herederos forzosos: los descendientes tienen reservados 2/3 de la herencia, ascendientes y cónyuge 1/2 (art. 2445 CCyC); los porcentajes que configurás solo son seguros sobre la porción disponible, y los bienes igual se declaran en la sucesión. El pacto sobre herencia futura está prohibido (art. 1010 CCyC), por eso esto no es una forma de heredar sino una herramienta de ejecución. La inactividad no prueba la muerte (la presunción de fallecimiento exige 3 años, art. 85 CCyC): por eso hay aviso y gracia. No usamos la figura del mandato (se extingue con la muerte o incapacidad, art. 1329 CCyC). No es asesoramiento legal.

## Equipo

- P1 · Juan David Chaparro ([@dav1dchaparro](https://github.com/dav1dchaparro)): contratos y agente.
- P2 · Gabriel ([@Gabosawn](https://github.com/Gabosawn)): web ↔ contrato y 0xGasless.
- P3 · Ramiro Monllor ([@ramiro-monllor](https://github.com/ramiro-monllor)): pantallas y panel de demo.
- P4 · Facundo Monllor ([@facundo-monllor](https://github.com/facundo-monllor)): KUMPLY, README, pitch y entrega.
