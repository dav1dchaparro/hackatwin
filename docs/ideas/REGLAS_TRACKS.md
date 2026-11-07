# Reglas oficiales de los dos tracks (resumen fiel de los PDFs, 7/11)

Hoy: sábado 7/11/2026. Kickoff 9:00. **ENTREGA 18:00** (Stablecoins lo dice explícito; asumir lo mismo para Blockchain). Demo day 19-21. Equipo de 4. Repo ya creado a las 9:12 (privado, se hace público al entregar).
**Pregunta abierta para organizadores:** ¿un mismo proyecto puede competir en los dos tracks? [SIN CONFIRMAR]

## A. Blockchain Track (Avalanche) — un premio (monto no informado)
6 OBLIGATORIOS (si falta uno, no es elegible):
1. Contrato en Avalanche (Fuji o mainnet, C-Chain o L1 propia) VERIFICADO en el explorer.
2. Interfaz web o mobile conectada a los contratos (CLI o bot NO sirve).
3. "Por qué Avalanche" documentado en el repo (finalidad rápida, L1 propia, compliance/privacidad institucional, ICM).
4. Modelo de negocio: problema, cliente, ingresos, ventaja (validación temprana suma).
5. Repo público con instalación, despliegue y arquitectura.
6. README que separe lo hecho en el evento.
Jurado (100): Impacto 25 · Uso de Avalanche (capacidades propias de la red) 25 · Factibilidad técnica (funciona y está desplegado) 20 · Negocio y escalabilidad 20 · Presentación 10. Desempate: jurado sin bonus.
Bonus:
- 0xGasless hasta +10: básico +5 (cualquier componente + tx patrocinada o pago x402 en Fuji/mainnet); core +10 (en el flujo principal, ej. usuario nunca paga gas).
- KUMPLY hasta +10: básico +5 (@kumply/sdk + gate ON-CHAIN con isPersonAtLeast/isBusiness/isAgent en Fuji, mostrando una dirección que pasa y una bloqueada); core +10 (verificación clave del producto, PRIORIDAD casos KYA/agentes). No usar hasTier(). README: las atestaciones de Fuji son de demo sin verificación real.
- Combo +20 ejemplo: paymaster 0xGasless que solo patrocina cuentas verificadas con KUMPLY.

## B. Track Stablecoins (Twin) — 500 USDT + merch
Consigna: en 9 horas, un producto que explore qué se puede hacer con moneda local programable y componible usando las Twin Stablecoins, con al menos una tx onchain real en la demo. Ideas nuevas, NO versiones onchain de productos existentes. El token debe ser el NÚCLEO, no decorativo.
Obligatorio: usar al menos una Twin Stablecoin (ARGt, BRAt, COLt, PERt, MEXt, CHLt, BOLt) en una chain elegible (Arbitrum, Base, Polygon, Ethereum, Avalanche) + al menos un hash de tx ejecutada por el producto, verificable en el explorer. Commits deben mostrar que la lógica se hizo hoy.
Criterios (1-5, igual peso): Idea (original, solo posible con moneda local onchain, token núcleo) · Problema (usuario y dolor concreto en la región) · Negocio · Pitch (3 min + demo que funciona).
Disparadores sugeridos por Twin: pagos agénticos en moneda local con límites del usuario; capital de trabajo para comercios con scoring por cobros onchain y repago % de ventas (vaults Morpho); FX entre monedas locales (pools Curve) o cobertura cambiaria.

## Hechos técnicos que condicionan
- NO hay ARGt oficial en Fuji. Tokens de prueba (montos mínimos) los dan los mentores de Twin. ARGt en Avalanche C-Chain mainnet: 0x2E4e93eCA2E16E4989b894e188B7F7fC0175703B (según repo de referencia; confirmar). Curve pools y Morpho vaults solo en Arbitrum. Bridge solo ARGt entre Arbitrum/Base/Polygon/Ethereum (no Avalanche).
- KUMPLY: atestaciones de demo en Fuji solo las emite el staff (hay que pedirlas: cuello de botella humano). Gate en Solidity leyendo AttestationStore Fuji 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD `verify(addr) → (ok, tier, ts, expiry)`. Mainnet de KUMPLY es beta de solo lectura.
- 0xGasless: funciona en Fuji (@0xgasless/core, login con email, smart account, tx patrocinadas; API key en dashboard). El lane KUMPLY+0xGasless en Fuji solo patrocina tier 5 (agentes).
- Una opción dual: mismo contrato en Fuji (USDC/token de prueba + KUMPLY + 0xGasless) y en Avalanche mainnet con ARGt real de Twin. Evaluar costo/riesgo.
