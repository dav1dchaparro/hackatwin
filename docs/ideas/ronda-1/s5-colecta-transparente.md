# s5 – Colecta transparente
**Frase:** un comedor comunitario verificado con KYB recibe donaciones en ARGt y cualquiera puede ver en qué se usaron.

*(Semilla 5 de TORNEO_IDEAS.md. Rutas relativas a `ideas/`.)*

## Problema
Los comedores dependen cada vez más de donaciones, pero el donante no sabe si el comedor existe ni a dónde va su plata. El Estado dio de baja el padrón de comedores y no sabe cuántos siguen abiertos.

## Usuario concreto
**Graciela, 52, coordina un comedor en José C. Paz** que da de comer a 120 chicos. **Pablo, 35, contador en Palermo**, quiere donar $20.000 por mes, pero desconfía después de leer sobre comedores "fantasma".

## Evidencia (búsqueda nueva, 7/11/2026)
- La Resolución 393/2025 (18/7/2025) dejó sin efecto el RENACOM (registro nacional de comedores) por observaciones de la SIGEN sobre la confiabilidad de los datos; el Estado "no tiene un padrón vigente de cuántos comedores y merenderos están abiertos en el país". En Entre Ríos se financiaron "116 espacios comunitarios en 2024, 93 en 2025 y apenas 64 en 2026" ([Análisis Digital, 15/6/2026](https://www.analisisdigital.com.ar/provinciales/2026/06/15/entre-rios-cuando-la-pobreza-sigue-creciendo-y-el-estado-nacional-achica-la-asistencia)).
- La Res. 650/2025 creó una rendición de cuentas digital específica para Alimentar Comunidad (tarjetas prepagas) ([Cronista](https://www.cronista.com/economia-politica/sandra-pettovello-activo-cambios-clave-en-este-programa-social-alimentario)) [SIN VERIFICAR]: solo visto en el resumen del buscador.
- "32 % de comedores registrados no operaba" (auditoría de Capital Humano, nov. 2024): [SIN VERIFICAR], no lo pude confirmar en la fuente.
- Cuánto donan los particulares a comedores: [SIN VERIFICAR].

## Solución (3 frases)
El comedor (o la asociación que lo representa) tiene credencial KYB en KUMPLY (`isBusiness`, nivel 4), y solo así puede recibir en el contrato de colecta. Pablo dona en ARGt (en Fuji, token de prueba) y todo queda registrado. Cada gasto del comedor sale del contrato hacia proveedores con una etiqueta ("verdulería, 15 kg de papa") que cualquiera puede ver.

## Momento wow (30 s)
Pablo dona desde el celular; en una pantalla pública del comedor aparece su donación y, al lado, el pago a la verdulería con el mismo dinero, todo con link al explorador de Fuji.

## Quién paga
[SIN VERIFICAR] Una comisión mínima sobre donaciones, o empresas que donan y quieren el comprobante público (responsabilidad social).

## Sponsor que la amaría
- **KUMPLY:** usa KYB (nivel 4), que casi ninguna otra semilla usa (SPONSORS.md #7).
- **Twin:** ARGt como medio de pago en pesos, sin dólar en el medio (SPONSORS.md #1).

## Qué se reutiliza del repo de referencia
- `refs/Kumply/packages/sdk/src/client.ts` – `isBusiness` (línea 236).
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85), con `requiredTier` 4.
- `refs/Kumply/contracts/scripts/issue-tier4-deployer.ts` – referencia de cómo se emite un nivel 4 (solo leer, no ejecutar).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol` – si parte de cada donación va a un fondo fijo.
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – ARGt de prueba.
- A construir: contrato de colecta con gastos etiquetados.

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** La entrada de las donaciones gana algo con la cadena, porque es trazable. La salida no: "verdulería, 15 kg de papa" es una etiqueta que pone el comedor, y la cadena solo prueba que la plata fue a una dirección, no que llegó la papa. Es el problema del oráculo. Además, la verdulería del barrio tendría que tener billetera y aceptar ARGt.
- **¿Ya existe?** Pulenta (Xcapit) recibe donaciones en USDC sobre Polygon con trazabilidad on-chain para comprar alimentos, y es argentina ([Forbes AR](https://www.forbesargentina.com/innovacion/de-mano-cura-una-firma-diseno-una-wallet-mundo-crypto-suma-causas-solidarias-n20509)). Giveth tiene proyectos verificados y donaciones rastreables ([Giveth](https://giveth.io/landings/web3-crypto-donation-platform)). Naranja X tiene "Donar" para comedores y bancos de alimentos ([Naranja X](https://www.naranjax.com/sustentabilidad/naranja-x-presenta-donar-y-duplicara-el-100-de-los-aportes-de-sus-clientes)).
- **¿Billetera cripto?** Pablo puede donar en ARGt. Graciela y los proveedores del barrio manejan efectivo, y los gastos reales del comedor probablemente van por fuera del contrato.
- **¿Fuji en 12 h?** Sí, es fácil. Lo más riesgoso: KYB real (nivel 4) para una organización en Fuji, que tiene que ser una persona jurídica, y muchos comedores no lo son [SIN VERIFICAR]. Ojo: `ComplianceGate` con nivel 4 también deja pasar agentes nivel 5 (`tier >= requiredTier`, línea 97).
- **¿ARGt y KUMPLY?** KYB prueba que la entidad existe, no que el comedor funcione: el RENACOM se cayó justamente por datos poco confiables. ARGt es solo el medio de pago.
- **Debilidad más grave:** ya existe una donación on-chain argentina (Pulenta) y el "gasto etiquetado" lo declara el propio comedor, así que no prueba nada.

## Usuario
Soy Pablo, contador en Palermo. Me gusta ver que mi donación llegó a un comedor que existe; donaría en ARGt sin problema.
No entiendo cómo sé que la papa llegó de verdad: "15 kg de papa" lo escribe el mismo comedor, y como contador sé que una etiqueta no es un comprobante.
Aceptaría una comisión de 1-2 % sobre lo que dono, no más.
Me da miedo que sea otro sistema lindo que después nadie mantiene, y que mi nombre o mi billetera queden asociados en público a una organización.
