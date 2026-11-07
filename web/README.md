# Web de Llave de Emergencia

Vite + React + TypeScript + viem. Login con email y transacciones sin gas con **0xGasless** (embedded wallet +
smart account ERC-4337 + paymaster), identidad con **KUMPLY** (`@kumply/sdk`), todo en **Avalanche Fuji (43113)**.

- `web/src/lib/` (P2): integración web ↔ contrato, sesión 0xGasless, KUMPLY, errores en castellano. **Este README.**
- `web/src/pages`, `components`, `mock` (P3): pantallas y mock con la misma máquina de estados.
- `web/src/abi/` (P1): ABI generado con `contracts/script/export-abi.mjs` + `deployments.fuji.json`. Nadie lo edita a mano.

## Correr la web

```bash
cd web
npm ci
cp .env.example .env.local        # completar VITE_OXGASLESS_API_KEY (ver abajo)
npm run dev                       # http://localhost:5173
npm run build                     # tsc + vite → dist/
```

Requisitos: Node 20+ (probado con 22). `.env.local` está ignorado por git: **ninguna API key va al repo**.

## Variables (`web/.env.example`)

| Variable | Para qué | Si está vacía |
|---|---|---|
| `VITE_MODO` | `mock` (pantallas con el mock de P3) o `fuji` (contrato real) | `mock`; si no existe `web/src/mock/cliente-mock.ts`, usa Fuji igual |
| `VITE_CHAIN_ID` / `VITE_RPC_URL` / `VITE_EXPLORER` | Fuji 43113, RPC público, Snowtrace testnet | valores por defecto de Fuji |
| `VITE_LLAVE_ADDRESS` | instancia de `LlaveEmergencia` | `deployments.fuji.json → llave.A` |
| `VITE_PESOS_ADDRESS` | `MockPesos` | `deployments.fuji.json → mockPesos` |
| `VITE_KUMPLY_STORE` | `AttestationStore` de KUMPLY (o el `DemoAttestationStore` del plan B) | `fuji.json → attestationStoreEnUso`, y si no el oficial `0xa3Bc…22dD` |
| `VITE_OXGASLESS_API_KEY` | API key del proyecto Fuji en el dashboard de 0xGasless | sin login: la web solo lee |
| `VITE_OXGASLESS_BUNDLER_URL` / `VITE_OXGASLESS_PAYMASTER_URL` | bundler y paymaster del dashboard | `https://bundler.0xgasless.com/43113` y `https://paymaster.0xgasless.com/v1/43113/rpc/<API key>` [SIN VERIFICAR] |
| `VITE_PAYMASTER_URL` | solo si el staff habilita un lane de patrocinio para personas (combo KUMPLY + 0xGasless) | se usa el paymaster de arriba |
| `VITE_POLITICA_PATROCINIO` | `off` apaga la política del cliente (P2-8) | activa |

**Cambiar de instancia sin recompilar:** `http://localhost:5173/?llave=0x…` (y `?pesos=0x…`). Prioridad:
`?llave=` > `VITE_LLAVE_ADDRESS` > `deployments.fuji.json`. Para la instancia B "pre-envejecida" de la demo, otra pestaña con `?llave=<B>`.

## Cómo se usa 0xGasless (bonus 0xGasless core)

1. **Entrar con email.** `entrar()` abre el widget de 0xGasless (email + código). La clave privada vive en AWS KMS dentro del
   iframe del widget; la web solo recibe el email y una EOA firmante.
2. **Smart account.** `setupSmartAccount()` deriva la cuenta ERC-4337 (SA) de esa EOA. **La SA es la cuenta del usuario**:
   es la que ve el contrato como `msg.sender` y la que KUMPLY tiene que atestar. (La EOA del KMS no se usa para nada más.)
3. **Toda tx es una userOp patrocinada.** `enviar(calls[])` → `sendTransaction` (1 llamada) o `sendBatchTransactions`
   (varias, ej. `faucet + approve + depositar` en una sola userOp) con `PaymasterMode.SPONSORED`. La web **nunca firma con
   una EOA** ni pide AVAX. Captura para el README: AVAX de la SA = 0 (el panel lo muestra).
4. **Simular antes de mandar.** Cada escritura hace `simulateContract` con `account = SA`. Si revierte, el error se traduce
   a castellano (`errores.ts`) y **no se manda nada** al bundler. Si pasa, se mide el tiempo hasta el receipt (`ms`,
   incluye el bundler) y `msFinal = 0`: en Avalanche la inclusión es la finalidad.
5. **Sesión tras F5.** El widget recuerda el login; la web guarda `{email, SA, alias}` en `localStorage` y `reconectar()`
   re-arma el cliente en silencio al cargar (muestra el widget solo si pide algo).
6. **Política de patrocinio en el cliente (P2-8).** Antes de mandar, la web exige que la SA sea la dueña de la llave o pase
   `isPersonAtLeast(sa, 2)`; si no, muestra *"Tu cuenta tiene que estar verificada para operar sin gas."*
   **No es un paymaster**: no se reclama el combo +20 salvo que el staff habilite un lane real (`VITE_PAYMASTER_URL`).

Variables que se leen en `config.ts`: `VITE_OXGASLESS_API_KEY`, bundler y paymaster. Nunca `hasTier()`.

## Cómo se usa KUMPLY (bonus KUMPLY core)

`lib/kumply.ts` usa `@kumply/sdk` (`KumplyClient({ network: "fuji", contractAddress })`): `verify()`,
`isPersonAtLeast(cuenta, 2)` e `isBusiness(cuenta)`. Misma regla que `KumplyGated` en el contrato: **persona** = ok y
2 ≤ tier ≤ 3; **empresa** = ok y tier == 4. Si el SDK falla, el fallback a `verify()` del store con viem es **declarado**:
`fuente: "contrato"` + warning en consola (nada silencioso).

Fixtures públicos de Fuji verificados con el SDK el 7/11/2026 (`FIXTURES_KUMPLY`):

| Dirección | Resultado | Uso |
|---|---|---|
| `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` | tier 3, persona, vence 17/07/2027 | badge verde |
| `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` | tier 4, empresa (la "Clínica") | destino de emergencia |
| `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` | sin atestación hoy (tier 0) | badge rojo / bloqueado |

Las atestaciones de las cuentas de la demo (Lucía, Pablo, Rosa, Marta) las emite el staff de KUMPLY sobre las **smart
accounts** (no sobre las EOAs). Son de DEMO, sin KYC real.

## Para P3: cómo usar la lib

```ts
import { cliente, config, aliasDe, onSesion } from "../lib";

const e = await cliente.estado();          // fase, saldo, venceEn, ahoraCadena (reloj de la cadena)…
const r = await cliente.estoyBien();       // ResultadoTx: { ok, hash, url, ms } o { ok:false, error:{ nombre, mensaje } }
const off = cliente.escucharEventos((ev) => console.log(ev.nombre, ev.args, ev.url));   // polling cada 2 s
```

- `cliente` es `LlaveCliente` (`lib/tipos.ts`, congelado): mock o Fuji según `VITE_MODO`.
- Mostrar `error.mensaje` tal cual y `error.nombre` en chico. `MENSAJE_SIN_GAS` es el texto de la política P2-8.
- Cuenta regresiva: usar `estado.ahoraCadena` (no `Date.now()`) y `config.margenSegundos`.
- `EstadoLlave.comisionBps` / `tesoreria` vienen cuando P1 publica el ABI v2 (A1); hasta entonces `undefined`.
- `EmergenciaVista.vigente === false` → "Caducó" (mejora 17).
- Chips: `fuenteKumply()` para "KUMPLY (sdk)" y `ResultadoTx.patrocinada` para "gas pagado por 0xGasless".

## Panel de integración (provisional)

`src/lib/dev/PanelIntegracion.tsx` (hoy montado en `App.tsx`; P3 lo reemplaza o lo deja en `/integracion`):
entrar/salir con email, dirección de la SA y su AVAX, los 9 métodos de escritura, `faucet()` como 1.ª tx patrocinada,
estado/herederos/guardianes/emergencias en vivo, eventos y semáforo KUMPLY.

Pasos de P2-1 con el panel: entrar con el email de Marta → copiar la smart account → salir → repetir con Lucía, Pablo y Rosa
→ pasar las 4 direcciones (solo públicas) por el PR #2 para que P4 pida las atestaciones y P1 las cargue en el constructor.

## ABI

Hasta que P1 corra `export-abi.mjs`, la lib usa `src/lib/abi-llave.ts`: ABI escrito a mano con `parseAbi` desde la
interfaz congelada (§2.2) + mejoras 1-5 + comisión A1. Cuando exista `src/abi/LlaveEmergencia.ts`, se cambia el import en
`cliente-fuji.ts` y `errores.ts` y se borra el provisional. Lo que el contrato no tenga (ej. `comisionBps()` en el ABI v1)
se detecta en runtime y se trata como "no soportado", sin romper nada.

## Keeper de avisos

`keeper/` (carpeta aparte): script Node + viem que lee `estado()` cada 5 s y avisa por Telegram antes del vencimiento,
al iniciarse un reclamo y al heredero que no pasa `isPersonAtLeast`. Ver `keeper/README.md`.
