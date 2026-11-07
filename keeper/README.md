# keeper

Script off-chain (Node 20+, `viem`, sin framework) que vigila una **Llave de Emergencia** en Avalanche Fuji y avisa por Telegram:

- ⏳ a la dueña, cuando faltan `UMBRALES_SEGUNDOS` para que venza la señal de vida (demo: 30 y 10 s);
- ⚠️ a la dueña, cuando la Llave venció y un heredero verificado ya puede reclamar;
- 🚨 a la dueña, cuando un heredero inició un reclamo (con la hora límite para cancelarlo) y ✅ cuando lo canceló;
- 🪪 a cada heredero sin verificar en KUMPLY, para que verifique su identidad antes de cobrar.

Usa la hora de la cadena (`estado().ahora`), no la del reloj local.

## Setup del bot (5 min)

1. En Telegram, abrí [@BotFather](https://t.me/BotFather), mandá `/newbot`, elegí nombre y usuario. Te da un **token**: va en `TELEGRAM_BOT_TOKEN`.
2. La dueña (y cada heredero, si querés avisos directos) abre el bot y le manda `/start`.
3. Sacá los `chat_id`:

   ```sh
   cd keeper
   npm install
   cp .env.example .env   # completá el token
   npm run chat-id
   ```

   Muestra `chat_id`, nombre y último texto de cada chat que habló con el bot. Pegá el de la dueña en `TELEGRAM_CHAT_ID_DUENO` y los de los herederos en `TELEGRAM_CHAT_ID_HEREDEROS` (`tomas=123,lucia=456`).

## Variables (`keeper/.env`)

| Variable | Qué es |
| --- | --- |
| `FUJI_RPC_URL` | RPC de Fuji (por defecto el público de Ava Labs). |
| `LLAVE_ADDRESS` | Dirección del contrato. **Obligatoria.** |
| `WEB_URL` | Base de los links de los avisos (`/dueno`, `/heredero`). |
| `TELEGRAM_BOT_TOKEN` | Token del bot. Si falta, modo seco: los avisos se imprimen por consola con `[sin token]`. |
| `TELEGRAM_CHAT_ID_DUENO` | chat_id de la dueña. |
| `TELEGRAM_CHAT_ID_HEREDEROS` | Opcional, `alias=chat_id,...`. Si falta un heredero, su aviso va al chat de la dueña con prefijo `[para alias]`. |
| `UMBRALES_SEGUNDOS` | Segundos antes del vencimiento en los que se avisa (`30,10`). |
| `ALIAS` | Opcional, `alias=0x...,...` para mostrar nombres en vez de direcciones. |
| `INTERVALO_MS` | Cada cuánto consulta el contrato (5000). |

Nunca commitees el `.env`: `keeper/.gitignore` ignora `.env*` salvo `.env.example`.

## Correrlo

```sh
cd keeper
npm run avisos
```

Imprime una línea por ciclo (`14:22:05 fase=Activa faltan=47s saldo=0.5 AVAX reclamo=no`) y cada aviso que manda. Un fallo del RPC no lo mata; `Ctrl+C` lo apaga limpio. Typecheck: `npm run typecheck`.

## Nota

No hay cron on-chain; el contrato usa `block.timestamp` (recomendación de Ava Labs para la C-Chain) y este keeper off-chain avisa antes del vencimiento. En producción: Chainlink CRE o un relayer propio, y los tres canales (Telegram, WhatsApp, email).
