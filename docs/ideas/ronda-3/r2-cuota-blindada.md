Origen: r2-cuota-blindada (+ injertos de RESCATE r2: barra sólido/rayado/ámbar y reparto adentro sin `RevenueSplitter`, ambos de r2-cheque-que-se-llena) · Rol: Planificador, ronda 3

# Cuota Blindada: plan de construcción

## Resumen (5 líneas)
1. Las cuotas del viaje de egresados se juntan en ARGt en un contrato, y ese contrato paga cada hito (hotel, micro, boliches) directo al proveedor cuando el proveedor confirma la reserva.
2. **Arreglo obligatorio, ya incluido:** la agencia (KYB, `tier == 4`) *propone* los proveedores, pero un proveedor solo puede cobrar si **Claudia (la delegada, con KYC 2+) lo aprueba en el contrato**.
3. **Usuario:** Claudia, delegada de 32 familias de 5.º año en Bahía Blanca. Viajan a Bariloche en 14 cuotas y todas las semanas le preguntan "¿ya pagaron el hotel?".
4. **Momento wow:** abre el tablero público y ve "en manos de la agencia: $0". La agencia mete a un amigo como proveedor y le sale **"proveedor no aprobado por las familias"**. Después, el hito de los boliches vence sin confirmar y la parte de Claudia le vuelve en vivo.
5. La regla honesta: la agencia nunca tiene en la mano más que un tramo. Para el tramo de la aerolínea (que no cobra en ARGt) le llega solo ese tramo y una semana antes.

## Contratos en Fuji (C-Chain, 43113)
- **`ARGtDemo`**: ERC-20 con mint abierto y `permit` (EIP-2612 de OpenZeppelin). Así la familia firma **una vez** por el total, sin gas, y el `approve` que marcó el verificador se resuelve. Que la versión de OZ del repo traiga `ERC20Permit`: [SIN VERIFICAR]. Si no la trae, se usa la estándar de OZ v5.
- **`ViajeEgresados`** (uno por viaje, ~250 líneas). Funciones:
  - `proponerProveedor`, solo la agencia. Pide `verify().tier == 4`.
  - `aprobarProveedor`, solo la delegada. Pide nivel 2 o 3.
  - `agregarHito(proveedor, monto, vence)`.
  - `adherir(permit)`, para la familia (KYC 1-3).
  - `debitar(familia)`: lo puede llamar cualquiera, pero cobra **como máximo una cuota por período**. Este tope arregla el "presupuesto total" de `PaymentHub`.
  - `confirmarReserva(hito)`, solo el proveedor aprobado, antes de `vence`. Le acredita su tramo.
  - `liberarVencido(hito)`: devuelve el tramo a cada familia en proporción a lo que aportó.
  - `withdraw`, para cobrar.
  - `cerrarViaje()`: libera el margen de la agencia con un `_split` interno.
  - Recibe **dos stores en el constructor** (`storePersonas` y `storeEmpresas`): la idea es KYC real en el store oficial y KYB en el que se pueda conseguir. El período y los plazos se configuran en minutos (hallazgo 6).
- **Solo si hace falta el plan B de KYB:** desplegamos nuestra propia copia de `AttestationStore`.

## Reparto (4 personas, ~9 h de construcción cada una)
| Persona | Hace | Horas |
|---|---|---|
| P1 Solidity | `ViajeEgresados` + `ARGtDemo`, tests en Foundry (rechazos, vencimiento, devolución proporcional, tope por período), script de despliegue | 6 contrato/tests + 1 deploy + 2 de soporte |
| P2 KUMPLY e infra | A las 9:00, la pregunta a KUMPLY. Arma 8 billeteras (agencia, hotel, micro, boliche, "amigo", Claudia y 2 familias: una dirección = un rol, hallazgo 8). Hace el KYC real de Claudia. Si hace falta, despliega el plan B del store y emite niveles. Deja un script semilla con el viaje armado y los hitos en 3-5 min | 2 KUMPLY + 2 billeteras/KYC + 3 semilla/ensayo + 2 de soporte |
| P3 Front público | Tablero sin billetera (viem, RPC pública de Fuji): hitos, barra sólido/rayado/ámbar, "en manos de la agencia: $X", familias con débito fallido en ámbar, link a Snowtrace por cada tx | 7 + 2 de pulido |
| P4 Front de roles y pitch | Paneles con billetera de agencia, proveedor, delegada y familia (firma del `permit`), y botón "debitar" que hace de ejecutor mensual. Pitch, guion de la demo, slides y video de respaldo | 5 front + 4 pitch/video |

## Qué se reutiliza (guía: se reescribe, no se copia; CONTEXTO)
| Pieza | Ruta real en `/home/juan-chaparro/hackatwin-noche/ideas/refs/` | Uso |
|---|---|---|
| Estados | `hackatwin-x402-team1-avalanche/packages/contracts/src/libraries/PaymentStateLib.sol` (`canTransition`, l. 21) | Estados del hito: Pendiente → Confirmado / Vencido |
| Cobro con `withdraw` | `…/packages/contracts/src/PaymentHub.sol` (`withdraw`, l. 193; `_transition`, l. 211; `refund`, l. 158 como contraejemplo de un solo pagador) | Patrón de crédito y retiro |
| Reparto | `…/packages/contracts/src/RevenueSplitter.sol` (`_split`, l. 56) | Copiado adentro de `cerrarViaje`, sin desplegar el splitter (rescate) |
| Token | `…/packages/contracts/test/utils/MockERC20.sol` | Base de `ARGtDemo` |
| Despliegue y red | `…/packages/contracts/script/DeployFuji.s.sol`; `…/packages/chains/registry/fuji.json` | Script y RPC |
| UI | `…/packages/ui/src/atoms/Badge.tsx`, `TxLink.tsx` | Sellos y links a tx |
| Credencial | `Kumply/contracts/contracts/AttestationStore.sol` (`verify`, l. 224; `issueAttestation`, l. 197); `Kumply/contracts/scripts/issue-attestation.ts` e `issue-tier4-deployer.ts` | Chequeo exacto con `verify` (nunca `attestations()` ni `ComplianceGate`) y emisión en el plan B |
| SDK en el front | `Kumply/packages/sdk/src/client.ts` (`isPersonAtLeast`, l. 222; `isBusiness`, l. 236); `constants.ts` (l. 71, store de Fuji) | Sellos "empresa verificada" y "familia verificada" |

**De cero:** los dos contratos propios (salvo los patrones de arriba), los dos fronts y el script semilla. **Riesgo:** MEDIO, igual que en VERIFICACION.

## Plan B (si falla lo más riesgoso)
- **KUMPLY no emite el KYB (4) en su store de Fuji:** usamos la opción B del hallazgo 3, nuestra copia de `AttestationStore` con el equipo como verificador. Como el SDK recibe nuestro `contractAddress`, no hace falta adaptador. El KYC de Claudia sigue en el store oficial (por eso hay dos stores) y en el pitch lo decimos: "KYB emitido por nosotros hasta que KUMPLY habilite el Tier-4" (LITEPAPER l. 225). `WorkshopKYA` solo si todo lo demás falla, porque necesita adaptador.
- **No hay KYC real:** las familias y Claudia también van a nuestro store, y lo decimos.
- **Falla el `permit` o el débito:** cada familia paga su cuota con un botón (`approve` + `pagarCuota`). El blindaje por hitos, que es el corazón de la idea, no cambia.
- **Falla la devolución proporcional:** devolvemos partes iguales. Con cuota fija y todas al día da lo mismo, y en la demo hay 2 familias.
- **El reloj no llega a tiempo en vivo:** dejamos desplegado un segundo viaje con el hito de los boliches ya vencido y apretamos `liberarVencido` ahí.
- **Se cae Fuji o la RPC:** pasamos el video de la corrida en Fuji, grabado a las 18:00.

## 3 preguntas sí/no para la mañana
1. ¿KUMPLY puede emitir a mano el nivel 4 (KYB) a 5 billeteras nuestras en su `AttestationStore` de Fuji antes de las 12:00?
2. ¿Alguien del equipo puede completar hoy el KYC nivel 2 real (Sumsub) en Fuji con su DNI?
3. Si la respuesta 1 es no, ¿el jurado y KUMPLY aceptan una copia propia de `AttestationStore`, avisada en el pitch, como plan B válido para el track?

## Ataque final
*(Abogado del diablo 2, ronda 3)*
- **Hueco nuevo: ¿quién elige a la delegada?** El plan no dice quién carga la dirección de Claudia. Si la agencia despliega `ViajeEgresados`, puede poner como "delegada" a una empleada con KYC 2: el nivel prueba que es una persona, no que la votaron las familias. Hay que fijarla en el constructor y que cada familia la acepte al `adherir`.
- **¿Base de datos común?** Casi todo, sí. La "cuota cero" (6 %) ya va a un fideicomiso y el certificado de la agencia se chequea en Turismo ([argentina.gob.ar](https://www.argentina.gob.ar/node/117856)). Lo que se pierde sin cadena es que la agencia no pueda tocar el pozo y que las familias auditen sin pedirle permiso a nadie. Es real, pero hay que decirlo así.
- **¿Ya existe?** Busqué app o escrow de cuotas de egresados en AR/LATAM (7/11) y no encontré [SIN VERIFICAR que no exista]. El dolor está documentado: "un quilombo financiero", sin plataforma nombrada ([Sir Chandler, 6/6/2024](https://www.sirchandler.com.ar/2024/06/viajes-de-egresados-su-sistema-de-pagos-atado-con-alambre/)). Competidor nuevo: el Banco Nación financia el viaje en cuotas sin interés desde su app ([iProfesional, 4/8/2026](https://www.iprofesional.com/economia/461521-sigue-la-posibilidad-de-cuotas-sin-interes-o-prestamo-a-tasa-baja-para-estos-viajes)), y ahí las familias no tocan cripto.
- **¿Billetera cripto?** El `permit` arregla la firma, pero no el saldo: 32 familias tienen que comprar ARGt en Avalanche 14 veces, y Belo opera "principalmente en Base" (SPONSORS #1). Lo más grave: **los proveedores reales** (hotel, micro, boliche) no tienen billetera ni KYB y no cobran en ARGt. Sin ellos, el blindaje no tiene a quién pagarle.
- **¿Fuji en 12 h?** Es ajustado: ~250 líneas con varios pagadores, tope por período, devolución proporcional, `permit` y dos stores, más 8 billeteras y 5 pantallas. Lo más riesgoso es el KYB nivel 4 en el store de KUMPLY (LITEPAPER l. 225: el KYB depende de un presupuesto Enterprise pendiente). El reloj en minutos ya está cubierto con el segundo viaje.
- **¿ARGt y KUMPLY?** ARGt encaja (cuotas en pesos para gastos en pesos), pero en Fuji es `ARGtDemo` y cualquier token sirve igual. El KYC de la delegada suma. El KYB de la agencia está **pegado**: lo que frena al "amigo" es la aprobación de Claudia, no el nivel 4. En plan B, el KYB lo emitimos nosotros mismos.
