# Contratos de la Llave (Foundry · Avalanche Fuji)

La **Llave** es una herencia por inactividad: una bóveda on-chain por dueño. El dueño entra con su email (smart
account de 0xGasless, sin gas), deposita un token, elige billeteras herederas con porcentajes y un plazo de
inactividad. **Cada movimiento suyo reinicia el reloj.** Si deja de dar señales, vence el plazo y se abre un período
de gracia que él puede cancelar con un clic. Al terminar la gracia, la plata se **envía sola** a todos los herederos
en una sola transacción, menos una comisión del 1 %.

La blockchain no tiene cron. Por eso un **agente de IA verificado por KUMPLY como agente** (tier 5, KYA) vigila,
avisa por Telegram y mail, y ejecuta. **Solo un agente tier 5 puede iniciar el reclamo y liberar.** Un bot sin
verificar queda bloqueado on-chain con `NotAgent(bot, 0)`.

> Fuera de alcance hoy: la emergencia con clínica y guardianes, y la multifirma.

---

## Índice
1. [Fases](#1-fases)
2. [Arquitectura](#2-arquitectura)
3. [Reglas del contrato](#3-reglas-del-contrato)
4. [Requisitos](#4-requisitos)
5. [Instalar](#5-instalar)
6. [Build y test](#6-build-y-test)
7. [ABI para la web](#7-abi-para-la-web)
8. [Deploy y verificación en Fuji (un paso)](#8-deploy-y-verificación-en-fuji-un-paso)
9. [Si la verificación falla: 3 alternativas](#9-si-la-verificación-falla-3-alternativas)
10. [Plan B declarado: store de atestaciones demo](#10-plan-b-declarado-store-de-atestaciones-demo)
11. [Instancias A y B](#11-instancias-a-y-b)
12. [Evidencias con cast](#12-evidencias-con-cast)
13. [Lecturas útiles](#13-lecturas-útiles)
14. [Direcciones](#14-direcciones)
15. [Solo `verify`, nunca la función deprecada](#15-solo-verify-nunca-la-función-deprecada)
16. [Límites conocidos](#16-límites-conocidos)
17. [Qué se hizo hoy](#17-qué-se-hizo-hoy)
18. [Para P2 y P3: cambios de interfaz (PR #2)](#18-para-p2-y-p3-cambios-de-interfaz-pr-2)

---

## 1. Fases

`fase()` devuelve un `uint8`: la web y el agente usan estos índices.

```
                 cualquier movimiento del dueño (depositar · retirar · estoyBien · configurar · transferirDueno)
                 reinicia el reloj y, si había reclamo sin liberar, lo CANCELA (ReclamoCancelado)
        ┌─────────────────────────────────────────────┬───────────────────────────────────────┐
        ▼                                             │                                       │
 ┌─────────────┐   ahora ≥ ultimaSenal          ┌─────┴───────┐   agente tier 5         ┌──────┴──────┐
 │ 0 · Activa  │ ─────────────────────────────► │ 1 · Vencida │ ──────────────────────► │ 2 · EnGracia│
 └─────────────┘   + plazoInactividad           └─────────────┘   iniciarReclamo()      └──────┬──────┘
                                                                                               │ ahora ≥ reclamoIniciadoEn
                                                                                               │       + plazoGracia
 ┌─────────────┐   agente tier 5: liberar()                                             ┌──────▼──────┐
 │ 4 · Liberada│ ◄───────────────────────────────────────────────────────────────────── │3 · Ejecutable│
 └─────────────┘   1 % → tesorería · resto → TODOS los herederos (misma tx) · bóveda = 0└─────────────┘
   (terminal: ya no se aceptan depósitos, retiros ni señales → YaLiberada)
```

Ejemplo (A1): saldo 1.000.000 mPESO, herederos 60 % / 40 %, comisión 100 bps →
tesorería **10.000**, Lucía **594.000**, Tomás **396.000**.

## 2. Arquitectura

```
 Dueño (Marta)                                   Agente (agente/, Node 22 + TS + viem)
 email → @0xgasless/core → smart account         EOA atestada por KUMPLY como agente (tier 5, KYA)
   │ depositar · retirar · estoyBien ·              │ lee estado() cada POLL_MS · avisa por Telegram y mail
   │ configurar   (gas patrocinado;                 │ iniciarReclamo() al vencer · liberar() al terminar la gracia
   │ msg.sender = la smart account)                 │ (paga su gas en AVAX)
   ▼                                                ▼
 ┌───────────────────────────── Llave (Fuji, chainId 43113) ─────────────────────────────┐        ┌──────────────────────────────┐
 │ is KumplyGated, ReentrancyGuard · SafeERC20 · sin función de administrador            │ verify │ KUMPLY AttestationStore      │
 │ iniciarReclamo / liberar: _requireAgent(msg.sender) → NotAgent(who, tier) si tier ≠ 5 │──────► │ 0xa3Bc…22dD                  │
 │ comisionBps y tesoreria immutables (máx. 1 %) · retirar es gratis                     │        │ verify(addr)→(ok,tier,ts,exp)│
 └──────────────────────────┬────────────────────────────────────────────────────────────┘        └──────────────────────────────┘
                            │ SafeERC20.transfer
                            ▼
                 MockPesos (mPESO, 18 decimales, faucet libre)   →  herederos (Lucía, Tomás) + tesorería
```

| Pieza | Archivo | Qué hace |
|---|---|---|
| `Llave` | `src/Llave.sol` | Bóveda de un token con herederos, porcentajes, plazo de inactividad y gracia. |
| `KumplyGated` | `src/kumply/KumplyGated.sol` | Gate on-chain con la semántica de `@kumply/sdk`: persona 1-3, empresa 4, **agente 5**. |
| `IKumplyAttestationStore` | `src/kumply/IKumplyAttestationStore.sol` | Interfaz mínima del store de KUMPLY (`verify`). |
| `MockPesos` | `src/MockPesos.sol` | ERC-20 de demo en pesos (`faucet()` da 1.000.000). |
| `DemoAttestationStore` | `src/demo/DemoAttestationStore.sol` | Store propio con la misma regla de `verify`. Para tests y para el plan B. |
| `DeployLlave` | `script/DeployLlave.s.sol` | Deploy completo en un comando (store demo opcional, token, Llave y siembra). |
| `export-abi.mjs` | `script/export-abi.mjs` | Genera `web/src/abi/` a partir de `out/`. |
| Agente | `../agente/` | Vigila, avisa y ejecuta. Tiene su propio README y `.env.example`. |

## 3. Reglas del contrato

| Función | Quién | Efecto | Errores (en orden de chequeo) |
|---|---|---|---|
| `estoyBien()` | dueño | señal de vida | `NoEsDueno`, `YaLiberada` |
| `depositar(monto)` | cualquiera (con `approve`) | entra plata; si es el dueño, cuenta como señal | `YaLiberada`, `MontoInvalido` |
| `retirar(a, monto)` | dueño | sale plata **sin comisión**; cuenta como señal | `NoEsDueno`, `YaLiberada`, `DireccionInvalida`, `MontoInvalido`, `SaldoInsuficiente` |
| `configurar(c)` | dueño | reemplaza herederos, bps y plazos; señal | `NoEsDueno`, `YaLiberada`, `DireccionInvalida`, validación de la config |
| `transferirDueno(n)` | dueño | cambia el dueño; señal | `NoEsDueno`, `YaLiberada`, `DireccionInvalida` |
| `iniciarReclamo()` | **agente tier 5** | abre la gracia | `NotAgent(who, tier)`, `YaLiberada`, `ReclamoYaIniciado`, `SigueVivo(venceEn)` |
| `liberar()` | **agente tier 5** | comisión a la tesorería y el resto a todos los herederos | `NotAgent`, `YaLiberada`, `SinReclamo`, `GraciaEnCurso(terminaEn)`, `SinSaldo` |

Validación de la config (constructor y `configurar`): dueño ≠ 0 · 1 a 5 herederos · mismo largo que `bps` ·
herederos sin cero, sin el dueño y sin repetidos · cada bps > 0 y suma = 10.000 · cada plazo ≥ `periodoMinimo`.
Lecturas: `estado()` (todo en una llamada, incluye `ahora = block.timestamp`), `fase()`, `herederos()`,
`esHeredero(addr)`, `parteDe(addr)` (neto, coincide al wei con lo que manda `liberar`), `venceEn()`,
`graciaTerminaEn()`, `isAgent(addr)`, `kumply()`, `token()`, `comisionBps()`, `tesoreria()`.

## 4. Requisitos

- **Foundry 1.7.1** (`forge`, `cast`, `anvil`): `curl -L https://foundry.paradigm.xyz | bash && foundryup`.
- **Node ≥ 22** (para `export-abi.mjs` y el agente). `jq` opcional (el CI corre `jq empty` sobre los `*.json`).
- **git** con submódulos (forge-std y OpenZeppelin v5.1.0 están en `lib/` como submódulos).
- Para desplegar en Fuji: AVAX de testnet en el deployer (≥ 0,5) y en el agente (≥ 0,1).
  Faucet: https://core.app/tools/testnet-faucet/?subnet=c&token=c

## 5. Instalar

```bash
git clone https://github.com/dav1dchaparro/hackatwin && cd hackatwin
git submodule update --init --recursive
cd contracts
cp .env.example .env        # completar; .env está en .gitignore
```

Claves: **nunca en archivos.** El deployer, el agente y el bot de evidencia se importan una vez al keystore
de Foundry (la clave se pide con prompt oculto):

```bash
cast wallet import hackatwin-deployer --interactive
cast wallet import agente --interactive
cast wallet import bot-sin-kya --interactive
```

## 6. Build y test

```bash
forge build
forge test -vv
forge fmt --check
# test fork contra el AttestationStore real de KUMPLY (sin FUJI_RPC_URL se saltea)
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc forge test --match-contract ForkFuji -vv
```

Salida real de `forge test` (7/11/2026, forge 1.7.1). `ForkFuji` se saltea sin `FUJI_RPC_URL` o sin red:

<!-- SALIDA_FORGE_TEST -->
```
$ forge test
Ran 1 test for test/ForkFuji.t.sol:ForkFujiTest
[SKIP: skipped] setUp() (gas: 0)
Suite result: ok. 0 passed; 0 failed; 1 skipped; finished in 4.13ms (0.00ns CPU time)

Ran 18 tests for test/KumplyGated.t.sol:KumplyGatedTest
[PASS] testFuzz_reglaDelSdk(uint32,uint32,bool) (runs: 512, μ: 51791, ~: 51766)
[PASS] test_constructor_guardaStore() (gas: 7694)
[PASS] test_constructor_storeCero() (gas: 36498)
[PASS] test_constructor_storeEOA() (gas: 40465)
[PASS] test_empresaYAgenteExactos() (gas: 58957)
[PASS] test_modifiers_agenteYEmpresa() (gas: 35184)
[PASS] test_nivelInvalido() (gas: 19306)
[PASS] test_okFalseConTier5NoPasa() (gas: 44407)
[PASS] test_persona_empresaYAgenteNuncaSonPersona() (gas: 48761)
[PASS] test_persona_modifiers() (gas: 30498)
[PASS] test_persona_niveles() (gas: 47977)
[PASS] test_persona_requireRevierteConTierYNivel() (gas: 52742)
[PASS] test_revocada() (gas: 24491)
[PASS] test_sinAtestacion() (gas: 30416)
[PASS] test_tercero_agenteAPersonaRevierteNotBusiness() (gas: 23882)
[PASS] test_tercero_agentePagaAEmpresa() (gas: 27714)
[PASS] test_tercero_botSinKyaRevierteAntesNotAgent() (gas: 19964)
[PASS] test_vencida_bordeExacto() (gas: 47205)
Suite result: ok. 18 passed; 0 failed; 0 skipped; finished in 259.24ms (268.16ms CPU time)

Ran 80 tests for test/Llave.t.sol:LlaveTest
[PASS] testFuzz_faseCoherente(uint64,uint64,uint64,bool,uint64) (runs: 512, μ: 2228992, ~: 2226360)
[PASS] testFuzz_reparto(uint8,uint16[5],uint256,uint16) (runs: 512, μ: 2491230, ~: 2485273)
[PASS] test_configurar_conPeriodoMinimoDeProduccion() (gas: 2201381)
[PASS] test_configurar_exigeMismoDueno() (gas: 25050)
[PASS] test_configurar_reemplazaLaConfig() (gas: 110367)
[PASS] test_configurar_revierte_herederoEsLaBoveda() (gas: 23059)
[PASS] test_configurar_soloElDueno() (gas: 20175)
[PASS] test_configurar_validaIgualQueElConstructor() (gas: 93076)
[PASS] test_constructor_cincoHerederosEsValido() (gas: 2268196)
[PASS] test_constructor_comisionMaximaEsValida() (gas: 2191328)
[PASS] test_constructor_guardaConfig() (gas: 62199)
[PASS] test_constructor_revierte_bpsCero() (gas: 83594)
[PASS] test_constructor_revierte_bpsDeOtroLargo() (gas: 81808)
[PASS] test_constructor_revierte_bpsNoSuman10000() (gas: 150756)
[PASS] test_constructor_revierte_ceroHerederos() (gas: 76264)
[PASS] test_constructor_revierte_comision101() (gas: 82061)
[PASS] test_constructor_revierte_comisionSinTesoreria() (gas: 79943)
[PASS] test_constructor_revierte_duenoCero() (gas: 82203)
[PASS] test_constructor_revierte_herederoCero() (gas: 80250)
[PASS] test_constructor_revierte_herederoEsLaBoveda() (gas: 81579)
[PASS] test_constructor_revierte_herederoIgualAlDueno() (gas: 80651)
[PASS] test_constructor_revierte_herederoRepetido() (gas: 80802)
[PASS] test_constructor_revierte_ordenDeChequeos() (gas: 147616)
[PASS] test_constructor_revierte_periodoMinimoCero() (gas: 81975)
[PASS] test_constructor_revierte_plazoMenorAlMinimo() (gas: 218407)
[PASS] test_constructor_revierte_seisHerederos() (gas: 81434)
[PASS] test_constructor_revierte_storeSinCodigo() (gas: 59813)
[PASS] test_constructor_revierte_tokenCero() (gas: 79718)
[PASS] test_constructor_sinComisionPermiteTesoreriaCero() (gas: 2189898)
[PASS] test_constructor_ultimaSenalEsNowYEmiteConfigurada() (gas: 2200735)
[PASS] test_depositar_deUnTerceroNoCancelaElReclamo() (gas: 238199)
[PASS] test_depositar_deUnTerceroNoEsSenal() (gas: 226675)
[PASS] test_depositar_delDuenoEsSenal() (gas: 134598)
[PASS] test_depositar_montoCero() (gas: 18430)
[PASS] test_ejecutable_estoyBienCancela() (gas: 60716)
[PASS] test_estado_enGracia() (gas: 47537)
[PASS] test_estoyBien_deOtroRevierteNoEsDueno() (gas: 19806)
[PASS] test_estoyBien_reiniciaElReloj() (gas: 25090)
[PASS] test_fase_activaAVencidaEnElBorde() (gas: 20168)
[PASS] test_gracia_cancelarYVolverAReclamar() (gas: 56713)
[PASS] test_gracia_configurarCancela() (gas: 80398)
[PASS] test_gracia_depositarDelDuenoCancela() (gas: 157488)
[PASS] test_gracia_estoyBienCancela() (gas: 47885)
[PASS] test_gracia_retirarCancela() (gas: 88230)
[PASS] test_gracia_transferirDuenoCancela() (gas: 61806)
[PASS] test_iniciarReclamo_agentePasaAEnGraciaYEmite() (gas: 39433)
[PASS] test_iniciarReclamo_antesDeTiempoRevierteSigueVivo() (gas: 24422)
[PASS] test_iniciarReclamo_botSinKyaRevierteNotAgent() (gas: 23658)
[PASS] test_iniciarReclamo_elGateVaAntesQueElReloj() (gas: 17833)
[PASS] test_iniciarReclamo_empresaTier4RevierteNotAgent() (gas: 23728)
[PASS] test_iniciarReclamo_herederoNoAgenteRevierteNotAgent() (gas: 44682)
[PASS] test_iniciarReclamo_segundoReclamoRevierte() (gas: 35952)
[PASS] test_iniciarReclamo_tambienEnEjecutableRevierteReclamoYaIniciado() (gas: 37212)
[PASS] test_liberada_noEsDuenoVaAntes() (gas: 172833)
[PASS] test_liberada_todoRevierteYaLiberada() (gas: 269027)
[PASS] test_liberar_atestacionRevocadaRevierteNotAgent() (gas: 43273)
[PASS] test_liberar_atestacionVencidaRevierteNotAgent() (gas: 180226)
[PASS] test_liberar_botRevierteNotAgent() (gas: 71155)
[PASS] test_liberar_ejemploA1() (gas: 192108)
[PASS] test_liberar_enGraciaRevierteGraciaEnCurso() (gas: 51714)
[PASS] test_liberar_otroAgenteTier5PuedeLiberar() (gas: 188688)
[PASS] test_liberar_parteCeroEmiteSinTransferir() (gas: 2363317)
[PASS] test_liberar_sinComision() (gas: 2379554)
[PASS] test_liberar_sinReclamoRevierte() (gas: 44304)
[PASS] test_liberar_sinSaldoRevierte() (gas: 2218517)
[PASS] test_liberar_todoEnUnaSolaTx() (gas: 187644)
[PASS] test_parteDe_antesYDespuesCoincideConLoRecibido() (gas: 194089)
[PASS] test_parteDe_polvoAlUltimoHeredero() (gas: 2470304)
[PASS] test_plazoMaximoNoRompeLecturas() (gas: 4411754)
[PASS] test_reentrancy_liberarBloqueaReentrada() (gas: 3232519)
[PASS] test_reentrancy_retirarBloqueaReentrada() (gas: 3170956)
[PASS] test_retirar_direccionCero() (gas: 20931)
[PASS] test_retirar_esGratisYReiniciaElReloj() (gas: 76652)
[PASS] test_retirar_montoCero() (gas: 20970)
[PASS] test_retirar_saldoInsuficiente() (gas: 26743)
[PASS] test_retirar_soloElDueno() (gas: 30628)
[PASS] test_retirar_todo() (gas: 65444)
[PASS] test_transferirDueno_invalidos() (gas: 42420)
[PASS] test_transferirDueno_ok() (gas: 43094)
[PASS] test_transferirDueno_revierte_aLaBoveda() (gas: 19199)
Suite result: ok. 80 passed; 0 failed; 0 skipped; finished in 376.31ms (494.74ms CPU time)

Ran 3 test suites in 378.66ms (639.69ms CPU time): 98 tests passed, 0 failed, 1 skipped (99 total tests)
```
<!-- /SALIDA_FORGE_TEST -->

## 7. ABI para la web

```bash
forge build && node script/export-abi.mjs          # o: node script/export-abi.mjs --out <carpeta de forge>
```

Genera en `web/src/abi/` (archivos **generados**, nadie los edita a mano):

| Archivo | Export |
|---|---|
| `Llave.ts` | `llaveAbi` (as const) |
| `MockPesos.ts` | `pesosAbi` (as const) |
| `KumplyStore.ts` | `kumplyStoreAbi`: solo `verify(address subject) → (bool verified, uint32 tier, uint64 timestamp, uint64 expiry)` |
| `deployments.fuji.json` | copia de `deployments/fuji.json` |

El script falla con un mensaje claro si falta el build o si el ABI no tiene lo que usan la web y el agente
(`liberar`, `iniciarReclamo`, `NotAgent`, `estado`, los eventos, etc.). No existe `LlaveEmergencia.ts`: la web
importa `llaveAbi` desde `./abi/Llave`.

## 8. Deploy y verificación en Fuji (un paso)

Variables (todas en `.env.example`, con comentarios):

| Variable | Para qué | Por defecto si está vacía |
|---|---|---|
| `FUJI_RPC_URL` | RPC de Fuji | — |
| `DEPLOYER_ACCOUNT` / `DEPLOYER_ADDRESS` | keystore y dirección del deployer (`--account` / `--sender`) | — |
| `KUMPLY_STORE` | AttestationStore oficial | `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` |
| `USAR_STORE_DEMO` | plan B: despliega `DemoAttestationStore` | `false` |
| `AGENTE_ADDRESS` | EOA del agente (con store demo recibe tier 5) | obligatoria con store demo |
| `AGENTES_EXTRA` / `EMPRESAS_EXTRA` | store demo: más cuentas tier 5 / tier 4 (separadas por comas) | ninguna |
| `STORE_DEMO_VIGENCIA_S` | vigencia de las atestaciones del store demo | 30 días |
| `PESOS_ADDRESS` | token de la bóveda | despliega `MockPesos` nuevo |
| `PERIODO_MINIMO` | piso de los plazos | `1` (demo); prod `2592000` |
| `DEMO_DUENO` | SA de Marta | el deployer (después `transferirDueno`) |
| `DEMO_HEREDEROS` / `DEMO_BPS` | herederos y porcentajes, separados por comas, mismo orden | obligatorias |
| `DEMO_INACTIVIDAD` / `DEMO_GRACIA` | plazos en segundos | `60` / `30` |
| `COMISION_BPS` / `TESORERIA` | comisión al liberar (máx. 100 = 1 %) y quién la recibe | `100` / el deployer |
| `DEMO_SIEMBRA` | saldo inicial (unidades mínimas); el deployer hace faucet + approve + depositar | `0` |
| `LLAVE_INSTANCIA` | `A` o `B`: bajo qué clave de `llave` sale la dirección en el fragmento JSON del log | `A` |

**Paso 0 — antes de desplegar: tier 5 para el agente en el store oficial.** El bonus KUMPLY ("una dirección que
pasa y otra bloqueada", on-chain) necesita que la EOA del agente (`AGENTE_ADDRESS`) esté atestada **tier 5** en el
AttestationStore oficial `0xa3Bc…22dD`. Los fixtures `0x9f8F…` / `0x7Fc6…` sirven solo para `cast call` y para el
fork (no tenemos sus claves). Pedírselo al staff de KUMPLY **ya**, y comprobarlo:

```bash
cast call 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD "verify(address)(bool,uint32,uint64,uint64)" $AGENTE_ADDRESS \
  --rpc-url $FUJI_RPC_URL     # → true, 5, <ts>, <expiry>   (anotar el expiry: hay que renovar antes)
```

Si no llega a tiempo, se usa el plan B (§10), que debilita el bonus porque ya no es el store oficial.

**Simulación local primero** (sin `--broadcast`, no gasta nada; anvil con el chainId de Fuji porque el script
exige 43113):

```bash
anvil --chain-id 43113 --port 8545 &
set -a && . ./.env.example && set +a
USAR_STORE_DEMO=true forge script script/DeployLlave.s.sol:DeployLlave --rpc-url http://127.0.0.1:8545
pkill anvil
```

Termina con `SIMULATION COMPLETE`, loguea store demo, MockPesos y Llave, comprueba que la Llave quedó **Activa**
con saldo = `DEMO_SIEMBRA` e imprime un **fragmento JSON con el esquema de `deployments/fuji.json`** (mismos nombres:
`attestationStoreEnUso`, `mockPesos`, `tesoreria`, `comisionBps`, `llave.<LLAVE_INSTANCIA>`, `demo`, `agente`).

**Deploy + verificación en Routescan en un solo comando:**

```bash
source .env
forge script script/DeployLlave.s.sol:DeployLlave --rpc-url fuji \
  --account $DEPLOYER_ACCOUNT --sender $DEPLOYER_ADDRESS --broadcast \
  --verify --verifier etherscan \
  --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --delay 15 --retries 10
```

Después:
1. Fusionar el fragmento JSON del log con `../deployments/fuji.json` (no reemplazar el archivo: el fragmento no trae
   `kumplyStore`, `actualizado`, `cuentas` ni la otra instancia). Por ejemplo, con el fragmento en `/tmp/frag.json`:
   `jq -s '.[0] * .[1]' ../deployments/fuji.json /tmp/frag.json > /tmp/f.json && mv /tmp/f.json ../deployments/fuji.json`.
   Después actualizar `actualizado` (ISO) y `cuentas.*`, y correr `jq empty ../deployments/fuji.json`.
2. `node script/export-abi.mjs` y commitear `web/src/abi/`.
3. Si el dueño quedó en el deployer: `cast send <LLAVE> "transferirDueno(address)" <SA_MARTA> --account $DEPLOYER_ACCOUNT --rpc-url $FUJI_RPC_URL`.
4. Comprobar `https://testnet.snowtrace.io/address/<LLAVE>#code` y `…/<MOCKPESOS>#code` en verde.
5. **Paymaster de 0xGasless (bonus "sin gas").** En el dashboard de 0xGasless, en la política de sponsorship / gas
   tank de Fuji, dar de alta las direcciones de la Llave A, la Llave B y `MockPesos`, con el gas tank cargado. Sin
   eso, las tx de la smart account de Marta (`faucet`, `approve`, `depositar`, `estoyBien`, `retirar`,
   `configurar`) no salen patrocinadas. Probar una tx de la SA de Marta antes de la demo.

## 9. Si la verificación falla: 3 alternativas

En este orden (primero con `MockPesos`, que no tiene argumentos de constructor):

1. **`--verifier custom`** con la misma URL y `--etherscan-api-key verifyContract`.
2. URL con sufijo **`/etherscan/api`**: `https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api`.
3. **A mano:** `forge flatten src/Llave.sol > flat.sol` y subirlo en https://routescan.io/verifycontract (o en la UI
   de testnet.snowtrace.io) con solc **0.8.28**, optimizer **200** runs, EVM **cancun**, licencia MIT.

Para verificar un contrato ya desplegado sin redeployar (los argumentos del constructor salen de la tx de creación):

```bash
forge verify-contract <LLAVE> src/Llave.sol:Llave --chain 43113 \
  --verifier etherscan --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --guess-constructor-args --rpc-url $FUJI_RPC_URL --watch
forge verify-contract <MOCKPESOS> src/MockPesos.sol:MockPesos --chain 43113 \
  --verifier etherscan --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --watch
```

## 10. Plan B declarado: store de atestaciones demo

Si el staff de KUMPLY no emite a tiempo el tier 5 a la EOA del agente, se despliega con `USAR_STORE_DEMO=true`:
el script crea un `DemoAttestationStore` (escrito de cero, con la **misma** regla de `verify` que el store real:
`(true, …)` solo si existe y `expiry > block.timestamp`), le emite tier 5 a `AGENTE_ADDRESS` (y a `AGENTES_EXTRA`)
y apunta la Llave a ese store. Para replicar las evidencias, se puede emitir tier 5 al fixture `0x9f8F…79A2`
(`AGENTES_EXTRA`) y tier 4 al fixture `0x7Fc6…DaE9` (`EMPRESAS_EXTRA`).

```bash
USAR_STORE_DEMO=true AGENTES_EXTRA=0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 \
EMPRESAS_EXTRA=0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 \
forge script script/DeployLlave.s.sol:DeployLlave --rpc-url fuji --account $DEPLOYER_ACCOUNT \
  --sender $DEPLOYER_ADDRESS --broadcast --verify --verifier etherscan \
  --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --delay 15 --retries 10
```

**Esto se declara** en `deployments/fuji.json` (`attestationStoreEnUso` ≠ `kumplyStore`) y en la descripción del PR
y de la entrega (el README raíz es compartido: el resumen de la raíz se coordina en el PR #2). Es un
plan B de tiempos, no un reemplazo de KUMPLY. Si la atestación real llega, se vuelve al store oficial con el mismo
comando y `USAR_STORE_DEMO=false`.

## 11. Instancias A y B

- **A** (demo en vivo): recién desplegada, Activa, 60 s de inactividad y 30 s de gracia.
- **B** ("pre-envejecida", plan B de tiempos): mismo comando. Se dejan pasar más de 60 s sin señal y el agente
  inicia el reclamo (`npm start` en `agente/` con `LLAVE_ADDRESS=<B>`, o a mano:
  `cast send <B> "iniciarReclamo()" --account agente --rpc-url $FUJI_RPC_URL`). Pasados 30 s más, B queda
  **Ejecutable** y lista para mostrar `liberar()`. Ojo: cualquier movimiento del dueño en B cancela el reclamo.
- Instancia con USDC de Fuji (opcional): `PESOS_ADDRESS=<USDC Fuji>` y un deployer con saldo (no tiene faucet).
  Ver límites (lista negra).

## 12. Evidencias con cast

Requieren una Llave desplegada (`LLAVE=<dirección>`) y `FUJI_RPC_URL`.

**Bot sin KYA bloqueado (tx revertida real).** `--gas-limit` evita que la estimación frene el envío, así la tx queda
en la cadena con estado *Fail*:

```bash
cast send $LLAVE "iniciarReclamo()" --gas-limit 300000 --account bot-sin-kya --rpc-url $FUJI_RPC_URL
# → status 0 (failed). Motivo: NotAgent(bot, 0)  — selector 0xbff04f04
```

**El gate en simulación, con los fixtures del store real** (`cast call` no manda tx):

```bash
# agente tier 5 (fixture KUMPLY): pasa el gate. Si la Llave está Vencida, la llamada no revierte;
# si todavía está Activa revierte con SigueVivo(venceEn), que se chequea DESPUÉS del gate.
cast call $LLAVE "iniciarReclamo()" --from 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 --rpc-url $FUJI_RPC_URL

# empresa tier 4 (fixture KUMPLY): NotAgent(0x7Fc6…DaE9, 4)
cast call $LLAVE "iniciarReclamo()" --from 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 --rpc-url $FUJI_RPC_URL

# sin atestación: NotAgent(0x…dEaD, 0)
cast call $LLAVE "iniciarReclamo()" --from 0x000000000000000000000000000000000000dEaD --rpc-url $FUJI_RPC_URL
```

Para leer el error de un revert: `cast decode-error <data> --sig "NotAgent(address,uint32)"`.
En Snowtrace, la tx de `iniciarReclamo`/`liberar` del agente real muestra el evento
`VerificadoKumply(agente, 5, 3)`: el mismo hash prueba que actuó un agente KUMPLY tier 5.

## 13. Lecturas útiles

```bash
cast call $LLAVE "fase()(uint8)" --rpc-url $FUJI_RPC_URL        # 0 Activa · 1 Vencida · 2 EnGracia · 3 Ejecutable · 4 Liberada
cast call $LLAVE "estado()((address,uint8,uint256,uint64,uint64,uint64,uint64,uint64,uint256,uint64,uint64,uint16,uint64))" --rpc-url $FUJI_RPC_URL
cast call $LLAVE "herederos()((address,uint16)[])" --rpc-url $FUJI_RPC_URL
cast call $LLAVE "parteDe(address)(uint256)" <HEREDERO> --rpc-url $FUJI_RPC_URL
cast call $LLAVE "venceEn()(uint64)" --rpc-url $FUJI_RPC_URL
cast call $LLAVE "isAgent(address)(bool)" <AGENTE> --rpc-url $FUJI_RPC_URL
cast call 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD "verify(address)(bool,uint32,uint64,uint64)" <AGENTE> --rpc-url $FUJI_RPC_URL
```

Orden de `estado()`: dueno, fase, saldo, ultimaSenal, venceEn, reclamoIniciadoEn, graciaTerminaEn, liberadaEn,
totalLiberado, plazoInactividad, plazoGracia, comisionBps, ahora.

## 14. Direcciones

Fuente de verdad: [`deployments/fuji.json`](../deployments/fuji.json) (la web lee la copia en `web/src/abi/`).

### Despliegue en Fuji

Desplegado el 7/11/2026 con `DeployLlave.s.sol` (dos corridas: A con el store oficial, B con `USAR_STORE_DEMO=true`
y `PESOS_ADDRESS` = el MockPesos de A). Deployer `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325`. Los cuatro contratos
quedaron **verificados** en Routescan/Snowtrace (`--verify --verifier etherscan`, primer intento).

| Contrato | Dirección | Explorer | Tx de deploy | Verificado |
|---|---|---|---|---|
| MockPesos (mPESO) | `0x866FD7C4B1c5d356c11840550483Ef3e415FA66E` | [código](https://testnet.snowtrace.io/address/0x866FD7C4B1c5d356c11840550483Ef3e415FA66E#code) | [`0x9228a39f…`](https://testnet.snowtrace.io/tx/0x9228a39fbfd175f84675c0631c42f141a34deceb4d5e03414c560fa117074c3b) | sí |
| Llave A (store oficial KUMPLY) | `0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA` | [código](https://testnet.snowtrace.io/address/0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA#code) | [`0xc19b2c84…`](https://testnet.snowtrace.io/tx/0xc19b2c8495ecafac8f5af6b88b8be8508d2bc5a44a848fe0921923089d9c0205) | sí |
| DemoAttestationStore (plan B) | `0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513` | [código](https://testnet.snowtrace.io/address/0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513#code) | [`0x7bdd1c86…`](https://testnet.snowtrace.io/tx/0x7bdd1c863f404bf390976e16e13e9edd6d46b51e50fb595a550c7c78f6f5a58c) | sí |
| Llave B (store demo) | `0xc74d36226ACABb11482455175919fbFF3936de37` | [código](https://testnet.snowtrace.io/address/0xc74d36226ACABb11482455175919fbFF3936de37#code) | [`0x1017c19c…`](https://testnet.snowtrace.io/tx/0x1017c19cb5c7e2b90a2a46f106a9a68800938af8c9f42fa300e8f475f60934a4) | sí |

Hashes completos de deploy:

- MockPesos: `0x9228a39fbfd175f84675c0631c42f141a34deceb4d5e03414c560fa117074c3b`
- Llave A: `0xc19b2c8495ecafac8f5af6b88b8be8508d2bc5a44a848fe0921923089d9c0205`
- DemoAttestationStore: `0x7bdd1c863f404bf390976e16e13e9edd6d46b51e50fb595a550c7c78f6f5a58c`
- Llave B: `0x1017c19cb5c7e2b90a2a46f106a9a68800938af8c9f42fa300e8f475f60934a4`

Configuración de las dos Llaves: dueño = deployer (provisorio, falta `transferirDueno` a la SA de Marta), herederos
placeholder `0x7099…79C8` (6000 bps) y `0x3C44…93BC` (4000 bps) — cuentas públicas de anvil, cambiarlas con
`configurar` cuando estén las SA reales —, 60 s de inactividad, 30 s de gracia, comisión 100 bps, tesorería = deployer,
siembra 1.000.000 mPESO cada una. El store demo emitió tier 5 al agente y al fixture `0x9f8F…79A2`, y tier 4 al
fixture `0x7Fc6…DaE9` (vigencia 30 días).

Comprobado con `cast call … "isAgent(address)(bool)"` después del deploy:

| Cuenta | Llave A (store oficial) | Llave B (store demo) |
|---|---|---|
| Agente `0x8739…CfCb` | `false` (tier 5 de KUMPLY pendiente) | `true` |
| Fixture agente tier 5 `0x9f8F…79A2` | `true` | `true` |
| Fixture empresa tier 4 `0x7Fc6…DaE9` | `false` | `false` |
| Sin atestación `0x…dEaD` | `false` | `false` |

| Qué | Dirección | Explorer |
|---|---|---|
| KUMPLY AttestationStore (oficial, Llave A) | `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` | [ver](https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD) |
| Store demo (Llave B) | `0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513` | [código](https://testnet.snowtrace.io/address/0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513#code) |
| Tesorería (1 %) | `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` | [ver](https://testnet.snowtrace.io/address/0x92893C663E74d6b1c6e551C17E7a35acaa9E8325) |
| Agente | `0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb` | [ver](https://testnet.snowtrace.io/address/0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb) |
| Fixture agente tier 5 | `0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2` | — |
| Fixture empresa tier 4 | `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` | — |
| Sin atestación | `0x000000000000000000000000000000000000dEaD` | — |

## 15. Solo `verify`, nunca la función deprecada

El gate usa **solo** `verify(address) → (ok, tier, ts, expiry)` y compara el tier **exacto**:
agente = `ok && tier == 5`. Nunca se usa la función deprecada del store que compara `tier >= N` (con esa regla, una
empresa o un agente pasarían como persona, y una cuenta de tier más alto que 5 pasaría como agente), ni
`checkCompliance` (es `payable`). Control: `grep -rnE 'has[T]ier' src test script` no devuelve nada en el código.

## 16. Límites conocidos

- **Token con lista negra (USDC):** si un heredero o la tesorería quedan bloqueados por el emisor, la transferencia
  revierte y `liberar()` falla entera (es todo o nada en la misma tx). Por eso la demo usa `MockPesos`.
- **Tokens transferidos directo** (sin `depositar`) quedan en la bóveda, **no** cuentan como señal de vida y se
  reparten al liberar (el saldo es `balanceOf` de la bóveda).
- **Después de `Liberada`** no se aceptan depósitos, retiros ni señales (`YaLiberada`). Es terminal. Tokens que
  alguien mande con `transfer` directo **después** de liberar quedan trabados en la bóveda (no hay barrido).
- **`transferirDueno`** rechaza `0`, el dueño actual, un heredero y la propia bóveda (`DireccionInvalida`).
- **Supuesto de confianza — disponibilidad del agente KUMPLY:** sin un agente tier 5 **vigente** nadie puede iniciar
  ni liberar, y el store es `immutable` (`kumply`). Si KUMPLY no renueva o revoca las atestaciones, o migra el
  AttestationStore, la herencia no se puede liberar: con el dueño fallecido, la plata queda en la bóveda (solo el
  dueño puede `retirar`). Operativamente: renovar la atestación del agente **antes** de su `expiry` (el store demo
  usa 30 días) y tener más de un agente tier 5 posible. Post-hackatón (solo agrega, no rompe la interfaz): una vía
  de respaldo, por ejemplo que un heredero pueda llamar `liberar()` pasado `graciaTerminaEn + N × plazoGracia`.
- **Tiempo:** todo usa `block.timestamp`. La C-Chain solo produce bloques con tx, así que `estado().ahora` puede
  atrasarse unos segundos respecto del reloj: la web y el agente simulan antes de mandar.
- **Tokens con fee-on-transfer o rebase:** no soportados (el evento `Depositado` registra el monto pedido).
- Sin emergencias, guardianes ni multifirma (fuera de alcance).

## 17. Qué se hizo hoy

- Contrato `Llave` (herencia por inactividad) sobre `KumplyGated`: solo un agente KUMPLY tier 5 inicia y libera;
  envío automático a todos los herederos en una tx, comisión del 1 % al liberar, retirar gratis, `_senal()` única.
- `MockPesos` y `DemoAttestationStore` para la demo y los tests.
- Tests con `DemoAttestationStore` + `vm.warp`: **98 en verde** (80 de la Llave + 18 de `KumplyGated`, con fuzz) y
  test fork contra el store real (`ForkFuji`, se corre con `FUJI_RPC_URL`).
- `DeployLlave.s.sol`: deploy en un comando con verificación en Routescan, plan B con store demo y siembra;
  comprueba el estado final y loguea el JSON para `deployments/fuji.json`. Probado en simulación contra
  `anvil --chain-id 43113`.
- `export-abi.mjs` y `web/src/abi/` generado (`llaveAbi`, `pesosAbi`, `kumplyStoreAbi`, `deployments.fuji.json`).
- `deployments/fuji.json` con el esquema final y direcciones en cero.
- Deploy y verificación en Fuji de MockPesos, Llave A (store oficial), DemoAttestationStore y Llave B (§14).
- Pendiente: tier 5 de KUMPLY para el agente (Llave A), `transferirDueno`/`configurar` con las SA reales y la
  evidencia del bot rebotando.

## 18. Para P2 y P3: cambios de interfaz (PR #2)

Nota para publicar en el PR #2 (no se tocan las carpetas de P2/P3):

- **ABI:** `import { llaveAbi } from "./abi/Llave"` (no existe `LlaveEmergencia.ts`); direcciones en
  `web/src/abi/deployments.fuji.json` (copia generada de `deployments/fuji.json`).
- **`tipos.ts` (§2.7):** se van guardianes, emergencias, `cobrar` y la fase `Repartiendo`. `Fase` pasa a
  `Activa | Vencida | EnGracia | Ejecutable | Liberada` (0…4) y `EstadoLlave` suma `liberadaEn`, `totalLiberado` y
  `comisionBps`.
- **`errores.ts`:** `NotAgent(bot, 0)` → "Este bot no es un agente verificado por KUMPLY"; `NotAgent(x, 4)` →
  "Es una empresa, no un agente"; `YaLiberada` → "La herencia ya se envió".
- **Secuencia del dueño con `sendBatchTransactions`:** `faucet` → `approve` → `depositar` (msg.sender = la smart
  account de 0xGasless). La Llave (A y B) y `MockPesos` tienen que estar en la política del paymaster
  (§8, paso 5).
