# Respuestas de KUMPLY y 0xGasless (sin stand: sacadas de su documentación)

Sáb 7/11/2026, ~14:30. En el evento no hay stand de KUMPLY ni de 0xGasless, así que las preguntas de `PLAN_CONSTRUCCION_LLAVE.md` §8.4 y A2 se respondieron con la documentación oficial y el repo público de KUMPLY. Lo que la documentación no dice queda marcado **[SIN VERIFICAR]**.

## KUMPLY

| Pregunta | Respuesta | Fuente |
|---|---|---|
| ¿Quién emite las atestaciones de demo en Fuji? | **El equipo de KUMPLY, a mano**: "KUMPLY's own team issues them directly, with no document check". No hay formulario para pedirlas | [blog de KUMPLY](https://kumply.xyz/blog/building-with-kumply-kyc-kyb-kya) |
| ¿Hay un flujo self-service? | **Sí, para billeteras que se conectan al sitio**: en [kumply.xyz/verify](https://kumply.xyz/verify) se conecta la billetera, se hace el chequeo de identidad de Sumsub (en modo sandbox) y un webhook emite `issueAttestation` en Fuji sobre esa dirección. Niveles: `basic-kyc`=1, `standard-kyc`=2, `enhanced-kyc`=3, `business-kyb`=4, `agent-kya`=5. Dice "only takes a few minutes" [SIN VERIFICAR: si el sandbox aprueba solo y cuánto tarda de verdad] | `kumplyprotocol/Kumply`: `apps/api/src/index.ts`, `apps/web/src/app/api/webhook/route.ts`, `pitch-deck.ts` ("Identity checks currently run on Sumsub's sandbox tier") |
| ¿Atestan smart accounts? | **Sí**: "Attestations are keyed by the exact address that signs or is sponsored". Hay que atestar la dirección de la smart account, no la EOA. **Pero** el flujo self-service atesta la billetera conectada, y una smart account de 0xGasless no se puede conectar al sitio: las SA solo se pueden atestar a mano por el equipo de KUMPLY | [kumply.xyz/developers](https://kumply.xyz/developers) |
| ¿Hay tier 5 (agente) para la mejora 5? | Solo lo emite el equipo de KUMPLY. Según su litepaper, `agent-kya` no está configurado en Sumsub, así que no sale por self-service | `LITEPAPER.md` §4.1 |
| ¿Cómo se los contacta? | `hello@kumply.xyz` (está en su `SECURITY.md`) y los issues del repo (plantilla "SDK question"). La documentación no lista Telegram ni Discord | `kumplyprotocol/Kumply` |
| Direcciones | `AttestationStore` Fuji `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` · `ComplianceGate` Fuji `0xcFDd…64cF` (no lo usamos: deja pasar tier 4 y 5 como persona) | kumply.xyz/developers |

## 0xGasless

| Pregunta | Respuesta | Fuente |
|---|---|---|
| ¿Cómo se consigue la API key? | Self-service: se crea un proyecto en [dashboard.0xgasless.com](https://dashboard.0xgasless.com) y se copia la key. Paymaster: `https://paymaster.0xgasless.com/v1/43113/rpc/<API_KEY>`. Fuji requiere `@0xgasless/core` ≥ 1.2.0 | [quickstart](https://docs.0xgasless.com/core/getting-started/quickstart) |
| ¿Patrocina en Fuji sin depósito? | El PDF del track dice que 0xGasless da API keys y créditos de paymaster gratis (free tier de 1.500 wallets). La documentación del paymaster habla de depósito, pero no menciona créditos de testnet [SIN VERIFICAR hasta que P2 mande la primera tx] | PDF del track · [paymasters](https://docs.0xgasless.com/accountabstraction/core-concepts/paymasters/) |
| ¿Hay políticas de patrocinio? | **Sí, cuatro:** patrocinio global, **lista de contratos permitidos**, límite de tx por usuario por día y límite de precio de gas. **No hay** lista de direcciones que envían (sender) ni webhook | [paymasters](https://docs.0xgasless.com/accountabstraction/core-concepts/paymasters/) |
| ¿Se puede el combo +20? | **No con el dashboard**: no hay política "solo cuentas verificadas por KUMPLY". El único paymaster que chequea KUMPLY es el *lane* KUMPLY+0xGasless, que **solo patrocina tier 5 (agentes)**, y su URL "la comparte el equipo de KUMPLY con los participantes de los workshops". → **No se reclama el combo**, salvo que KUMPLY nos dé el lane y un tier 5 | [cómo decide el lane](https://docs.0xgasless.com/partners/kumply/how-it-works/) · [quickstart del lane](https://docs.0xgasless.com/partners/kumply/quickstart/) |
| ¿Pre-alta de wallet por email? | No está documentado → roadmap | quickstart |
| ¿El bundler acepta userOps que revierten? | No está documentado → la web **siempre simula antes** (ya está en el plan) | paymasters |

## Qué hacemos con esto (actualizado 15:10, alcance "solo herencia" de P1)

Desde el cambio de alcance, KUMPLY verifica **al agente** (tier 5) y no a los herederos. El self-service de kumply.xyz/verify ya no sirve: da niveles de persona, y `agent-kya` no está configurado.

1. **Pedido a KUMPLY por escrito, ya:** mail a `hello@kumply.xyz` (y si no responden, issue en el repo) pidiendo tier 5 para el agente `0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb` en Fuji, y la URL del lane KUMPLY+0xGasless. Preguntar también a la organización (Twin / Team1) si hay alguien de KUMPLY en el evento.
2. **Plan B ya desplegado:** la Llave B usa el `DemoAttestationStore` (agente con tier 5) y anda hoy. Se declara en el README.
3. **Evidencia con el store oficial aunque no llegue el tier 5:** en la Llave A, el agente sin atestación es una dirección **bloqueada** real (`NotAgent(agente, 0)`) contra el store de KUMPLY. Y el fixture `0x9f8F…79A2` (tier 5 en el store oficial) **pasa** en una simulación (`cast call --from`), sin tx real porque nadie tiene su clave.
4. **Dashboard de 0xGasless:** usar la política de **lista de contratos permitidos** (`Llave` A, `Llave` B y `MockPesos`) y contarlo en el README.
5. **Combo +20:** solo si KUMPLY nos da el tier 5 **y** la URL del lane. Si no, no se reclama.
