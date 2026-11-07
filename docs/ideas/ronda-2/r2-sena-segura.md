Origen: s7 (+ injertos de RESCATE r1: g3-cobrador-verificado, g1-recibo-sin-patron, s2-changa, s8-p2p, s4-entradas, s1-alquiler; regla anti-autopago de g1-cuotas-egresados)

# Seña Segura: la seña queda retenida y el dueño suma estadías confirmadas por huéspedes verificados

**Frase:** pagás la seña en ARGt a un contrato, no al "dueño". La cobra cuando llegás, y su historial de huéspedes verificados distintos dice si la casa existe.

## Problema
Para reservar en la costa, las familias le transfieren la seña a un desconocido de Facebook o WhatsApp. Si la casa no existe, la plata ya se fue. Y un "dueño verificado" no alcanza: la estafa de la nota cobró en una cuenta bancaria, que también tiene KYC.

## Usuario concreto
**Andrea Gómez, de Santa Fe.** Encontró una casa en Santa Clara del Mar en Facebook y le piden $210.000 de seña antes de enero. No puede ir a verla.

## Evidencia
- Familia santafesina: $210.000 de seña por una casa que no se alquilaba, y la cuenta era de alguien preso ([Noticias NQN, 20/1/2026](https://www.noticiasnqn.com.ar/noticias/2026/01/20/326920-estafa-con-alquileres-en-la-costa-atlantica-una-familia-fue-enganada-y-recibio-burlas-desde-una-carcel)).
- La UFECI la puso entre las 4 estafas más reportadas de enero de 2025 ([Chequeado, 18/1/2025](https://chequeado.com/el-explicador/estafas-en-los-alquileres-de-verano-2025-cuales-son-las-modalidades-mas-comunes-y-como-evitar-caer-en-la-trampa/)).
- El KYC de una billetera no alcanza solo: el operativo de mayo de 2026 pasó por Binance P2P, que tiene escrow y KYC ([Crypto Briefing, 31/5/2026](https://cryptobriefing.com/argentina-arrests-24-seizes-8m-crypto-fraud/)). Conteo nacional de 2026: [SIN VERIFICAR].

## Solución (3 frases)
Solo publica quien es persona KYC 2-3 o inmobiliaria KYB 4, nunca un agente (5). Cada publicación muestra su **contador de estadías: check-ins confirmados por huéspedes KYC distintos**, que no suma si el huésped es el mismo dueño o repite. Andrea deja la seña en ARGt **retenida** y hay tres salidas: confirma el check-in y se libera; pasan 48 h desde la fecha de llegada sin reclamo y se libera; o reclama en esas 48 h y decide un árbitro KYB en 72 h (si no decide, la seña vuelve a Andrea).

## Momento wow (30 s)
**Dos publicaciones idénticas de la misma casa, lado a lado.** Una está en **rojo**: "sin verificación · 0 estadías · pide transferencia". La otra en **verde**: "persona verificada · 9 estadías de 9 huéspedes verificados". Andrea paga la seña en la verde → "Retenida" + comprobante (`TxLink`). El dueño intenta "reservarse" su propia casa para inflar el contador → **no suma**. Andrea hace el check-in → la seña pasa al dueño y el contador sube a 10.

## Quién paga
Comisión del 2 al 5 % de la seña, a cargo del huésped como "seguro" ([SIN VERIFICAR]: son las anclas de los usuarios simulados de s2 y s7). A futuro, el dueño con historial paga por destacarse. Regla del pitch: **si la seña no entra al contrato, no hay protección. "Transferime" es la señal de alarma.**

## Sponsor que la amaría
**Belo:** es su propia idea ("Seña de verano en Brasil", SPONSORS.md #5), y es donde Andrea consigue ARGt. La variante Florianópolis con BRAt queda a futuro. **Twin:** pesos que liquidan un sábado de enero. **KUMPLY:** gate de dos categorías en el contrato (persona 2+ o KYB) más un árbitro KYB.

## Qué se reutiliza (verificado en `refs/`)
- **A construir:** contrato `SenaEscrow` chico (~150 líneas). `PaymentHub` sirve de **patrón**, no tal cual: su `settle` exige estar antes del plazo (l. 177) y `refund` después (l. 162). Acá, en cambio, "vence sin reclamo" le paga al dueño.
- Patrones de `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol`: `_transition` (l. 211) + la tabla de estados de `src/libraries/PaymentStateLib.sol` (l. 11-21, sumando estados `EnDisputa`/`Liberada`), crédito y `withdraw` (l. 193), y `SafeERC20` con chequeo de saldo antes y después (l. 126-128).
- Comisión: `_split` de `src/RevenueSplitter.sol` (l. 56).
- Token de prueba: `packages/contracts/test/utils/MockERC20.sol`. Comprobante: `packages/ui/src/atoms/TxLink.tsx`.
- Credenciales: `refs/Kumply/contracts/contracts/AttestationStore.sol` (`verify`, l. 224), con `tier` en {2,3,4} explícito y **no** heredar `ComplianceGate.sol` (`tier < requiredTier`, l. 97, dejaría pasar agentes). En el front: `isPersonAtLeast`/`isBusiness` (`packages/sdk/src/client.ts` l. 222/236), `meetsTierRequirement` (`tier.ts` l. 27).
- Plan B: falta una billetera con KYC 2 real en Fuji. Si no aparece, usar `contracts/workshop/WorkshopKYA.sol` y decirlo.

**Riesgos:** el contador **mitiga, no prueba** que la casa sea del dueño. Inflarlo exige personas reales verificadas distintas, y una billetera verificada comprada no trae historial. El dueño honesto tiene que aceptar cobrar en ARGt.

## Cambios vs ronda 1
- **Contador de estadías confirmadas por huéspedes KYC distintos**, con el autopago excluido (injerto de g1-recibo y regla de g1-cuotas). Ataca la debilidad grave ("KYC no prueba que la casa sea suya") y la reventa de billeteras (s4).
- **Wow rojo/verde lado a lado** (injerto de g3-cobrador), en vez de arrancar con un rechazo técnico.
- **Plazos acotados** (48 h para reclamar, 72 h para el árbitro, devolución si no decide) contra el sesgo del plazo automático (s2) y el miedo de Andrea ("semanas").
- Admitimos que `PaymentHub` no sirve tal cual: pasa a "patrón + contrato a construir".
- Gate explícito {2,3,4} sin `ComplianceGate`, y la regla "fuera del contrato no hay protección" (s8). Comprobante con `TxLink` (s1).

## Ataque
*(Abogado del diablo 2, ronda 2)*
- **¿Base de datos común?** Sí: Alohar (Mar del Plata, justo la costa del caso) ya cobra online en pesos y le libera la plata al dueño "solo 72 horas después del check-in" como antifraude ([iProfesional, 7/1/2025](https://www.iprofesional.com/realestate/420145-con-que-app-puedo-alquilar-temporal-en-pesos-y-cuotas-sin-interes-en-vacaciones)). Lo que se pierde: que nadie custodie la seña y que el historial del dueño sirva fuera de una plataforma. Pero el trato de Facebook o WhatsApp sigue fuera de las dos.
- **¿Ya existe?** La retención hasta el check-in, sí: Alohar, Airbnb y Booking. El historial portable de estadías entre particulares, no lo encontré [SIN VERIFICAR: que no exista].
- **El contador cuenta billeteras, no personas.** La credencial de KUMPLY no trae datos personales (CONTEXTO.md), así que el contrato no puede saber si 9 billeteras KYC 2 son 9 personas o los primos del estafador. Si KUMPLY o Sumsub impiden que una persona verifique varias billeteras: [SIN VERIFICAR]. Encima, arranque en frío: todo dueño honesto empieza en "0 estadías", igual que el estafador. El "9 de 9" del wow es dato sembrado.
- **¿Billetera cripto?** Andrea, quizás vía Belo. El dueño de la costa que hoy cobra por transferencia no tiene por qué aceptarlo, y el estafador va a decir "transferime". Lo que los frena: conseguir ARGt, hacer KYC 2 y esperar 48 h para cobrar.
- **¿Fuji en 12 h?** Sí: `SenaEscrow` de unas 150 líneas, 3 salidas y un árbitro. Lo más riesgoso: hacen falta varias billeteras KYC 2 reales (dueño + huéspedes distintos) para que el contador no sea de mentira. Sin eso, todo sale de `WorkshopKYA.sol` y el wow pierde su base.
- **¿ARGt y KUMPLY?** ARGt encaja (seña en pesos, sábado de enero). KUMPLY es esencial para el contador, pero ahí mismo es más débil (punto 3).
- **Debilidad más grave:** el contador de "huéspedes distintos" mide billeteras, no personas, y arranca en 0 para todos. El diferencial nuevo frente a Alohar no está probado.

## Usuario
- Soy Andrea, de Santa Fe. Si el dueño acepta, la uso: dejar los $210.000 en un contrato y no en la cuenta de un desconocido me deja dormir.
- No entiendo cómo consigo ARGt ni qué es "KYC 2". Y si la casa tiene 0 estadías, ¿cómo sé si es trucha o si el dueño recién empieza?
- Pagaría hasta un 3 % de la seña (unos $6.000) como seguro. Más no, el alquiler ya es caro.
- Me da miedo que el dueño me diga "no uso eso, transferime" y perder la casa. Y llegar, que no exista, y que decida un árbitro que no conozco.
