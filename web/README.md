# Llave · web

Vite + React + TypeScript + viem. La dueña entra con su **email** y opera **sin gas** con **0xGasless** (embedded wallet +
smart account ERC-4337 + paymaster). La identidad del agente la verifica **KUMPLY** (`@kumply/sdk`, tier 5). Todo en
**Avalanche Fuji (43113)**. Alcance: **herencia por inactividad** (sin emergencias ni guardianes).

Pantallas: `/` (entrar), `/dueno`, `/heredero` (solo lectura), `/demo` (panel para el proyector) y `/integracion`
(panel de P2 contra Fuji, sin diseño).

- `web/src/lib/` (P2): integración web ↔ contrato, sesión 0xGasless, KUMPLY, errores en castellano. **Este README.**
- `web/src/pages`, `components`, `mock`, `styles` (P3): pantallas y mock con la misma máquina de estados.
- `web/src/abi/` (P1): ABI generado con `contracts/script/export-abi.mjs` + `deployments.fuji.json`. Nadie lo edita a mano.
- `agente/` (P1): el agente KUMPLY tier 5 que vigila, avisa e inicia el reclamo / libera. No es parte de la web.

## Correr la web

```bash
cd web
npm ci
cp .env.example .env.local        # completar VITE_OXGASLESS_API_KEY (ver abajo); VITE_MODO=mock no necesita nada más
npm run dev                       # http://localhost:5173
npm run build                     # tsc + vite → dist/
```

Requisitos: Node 20+ (probado con 22). `.env.local` está ignorado por git: **ninguna API key va al repo**.

## Variables (`web/.env.example`)

| Variable | Para qué | Si está vacía |
|---|---|---|
| `VITE_MODO` | `mock` (pantallas con el mock de P3) o `fuji` (contrato real) | `mock`; si el mock no existe o no está listo, usa Fuji igual |
| `VITE_CHAIN_ID` / `VITE_RPC_URL` / `VITE_EXPLORER` | Fuji 43113, RPC público, Snowtrace testnet | valores por defecto de Fuji |
| `VITE_LLAVE_ADDRESS` | instancia de `Llave` | `deployments.fuji.json → llave.A` |
| `VITE_PESOS_ADDRESS` | `MockPesos` | `deployments.fuji.json → mockPesos` |
| `VITE_AGENTE_ADDRESS` | EOA del agente tier 5 (chip "agente verificado ✓") | `deployments.fuji.json → cuentas.agente` |
| `VITE_KUMPLY_STORE` | `AttestationStore` de KUMPLY (o el `DemoAttestationStore` del plan B) | `fuji.json → attestationStoreEnUso`, y si no el oficial `0xa3Bc…22dD` |
| `VITE_OXGASLESS_API_KEY` | API key del proyecto Fuji en el dashboard de 0xGasless | sin login: la web solo lee |
| `VITE_OXGASLESS_BUNDLER_URL` / `VITE_OXGASLESS_PAYMASTER_URL` | bundler y paymaster del dashboard | `https://bundler.0xgasless.com/43113` y `https://paymaster.0xgasless.com/v1/43113/rpc/<API key>` [SIN VERIFICAR] |
| `VITE_PAYMASTER_URL` | solo si el staff habilita otro lane de patrocinio | se usa el paymaster de arriba |
| `VITE_POLITICA_PATROCINIO` | `off` apaga el chequeo "solo la dueña opera desde la web" (P2-8) | activa |

**Cambiar de instancia sin recompilar:** `http://localhost:5173/dueno?llave=0x…` (y `?pesos=0x…`). Prioridad:
`?llave=` > `VITE_LLAVE_ADDRESS` > `deployments.fuji.json`. Para la instancia B "pre-envejecida" de la demo, otra pestaña con `?llave=<B>`.

## Cómo se usa 0xGasless (bonus 0xGasless core)

1. **Entrar con email.** `entrar()` abre el widget de 0xGasless (email + código). La clave privada vive en AWS KMS dentro del
   iframe del widget; la web solo recibe el email y una EOA firmante.
2. **Smart account.** `setupSmartAccount()` deriva la cuenta ERC-4337 (SA) de esa EOA. **La SA es la cuenta de la dueña**:
   es la que ve el contrato como `msg.sender` (`dueno`). La EOA del KMS no se usa para nada más.
3. **Toda tx de la dueña es una userOp patrocinada.** `enviar(calls[])` → `sendTransaction` (1 llamada) o
   `sendBatchTransactions` (varias, ej. `faucet + approve + depositar` en una sola userOp) con `PaymasterMode.SPONSORED`.
   La web **nunca firma con una EOA** ni pide AVAX. Captura para el README: AVAX de la SA = 0 (el panel lo muestra).
4. **Simular antes de mandar.** Cada escritura hace `simulateContract` con `account = SA`. Si revierte, el error se traduce
   a castellano (`errores.ts`) y **no se manda nada** al bundler. Si pasa, se mide el tiempo hasta el receipt (`ms`,
   incluye el bundler) y `msFinal = 0`: en Avalanche la inclusión es la finalidad.
5. **Sesión tras F5.** El widget recuerda el login; la web guarda `{email, SA, alias}` en `localStorage` y `reconectar()`
   re-arma el cliente en silencio al cargar (muestra el widget solo si pide algo).
6. **Política en el cliente (P2-8).** Antes de mandar, la web exige que la SA sea la dueña de la Llave; si no, muestra
   *"Esta cuenta no es la dueña de esta Llave: solo ella puede operar desde acá."* **No es un paymaster**: el combo +20
   se juega con el gas del agente (lane tier 5 de KUMPLY + 0xGasless), no desde la web.

Los herederos **no necesitan cuenta**: reciben la plata en su dirección cuando el agente libera. `/heredero` es solo lectura.

## Cómo se usa KUMPLY (bonus KUMPLY core)

`lib/kumply.ts` usa `@kumply/sdk` (`KumplyClient({ network: "fuji", contractAddress })`): `verify()`, `isAgent()`,
`isPersonAtLeast(cuenta, 2)` e `isBusiness(cuenta)`. Misma regla que `KumplyGated` en el contrato: **agente** = ok y
tier == 5 (el gate de `iniciarReclamo()` y `liberar()`); **persona** = ok y 2 ≤ tier ≤ 3; **empresa** = ok y tier == 4.
Nunca `hasTier()`. Si el SDK falla, el fallback a `verify()` del store con viem es **declarado**: `fuente: "contrato"` +
warning en consola (nada silencioso).

Fixtures públicos de Fuji verificados con el SDK el 7/11/2026 (`FIXTURES_KUMPLY`):

| Dirección | Resultado | Uso |
|---|---|---|
| `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` | tier 3, persona, vence 17/07/2027 | badge verde persona |
| `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` | tier 4, empresa | "es una empresa, no un agente" |
| `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` | sin atestación hoy (tier 0) | bot bloqueado |

La atestación **tier 5** del agente la emite el staff de KUMPLY sobre la EOA del agente (`agente/`, P1). Es de DEMO, sin
KYA real. La web la muestra con `cliente.agente()`.

## Para P3: cómo usar la lib

```ts
import { cliente, config, aliasDe, onSesion } from "../lib";

const e = await cliente.estado();          // fase, saldo, venceEn, graciaTerminaEn, liberadaEn, comisionBps, ahoraCadena…
const r = await cliente.estoyBien();       // ResultadoTx: { ok, hash, url, ms } o { ok:false, error:{ nombre, mensaje } }
await cliente.configurar({ herederos, bps, plazoInactividad: 60, plazoGracia: 30 });   // presets A3: los bps suman 10.000
const off = cliente.escucharEventos((ev) => console.log(ev.nombre, ev.args, ev.url));   // polling cada 2 s
const a = await cliente.agente?.();        // { cuenta, alias, verificacion: { esAgente, tier, fuente } } | null
```

- `cliente` es `LlaveCliente` (`lib/tipos.ts`): mock o Fuji según `VITE_MODO`.
- Fases: `Activa | Vencida | EnGracia | Ejecutable | Liberada` (índice = enum del contrato).
- Mostrar `error.mensaje` tal cual y `error.nombre` en chico.
- Cuenta regresiva: usar `estado.ahoraCadena` (no `Date.now()`) y `config.margenSegundos`.
- Comisión: `estado.comisionBps / 100` % ("Comisión Llave: 1% al liberar"); `herederos[i].parte` ya es el neto.
- Chips: `fuenteKumply()` para "KUMPLY (sdk)" y `ResultadoTx.patrocinada` para "gas pagado por 0xGasless".

## ABI

`src/lib/abi-llave.ts` tiene el ABI escrito con `parseAbi` desde `contracts/src/Llave.sol` (da los tipos). En runtime,
si P1 corrió `export-abi.mjs` y existe `src/abi/Llave.ts`, se usa el generado; si no, el provisional. No hay que cambiar
imports (`ABI_GENERADO` dice cuál está activo).
