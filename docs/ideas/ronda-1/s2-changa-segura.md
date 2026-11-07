# s2 – Changa segura
**Frase:** cliente y trabajador independiente se verifican con KUMPLY y el pago en ARGt queda retenido hasta que el trabajo se confirma.

*(Semilla 2 de TORNEO_IDEAS.md. Rutas relativas a `ideas/`.)*

## Problema
En una changa (plomero, niñera, electricista) nadie se conoce: el cliente teme pagar por adelantado y que el trabajador no aparezca; el trabajador teme terminar y que no le paguen. Encima, el trabajador informal no tiene cómo demostrar sus ingresos.

## Usuario concreto
**Ramón, 47, plomero en Lomas de Zamora.** Le piden arreglar un termotanque en Banfield. La clienta, **Silvia**, no lo conoce y no quiere adelantar los materiales; Ramón ya tuvo dos clientes que le dijeron "te transfiero mañana" y nunca pagaron.

## Evidencia
- Informalidad del 43 % (unos 5,8 M de personas) en el 4.º trimestre de 2025, INDEC; el 30,3 % de los asalariados sin aportes ([Crónica, 13/4/2026](https://www.cronica.com.ar/politica/la-informalidad-laboral-no-da-tregua-afecto-al-43-de-los-trabajadores-al-cierre-de-2025/), DOLORES.md #8).
- Servicio doméstico: 71,4 % no registrado; construcción: 60 % ([Mendoza Post, 2/9/2026](https://www.mendozapost.com/economia/mapa-de-la-informalidad-en-la-argentina-sector-por-sector/), DOLORES.md #8).
- Que les paguen tarde o no les paguen: [SIN VERIFICAR] (DOLORES.md no encontró nota con datos).

## Solución (3 frases)
Silvia y Ramón conectan sus billeteras y el contrato exige que ambos tengan KYC (KUMPLY `isPersonAtLeast`). Silvia deposita el pago en ARGt (en Fuji, token de prueba) y queda retenido en el contrato. Cuando Silvia confirma el trabajo, el pago se libera a Ramón; si no confirma ni reclama, se libera solo al vencer el plazo.

## Momento wow (30 s)
Pantalla partida: Silvia deposita, el saldo aparece "retenido"; aprieta "Trabajo terminado" y el celular de Ramón muestra el cobro acreditado al instante, con el recibo en el explorador de Fuji.

## Quién paga
[SIN VERIFICAR] Comisión por changa retenida (ej. un % del monto), a cargo del cliente o repartida.

## Sponsor que la amaría
- **Digital House:** propuso esta semilla como "Primera changa del egresado" (dev junior cobra su primer freelance) (SPONSORS.md #6).
- **Twin:** ARGt como medio de pago cotidiano (SPONSORS.md #1).
- **KUMPLY:** dos personas verificadas en el mismo flujo (SPONSORS.md #7).

## Qué se reutiliza del repo de referencia
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` – patrón de retención: `pay` (línea 109) deposita, `refund` (línea 158) devuelve al vencer, `settle` (línea 171) libera. Ojo: `settle` lo puede llamar cualquiera; la confirmación del cliente es a construir.
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85).
- `refs/Kumply/packages/sdk/src/client.ts` – `isPersonAtLeast` (línea 222).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol` – si se cobra comisión de plataforma (`script/params/fuji-revenue-splitter.json`: `platformBps` 500).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – ARGt de prueba.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Sí. Un escrow centralizado (la plataforma retiene y libera) hace lo mismo y es lo que ya existe. Lo que se pierde: que la plataforma no pueda quedarse con la plata ni congelarla. Pero el conflicto real (¿el termotanque quedó bien?) igual lo tiene que decidir una persona, adentro o afuera de la cadena.
- **¿Ya existe?** Workana (nacida en Buenos Aires) retiene el pago de proyectos de precio fijo y lo libera cuando el cliente aprueba, con liberación automática en algunos proyectos de menos de US$300 ([ayuda Workana](https://help.workana.com/hc/en-us/articles/360055401753-How-it-works-the-automatic-release-of-funds)). Es justo la variante "primera changa del egresado". En oficios, 2x3 (Chile) tendría un "Pago Protegido" [SIN VERIFICAR: solo lo vi en el resumen del buscador, no abrí la página]. En Argentina no encontré una app de oficios con pago retenido; Zolvers y similares no retienen el pago [SIN VERIFICAR].
- **¿Ramón usaría una billetera cripto?** Difícil. Necesita pesos para comprar materiales antes de arrancar, y la idea no contempla un adelanto. Silvia tendría que comprar ARGt para pagar un arreglo. Pasar por KYC nivel 2 (documento + prueba de vida) para una changa también frena.
- **¿Fuji en 12 h?** Sí, es fácil: retención + confirmación + liberación por plazo. Lo riesgoso es la disputa: sin árbitro, el plazo automático favorece al que espera. Y la demo es un escrow más, poco wow.
- **¿ARGt y KUMPLY esenciales?** ARGt encaja como pago en pesos. KUMPLY es útil pero no clave: saber que Ramón es "una persona verificada" no dice nada de si hace bien el trabajo, y la credencial no trae nombre ni reputación (`CONTEXTO.md`).

## Usuario
Soy Ramón, plomero en Lomas de Zamora. Saber que la plata ya está apartada antes de arrancar me sirve, lo usaría con clientes nuevos.
No entiendo cómo compro los materiales si la plata queda trabada hasta el final, ni qué pasa si la señora dice "goteaba" y no confirma nunca.
Pagaría 2-3 % si me asegura que cobro; más que eso, no.
Me da miedo que el plazo automático juegue en mi contra, tener que hacer un trámite con selfie para cada changa, y no saber cómo pasar el ARGt a pesos.
