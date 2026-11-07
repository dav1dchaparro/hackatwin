# Arquitectura

Todo corre en **Avalanche Fuji C-Chain (43113)**.

## Componentes

```
 NAVEGADOR (web/, Vite+React+viem)                                    AVALANCHE FUJI C-CHAIN (43113)
 ┌──────────────────────────────────────────┐
 │ Entrar (email) ─► @0xgasless/core        │   userOp firmado     ┌──────────────┐   ┌────────────────────────┐
 │   OxGasClient.login → setupSmartAccount  │──────────────────────► Bundler +    │──►│ EntryPoint → SmartAcct │
 │ Pantallas: Dueño · Heredero · Guardianes │                      │ Paymaster    │   │  (msg.sender = la SA)  │
 │ Panel /demo (proyector, solo lectura)    │                      │ 0xGasless    │   └───────────┬────────────┘
 │                                          │                      │ (paga el gas)│               │ call
 │ lib/cliente-fuji.ts ── viem readContract,│                      └──────────────┘               ▼
 │   simulateContract, getLogs (polling 2s) │◄───── lecturas RPC ─────────────────── ┌───────────────────────────────┐
 │ lib/kumply.ts ── @kumply/sdk             │                                        │ LlaveEmergencia (VERIFICADO)  │
 │   isPersonAtLeast(addr,2) / isBusiness   │──── verify() ──────┐                   │  is KumplyGated, ReentrancyGd │
 └──────────────────────────────────────────┘                    │                   │  reglas + plata (mPESO)       │
                                                                 ▼                   │                               │
                                          ┌──────────────────────────────────┐ verify│  iniciarReclamo/cobrar:       │
                                          │ KUMPLY AttestationStore (Fuji)   │◄──────│   heredero tier 1-3, nivel≥2  │
                                          │ 0xa3Bc5564…22dD                  │       │  emergencias: guardián ≥2     │
                                          │ verify(addr)→(ok,tier,ts,expiry) │       │   destino = empresa (tier 4)  │
                                          └──────────────────────────────────┘       └──────────────┬────────────────┘
                                                                                                    │ SafeERC20.transfer
                                                                                     ┌──────────────▼────────────────┐
                                                                                     │ MockPesos (mPESO, VERIFICADO) │
                                                                                     │ faucet() libre (testnet)      │
                                                                                     └───────────────────────────────┘
 Tomás (EOA con AVAX, SIN atestación) ── cast send cobrar() --gas-limit ──► revierte NotPerson(tomás,0,2)  (evidencia KUMPLY)
```

## Flujo de la demo (instancia con plazos en segundos)

```
 Deploy (P1, script): dueño=SA Marta · herederos Lucía 60% / Tomás 40% · guardianes Lucía, Pablo, Rosa
                      inactividad 60 s · gracia 30 s · tope emergencia 20% · demoraVeto 0 · siembra 1.000.000 mPESO

 [ACTIVA]──Marta "Estoy bien" (gasless)──►[ACTIVA, reloj 60 s, tope emergencia = 200.000]
     │
     ├─ Pablo propone 150.000 → Clínica (tier 4) ─► Lucía aprueba (2/3) ─► EmergenciaEjecutada  (clínica +150.000)
     ├─ Pablo propone 100.000 → Clínica ─► revierte TopeEmergenciaSuperado (quedan 50.000)
     ├─ Pablo propone → su propia cuenta ─► revierte NotBusiness(pablo, 2)
     │
     └─ pasan 60 s sin señal ─►[VENCIDA]──Lucía "Iniciar reclamo"──►[EN GRACIA 30 s]
                                                     │   (Marta podría tocar "Estoy bien" y se cancela)
                                                     └─ fin de gracia ─►[EJECUTABLE]
                                                            ├─ Tomás "Cobrar" ─► NotPerson(tomás, 0, 2): BLOQUEADO, su 40% queda
                                                            └─ Lucía "Cobrar" ─► foto = 850.000 → Lucía +510.000 ─►[REPARTIENDO]
```

## Carpetas y responsables

| Carpeta | Contenido | Responsable |
|---|---|---|
| `contracts/` | Foundry: `LlaveEmergencia`, `MockPesos`, `KumplyGated`, `DemoAttestationStore`, tests y scripts de deploy | P1 |
| `deployments/fuji.json` | Única fuente de verdad de las direcciones | P1 |
| `web/src/abi/` | ABI generado por `export-abi.mjs` (nadie lo edita a mano) | P1 |
| `web/src/lib/` | Cliente de Fuji, 0xGasless, KUMPLY, errores en castellano | P2 |
| `keeper/` | Avisos por Telegram antes del vencimiento (off-chain) | P2 |
| `web/src/{pages,components,mock,styles}` | Pantallas Dueño, Heredero, Guardianes y panel `/demo` | P3 |
| `README.md`, `docs/`, `scripts/` | Documentación, evidencias, benchmark de finalidad y pitch | P4 |

## Decisiones de diseño

- **Sin función de administrador:** las reglas viven en el mismo contrato que guarda la plata.
- **Gate de identidad on-chain:** el contrato lee `verify()` del `AttestationStore` de KUMPLY en la misma tx. La web usa `@kumply/sdk` solo para mostrar el semáforo.
- **Reloj:** los plazos usan `block.timestamp`, como recomienda Ava Labs para la C-Chain (los bloques se producen solo cuando hay transacciones).
- **Avisos off-chain:** no hay cron on-chain; un keeper lee `estado()` y avisa por Telegram antes del vencimiento.
