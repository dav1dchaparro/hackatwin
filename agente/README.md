# Agente KUMPLY de la Llave

Proceso en Node que cuida una Llave en Avalanche Fuji. Mira el reloj, le avisa al dueño por Telegram y mail, y
cuando corresponde abre el período de gracia y envía la herencia. Firma con una cuenta propia (EOA) que KUMPLY
verificó como agente (tier 5).

## Por qué hace falta

La blockchain no tiene cron. El contrato `Llave` sabe cuándo venció el plazo, pero no puede hacer nada solo:
alguien tiene que mandar una transacción. Este agente:

1. **Vigila.** Cada `POLL_MS` lee `estado()` de la Llave y calcula la fase con su propio reloj (ver más abajo).
2. **Avisa.** Mientras la Llave está activa, le recuerda al dueño que toque "Estoy bien" cuando quedan
   `AVISOS_UMBRALES_S` segundos (un aviso por umbral, que no se repite). Si vence, le avisa que empezó la gracia y
   cómo cancelarla. Al final les avisa al dueño y a los herederos cuánto recibió cada uno, con el comprobante.
3. **Ejecuta.** Con el plazo vencido llama a `iniciarReclamo()`. Cuando termina la gracia llama a `liberar()`,
   que en la misma transacción cobra la comisión y reparte el saldo entre todos los herederos.

El contrato solo acepta `iniciarReclamo()` y `liberar()` de un **agente KUMPLY tier 5**
(`verify(agente)` → `ok && tier == 5`). Un bot sin verificar recibe `NotAgent(bot, 0)` y una empresa (tier 4)
recibe `NotAgent(x, 4)`. Por eso la dirección del agente tiene que estar atestada con tier 5 en el
AttestationStore de KUMPLY (`0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` en Fuji) o, como plan B de la demo, en el
`DemoAttestationStore` que despliega `DeployLlave.s.sol` con `USAR_STORE_DEMO=true`.

Si el agente no es tier 5, arranca igual en **modo solo avisos**: avisa, pero no puede abrir la gracia ni liberar.
La primera vez que el contrato lo rechaza le manda al dueño un único aviso ("el agente no está verificado por
KUMPLY (tier N)"). Después no reintenta en loop: vuelve a probar cada 5 minutos, por si lo verifican.

## Cómo decide

`src/decision.ts` exporta `decidir(estado, ahoraLocal, memoria, umbrales, contexto)`, una función pura sin red ni
LLM. Toma como hora el **máximo entre `estado.ahora` (timestamp del último bloque) y el reloj local**. La C-Chain
no produce bloques si no hay transacciones, así que el último bloque puede tener minutos de atraso.

| Fase         | Qué hace                                                                    |
| ------------ | --------------------------------------------------------------------------- |
| `Activa`     | Recordatorio al dueño por umbral y por señal, con link a `WEB_URL/dueno`.   |
| `Vencida`    | `iniciarReclamo()` y aviso al dueño con la hora de fin de la gracia.        |
| `EnGracia`   | Aviso único: "cancelalo tocando Estoy bien".                                |
| `Ejecutable` | `liberar()`.                                                                |
| `Liberada`   | Aviso único al dueño y a los herederos, con montos y comprobante.           |

Antes de mandar, `src/ejecutor.ts` simula la transacción (`simulateContract`) y decodifica el error si revierte.
Si el error es `SigueVivo` o `GraciaEnCurso` pero el reloj local ya pasó el plazo por 2 segundos, la manda igual
con gas fijo (200k para iniciar, 600k para liberar): la simulación usó un bloque viejo y el bloque nuevo trae la
hora real. Si esa tx forzada igual revierte on-chain (el reloj del host va adelantado), no la vuelve a forzar con
el mismo plazo hasta 60 s después (`PAUSA_FORZADA_MS`), para no quemar AVAX en cada ciclo; si mientras tanto la
simulación pasa, la manda normal. Con `DRY_RUN=true` simula y loguea, pero no manda nada.

Los avisos se redactan con plantillas en castellano y sin jerga cripto (`src/redaccion.ts`). Si hay
`ANTHROPIC_API_KEY`, se reescriben con Claude (`claude-opus-5-5`, 5 segundos como máximo). Si falla, tarda o
pierde algún número o link, o si **agrega** un link, dominio o dirección `0x` que no estaba (anti-phishing), se usa
la plantilla. **Ninguna decisión depende del LLM.**

Los avisos ya enviados se guardan en `agente/estado/memoria.json`, que está ignorado por git. Así no se repiten
si reiniciás el agente.

## Cómo correrlo

Necesitás Node 22.12 o más nuevo.

**Paso 0 — tier 5 en KUMPLY.** Antes de la demo, pedile al staff de KUMPLY la atestación **tier 5** para la EOA del
agente en el store oficial y comprobala (si no, el agente arranca en "modo solo avisos"):

```bash
cast call 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD "verify(address)(bool,uint32,uint64,uint64)" <AGENTE> \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc     # → true, 5, <ts>, <expiry>
```

La atestación vence (`expiry`): renovarla antes. Plan B: `USAR_STORE_DEMO=true` en el deploy (ver
`contracts/README.md` §10).

```bash
cd agente
npm install
cp .env.example .env         # completalo: FUJI_RPC_URL, LLAVE_ADDRESS, AGENTE_PRIVATE_KEY…
npm start                    # Ctrl+C para apagarlo limpio (guarda la memoria)
```

- `LLAVE_ADDRESS` está en `deployments/fuji.json` (`llave.A`).
- `AGENTE_PRIVATE_KEY` va **solo** en `agente/.env`, que git ignora. Nunca la pongas en otro archivo. La cuenta
  necesita AVAX de Fuji para el gas (faucet: <https://faucet.avax.network>).
- Para probar sin clave y sin mandar nada:

  ```bash
  DRY_RUN=true FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc LLAVE_ADDRESS=0x… npm start
  ```

Al arrancar, el agente lee `kumply()` de la Llave y `verify(agente)` en ese store. Si da tier 5, loguea
`Agente verificado tier 5`. Si no, loguea `Modo solo avisos`.

### Variables

| Variable                                  | Para qué                                                              |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `FUJI_RPC_URL`                            | RPC de Fuji (C-Chain 43113).                                          |
| `LLAVE_ADDRESS`                           | Contrato Llave a vigilar.                                             |
| `AGENTE_PRIVATE_KEY`                      | Clave de la EOA tier 5. Obligatoria salvo con `DRY_RUN=true`.         |
| `POLL_MS`                                 | Cada cuánto mira la Llave, en milisegundos (5000 por defecto).        |
| `AVISOS_UMBRALES_S`                       | Segundos restantes en los que se le recuerda al dueño (`30,10`).      |
| `WEB_URL`                                 | Base de la web; el dueño entra en `WEB_URL/dueno`.                    |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_DUENO` | Avisos al dueño por Telegram (opcional).                         |
| `RESEND_API_KEY`, `EMAIL_DE`, `EMAIL_DUENO`    | Mails vía Resend (opcional).                                     |
| `EMAILS_HEREDEROS`                        | `0xcuenta:mail,…`: a quién avisarle cuando se envía la herencia. Solo se usa el mail de las cuentas que son herederas on-chain (`herederos()`). |
| `ANTHROPIC_API_KEY`                       | Reescritura opcional de los avisos con Claude.                        |
| `DRY_RUN`                                 | `true` = simula y avisa, pero no manda transacciones.                 |

La consola siempre muestra los avisos. Si un canal no tiene credenciales, se saltea con un log y el agente sigue
andando.

### Crear el bot de Telegram

1. En Telegram, abrí [@BotFather](https://t.me/BotFather), mandá `/newbot` y elegí nombre y usuario. Te devuelve
   el token, que va en `TELEGRAM_BOT_TOKEN`.
2. Desde la cuenta del dueño, abrí el bot y mandale cualquier mensaje (por ejemplo `/start`).
3. Buscá el chat id:

   ```bash
   curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates" | jq '.result[].message.chat.id'
   ```

   Ese número va en `TELEGRAM_CHAT_ID_DUENO`.

## Tests

```bash
npm run typecheck
npm test
```

Los tests cubren `decidir()` en cada fase, que los umbrales no repitan avisos y que mande el reloj local cuando el
bloque está atrasado. También cubren `NotAgent` sin reintentos en loop, el envío con gas fijo y su pausa si
revierte, `DRY_RUN`, las plantillas, la reescritura con vuelta a la plantilla (también si agrega links o cuentas),
los canales (el mail solo a herederos on-chain), la memoria y la configuración inválida.

`test/abi.test.ts` compara cada función, evento y error de `src/abi.ts` con el ABI completo del contrato: el que
genera `forge build` (`contracts/out/Llave.sol/Llave.json`) o, si no se compiló (clon limpio, CI), el versionado
en `web/src/abi/Llave.ts`. Solo se saltea si no hay ninguno; con `CI` definido, en ese caso falla.

## Estructura

```
src/
  index.ts        arranque, chequeo KUMPLY, loop, eventos y apagado limpio (SIGINT/SIGTERM)
  config.ts       lee y valida el entorno (mensajes en castellano; la clave nunca se loguea)
  abi.ts          subconjunto del ABI con parseAbi
  cadena.ts       clientes viem para Fuji, lecturas y decodificación de reverts
  decision.ts     decidir(): función pura
  ejecutor.ts     simula, decide si mandar (gas fijo, NotAgent, DRY_RUN) y espera el recibo
  redaccion.ts    plantillas y reescritura opcional con Claude
  memoria.ts      avisos enviados, último bloque y comprobante (estado/memoria.json)
  avisos/         canales: consola, Telegram (Bot API) y mail (Resend)
test/             vitest
```
