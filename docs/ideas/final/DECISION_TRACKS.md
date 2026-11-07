# DECISIÓN FINAL – tracks e idea (sáb 7/11, ~9:55)

**TL;DR**
1. Vamos con **Mandato ("Al contrato no lo chamuyan"), recortado**: el agente de IA de Diego paga los remedios de Nelly en **ARGt**, y los límites (tope por pago, tope semanal en pesos, lista de comercios, veto) los aplica el contrato, no el agente.
2. **Vamos a los dos tracks**: el mismo contrato se despliega en Fuji (para Avalanche, con KUMPLY y 0xGasless) y en C-Chain mainnet con ARGt real (para Twin). Stablecoins es solo un deploy más y nunca le saca horas al núcleo.
3. **Cortes:** si a las 12:00 no hay verde/rojo en Fuji, pasamos a Seña Segura (el KIT de anoche). Si a las 13:00 no tenemos ARGt de Twin en una billetera, o a las 15:30 no hay hash en mainnet, abandonamos Stablecoins.

## Por qué esta y no otra
- Es la única idea que pega en el centro de los dos jurados. En Avalanche es la mejor estimada, ~85-92 contra ~81-91 de Seña: KYA (`isAgent`) es la prioridad core de KUMPLY, y el combo +20 sale natural (el lane KUMPLY+0xGasless de Fuji patrocina solo tier 5, o sea agentes). En Twin es el disparador #1 ("pagos agénticos con límites del usuario"): 15-17/20, contra 15 de Seña, que Twin puede leer como "escrow que ya existe".
- El Cheque que se llena saca más en Twin (17), pero necesita Morpho, que solo está en Arbitrum, así que no sirve para los dos tracks, y en Avalanche es un escrow genérico. Queda descartado.
- Todos los puntajes son estimaciones nuestras [SIN VERIFICAR].

**Variante (cambio respecto de Mandato de anoche, en 3 líneas):**
1. Todo en **ARGt**: los topes se escriben en pesos ("hasta $20.000 por semana"). En Fuji se usa `ARGtDemo` y en mainnet el ARGt real (0x2E4e…703B, [SIN VERIFICAR: confirmar con Twin]).
2. **Se recortan** el ERC-8004 propio y el servidor 402: la pantalla de la farmacia escucha el evento `Pagado`. Si hace falta registro, se usa un `RegistroAgentes` mínimo.
3. El agente con guion fijo hace 4 intentos (bot sin dueño, página trampa, comercio fuera de lista y compra OK), más una caja grande que queda en la cola con "Vetar".

## Los 3 cambios respecto del KIT de anoche (KIT_GANADORA = Seña)
1. **Idea y roles:** Seña pasa a ser el paracaídas de las 12:00 y el KIT queda guardado para ese caso. El nuevo reparto:
   - P1: `Mandato.sol`, tests y deploy verificado en Fuji.
   - P2: agente, 0xGasless y KUMPLY (o store propio).
   - P3: panel de Diego y pantalla de la farmacia.
   - P4: pedidos a sponsors, deploy en mainnet con la tx ARGt, README, pitch y video a las **17:00** (no a las 19:00).
2. **Regla 2 del KIT ("nada en mainnet") cambia:** se permite **un** deploy en C-Chain mainnet, desde una billetera aparte con saldo mínimo (keystore, nunca la clave en el código). Lo hace solo P4, con un máximo de 1,5 h.
3. **Bonus y README orientados a las reglas nuevas:**
   - El flujo principal es gasless: Diego y el agente nunca pagan gas.
   - El gate on-chain usa `isAgent` / `isBusiness` (no `hasTier`) y muestra una dirección que pasa y otra bloqueada.
   - El README cubre los 6 obligatorios: "por qué Avalanche" (finalidad en el mostrador + KUMPLY/0xGasless de Fuji), negocio, qué se hizo hoy, y aclara que las atestaciones de Fuji son de demo. Lleva también el hash de mainnet para Twin.

## Las 3 cosas a pedir YA (P4, antes de las 10:15)
1. **Organización:**
   - ¿Un mismo proyecto puede competir en los dos tracks? Si dicen que no, vamos **solo Avalanche**, que tiene más puntos y bonus en juego.
   - ¿La entrega de Blockchain también es a las 18:00?
2. **Staff de KUMPLY + 0xGasless:**
   - Que emitan **tier 5 (agente)** a nuestra billetera del agente y **tier 4 (farmacia)** en el AttestationStore de Fuji antes de las 12:00. Si no pueden, ¿aceptan un store propio declarado?
   - La API key de 0xGasless, y confirmar que el lane patrocina tier 5.
3. **Mentores de Twin:**
   - ARGt de prueba: ¿en qué chain lo dan? ¿Se confirma 0x2E4e…703B en C-Chain?
   - Un poco de AVAX de mainnet para gas.
   - ¿"Agente que paga en pesos con límites del usuario" cuenta como token núcleo?
   - Si el ARGt solo está en Arbitrum o Base, el mismo contrato se despliega ahí: Twin acepta esas chains.
