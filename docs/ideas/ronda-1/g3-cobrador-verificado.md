# Cobrador con credencial

**Antes de pagarle al "estudio" que te escribe por una deuda, tu celular chequea en 2 segundos que el bot es un agente KYA cuyo dueño es la empresa KYB a la que le debés. El pago va directo a esa empresa y te deja un libre deuda on-chain.**

*(Generador G3 · Ronda 1. Rutas relativas a `ideas/`.)*

## Problema
Con la mora en récord, las fintech ceden o tercerizan sus carteras y la cobranza llega por WhatsApp, SMS y bots. El deudor no puede distinguir al cobrador real del estafador que pide transferir a un alias. Y cuando paga, se queda sin una prueba simple de que la deuda se canceló.

## Usuario concreto
**Brian, 29, repartidor en Quilmes.** Debe 3 cuotas de un préstamo de billetera. La misma semana le escriben dos "estudios jurídicos" distintos, los dos con amenaza de embargo y un alias para transferir.

## Evidencia
- Mora de familias con billeteras: 29,6 % en mayo de 2026; 5,8 M de personas en mora (CEPA/BCRA, Sitio Andino 28/7/2026, en `ronda-0/DOLORES.md` #9).
- Denuncias por "acoso" en la Defensa del Consumidor bonaerense: 393 (2024), 1.064 (2025) y 1.237 solo entre enero y mayo de 2026. La nota describe la "simulación de notificaciones judiciales" y amenazas de embargo sin respaldo judicial (Sitio Andino, 3/8/2026): https://www.sitioandino.com.ar/sociedad/las-deudas-ya-no-solo-preocupan-la-mora-crecen-las-denuncias-amenazas-y-hostigamiento-las-cobranzas-n5727612
- Proyecto de ley (ago. 2026) para regular la cobranza extrajudicial; menciona la "cesión y tercerización de carteras de deudores" de fintech y billeteras (iProfesional, 18/8/2026): https://www.iprofesional.com/legales/462539-proyecto-ley-cobranza-proteger-familias-hostigamiento
- Falsos estudios que piden pagar deudas inexistentes a un alias por WhatsApp: [SIN VERIFICAR]. Lo vi en resúmenes del buscador; la nota de MDZ ("embargos falsos y amenazas: la mafia de la cobranza digital") devolvió 403.
- Que la cobranza ya use bots de IA: [SIN VERIFICAR].

## Solución (3 frases)
La fintech acreedora tiene credencial KYB (nivel 4) y registra a su bot de cobranza como agente ERC-8004 con dueño = la fintech, más credencial KYA (nivel 5). Cada mensaje trae un link a una deuda en el contrato **CajaDeCobro**, y la app de Brian verifica tres cosas: `isAgent(bot)`, que `ownerOf(agentId)` sea el acreedor y `isBusiness(acreedor)`. Brian paga la cuota en ARGt al contrato, la plata va al acreedor (con la comisión del estudio repartida automáticamente) y queda el evento `LibreDeuda(deudaId)`, que cualquiera puede consultar.

## Momento wow (30 s)
Dos celulares con dos mensajes casi iguales. El de "Estudio Fantasma" sale en rojo ("este agente no tiene dueño verificado"). El de "Cobranzas FinX" sale en verde. Brian paga la cuota y en el explorador de Fuji aparece el libre deuda con su número de deuda.

## Quién paga
El acreedor o el estudio, con una comisión por cuota cobrada a través del contrato. Su incentivo: menos denuncias por "trato indigno" y más pagos de deudores que hoy desconfían [SIN VERIFICAR: que los mensajes verificados se paguen más]. Para el deudor es gratis.

## Qué sponsor la amaría y por qué
- **KUMPLY:** usa KYA atado a un dueño KYB, que es justo su diseño de "owner attestation" (`refs/Kumply/LITEPAPER.md` §4.1), resuelto con ERC-8004 + niveles 4 y 5 que ya existen.
- **Belo / Twin:** cobros cotidianos en pesos; ARGt como medio de pago, sin rendimiento.
- **BitGo:** identidad y auditoría del agente. **Team1:** ERC-8004 en Fuji.
- No es "pagos por chat" (saturado #6): el chat solo trae el link; lo nuevo es verificar quién está detrás del bot.

## Qué se reutiliza
- `isAgent`, `isBusiness`, `verify`: `refs/Kumply/packages/sdk/src/client.ts`.
- Dueño del agente con `ownerOf(agentId)`: `refs/hackatwin-x402-team1-avalanche/packages/agent-kit/src/identity/erc8004-identity.ts`; dirección del registro en Fuji en `refs/hackatwin-x402-team1-avalanche/packages/chains/registry/fuji.json` (entrada `erc8004Identity`).
- "Tarjeta" del agente (dueño y reputación): `refs/hackatwin-x402-team1-avalanche/demos/01-x402-twin/identity-card.ts`.
- Reparto entre acreedor y estudio: `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol` y `script/DeployRevenueSplitter.s.sol`.
- Opcional: la cuota como recurso x402 (`/deuda/123` responde 402 con el monto) para que también la pague el agente del deudor: `demos/01-x402-twin/adapters/seller-app.ts`.
- **A construir:** contrato CajaDeCobro (registro de deuda, pago y evento) y pantalla verde/roja. Riesgo: billeteras con KYB y KYA reales en Fuji (el nivel `agent-kya` no está configurado en Sumsub; ver `ronda-0/SPONSORS.md` #7).

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** Casi sí. Alcanza con un link firmado al dominio oficial de la fintech y con pagar desde su app, que ya conoce la deuda. El libre deuda lo puede emitir la fintech en PDF. Lo que se pierde: un registro abierto de agentes de cobranza entre empresas y un libre deuda que se valida sin depender del acreedor.
- **¿Ya existe?** WhatsApp ya muestra una insignia de empresa verificada con Meta Verified ([WhatsApp Business](https://whatsappbusiness.com/es-la/resources/resource-library/meta-verified-business/)). El BCRA deja consultar deudas por CUIT/CUIL ([texto ordenado de centrales](https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-ceninf.pdf)). La nota de MDZ sobre la "mafia de la cobranza digital" la vi solo en el resumen del buscador ([MDZ](https://www.mdzol.com/consumidores/embargos-falsos-y-amenazas-la-mafia-la-cobranza-digital-n1337635)) [SIN VERIFICAR].
- **¿Billetera cripto?** Brian está en mora y es repartidor: no tiene ARGt ni billetera, y va a pagar por la app de la billetera o por transferencia. Encima tiene que instalar "la app que verifica", y el estafador le puede mandar un link a una app verificadora trucha. Es el mismo problema de confianza.
- **¿Fuji en 12 h?** El contrato `CajaDeCobro` es simple. Lo más riesgoso: KYA real no hay (el nivel `agent-kya` no está configurado en Sumsub, LITEPAPER §4.1), así que la luz verde sale de `WorkshopKYA`, donde cualquiera emite tiers. Falta definir cómo se ata la billetera del bot a su `agentId` de ERC-8004 en Fuji (`0x8004A818...`, `packages/chains/registry/fuji.json`).
- **¿ARGt y KUMPLY?** KUMPLY (KYA + KYB) es el núcleo. ARGt está pegado: la deuda es en pesos, pero se paga igual con cualquier token y el usuario real no lo tiene. x402 es opcional.
- **Debilidad más grave:** el deudor no usa cripto y la verificación KYA real todavía no existe, así que el verde de la demo es de juguete.

## Usuario
Soy Brian, repartidor en Quilmes. Un cartel verde que me diga cuál es el cobrador de verdad me sirve, porque esta semana me escribieron dos y no sé a cuál creerle.
No entiendo qué es un "agente KYA", ni por qué tengo que bajarme otra app y comprar ARGt si la deuda la pago desde la misma billetera donde la saqué.
No pagaría nada: el que me debe cobrar es el que tiene que pagar.
Me da miedo que el link de la "app que verifica" también sea trucho, y que el libre deuda on-chain no lo acepte nadie cuando lo necesite.
