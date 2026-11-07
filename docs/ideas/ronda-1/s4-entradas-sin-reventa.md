# s4 – Entradas sin reventa
**Frase:** la entrada queda atada a una billetera con KYC y se paga en ARGt, así no se puede revender ni falsificar.

*(Semilla 4 de TORNEO_IDEAS.md. Rutas relativas a `ideas/`.)*

## Problema
Para recitales y partidos, los revendedores compran y revenden más caro, y circulan entradas falsas por redes. El fan paga y recién en la puerta descubre que la entrada no sirve.

## Usuario concreto
**Nico, 22, estudiante en Córdoba.** Se quedó sin entrada en la venta oficial para un show de cuarteto y un perfil de Instagram le ofrece dos al doble. No tiene forma de saber si son reales.

## Evidencia (búsqueda nueva, 7/11/2026)
- Detenido en Colonia Caroya (Córdoba) "mientras intentaba comercializar los tickets apócrifos" para un baile de cuarteto. En la misma nota, la Policía de la Ciudad desarticuló una "reventa ilegal de entradas para espectáculos masivos" (Lollapalooza, Quilmes Rock, Movistar Arena, Eliminatorias); la acusada fue imputada por el art. 91 del Código Contravencional (CABA), que sanciona la reventa ([Infobae, 14/9/2025](https://www.infobae.com/sociedad/policiales/2025/09/14/ofrecia-entradas-falsas-para-un-recital-de-cuarteto-en-cordoba-y-quedo-detenido-por-la-estafa/)).
- La Policía de Río Negro alertó por estafas mundialistas con entradas falsas ([ANB, 6/6/2026](https://www.anbariloche.com.ar/amp/noticias/2026/06/06/107753-la-policia-alerto-por-estafas-mundialistas-entradas-falsas-paquetes-truchos-y-albumes-inexistentes)) [SIN VERIFICAR] contenido: solo visto en el resultado del buscador.
- El 56 % del fraude en línea reportado a la UFECI en 2024 fue en compraventas por internet ([Chequeado, 4/7/2025](https://chequeado.com/nota/las-denuncias-de-estafas-virtuales-aumentaron-un-21-en-2024-cuales-son-los-tipos-de-fraude-mas-comunes), DOLORES.md #5).
- Volumen nacional de reventa o entradas falsas: [SIN VERIFICAR], no hay cifra.

## Solución (3 frases)
La productora emite cada entrada a nombre de una billetera que tiene KYC (KUMPLY `isPersonAtLeast`), cobrando en ARGt (en Fuji, token de prueba). El contrato no permite transferir la entrada a otra billetera (o solo a otra verificada, al precio original). En la puerta, se escanea un QR firmado por la billetera y se verifica on-chain que es la dueña.

## Momento wow (30 s)
Nico compra su entrada en ARGt; un "revendedor" intenta transferírsela a otro y el contrato lo rechaza; en la puerta, el escáner muestra en verde "entrada válida, dueño verificado".

## Quién paga
[SIN VERIFICAR] La productora, con un fee por entrada emitida; argumento: menos reventa y menos reclamos.

## Sponsor que la amaría
- **KUMPLY:** gate de persona en un contrato on-chain (SPONSORS.md #7).
- **Twin:** ARGt como medio de pago en pesos (SPONSORS.md #1).
- Nota: KUMPLY **no verifica edad**, así que no sirve para eventos +18 (CONTEXTO.md).

## Qué se reutiliza del repo de referencia
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85) para la compra y la transferencia.
- `refs/Kumply/packages/sdk/src/client.ts` – `isPersonAtLeast` (línea 222) para el escáner de la puerta.
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – ARGt de prueba.
- A construir: contrato de entradas intransferibles y escáner de QR.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Sí. La ticketera ya ata la entrada a una cuenta y controla las transferencias en su servidor. Lo que se pierde: que la regla de "solo al precio original" sea pública. Eso lo puede prometer la ticketera igual.
- **¿Ya existe?** AllAccess tiene un QR que cambia cada 10 segundos, y al transferir la entrada desaparece de la app del que la tenía ([Cronista](https://www.cronista.com/infotechnology/online/como-funciona-el-servicio-que-te-deja-ir-a-todos-los-recitales-sin-entradas)). Livepass emite solo QR dinámico, tiene reventa oficial "fan to fan" e invalida cualquier reventa por fuera ([T&C Ed Sheeran ARG 2026](https://www.edsheeran.com/sites/g/files/g2000021856/files/2026-04/Ed%20Sheeran%20ARG%202026%20-%20T%26Cs_pT9v4n1JB3oJsd.pdf)). DF bloqueó la reventa de Taylor Swift con 11 medidas ([iProfesional](https://www.iprofesional.com/tecnologia/383044-taylor-swift-como-bloquearan-la-reventa-de-entradas)). El problema de la entrada falsa ya está bastante resuelto en las ticketeras grandes.
- **¿Nico usaría una billetera cripto?** Para un show, no. Hacer KYC con documento + prueba de vida y comprar ARGt solo para una entrada es mucha fricción contra una app que ya tiene.
- **Falla de fondo:** la puerta verifica que el QR lo firma la billetera dueña, no que quien entra sea Nico. La credencial no trae nombre ni foto (`CONTEXTO.md`). El revendedor vende **la billetera con la entrada** (la clave privada) y la reventa sigue igual.
- **¿Fuji en 12 h?** Sí: token intransferible + QR firmado + escáner, factible y conocido. El riesgo es que la demo luzca como un "NFT de entradas", que está prohibido en `INSTRUCCIONES_NOCHE.md`.
- **¿ARGt y KUMPLY esenciales?** ARGt está pegado (la entrada se cobra igual con tarjeta). KUMPLY sirve de filtro de "humano único", pero sin ligarlo a la persona en la puerta, no frena la reventa.

## Usuario
Soy Nico, estudiante en Córdoba. Si la productora lo exige, lo uso; por mi cuenta, no: ya compro en la app de la ticketera con QR que cambia.
No entiendo por qué tengo que hacer DNI y prueba de vida y comprar "ARGt" para ir a un show, ni qué pasa si no puedo ir y quiero pasarle la entrada a un amigo.
No pagaría extra: el cargo por servicio ya es caro.
Me da miedo perder el celular o la clave antes del show y quedarme afuera sin que nadie me la recupere.
