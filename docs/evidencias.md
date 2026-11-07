# Evidencias on-chain (Fuji C-Chain, 43113)

Cada hash o link que el equipo publica en el PR #2 se copia acá en el momento.
Explorer: `https://testnet.snowtrace.io/tx/<hash>` · contratos: `https://testnet.snowtrace.io/address/<dir>#code`.

## Contratos verificados

| Contrato | Dirección | Link `#code` | Publicado por / hora |
|---|---|---|---|
| `LlaveEmergencia` (instancia A) | `TODO` | `TODO` | P1 |
| `MockPesos` (mPESO) | `TODO` | `TODO` | P1 |
| `LlaveEmergencia` (instancia final A) | `TODO` | `TODO` | P1 (16:15) |
| `LlaveEmergencia` (instancia B, respaldo) | `TODO` | `TODO` | P1 (16:15) |

## Transacciones

| # | Acción | Quién | Resultado esperado | Hash / link | Patrocinada (0xGasless) | Prueba de bonus |
|---|---|---|---|---|---|---|
| 1 | `estoyBien()` | Marta (SA) | evento `SenalDeVida` | `TODO` | sí | 0xGasless |
| 2 | `proponerEmergencia(150.000 → Clínica)` | Pablo (SA) | evento `EmergenciaPropuesta` | `TODO` | sí | 0xGasless · KUMPLY (pasa) |
| 3 | `aprobarEmergencia` | Lucía (SA) | `EmergenciaVotada` + `EmergenciaEjecutada` | `TODO` | sí | KUMPLY (pasa) |
| 4 | Emergencia que supera el tope | Pablo | revierte `TopeEmergenciaSuperado` (simulación) | `TODO` captura | — | — |
| 5 | Emergencia a un destino no verificado | Pablo | revierte `NotBusiness` (simulación) | `TODO` captura | — | KUMPLY (bloqueada) |
| 6 | `iniciarReclamo()` | Lucía (SA) | evento `ReclamoIniciado` | `TODO` | sí | 0xGasless · KUMPLY (pasa) |
| 7 | Reclamo cancelado por "Estoy bien" | Marta (SA) | evento `ReclamoCancelado` | `TODO` | sí | — |
| 8 | `vetarEmergencia` | Marta (SA) | evento de veto | `TODO` | sí | — |
| 9 | `cobrar()` sin atestación | Tomás (EOA) | **revierte** `NotPerson(tomás, 0, 2)` | `TODO` | no (EOA con AVAX) | KUMPLY (bloqueada) |
| 10 | `cobrar()` | Lucía (SA) | `Cobrado` (+ `ComisionCobrada` si entra A1) | `TODO` | sí | 0xGasless · KUMPLY (pasa) |

Meta del plan: **≥8 tx con link** a las 15:30.

## Saldos de AVAX de las smart accounts

| Cuenta | AVAX | Captura |
|---|---|---|
| Marta | `TODO` (esperado: 0) | `TODO` |
| Lucía | `TODO` (esperado: 0) | `TODO` |
| Pablo | `TODO` (esperado: 0) | `TODO` |
