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

## Qué hacemos con esto

1. **Pedido a KUMPLY por escrito, ya:** mail a `hello@kumply.xyz` (y si no responden, issue en el repo) con las 4 SA cuando P2 las publique. Preguntar también a la organización (Twin / Team1) si hay alguien de KUMPLY en el evento.
2. **Probar el self-service ahora** con una billetera EOA del equipo (MetaMask o Core) en kumply.xyz/verify, nivel `standard-kyc`. Si en pocos minutos da tier 2, tenemos una dirección que **pasa** con el store oficial. Plan posible para el equipo: Lucía cobra desde esa EOA (esa acción paga gas, el resto sigue sin gas) y se conserva el bonus KUMPLY con el store real.
3. **Tomás (la dirección bloqueada)** no depende de nadie: funciona con el store oficial.
4. **Dashboard de 0xGasless:** usar la política de **lista de contratos permitidos** (solo `LlaveEmergencia` y `MockPesos`) y contarlo en el README.
5. **Combo +20:** no se reclama. Mejora 5 (agente tier 5): no sale sin el equipo de KUMPLY.
6. **15:00:** si no hay atestaciones sobre las SA, plan B (store demo de P1, declarado). Ojo: con el store demo el gate ya no lee KUMPLY, así que conviene que al menos una prueba (Tomás bloqueado, y si sale el punto 2, Lucía) quede con el store oficial.
