# Llave de Emergencia

> *"Si te pasa algo, tu plata no se congela: llega a quien vos elegiste, y nadie más la puede tocar."*

HackaTwin 2026 · Blockchain Track (Avalanche) · Fuji C-Chain (43113)

**Demo:** video de respaldo `TODO-link` · web `TODO-link` · pitch `docs/pitch.md` `TODO-link`

---

## Qué es

1. La plata vive en una **bóveda tuya** en Avalanche (un contrato sin función de administrador: ni nosotros la podemos tocar).
2. Una vez por período tocás **"Estoy bien"**: entrás con tu email y no pagás gas.
3. **Emergencia 2 de 3:** si estás viva pero internada, 2 de tus 3 personas de confianza pueden mandar una parte con tope (20% del saldo hasta tu próxima señal) **solo a un destino verificado** (la clínica).
4. **Herencia:** si dejás de dar señales, hay aviso y un período de gracia en el que podés cancelar. Después, cada heredero cobra su porcentaje, **solo si tiene la identidad verificada** con KUMPLY. Si no la tiene, su parte queda esperándolo.
5. Retirar tu plata es gratis y cuenta como "Estoy bien".

## El problema

- **Lento:** una sucesión simple en CABA tarda en promedio 4 a 5 meses hasta la declaratoria; con disputas, de 6 meses a 2 años o más. [iProfesional](https://www.iprofesional.com/legales/441805-heredar-en-argentina-como-se-tramita-cuanto-demora-y-cuanto-sale-completar-una-sucesion) · [abogados.com.ar](https://abogados.com.ar/sucesiones-pasos-tiempos-y-costos-del-proceso-en-argentina/38051)
- **Caro:** entre 6% y 15% del valor de los bienes, sumando honorarios, tasa de justicia y gastos. [Cronista](https://www.cronista.com/economia-politica/cuanto-cuesta-una-sucesion-en-2026-ley-nacional-de-honorarios-y-gastos-ocultos/)
- **Se congela cuando más hace falta:** el banco bloquea la cuenta al enterarse de la muerte; en billeteras virtuales es todavía más difícil. [Canal26](https://www.canal26.com/economia/2025/05/31/fallecimiento-de-un-titular-bancario-que-deben-hacer-los-familiares-para-acceder-a-los-fondos-de-la-cuenta/) · [Cronista](https://www.cronista.com/informacion-gral/por-cambios-en-ley-de-sucesiones-que-pasa-con-las-billeteras-virtuales-y-cuentas-comitentes-cuando-alguien-fallece)
- **Cripto sin claves = cripto perdida:** Chainalysis estimó que ~20% de los BTC están perdidos (no separa cuántos por muerte). [CriptoNoticias](https://www.criptonoticias.com/mercados/3-7-millones-de-bitcoins-podrian-estar-perdidos-segun-chainalysis)
- **Mercado en stablecoins:** según Bitso, el 85% de lo que compraron sus clientes argentinos en el 1.er semestre de 2025 fueron stablecoins. [Mercado](https://mercado.com.ar/tendencias/bitso-stablecoins-dominan-compra-y-bitcoin-crece-en-carteras-durante-2025)

## Cómo funciona

```
 [ACTIVA] ── "Estoy bien" (sin gas) ──► reloj reiniciado, tope de emergencia = 20% del saldo
     │
     ├─ Emergencia: guardián propone → 2.º guardián aprueba → la plata va a la clínica (empresa verificada)
     │     · supera el tope → revierte TopeEmergenciaSuperado
     │     · destino no verificado → revierte NotBusiness
     │
     └─ vence el plazo sin señal ─► [VENCIDA] ─ heredero inicia reclamo ─► [EN GRACIA] (el dueño puede cancelar)
                                                         └─► [EJECUTABLE]
                                                               ├─ heredero sin KYC → revierte NotPerson (su parte queda)
                                                               └─ heredero verificado → cobra su porcentaje
```

## Arquitectura

Diagrama completo y responsabilidades de cada carpeta: [`docs/arquitectura.md`](docs/arquitectura.md).

- `contracts/`: Foundry. `LlaveEmergencia.sol` (hereda de `KumplyGated`), `MockPesos.sol` (token de prueba mPESO), `DemoAttestationStore.sol` (solo tests y plan B).
- `web/`: Vite + React + TypeScript + viem. Login con email y gas patrocinado con `@0xgasless/core`; semáforo de identidad con `@kumply/sdk`.
- `deployments/fuji.json`: única fuente de verdad de las direcciones.

## Contratos desplegados (Fuji C-Chain, 43113)

| Contrato | Dirección | Código verificado |
|---|---|---|
| `LlaveEmergencia` (instancia A) | `TODO` | `TODO-link #code` |
| `LlaveEmergencia` (instancia B, respaldo) | `TODO` | `TODO-link #code` |
| `MockPesos` (mPESO) | `TODO` | `TODO-link #code` |
| KUMPLY `AttestationStore` (de KUMPLY, no nuestro) | `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` | [Snowtrace](https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD) |

## Por qué Avalanche

1. **Compliance on-chain en la misma transacción.** El contrato lee el `AttestationStore` de KUMPLY en Fuji dentro de cada `iniciarReclamo`, `cobrar` y voto de emergencia, sin oráculos de por medio. Si el heredero no es una persona verificada, la plata no sale. Avalanche tiene hoy esa infraestructura de identidad (KYC, KYB y KYA) desplegada en Fuji.
2. **Finalidad medida.** Una señal de vida o un cobro confirmados no se revierten. Medido hoy en Fuji: `TODO` p50 / `TODO` p95 (ver [`docs/finalidad.md`](docs/finalidad.md)). Solo publicamos cifras medidas.
3. **Gas patrocinado en Fuji.** Con 0xGasless, Marta y su familia nunca compran AVAX.
4. **Reloj correcto para un contrato de inactividad.** La C-Chain produce bloques solo cuando hay transacciones y Ava Labs recomienda usar `block.timestamp` en vez del número de bloque ([coreth](https://github.com/ava-labs/coreth/blob/master/README.md)). Nuestro contrato mide los plazos con `block.timestamp` y expone `ahora` para que la web corrija su reloj; el aviso previo lo hace un keeper off-chain.
5. **Visión (roadmap, NO DESPLEGADA):** una L1 institucional permisionada para bancos y billeteras, conectada a la C-Chain por Interchain Messaging (ICM).

## Bonus KUMPLY (core)

- `@kumply/sdk` en la web (`web/src/lib/kumply.ts`): semáforo con `isPersonAtLeast(addr, 2)` e `isBusiness(addr)`.
- **Gate on-chain:** `isPersonAtLeast(…, 2)` en `iniciarReclamo`, `cobrar` y en los votos de los guardianes; `isBusiness` en el destino de una emergencia.
- **Pasa:** Lucía cobra → `TODO-link` (tx `Cobrado`).
- **Bloqueada:** Tomás intenta cobrar sin atestación → `TODO-link` (tx revertida `NotPerson`).
- No usamos `hasTier()`.
- **Las atestaciones de KUMPLY en Fuji son de DEMO, emitidas por el staff, sin verificación KYC real.**

## Bonus 0xGasless (core)

- Componente: `@0xgasless/core` (embedded wallet con login por email + smart account + paymaster).
- Por qué: Marta, Lucía y los guardianes nunca compran AVAX. Está en el flujo principal: ninguna acción del usuario paga gas.
- Tx patrocinadas: `SenalDeVida` `TODO-link` · `EmergenciaPropuesta` `TODO-link` · `ReclamoIniciado` `TODO-link` · `Cobrado` `TODO-link`.
- Saldo de AVAX de las smart accounts: 0 (`TODO` captura).
- **Combo +20:** `TODO` (solo se reclama si 0xGasless habilita una política de patrocinio que verifique KUMPLY; si no, no se reclama).

## Evidencias

Tabla completa (acción → hash → link): [`docs/evidencias.md`](docs/evidencias.md).

## Instalación y despliegue

- Contratos (build, tests, deploy y verificación): [`contracts/README.md`](contracts/README.md) `TODO` (P1).
- Web (instalación, variables y `npm run dev`): [`web/README.md`](web/README.md) `TODO` (P2).
- Cuentas de prueba (solo direcciones públicas): [`docs/cuentas.md`](docs/cuentas.md).

Resumen rápido:
```bash
git clone https://github.com/dav1dchaparro/hackatwin.git && cd hackatwin
# contratos
cd contracts && forge install && forge build && forge test
# web
cd ../web && npm ci && cp .env.example .env.local && npm run dev
```

## Modelo de negocio

- **Problema:** la plata en dólares o pesos digitales se congela cuando el dueño muere o queda incapacitado; la sucesión tarda meses y cuesta entre 6% y 15% del patrimonio; sin claves, la cripto se pierde.
- **Cliente:** B2C, personas y familias que ahorran en stablecoins (o la hija que le arma la Llave a su madre). B2B (el que escala): billeteras, exchanges y bancos digitales que ya tienen a esos usuarios y su KYC.
- **Ingresos:**
  1. **1% al liberar la herencia**, cobrado por el contrato (`comisionBps`, immutable, visible en Snowtrace). `TODO`: si P1 no llega con la comisión, cambiar a "en el contrato de producción; el MVP de hoy lo documenta y no lo cobra".
  2. Plan Familia USD 2/mes (más herederos, más guardianes, avisos por WhatsApp).
  3. Marca blanca B2B: USD 0,50 por bóveda activa por mes.
  - **El gas lo pagamos nosotros** (0xGasless): un "Estoy bien" por mes cuesta centavos [medido en `docs/finalidad.md`].
- **Ventaja:** nadie junta (1) plata en stablecoins que se mueve sola por inactividad, (2) herederos con identidad verificada on-chain, (3) retiro de emergencia 2 de 3 con tope y (4) alta con email sin gas. Comparables: Vault12 USD 49,99/mes, Casa desde USD 250/año, Kresus USD 99,99/año, Nunchuk 0,3% al reclamar. Ninguno verifica al heredero ni mueve stablecoins en pesos.

### ¿Y si retiro mi plata antes?

Retirás cuando quieras, sin costo. Retirar también cuenta como "Estoy bien". No cobramos por sacar tu plata: sería una cláusula abusiva (Ley 24.240, art. 37) y nos convertiría en custodios. Cobramos solo cuando el servicio hizo su trabajo: 1% al liberar la herencia, escrito en el contrato.

## Validación

`TODO` (16:15): resultados reales de las conversaciones del evento. Si no hay datos: "Validación: pendiente".

## Hecho en el evento vs. reutilizado

- **Hecho en el evento (sáb 7/11/2026, desde las 9:12):** todo el código de `contracts/`, `web/`, `keeper/`, `scripts/` y `docs/`. Se puede comprobar con `git log` (el primer commit del repo es de ese día).
- **Reutilizado:** OpenZeppelin Contracts v5.1.0, forge-std, `@0xgasless/core`, `@kumply/sdk`, viem, Vite y React. `KumplyGated` se diseñó también hoy, en el plan de la mañana.

## Por qué no Privy ni Safe hoy

**Privy** tiene wallets pregeneradas por email, pero su patrocinio de gas usa EIP-7702, que no está activo en Avalanche (ACP-209 sigue propuesta). Usamos la embedded wallet de **0xGasless**, que patrocina en Fuji hoy. **Safe** está desplegado en Fuji, pero su módulo 4337 no, y su web dejó de soportar la C-Chain en junio de 2026; además, nuestro gate de identidad no deja cobrar a un contrato. La 2 de 3 de guardianes vive en nuestro contrato, con tope, destino verificado y veto. Safe queda como "fondo común familiar" en el roadmap.

## Límites conocidos y roadmap

- La parte de un heredero que nunca verifica su identidad queda en la bóveda.
- La inactividad no prueba la muerte: por eso hay aviso, gracia, veto y guardianes.
- Roadmap: alta por invitación con email · fondo común familiar con Safe · reclamo con 2 firmas y rotación de dueño 2 de 3 · señal de vida por firma EIP-712 relayada · keeper gestionado y avisos por Telegram, WhatsApp y email · paymaster condicionado a KUMPLY · mainnet con ARGt de Twin como medio de pago (nunca rendimiento) · L1 institucional + ICM.

## Aviso legal

Llave de Emergencia **no reemplaza la sucesión ni un testamento**: es un plan de continuidad y liquidez para que la plata no se pierda sin claves y la familia tenga acceso mientras sale la sucesión. En Argentina existen herederos forzosos: los descendientes tienen reservados 2/3 de la herencia, ascendientes y cónyuge 1/2 (art. 2445 CCyC); los porcentajes que configurás solo son seguros sobre la porción disponible, y los bienes igual se declaran en la sucesión. El pacto sobre herencia futura está prohibido (art. 1010 CCyC), por eso esto no es una forma de heredar sino una herramienta de ejecución. La inactividad no prueba la muerte (la presunción de fallecimiento exige 3 años, art. 85 CCyC): por eso hay aviso, gracia, veto y guardianes. No usamos la figura del mandato (se extingue con la muerte o incapacidad, art. 1329 CCyC). No es asesoramiento legal.

## Equipo

- P1 · Juan David Chaparro ([@dav1dchaparro](https://github.com/dav1dchaparro)): contratos.
- P2 · Gabriel ([@Gabosawn](https://github.com/Gabosawn)): web ↔ contrato y 0xGasless.
- P3 · Ramiro Monllor ([@ramiro-monllor](https://github.com/ramiro-monllor)): pantallas y panel de demo.
- P4 · Facundo Monllor ([@facundo-monllor](https://github.com/facundo-monllor)): KUMPLY, README, pitch y entrega.
