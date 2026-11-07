# Evidencias on-chain en Avalanche Fuji

Testnet Fuji (chainId 43113), AVAX y mPESO de prueba. Generadas el 7/11/2026 sobre una instancia propia, la
**Llave C "evidencias"**, para no tocar la Llave A ni la Llave B, que quedan reservadas para la demo en vivo.

## Llave C "evidencias"

| Campo | Valor |
|---|---|
| Dirección | [`0x4caa8250Fb4BA06472Dd100d134f32E8364eB8ef`](https://testnet.snowtrace.io/address/0x4caa8250Fb4BA06472Dd100d134f32E8364eB8ef#code) (verificada en Routescan) |
| Tx de deploy | [`0xc1f74c76…`](https://testnet.snowtrace.io/tx/0xc1f74c76c49c12d3e60d98d6631ba44e4a53d0617087b4540c0f08cdb0e2958a) (`DeployLlave.s.sol`, bloque 60692725) |
| Store de atestaciones | `DemoAttestationStore` `0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513` (plan B declarado; el agente tiene tier 5) |
| Token | MockPesos (mPESO) `0x866FD7C4B1c5d356c11840550483Ef3e415FA66E` |
| Dueño y tesorería | deployer `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` |
| Agente (tier 5) | `0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb` |
| Herederos | `0x6382b31D4F54D4F91001DE9Dd8854Ed1532cDFBA` (6000 bps) · `0x00C45F72090019D08eea30df83eDC8b90CeD0fD8` (4000 bps). Direcciones nuevas de `cast wallet new`, solo para recibir: sus claves no se guardaron. |
| Plazos y comisión | inactividad 60 s · gracia 30 s · comisión 100 bps (1 %) |
| Siembra | 1.000.000 mPESO (faucet + approve + depositar en el mismo script) |

## Tabla de evidencias

| Evidencia | Hash | Link | Resultado |
|---|---|---|---|
| Bot sin verificar rebotado on-chain: el deployer (no es agente) llama `iniciarReclamo()` con la Llave ya **Vencida**, forzado con `--gas-limit 200000` | `0x37924752aa10fde00a041b0bf548519423dcc15bd9ac8e81ebe14dd78eac78ac` | [ver tx](https://testnet.snowtrace.io/tx/0x37924752aa10fde00a041b0bf548519423dcc15bd9ac8e81ebe14dd78eac78ac) | **status 0 (Fail)**, bloque 60692772. Revert `0xbff04f04` = `NotAgent(0x92893C663E74d6b1c6e551C17E7a35acaa9E8325, 0)`. El store devolvió `(false, 0, 0, 0)` |
| Ciclo 1/3: el dueño da señal de vida `estoyBien()` (reinicia el reloj) | `0x1728d311612b3a95a5e58a5b7469b8620c4e493ddb61177281da3e8c307df734` | [ver tx](https://testnet.snowtrace.io/tx/0x1728d311612b3a95a5e58a5b7469b8620c4e493ddb61177281da3e8c307df734) | status 1, bloque 60692776. Fase vuelve a 0 (Activa), evento `SenalDeVida` |
| Ciclo 2/3: pasados 60 s, el agente tier 5 llama `iniciarReclamo()` | `0xcb60329fa47e0019f33c8a560ad24bb9d0a192f849fd6fe630591c64e89f2a44` | [ver tx](https://testnet.snowtrace.io/tx/0xcb60329fa47e0019f33c8a560ad24bb9d0a192f849fd6fe630591c64e89f2a44) | status 1, bloque 60692824. Eventos `VerificadoKumply(agente, 5, 3)` y `ReclamoIniciado`. Fase 2 (EnGracia) |
| Ciclo 3/3: pasados 30 s de gracia, el agente llama `liberar()` | `0x75c06818c9fa708b1a78d49a801ba369c168aba3a931fb4836337ca4bf82d3da` | [ver tx](https://testnet.snowtrace.io/tx/0x75c06818c9fa708b1a78d49a801ba369c168aba3a931fb4836337ca4bf82d3da) | status 1, bloque 60692838. `VerificadoKumply(agente, 5, 3)`, 2 × `HerenciaEnviada`, `ComisionCobrada`, `Liberada`. Fase 4 (Liberada), bóveda en 0 |
| Finalidad 1/5: `transfer` de 1 mPESO | `0xddae24ba7f83416a6a5d6cbae0fb839a099f4939ce69d83480bd604e4d6b037d` | [ver tx](https://testnet.snowtrace.io/tx/0xddae24ba7f83416a6a5d6cbae0fb839a099f4939ce69d83480bd604e4d6b037d) | status 1 · 3230 ms |
| Finalidad 2/5: `transfer` de 1 mPESO | `0x5d791619fe51fbdcc8b82d73d66871e7ac170a1a875ec279f8db92d7327e96c3` | [ver tx](https://testnet.snowtrace.io/tx/0x5d791619fe51fbdcc8b82d73d66871e7ac170a1a875ec279f8db92d7327e96c3) | status 1 · 3538 ms |
| Finalidad 3/5: `transfer` de 1 mPESO | `0x1778b6b4caccf2ac725712d57f9850fe429c93d7a9da18d435f7f6c8a469cb27` | [ver tx](https://testnet.snowtrace.io/tx/0x1778b6b4caccf2ac725712d57f9850fe429c93d7a9da18d435f7f6c8a469cb27) | status 1 · 3422 ms |
| Finalidad 4/5: `transfer` de 1 mPESO | `0x84d01e12e5d09595cf22585baa2b7f2c6eb4fcd9240706ac985730c979751f23` | [ver tx](https://testnet.snowtrace.io/tx/0x84d01e12e5d09595cf22585baa2b7f2c6eb4fcd9240706ac985730c979751f23) | status 1 · 3300 ms |
| Finalidad 5/5: `transfer` de 1 mPESO | `0x52a002b29e401b151abe10f5dde37dcdc302ec5a359c8fd8ee8b102c222d9b5a` | [ver tx](https://testnet.snowtrace.io/tx/0x52a002b29e401b151abe10f5dde37dcdc302ec5a359c8fd8ee8b102c222d9b5a) | status 1 · 3345 ms |

### Cómo se comprobó el rebote del bot

```bash
cast receipt 0x37924752aa10fde00a041b0bf548519423dcc15bd9ac8e81ebe14dd78eac78ac status --rpc-url $FUJI_RPC_URL
# → false (status 0)
cast run 0x37924752aa10fde00a041b0bf548519423dcc15bd9ac8e81ebe14dd78eac78ac --rpc-url $FUJI_RPC_URL
# → verify(0x9289…8325) en el store → (false, 0, …) · Revert custom error 0xbff04f04
cast decode-error 0xbff04f04<datos> --sig "NotAgent(address,uint32)"
# → 0x92893C663E74d6b1c6e551C17E7a35acaa9E8325, 0
```

`cast 4byte-decode` no encuentra el selector en la base pública de firmas (es un error propio), por eso se decodifica
con la firma explícita `NotAgent(address,uint32)`. La tx no hizo nada: el gate de agente se chequea primero y la
Llave siguió **Vencida** hasta que el dueño dio señal de vida en la tx siguiente.

## Montos repartidos por `liberar()`

Saldo de la bóveda: 1.000.000 mPESO. Leídos con `cast call <MockPesos> "balanceOf(address)(uint256)"` antes y
después de la tx (todos arrancaban en 0).

| Destino | Dirección | Recibió |
|---|---|---|
| Heredero 1 (60 %) | `0x6382b31D4F54D4F91001DE9Dd8854Ed1532cDFBA` | **594.000 mPESO** (`594000000000000000000000`) |
| Heredero 2 (40 %) | `0x00C45F72090019D08eea30df83eDC8b90CeD0fD8` | **396.000 mPESO** (`396000000000000000000000`) |
| Tesorería (comisión 1 %) | `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` | **10.000 mPESO** (`10000000000000000000000`) |
| Bóveda (Llave C) | `0x4caa8250Fb4BA06472Dd100d134f32E8364eB8ef` | queda en **0** |

Todo en una sola transacción, sin intervención del dueño ni de los herederos.

## Finalidad medida

Tiempo de pared desde que se lanza `cast send` hasta que devuelve el receipt (`date +%s%3N` antes y después), para
`liberar()` (3482 ms) y las 5 transferencias de mPESO:

| Muestras | p50 | Máximo | Mínimo |
|---|---|---|---|
| 6 (liberar + 5 transfer) | **≈ 3,4 s** (3384 ms) | **3,54 s** (3538 ms) | 3,23 s (3230 ms) |

Aclaración honesta: es una cota superior de la finalidad, no la finalidad pura. Incluye la latencia del RPC público
(`api.avax-test.network`), las consultas previas que hace `cast send` (nonce, gas, chainId), la firma con el keystore
y el intervalo de sondeo del receipt. En Avalanche un bloque aceptado ya es final (no hay reorgs), así que cuando
llega el receipt la tx es irreversible.
