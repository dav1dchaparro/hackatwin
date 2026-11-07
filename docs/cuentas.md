# Cuentas de prueba (Fuji C-Chain, 43113)

Solo direcciones **públicas**. Nunca claves privadas, seeds ni API keys.
Las cuentas de la web son **smart accounts** de 0xGasless (la dirección que muestra la web después del login con email). KUMPLY tiene que atestar **esa** dirección, no la EOA que firma.

| Alias | Rol en la demo | Tipo | Dirección | Atestación KUMPLY esperada | Estado (`verify`) |
|---|---|---|---|---|---|
| Marta | Dueña de la Llave | SA 0xGasless | `TODO` (P2) | persona tier 2 | `TODO` |
| Lucía | Heredera 60% + guardiana | SA 0xGasless | `TODO` (P2) | persona tier 2 | `TODO` |
| Pablo | Guardián | SA 0xGasless | `TODO` (P2) | persona tier 2 | `TODO` |
| Rosa | Guardiana (reserva) | SA 0xGasless | `TODO` (P2) | persona tier 2 | `TODO` |
| Tomás | Heredero 40%, **sin** atestación (la dirección bloqueada) | EOA con AVAX | `TODO` (P1) | ninguna, a propósito | `TODO` |
| Clínica | Destino de la emergencia | fixture de KUMPLY | `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` | empresa tier 4 (vence 16/07/2027) | `TODO` |
| Deployer | Despliega y verifica los contratos | EOA (P1) | `TODO` (P1) | — | — |
| Tesorería | Recibe la comisión del 1% (si entra A1) | EOA del equipo | `TODO` | — | — |

## Control de atestaciones

```bash
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
STORE=0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD
cast call $STORE "verify(address)(bool,uint32,uint64,uint64)" <direccion> --rpc-url $FUJI_RPC_URL
```

Devuelve `(ok, tier, timestamp, vencimiento)`. Controles a las 14:40 y 15:00; a las 15:00 se decide: atestaciones oficiales o plan B (store demo de P1, declarado en el README).

## Registro del pedido a KUMPLY

| Hora | Qué se pidió | Respuesta |
|---|---|---|
| `TODO` | tier 2 para las SA de Marta, Lucía, Pablo y Rosa; Tomás sin atestación | `TODO` |
