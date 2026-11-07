# Evidencias del agente en Avalanche Fuji

Testnet Fuji (chainId 43113), AVAX y mPESO de prueba. Prueba hecha el 7/11/2026 (hora -03:00).

## Qué se probó

El **programa** del agente (`agente/`, `npm start`), tal como está en `develop`, corriendo sin intervención contra
una Llave nueva, la **Llave D "prueba-agente"**. La Llave A y la Llave B no se tocaron: quedan para la demo en vivo.

Sin nadie que diera señales, el agente tenía que:

1. Detectar que pasaron los 60 s de inactividad y llamar `iniciarReclamo()`.
2. Esperar los 30 s de gracia y llamar `liberar()`, que cobra la comisión y reparte el saldo entre los herederos.
3. Avisar en cada paso (en esta prueba, solo por consola: sin Telegram ni mail).

**Resultado: lo hizo solo.** Las dos transacciones las firmó la EOA del agente, sin ningún `cast send` manual.

La prueba encontró un bug en la lectura de eventos (el RPC público de Fuji acepta como máximo 100 bloques por
`eth_getLogs`). No afectó a las transacciones, pero el agente no leía los eventos. Está arreglado en el PR #20
(`fix/agente-e2e`). Ver [Bug encontrado](#bug-encontrado).

## Llave D "prueba-agente"

| Campo | Valor |
|---|---|
| Dirección | [`0xfb7Ac560A4cf2A92358883896ef82543c93f6F5f`](https://testnet.snowtrace.io/address/0xfb7Ac560A4cf2A92358883896ef82543c93f6F5f#code) (verificada en Routescan: `Pass - Verified`) |
| Tx de deploy | [`0x65e6ca86…`](https://testnet.snowtrace.io/tx/0x65e6ca86051f122cb2cb1428b978b38feb4a0cd89472a5eccec08e464aae1fe2) (`DeployLlave.s.sol`, bloque 60695365) |
| Siembra | `approve` [`0x0dd885d0…`](https://testnet.snowtrace.io/tx/0x0dd885d0f1fc91209778a804181f9dde1b8fed460b1bc0d6f87819e667052899) y `depositar` [`0x5bdce7c5…`](https://testnet.snowtrace.io/tx/0x5bdce7c56ffc1ee94ec8bc5a9ab70ce42bddeb03f0a15eb478cdecb75ece76ec): 1.000 mPESO, a las 16:20:19 (bloque 60695365) |
| Store de atestaciones | `DemoAttestationStore` `0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513`, el mismo de la Llave B (`KUMPLY_STORE=<store demo>`, `USAR_STORE_DEMO=false`: no se desplegó otro store) |
| Token | MockPesos (mPESO) `0x866FD7C4B1c5d356c11840550483Ef3e415FA66E` |
| Dueño y tesorería | deployer `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` |
| Agente (tier 5) | `0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb` |
| Herederos | Lucía `0xE072386cb7eCF2a5C99f2FcB277c3618d9bA0269` (6000 bps) · Tomás `0xECbB281061653d71c0984A1d188376b2A8096ef8` (4000 bps) |
| Plazos y comisión | inactividad 60 s · gracia 30 s · comisión 100 bps (1 %) |

Quedó registrada en `deployments/fuji.json` como `llavePruebaAgente` (y su tx en `despliegue.llavePruebaAgente`).

## Transacciones del agente

| Paso | Hash | Bloque y hora del bloque | Resultado |
|---|---|---|---|
| `iniciarReclamo()` | [`0x09d92cdbb82a4a0f38e78f3451fc2b70d82354718967994efab264a44390c5f0`](https://testnet.snowtrace.io/tx/0x09d92cdbb82a4a0f38e78f3451fc2b70d82354718967994efab264a44390c5f0) | 60695399 · 16:21:29 (70 s después del depósito) | status 1, `from` = agente. Fase 2 (EnGracia) |
| `liberar()` | [`0x1cbb1bf6c597fd5d4c7931a0f831ae1ffb994583313f8f4128d081f78a9588b8`](https://testnet.snowtrace.io/tx/0x1cbb1bf6c597fd5d4c7931a0f831ae1ffb994583313f8f4128d081f78a9588b8) | 60695422 · 16:22:08 (39 s después) | status 1, `from` = agente. `ComisionCobrada`, 2 × `HerenciaEnviada`, `Liberada`. Fase 4 (Liberada) |

## Montos

| Cuenta | Antes | Después | Diferencia |
|---|---|---|---|
| Lucía `0xE072…0269` | 200.000 mPESO | 200.594 mPESO | **+594** (60 % de 990) |
| Tomás `0xECbB…6ef8` | 0 mPESO | 396 mPESO | **+396** (40 % de 990) |
| Tesorería `0x9289…8325` | 9.995 mPESO | 9.005 mPESO | −1.000 de la siembra, **+10** de comisión (1 %) |
| Llave D | 1.000 mPESO | 0 mPESO | vaciada |

Estado final: `fase()` = **4 (Liberada)**. Gas del agente: unos 0,00000000004 AVAX por las dos transacciones (el gas de Fuji estaba casi en cero).

## Log del agente (resumido)

Hora local del host. El aviso de eventos fallido, que se repetía cada 5 s, se muestra una sola vez.

```text
[16:21:26] Llave 0xfb7Ac560A4cf2A92358883896ef82543c93f6F5f · KUMPLY 0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513 · token mPESO
[16:21:27] Agente verificado tier 5: 0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb
[16:21:27] Canales: consola · cada 5000 ms · umbrales 30, 10 s
[16:21:27] ⚠ No se pudieron leer los eventos (se reintenta): Invalid parameters were provided to the RPC method.   ← bug, ver abajo
[16:21:27] Fase: Vencida (según la cadena: Activa).
[16:21:27] El bloque de la simulación es viejo; mando iniciarReclamo() con gas fijo (200000).
[16:21:28] Tx iniciarReclamo() enviada: 0x09d92cdbb82a4a0f38e78f3451fc2b70d82354718967994efab264a44390c5f0. Esperando confirmación…
[16:21:33] ✔ iniciarReclamo() confirmada en el bloque 60695399.
[16:21:33] 📣 Aviso al dueño — Tu Llave venció: período de gracia
[16:21:38] Fase: EnGracia (según la cadena: EnGracia).
[16:21:38] 📣 Aviso al dueño — Tu Llave está en período de gracia (hasta el 07/11 16:21:59)
[16:22:00] Fase: Ejecutable (según la cadena: EnGracia).
[16:22:00] liberar() todavía no corresponde (GraciaEnCurso); se reintenta en el próximo ciclo.
[16:22:07] Tx liberar() enviada: 0x1cbb1bf6c597fd5d4c7931a0f831ae1ffb994583313f8f4128d081f78a9588b8. Esperando confirmación…
[16:22:11] ✔ liberar() confirmada en el bloque 60695422.
[16:22:17] Fase: Liberada (según la cadena: Liberada).
[16:22:17] 📣 Aviso al dueño — Tu Llave envió la herencia
    Total: 1.000 mPESO. Comisión del servicio (1%): 10 mPESO. Recibieron: cuenta terminada en 0269: 594 mPESO;
    cuenta terminada en 6ef8: 396 mPESO. Comprobante: https://testnet.snowtrace.io/tx/0x1cbb1bf6…
[16:22:17] 📣 Aviso a los herederos — Recibiste una herencia de una Llave
```

El agente arrancó cuando la Llave ya estaba vencida (el deploy con verificación tardó más de 60 s), así que
`iniciarReclamo()` salió en el primer ciclo. Al ver el último bloque viejo, mandó la tx con gas fijo, como dice el
README, y entró bien. Con `liberar()` la simulación todavía daba `GraciaEnCurso` y el agente esperó un ciclo en vez
de forzarla. Ningún aviso se repitió.

Detalle menor: el primer aviso de gracia dice que termina a las 16:21:57 y el segundo, a las 16:21:59. El primero
calcula la hora con el reloj local y el segundo usa `graciaTerminaEn` de la cadena. No cambia ninguna decisión.

## Bug encontrado

En cada ciclo, `leerEventos()` fallaba con `Invalid parameters were provided to the RPC method`. El RPC público
`https://api.avax-test.network/ext/bc/C/rpc` acepta como máximo **100 bloques (inclusive) por `eth_getLogs`** y
contesta `block range too large: ... exceeds the maximum of 100 blocks`. El agente pedía tramos de 2.000. Por eso
no logueaba `ReclamoIniciado`, `HerenciaEnviada` ni `Liberada`, y no avanzaba `ultimoBloque` en la memoria. El
comprobante del aviso final salió igual, porque el agente lo guarda del recibo de su propia tx.

**Arreglo:** `TRAMO_LOGS` pasa de `2_000n` a `100n` en `agente/src/index.ts`. Está en el PR
[#20](https://github.com/dav1dchaparro/hackatwin/pull/20) (`fix(agente): leer eventos de a 100 bloques…`).
Typecheck y 75 tests en verde. Con el arreglo, `DRY_RUN=true` contra la Llave D lee todos los eventos:

```text
[16:23:42] Evento: señal de vida del dueño.
[16:23:42] Evento: se abrió la gracia (agente 0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb). Termina el 07/11 16:21:59.
[16:23:42] Evento: herencia enviada a 0xE072386cb7eCF2a5C99f2FcB277c3618d9bA0269 (594 mPESO).
[16:23:42] Evento: herencia enviada a 0xECbB281061653d71c0984A1d188376b2A8096ef8 (396 mPESO).
[16:23:42] Evento: Llave liberada. Comprobante 0x1cbb1bf6c597fd5d4c7931a0f831ae1ffb994583313f8f4128d081f78a9588b8.
[16:23:42] Fase: Liberada (según la cadena: Liberada).
```

## Cómo se corrió

La clave del agente no se escribió en ningún archivo. Se descifró del keystore de Foundry en el mismo proceso que
lanza el agente y solo vivió en su entorno:

```bash
cd agente && npm ci
AGENTE_PRIVATE_KEY="$(cast wallet decrypt-keystore <KEYSTORE_AGENTE> | awk '{print $NF}')" \
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc \
LLAVE_ADDRESS=0xfb7Ac560A4cf2A92358883896ef82543c93f6F5f \
POLL_MS=5000 AVISOS_UMBRALES_S=30,10 DRY_RUN=false \
npm start
```

`cast wallet decrypt-keystore` pide la contraseña por un prompt oculto (o la toma de `CAST_UNSAFE_PASSWORD`).

## Comando para la demo (Llave B)

La Llave B (`0xc74d36226ACABb11482455175919fbFF3936de37`) usa el mismo store demo, donde el agente tiene tier 5.
Al 7/11 a las 16:23 estaba en **fase 1 (Vencida)**: apenas arranca, el agente llama `iniciarReclamo()` y, 30 s
después, `liberar()`. Si en la demo se quiere mostrar la gracia primero, el dueño tiene que tocar "Estoy bien"
antes de arrancar el agente.

```bash
cd agente
npm ci                       # incluye el arreglo del PR #20 una vez mergeado
AGENTE_PRIVATE_KEY="$(cast wallet decrypt-keystore <KEYSTORE_AGENTE> | awk '{print $NF}')" \
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc \
LLAVE_ADDRESS=0xc74d36226ACABb11482455175919fbFF3936de37 \
POLL_MS=5000 AVISOS_UMBRALES_S=30,10 DRY_RUN=false \
WEB_URL=<URL_DE_LA_WEB> \
TELEGRAM_BOT_TOKEN=<TOKEN_DEL_BOT> TELEGRAM_CHAT_ID_DUENO=<CHAT_ID_DEL_DUENO> \
npm start                    # Ctrl+C para apagarlo limpio
```

- Telegram, `WEB_URL` y el mail (`RESEND_API_KEY`, `EMAIL_DE`, `EMAIL_DUENO`, `EMAILS_HEREDEROS`) son opcionales.
  Sin credenciales, los avisos salen igual por consola.
- Alternativa equivalente: completar `agente/.env` (ignorado por git) a partir de `.env.example`. Nunca subir la
  clave al repo.
- Antes de la demo, comprobá el tier y el gas del agente:

  ```bash
  cast call 0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513 "verify(address)(bool,uint32,uint64,uint64)" \
    0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb --rpc-url https://api.avax-test.network/ext/bc/C/rpc   # → true, 5, …
  cast balance 0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb --ether --rpc-url https://api.avax-test.network/ext/bc/C/rpc
  ```

- `agente/estado/memoria.json` guarda los avisos enviados por Llave. Si cambia `LLAVE_ADDRESS`, la memoria arranca
  vacía sola, así que no hace falta borrarla.
