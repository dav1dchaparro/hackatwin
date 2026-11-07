# Contexto de la sesión madre (leer junto con HACKATWIN_BRIEF.md y TORNEO_IDEAS.md)

## Correcciones al HACKATWIN_BRIEF.md (prevalecen sobre el brief)
- Los repos de referencia son SOLO GUÍA de aprendizaje; no se entrega código de ellos. Lo que se construya se despliega en Avalanche Fuji (C-Chain, chain ID 43113).
- Ignorar las "Reglas de trabajo" de git del brief: no hay repo ni git antes del 7/11 a las 9:00. Esta noche solo se generan ideas.
- La tabla de "Sesiones en paralelo" del brief no aplica a esta noche. El equipo es de 4 personas.

## Datos verificados el 6/11 contra el código (usar en lugar de memoria)
- Demo 1 del repo x402 (`refs/hackatwin-x402-team1-avalanche`) corre sobre una COPIA LOCAL (anvil) de C-Chain mainnet, paga en ARGt, y el precio sale de Curve en Arbitrum + Chainlink en Base. En Fuji NO funciona tal cual: hay que usar USDC de prueba o un token propio. El repo tiene un perfil `fuji-crosschain` con USDC y un script de despliegue de RevenueSplitter en Fuji.
- KUMPLY (`refs/Kumply`), SDK `@kumply/sdk` v1.3.0:
  - `new KumplyClient({ network: "fuji", contractAddress: DEPLOYMENTS.fuji.attestationStore })` — `contractAddress` es OBLIGATORIO.
  - Niveles: 1 email+teléfono, 2 documento+prueba de vida, 3 domicilio+origen de fondos (escalera de personas); 4 empresa (KYB) y 5 agente (KYA) son categorías aparte.
  - `isPersonAtLeast(addr, nivel)`, `isBusiness(addr)`, `isAgent(addr)`. `hasTier` está deprecado. `verify()` devuelve verified=false igual si venció, fue revocada o nunca existió.
  - NO verifica edad. La credencial es pública en texto plano (verified, tier, timestamp, expiry, verifier), sin datos personales y sin ZK.
  - Integración con eERC es "Phase 2", NO implementada.
  - Las verificaciones (KYC con Sumsub) se emiten en Fuji; mainnet es beta de solo lectura. RIESGO DE DEMO: hace falta al menos una billetera con verificación real en Fuji. Ver `contracts/contracts/workshop/WorkshopKYA.sol`.
- eERC (ava-labs/EncryptedERC, no clonado): oculta saldos y montos con zk-SNARKs; transferencia ≈ 947k gas (~15× ERC-20); tiene un auditor que puede desencriptar. Pesado de montar en 12 h.

## Semillas extra aprobadas por el usuario (se suman a las 6 de TORNEO_IDEAS.md)
7. **Seña segura para alquileres de verano:** la seña de un alquiler temporario (o auto usado / Marketplace) queda retenida en un contrato; el dueño solo puede publicar si tiene KYC nivel 2+; se libera al confirmar el check-in o al vencer el plazo sin reclamo; si hay reclamo decide un árbitro.
8. **Compraventa P2P de USDT sin triangulación:** el vendedor deja los USDT retenidos; ambas partes con KYC. Debilidad conocida: KUMPLY prueba que la billetera es de una persona verificada, no que la cuenta bancaria que pagó sea suya.
