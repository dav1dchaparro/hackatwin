# Arquitectura

Todo corre en **Avalanche Fuji C-Chain (43113)**. Direcciones en `deployments/fuji.json`.

## Componentes

```
 NAVEGADOR (web/, Vite+React+viem)                         AVALANCHE FUJI C-CHAIN (43113)
 ┌───────────────────────────────────────┐   userOp    ┌──────────────┐   ┌───────────────────────┐
 │ Entrar (email) ─► @0xgasless/core     │────────────►│ Bundler +    │──►│ EntryPoint → SA dueña │
 │ Pantallas: Dueña · Heredero · /demo   │             │ Paymaster    │   └───────────┬───────────┘
 │ lecturas con viem (polling 2 s)       │             │ 0xGasless    │               │ depositar / retirar /
 │ badge @kumply/sdk (isAgent)           │             └──────────────┘               │ estoyBien / configurar
 └───────────────────────────────────────┘                                            ▼
                                                                       ┌──────────────────────────────┐
 AGENTE (agente/, Node+TS+viem)                                        │ Llave (VERIFICADO)           │
 ┌───────────────────────────────────────┐  iniciarReclamo / liberar   │  is KumplyGated              │
 │ vigila estado() · avisa Telegram/mail │────────────────────────────►│  _requireAgent(msg.sender)   │
 │ ejecuta al vencer plazo y gracia      │                             │  → reparte a TODOS los       │
 └───────────────────────────────────────┘                             │    herederos + 1% comisión   │
                                                                       └──────┬─────────────┬─────────┘
                                                         verify(agente)       │             │ SafeERC20
                                          ┌───────────────────────────────────▼──┐   ┌──────▼──────────────┐
                                          │ KUMPLY AttestationStore (Llave A)    │   │ MockPesos (mPESO)   │
                                          │ 0xa3Bc…22dD · o DemoAttestationStore │   │ VERIFICADO          │
                                          │ 0xc169…D513 (Llave B, plan B)        │   └─────────────────────┘
                                          └──────────────────────────────────────┘
 Bot sin KYA ── liberar() ──► revierte NotAgent(bot, 0)  (evidencia KUMPLY)
```

## Fases de una Llave

```
 Activa ──(vence el plazo sin señales)──► Vencida ──agente: iniciarReclamo()──► EnGracia
   ▲                                                                              │
   └──────────── cualquier movimiento de la dueña: ReclamoCancelado ◄─────────────┤
                                                                                  ▼
                                                     Ejecutable ──agente: liberar()──► Liberada
```

Demo: 60 s de inactividad, 30 s de gracia, comisión 1%.

## Carpetas y responsables

| Carpeta | Contenido | Responsable |
|---|---|---|
| `contracts/` | Foundry: `Llave`, `MockPesos`, `KumplyGated`, `DemoAttestationStore`, tests y script de deploy | P1 |
| `agente/` | Agente que vigila, avisa y ejecuta | P1 |
| `deployments/fuji.json` · `web/src/abi/` | Direcciones y ABI generados | P1 |
| `web/src/lib/` | Cliente de Fuji, 0xGasless, KUMPLY, errores en castellano | P2 |
| `web/src/{pages,components,mock,styles}` | Pantallas Dueña, Heredero y panel `/demo` | P3 |
| `README.md`, `docs/`, `scripts/` | Documentación, evidencias, benchmark de finalidad y pitch | P4 |

## Decisiones de diseño

- **Sin función de administrador:** las reglas viven en el mismo contrato que guarda la plata.
- **KUMPLY en quien ejecuta:** solo un agente con KYA (tier 5 exacto) puede iniciar el reclamo y liberar. No se usa `hasTier()`.
- **Reparto en una sola tx:** `liberar()` cobra el 1% y envía a todos los herederos; el polvo de redondeo va al último heredero.
- **Reloj:** los plazos usan `block.timestamp`, como recomienda Ava Labs para la C-Chain.
- **Avisos off-chain:** no hay cron on-chain; el agente lee `estado()` y avisa antes del vencimiento.
