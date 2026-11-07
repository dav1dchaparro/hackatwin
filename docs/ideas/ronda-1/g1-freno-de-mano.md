# Freno de Mano — los ahorros de la abuela no se van en 25 minutos

**Frase:** una caja de ahorro en ARGt donde pagarle a un comercio verificado es instantáneo, pero mandarle plata a un desconocido queda frenado 24 h y el hijo puede cancelarlo.

## Problema
En el cuento del tío digital te toman el celular (o te convencen por teléfono) y vacían la cuenta en minutos. Cuando la familia se entera, la plata ya salió y el banco dice que "la clienta entregó sus claves". El problema no es la clave: es que no hay tiempo para reaccionar.

## Usuario concreto
**Norma, 74 años, jubilada en Caseros.** Tiene $1,8 M ahorrados. Paga la farmacia y el súper con el celular. Su hijo **Darío** vive en Córdoba y es el "guardián".

## Evidencia
- Jubilada de Jáchal: le tomaron el control remoto del celular, sacaron préstamos y "vaciaron sus cuentas bancarias en cuestión de apenas 25 minutos"; cuando el banco bloqueó, "ya habían logrado transferir el dinero" ([Tiempo de San Juan, 12/5/2025](https://www.tiempodesanjuan.com/policiales/una-jubilada-jachallera-perdio-11-millones-pesos-minutos-producto-una-estafa-telefonica-n401933)).
- El 43 % sufrió hackeo o fraude en 2025-2026; canal principal WhatsApp (31 %) (DOLORES.md #5, [Perfil, 30/6/2026](https://www.perfil.com/noticias/sociedad/una-investigacion-encontro-que-el-43-de-los-argentinos-sufrio-un-fraude-o-hackeo-digital.phtml)).
- Préstamos a tu nombre + $1,66 M transferidos a terceros; el juzgado no ordenó devolver (DOLORES.md #6).
- Falsos empleados de ANSES tuvieron a una jubilada "más de una hora" al teléfono ([Diario de Cuyo, 27/1/2026](https://www.diariodecuyo.com.ar/argentina/una-jubilada-fue-victima-del-cuento-del-tio-se-hicieron-pasar-por-empleados-de-anses-y-le-robaron-90-000-dolares-1824881.html); ojo: ese caso fue en efectivo, no transferencia).

## Solución (3 frases)
Norma guarda sus ahorros en un contrato "Freno" en Fuji. Pagos a billeteras con `isBusiness` (KYB nivel 4, ej. la farmacia) salen al toque hasta un tope diario; cualquier otro destino por encima de $50.000 queda en cola 24 h. Durante esa ventana Darío (KYC 2+, verificado) puede cancelar con un clic y la plata vuelve; ni Norma ni quien tenga su celular pueden saltarse el freno.

## Momento wow (30 s)
En vivo: el "estafador" tiene el celular de Norma y manda $900.000 a una dirección sin verificación → la pantalla muestra "Frenado: sale en 23:59:58". Le llega el aviso a Darío, toca "Cancelar" → el saldo vuelve. Acto seguido Norma paga $8.000 en la farmacia verificada y sale al instante.

## Quién paga
Billeteras y fintech que distribuyen ARGt (les baja el costo de fraude y de juicios: la justicia viene condenando a bancos por estas estafas). Modelo B2B: módulo "Freno" por suscripción. Precio: [SIN VERIFICAR].

## Sponsor que la amaría
- **KUMPLY:** su credencial decide quién cobra al instante y quién espera; contrato que llama al gate on-chain, dos categorías distintas (KYB y persona) en el mismo flujo.
- **Belo / Twin:** ARGt como medio de pago cotidiano y seguro para gente no cripto. **BitGo:** es su lógica de políticas y aprobaciones, pero para una persona.

## Qué se reutiliza
- Patrón de chequeo de tier: `refs/Kumply/contracts/contracts/ComplianceGate.sol` (`_requireVerified`). Ojo: usa `tier < requiredTier`, así que para "solo KYB" hay que comparar `tier == 4` exacto, como hace `refs/Kumply/contracts/contracts/examples/KumplyPaymasterCheck.sol`.
- Lectura de la credencial: `refs/Kumply/contracts/contracts/AttestationStore.sol` (`verify`) y SDK `refs/Kumply/packages/sdk/src/client.ts` (`isBusiness`, `isPersonAtLeast`) con direcciones en `refs/Kumply/packages/sdk/src/constants.ts`.
- Pago en custodia con plazo y devolución: `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` (`pay` / `refund` / estados). A adaptar: `settle` no tiene control de acceso y acá el "guardián" tiene que poder cancelar.
- Tope por pago y total: `refs/hackatwin-x402-team1-avalanche/packages/agent-kit/src/policy/budget-policy.ts` (misma idea, llevada al contrato).
- Plan B sin KYB real en Fuji: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol` (`issueTier`, solo para demo).

**Riesgos que ya veo:** existen billeteras con "guardianes" y límites diarios (ej. Argent, fuera de AR) [SIN VERIFICAR]; no frena los préstamos que sacan en el banco tradicional; KYB nivel 4 todavía tiene la cotización de Sumsub pendiente (`refs/Kumply/LITEPAPER.md`), así que puede no haber billetera KYB real para la demo.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Casi sí. Una demora de 24 h con un guardián que cancela es una regla que un banco o billetera mete en su base. Los bancos ya demoran transferencias "por montos o habitualidad" ([BBVA](https://www.bbva.com/es/ar/salud-financiera/cuanto-demora-una-transferencia-bancaria-en-argentina-todo-lo-que-necesitas-saber/)). Lo único que se pierde: que la regla no dependa de la entidad y que ni la propia app pueda saltarla. Para Norma eso es abstracto.
- **¿Ya existe?** Mercado Pago lanzó en Argentina "Dinero Blindado", que bloquea operaciones fuera de las redes WiFi de confianza ([iProUP, 8/10/2026](https://www.iproup.com/economia-digital/72195-dinero-blindado-la-nueva-funcion-de-mercado-pago.amp)), y una Central de Seguridad con "personas de confianza" que reportan un robo (misma nota). No es igual (no hay demora con veto del hijo), pero ocupa el mismo lugar y ya tiene millones de usuarios. Guardianes en billeteras cripto: [SIN VERIFICAR] en LATAM.
- **¿Norma usaría una billetera cripto?** No. Una jubilada de 74 años no pasa sus ahorros de pesos a una autocustodia. Además, la farmacia del barrio no cobra en ARGt ni tiene KYB, así que el "pago instantáneo" no tiene adónde ir. El estafador se adapta: le pide a Norma que pague a un "comercio" con KYB, o convence a Darío.
- **¿Fuji en 12 h?** El contrato (cola + veto + tope) es chico y factible. Lo riesgoso: no hay KYB real (`refs/Kumply/LITEPAPER.md` l. 225: "pending Enterprise quote for Tier-4 KYB"). Con `WorkshopKYA.issueTier` la credencial del comercio es autoemitida y el jurado lo puede notar.
- **¿ARGt y KUMPLY esenciales?** KUMPLY sí: decide quién cobra al instante. ARGt está pegado: el freno anda igual con cualquier ERC-20, y los ahorros reales de Norma están en un banco.

## Usuario
Soy Norma, jubilada de Caseros. Si Darío me lo deja andando, quizás lo uso, pero yo sola no: no sé qué es "ARGt" ni por qué mi plata no está más en el Provincia.
No entiendo por qué la farmacia de acá a la vuelta "no está verificada" y tengo que esperar 24 horas para pagarle.
¿Pagar? Yo nada. Si lo paga el banco o Darío, bueno; Darío dice que $2.000 por mes estaría bien.
Me da miedo que se trabe y no pueda sacar plata para el remedio, y que si pierdo el celular no la recupere más.
