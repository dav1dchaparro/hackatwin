# s8 – Compraventa P2P de USDT sin triangulación
**Frase:** el vendedor de USDT deja las monedas retenidas en un contrato y solo opera con compradores verificados, para no recibir plata de terceros.

*(Semilla 8 de CONTEXTO.md. Rutas relativas a `ideas/`.)*

## Problema
En el P2P de USDT, el comprador manda pesos desde una cuenta que no es la suya (robada o de una víctima). Cuando la víctima denuncia, el banco revierte o congela la cuenta del vendedor inocente, que ya entregó los USDT.

## Usuario concreto
**Federico, 31, vende USDT por P2P en Mendoza** para completar su sueldo. El mes pasado le congelaron la cuenta bancaria por un pago que vino "del hermano" del comprador.

## Evidencia
- Esquema "mi hermano te transfiere": si la víctima denuncia, "el banco puede revertir la operación o congelar la cuenta del vendedor inocente" ([Derecho en Zapatillas, act. 21/10/2025](https://www.derechoenzapatillas.com/2025/%f0%9f%8e%ae-mi-hermano-te-transfiere-la-nueva-vieja-estafa-del-marketplace/), DOLORES.md #3).
- Operativo de mayo de 2026: 90 allanamientos, 24 detenidos, unos $3.000 M en pérdidas y más de 8 M de USDT congelados; los pesos de las víctimas pasaban a USDT por Binance P2P ([Crypto Briefing, 31/5/2026](https://cryptobriefing.com/argentina-arrests-24-seizes-8m-crypto-fraud/), DOLORES.md #3).
- El 43 % sufrió hackeo o fraude en 2025-26 (encuesta a 500 personas) ([Perfil, 30/6/2026](https://www.perfil.com/noticias/sociedad/una-investigacion-encontro-que-el-43-de-los-argentinos-sufrio-un-fraude-o-hackeo-digital.phtml), DOLORES.md #5).

## Solución (3 frases)
Federico deja los USDT (en Fuji, token de prueba) retenidos en el contrato al publicar su oferta. Solo pueden tomar la oferta compradores con KYC (KUMPLY `isPersonAtLeast`), y Federico también está verificado. Cuando Federico confirma que recibió los pesos, el contrato libera los USDT al comprador; si no hay pago en plazo, vuelven a Federico.

**Debilidad conocida (CONTEXTO.md):** KUMPLY prueba que la billetera es de una persona verificada, no que la cuenta bancaria que pagó sea suya. La triangulación sigue siendo posible en la pata en pesos.

## Momento wow (30 s)
Un comprador sin KYC intenta tomar la oferta y el contrato lo rechaza; el comprador verificado la toma, Federico confirma el pago y los USDT llegan al instante, con todo el rastro en el explorador de Fuji.

## Quién paga
[SIN VERIFICAR] Comisión por operación al vendedor, menor a la de exchanges P2P; argumento: menos cuentas congeladas.

## Sponsor que la amaría
- **Tether:** USDT en la economía real argentina; propuso la variante "P2P USDT↔ARGt" con swap atómico en el mismo contrato, que elimina la pata bancaria (SPONSORS.md #3).
- **KUMPLY:** dos personas verificadas en un contrato (SPONSORS.md #7).
- **Twin:** solo si la pata en pesos se paga en ARGt (variante de Tether); en la semilla tal cual, ARGt no participa.

## Qué se reutiliza del repo de referencia
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` – patrón de retención con `pay` (línea 109), `refund` por plazo (línea 158), `settle` (línea 171). Ojo: `settle` lo puede llamar cualquiera; la confirmación del vendedor es a construir.
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85).
- `refs/Kumply/packages/sdk/src/client.ts` – `isPersonAtLeast` (línea 222).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – USDT de prueba.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Sí: es lo que hace Binance P2P. Retiene la cripto en garantía y la libera cuando el vendedor confirma, con KYC obligatorio ([CriptoNoticias](https://www.criptonoticias.com/tutoriales-guias/comercio-p2p-de-criptomonedas-en-binance-guia-completa/)). Lo que se pierde: que la plataforma no custodie. Es un argumento para cripto-nativos, no para Federico.
- **¿Ya existe?** Sí, y es fuerte. Binance P2P (escrow + KYC) y El Dorado, que dice estar registrada en Argentina, bloquea los USDT del vendedor en escrow y exige KYC ([FAQ El Dorado](https://faq.eldorado.io/en/articles/12369866-what-is-el-dorado-s-p2p-marketplace-and-how-it-works)); según Sumsub, El Dorado es su cliente ([Sumsub](https://sumsub.com/customers/el-dorado)), el mismo proveedor que usa KUMPLY. Igual el operativo de mayo de 2026 pasó por Binance P2P (DOLORES #3): el escrow con KYC **no frenó la triangulación**.
- **¿Federico usaría una billetera cripto?** Ya la usa: es el único usuario cripto-nativo de la tanda. Lo frena la liquidez (sin compradores no hay operaciones) y que no gana nada contra Binance, porque la pata en pesos sigue igual.
- **¿Fuji en 12 h?** Sí, trivial (escrow + gate). No hay riesgo técnico. El riesgo es de **concepto**: la debilidad que admite `CONTEXTO.md` es justo el problema que dice resolver. La variante atómica USDT↔ARGt de Tether elimina el banco, pero se vuelve un swap OTC con KYC, y alguien tiene que haber comprado ARGt antes con pesos de un banco.
- **¿ARGt y KUMPLY esenciales?** ARGt no participa en la semilla tal cual. KUMPLY está pegado: prueba que la billetera es de una persona, no que la cuenta bancaria que pagó sea suya.

## Usuario
Soy Federico, vendo USDT en Mendoza. Manejo billetera sin problema, pero no veo por qué dejar Binance P2P, donde ya tengo escrow, KYC y compradores.
No entiendo cómo esto evita que me paguen desde la cuenta del "hermano": el KYC es de la billetera, no de la cuenta del banco que me transfiere.
Pagaría menos que Binance, o nada, mientras no tenga compradores.
Me da miedo que me vuelvan a congelar la cuenta igual, y operar en un lugar nuevo sin nadie del otro lado.
