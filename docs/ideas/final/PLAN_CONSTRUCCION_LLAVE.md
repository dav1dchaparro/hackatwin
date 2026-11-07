# PLAN DE CONSTRUCCIÓN: Llave de Emergencia (sáb 7/11/2026, 12:50 → entrega 18:00)

Blockchain Track de Avalanche, todo en **Fuji C-Chain (43113)**. Repo `github.com/dav1dchaparro/hackatwin`, rama default `develop`, ramas `feature/*` → PR a `develop` (CI: commitlint + nombre de rama).
Este archivo es el **cómo se construye**. El **qué** está en `PLAN_LLAVE_EMERGENCIA.md` (producto, problema, negocio y pitch); los cambios de `EVAL_LLAVE.md` (red team) ya están aplicados acá. La base `KumplyGated` sale de `PLAN_TAREA2_KUMPLY_GATE.md`.
Roles **P1-P4 sin nombres**: el equipo los asigna en el kickoff y no se vuelve a discutir. Lo no confirmado hoy va marcado **[SIN VERIFICAR]**.

**Nombres: este plan manda.** El plan de producto usaba nombres en inglés. Desde ahora, en código, issues y README se usan estos:

| En `PLAN_LLAVE_EMERGENCIA.md` | En el código (este plan) |
|---|---|
| `EmergencyVault` | `LlaveEmergencia` |
| `PesoDemo` (ARSd) | `MockPesos` (mPESO) |
| `ping()` / `startClaim()` / `claim()` | `estoyBien()` / `iniciarReclamo()` / `cobrar()` |
| `requestEmergency` / `approveEmergency` | `proponerEmergencia` / `aprobarEmergencia` (+ `ejecutarEmergencia`, `vetarEmergencia`) |
| `VITE_VAULT` | `VITE_LLAVE_ADDRESS` |

**Cambios al diseño del plan de producto (todos salen del red team de `EVAL_LLAVE.md`, punto 6):**
1. **Tope TOTAL de emergencias hasta el próximo "Estoy bien"** (20% del saldo que había en la última señal), en vez de 20% cada N días con cooldown. Dos guardianes de acuerdo sacan como mucho el 20% mientras Marta no da señales, y no ~74% en 6 meses.
2. **El destino de una emergencia tiene que ser una empresa verificada en KUMPLY** (`isBusiness`, tier 4: la clínica). Un guardián no se puede mandar la plata a sí mismo. Para la demo, la "Clínica" es el fixture de KUMPLY `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` (tier 4, vence el 16/07/2027). Solo recibe plata, así que no hace falta su clave.
3. **Demora de veto opcional** (`demoraVeto`): con 2 votos, la emergencia espera N segundos antes de ejecutarse y el dueño la puede vetar. Con `demoraVeto = 0` se ejecuta con el 2.º voto (así va la demo en vivo, para que entre en 3 min).
4. **A los guardianes se los chequea al actuar, no al configurar.** Así P1 puede desplegar a las 14:30 aunque las atestaciones no hayan llegado. El gate igual es on-chain en cada acción. La web muestra el semáforo al configurar.

---

## 1. Arquitectura final

### 1.1 Estructura del monorepo (y quién es dueño de cada carpeta)
```
hackatwin/
├─ README.md                      P4  (6 obligatorios + bonus; enlaza a contracts/README.md y web/README.md)
├─ CONTRIBUTING.md  .github/      nadie (ya existen)
├─ .gitignore                     P1 agrega: contracts/out, contracts/cache, contracts/broadcast/*/dry-run, **/.env, web/node_modules, web/dist
├─ deployments/
│  └─ fuji.json                   P1  (única fuente de verdad de direcciones)
├─ contracts/                     P1  (Foundry)
│  ├─ foundry.toml  remappings.txt  .env.example  README.md
│  ├─ lib/                        forge-std + openzeppelin-contracts@v5.1.0 (submódulos)
│  ├─ src/
│  │  ├─ kumply/IKumplyAttestationStore.sol   (copiado de PLAN_TAREA2)
│  │  ├─ kumply/KumplyGated.sol               (copiado de PLAN_TAREA2)
│  │  ├─ LlaveEmergencia.sol
│  │  ├─ MockPesos.sol
│  │  └─ demo/DemoAttestationStore.sol        (para tests y para el plan B)
│  ├─ test/LlaveEmergencia.t.sol  test/ForkFuji.t.sol
│  └─ script/DeployLlave.s.sol  script/export-abi.mjs
├─ web/                           Vite + React + TS + viem
│  ├─ .env.example  README.md  package.json  vite.config.ts  index.html      P3 (scaffold)
│  └─ src/
│     ├─ abi/                     P1 (GENERADO por export-abi.mjs, nadie lo edita a mano)
│     │  LlaveEmergencia.ts  MockPesos.ts  KumplyStore.ts  deployments.fuji.json
│     ├─ lib/                     P2 (tipos.ts queda CONGELADO a las 13:30)
│     │  tipos.ts  config.ts  gasless.ts  cliente-fuji.ts  kumply.ts  errores.ts  index.ts
│     ├─ mock/cliente-mock.ts     P3
│     ├─ components/              P3 (Monto, TxLink, BadgeKumply, CuentaRegresiva, LineaDeFases, BotonTx)
│     ├─ pages/                   P3 (Entrar, Dueno, Heredero, Guardian, Demo)
│     └─ App.tsx  main.tsx  styles/   P3
└─ docs/                          P4
   arquitectura.md  cuentas.md  evidencias.md  pitch.md  capturas/
```
**Regla de oro:** nadie edita la carpeta de otro. Si hace falta un cambio, se pide en el chat del equipo y lo hace el dueño. `package.json` de `web/` lo arma P3 a las 13:00 con **todas** las dependencias ya instaladas, para que P2 no tenga que tocarlo.

### 1.2 Diagrama de componentes
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

### 1.3 Flujo de la demo (instancia con períodos en segundos)
```
 Deploy (P1, script): dueño=SA Marta · herederos Lucía 60% / Tomás 40% · guardianes Lucía, Pablo, Rosa
                      inactividad 60 s · gracia 30 s · tope emergencia 20% · demoraVeto 0 · siembra 1.000.000 mPESO

 [ACTIVA]──Marta "Estoy bien" (gasless)──►[ACTIVA, reloj 60 s, tope emergencia = 200.000]
     │
     ├─ Pablo propone 150.000 → Clínica (tier 4) ─► Lucía aprueba (2/3) ─► EmergenciaEjecutada  (clínica +150.000)
     ├─ Pablo propone 100.000 → Clínica ─► revierte TopeEmergenciaSuperado (quedan 50.000)       (simulación en vivo)
     ├─ Pablo propone → su propia cuenta ─► revierte NotBusiness(pablo, 2)                         (simulación en vivo)
     │
     └─ pasan 60 s sin señal ─►[VENCIDA]──Lucía "Iniciar reclamo"──►[EN GRACIA 30 s]
                                                     │   (Marta podría tocar "Estoy bien" y se cancela: tx grabada)
                                                     └─ fin de gracia ─►[EJECUTABLE]
                                                            ├─ Tomás "Cobrar" ─► NotPerson(tomás, 0, 2): BLOQUEADO, su 40% queda
                                                            └─ Lucía "Cobrar" ─► foto = 850.000 → Lucía +510.000 ─►[REPARTIENDO]
```

---

## 2. CONTRATO DE INTERFACES (congelado a las 13:30)

Esto es lo que permite trabajar en paralelo. **P1 implementa exactamente estas firmas.** P2 y P3 programan contra ellas desde las 13:00 con el mock, sin esperar el deploy. Después de las 13:30, los cambios solo pueden **agregar** cosas, se avisan en el chat y P1 regenera el ABI.

### 2.1 `KumplyGated` e interfaz del store
Se copian **tal cual** de `PLAN_TAREA2_KUMPLY_GATE.md` §1-§2 (`IKumplyAttestationStore.verify/attestations`; `KumplyGated` con `kumply` immutable, `_tierOf`, `_isPersonAtLeast`, `_isBusiness`, `_requirePersonAtLeast`, `_requireBusiness`, `isPersonAtLeast/isBusiness/isAgent` públicas y los errores `KumplyStoreInvalid`, `InvalidPersonLevel`, `NotPerson(who, tier, minLevel)`, `NotBusiness(who, tier)`, `NotAgent(who, tier)`). Regla: persona = `ok && tier >= N && tier <= 3`, empresa = `tier == 4`. **Nunca `hasTier`.**

### 2.2 `LlaveEmergencia.sol` (firma exacta)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {KumplyGated} from "./kumply/KumplyGated.sol";
import {IKumplyAttestationStore} from "./kumply/IKumplyAttestationStore.sol";

/// Una bóveda por dueño. Sin función de administrador: nadie (ni nosotros) puede sacar la plata fuera de estas reglas.
contract LlaveEmergencia is KumplyGated, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ───────────── Tipos ─────────────
    enum Fase { Activa, Vencida, EnGracia, Ejecutable, Repartiendo }
    //          0       1        2         3           4      ← el índice lo usa la web

    struct Heredero { address cuenta; uint16 bps; }          // bps: 6000 = 60%

    struct Emergencia {
        address proponente;
        address destino;        // empresa KUMPLY (tier 4): se chequea al proponer y al ejecutar
        uint256 monto;
        uint64  propuestaEn;
        uint64  aprobadaEn;     // 0 = todavía no tiene 2 votos
        uint8   votos;
        bool    ejecutada;
        bool    vetada;
        string  motivo;
    }

    struct Config {
        address    dueno;              // smart account 0xGasless del dueño
        address[]  herederos;          // 1..5, sin repetidos, ni cero, ni el dueño
        uint16[]   bps;                // mismo largo, suman 10_000
        address[3] guardianes;         // 3 distintos, ni cero, ni el dueño
        uint64     plazoInactividad;   // seg. Demo 60; prod 180 días
        uint64     plazoGracia;        // seg. Demo 30; prod 30 días
        uint16     topeEmergenciaBps;  // 1..2_000 (máx 20%)
        uint64     demoraVeto;         // seg. 0 = se ejecuta con el 2.º voto
    }

    struct Estado {                    // una sola lectura para toda la web
        address dueno;
        Fase    fase;
        uint256 saldo;                 // token.balanceOf(this)
        uint64  ultimaSenal;
        uint64  venceEn;               // ultimaSenal + plazoInactividad
        uint64  reclamoIniciadoEn;     // 0 = no hay reclamo
        uint64  graciaTerminaEn;       // 0 si no hay reclamo
        uint256 foto;                  // saldo fijado en el 1.er cobro (0 = no empezó el reparto)
        uint256 emergenciaDisponible;  // lo que todavía se puede sacar por emergencia
        uint256 cantidadEmergencias;
        uint64  ahora;                 // block.timestamp, para que la web corrija su reloj
    }

    // ───────────── Constantes ─────────────
    uint32 public constant NIVEL_PERSONA = 2;
    uint8  public constant VOTOS_NECESARIOS = 2;
    uint8  public constant MAX_HEREDEROS = 5;
    uint16 public constant BPS_TOTAL = 10_000;
    uint16 public constant TOPE_EMERGENCIA_MAX_BPS = 2_000;

    // ───────────── Estado ─────────────
    IERC20  public immutable token;
    uint64  public immutable periodoMinimo;   // piso de los plazos: 1 en la instancia de demo, 2_592_000 (30 días) en prod
    address public dueno;
    uint64  public ultimaSenal;
    uint64  public plazoInactividad;
    uint64  public plazoGracia;
    uint64  public reclamoIniciadoEn;
    uint256 public foto;
    uint16  public topeEmergenciaBps;
    uint64  public demoraVeto;
    uint256 public baseEmergencia;            // saldo en la última señal del dueño
    uint256 public usadoEmergencia;           // sacado por emergencias desde la última señal
    Heredero[]  internal _herederos;
    address[3]  internal _guardianes;
    Emergencia[] internal _emergencias;       // id = índice (empieza en 0)
    mapping(address => bool) public cobro;                         // el heredero ya cobró
    mapping(uint256 => mapping(address => bool)) public voto;      // voto[id][guardian]

    // ───────────── Eventos ─────────────
    event Configurada(address indexed dueno, address[] herederos, uint16[] bps, address[3] guardianes,
                      uint64 plazoInactividad, uint64 plazoGracia, uint16 topeEmergenciaBps, uint64 demoraVeto);
    event SenalDeVida(address indexed dueno, uint64 cuando, uint256 baseEmergencia);
    event Depositado(address indexed de, uint256 monto);
    event Retirado(address indexed a, uint256 monto);
    event DuenoTransferido(address indexed anterior, address indexed nuevo);
    event ReclamoIniciado(address indexed heredero, uint64 graciaTerminaEn);
    event ReclamoCancelado(uint64 cuando);
    event RepartoIniciado(uint256 foto);
    event Cobrado(address indexed heredero, uint256 monto);
    event EmergenciaPropuesta(uint256 indexed id, address indexed guardian, address indexed destino, uint256 monto, string motivo);
    event EmergenciaVotada(uint256 indexed id, address indexed guardian, uint8 votos);
    event EmergenciaEjecutada(uint256 indexed id, address indexed destino, uint256 monto);
    event EmergenciaVetada(uint256 indexed id);

    // ───────────── Errores (además de los de KumplyGated) ─────────────
    error NoEsDueno(address quien);
    error NoEsHeredero(address quien);
    error NoEsGuardian(address quien);
    error PorcentajesInvalidos(uint256 suma);
    error CantidadHerederosInvalida(uint256 cantidad);
    error DireccionInvalida(address cuenta);
    error PlazoInvalido(uint64 plazo, uint64 minimo);
    error TopeInvalido(uint16 bps);
    error MontoInvalido();
    error SaldoInsuficiente(uint256 pedido, uint256 disponible);
    error SigueVivo(uint64 venceEn);
    error ReclamoYaIniciado(uint64 iniciadoEn);
    error SinReclamo();
    error GraciaEnCurso(uint64 terminaEn);
    error RepartoEnCurso();
    error YaCobraste(address heredero);
    error TopeEmergenciaSuperado(uint256 monto, uint256 disponible);
    error EmergenciaInexistente(uint256 id);
    error EmergenciaCerrada(uint256 id);
    error YaVotaste(uint256 id, address guardian);
    error FaltanVotos(uint256 id, uint8 votos);
    error VetoEnCurso(uint256 id, uint64 ejecutableDesde);

    // ───────────── Constructor ─────────────
    constructor(IKumplyAttestationStore store, IERC20 token_, uint64 periodoMinimo_, Config memory c) KumplyGated(store);

    // ───────────── Dueño (cada acción del dueño cuenta como "estoy bien") ─────────────
    function estoyBien() external;                                   // onlyDueno; cancela el reclamo si había
    function depositar(uint256 monto) external;                      // cualquiera (si es el dueño, cuenta como señal)
    function retirar(address a, uint256 monto) external;            // onlyDueno
    function configurar(Config calldata c) external;                 // onlyDueno; c.dueno debe ser == dueno
    function transferirDueno(address nuevo) external;                // onlyDueno (sirve para desplegar antes de tener la SA)
    function vetarEmergencia(uint256 id) external;                   // onlyDueno

    // ───────────── Herencia ─────────────
    function iniciarReclamo() external;                              // heredero verificado, fase Vencida
    function cobrar() external;                                      // heredero verificado, fase Ejecutable/Repartiendo

    // ───────────── Emergencia ─────────────
    function proponerEmergencia(address destino, uint256 monto, string calldata motivo) external returns (uint256 id);
    function aprobarEmergencia(uint256 id) external;                 // con el 2.º voto y demoraVeto==0, ejecuta
    function ejecutarEmergencia(uint256 id) external;                // cualquiera, pasada la demora de veto

    // ───────────── Lecturas ─────────────
    function fase() public view returns (Fase);
    function estado() external view returns (Estado memory);
    function herederos() external view returns (Heredero[] memory);
    function guardianes() external view returns (address[3] memory);
    function esHeredero(address cuenta) public view returns (bool es, uint16 bps);
    function esGuardian(address cuenta) public view returns (bool);
    function parteDe(address heredero) external view returns (uint256);   // foto (o saldo) * bps / 10_000
    function emergencia(uint256 id) external view returns (Emergencia memory);
    function cantidadEmergencias() external view returns (uint256);
    function emergenciaDisponible() public view returns (uint256);
    // heredadas de KumplyGated: isPersonAtLeast(address,uint32), isBusiness(address), isAgent(address), kumply()
}
```

### 2.3 Reglas de cada función (lo que testea P1 y lo que muestra P3)
| Función | Quién | Requisitos (en orden; el primero que falla da el error) | Efecto + evento |
|---|---|---|---|
| `constructor` | deployer | `store` con código; 1 ≤ herederos ≤ 5; largos iguales; bps suman 10.000; sin cero/repetidos/dueño; guardianes distintos y ≠ dueño; plazos ≥ `periodoMinimo`; 1 ≤ tope ≤ 2.000. **No** chequea KUMPLY | `ultimaSenal = now`, `baseEmergencia = 0` → `Configurada` |
| `fase()` | — | — | `foto≠0` → Repartiendo · `reclamo≠0` → (`now ≥ reclamo+gracia` ? Ejecutable : EnGracia) · `now ≥ ultimaSenal+inactividad` → Vencida · si no, Activa |
| `estoyBien()` | dueño | `NoEsDueno` · `RepartoEnCurso` | `ultimaSenal=now`; si había reclamo → `reclamo=0` + `ReclamoCancelado`; `baseEmergencia = saldo`, `usadoEmergencia = 0` → `SenalDeVida` |
| `depositar(m)` | cualquiera | `MontoInvalido` (m=0) · `RepartoEnCurso` | `safeTransferFrom` → `Depositado`; si es el dueño, además señal |
| `retirar(a,m)` | dueño | `NoEsDueno` · `RepartoEnCurso` · `DireccionInvalida` · `SaldoInsuficiente` | señal + `safeTransfer` → `Retirado` (CEI, `nonReentrant`) |
| `configurar(c)` | dueño | `NoEsDueno` · `RepartoEnCurso` · mismas validaciones del constructor | reemplaza la config + señal → `Configurada` |
| `transferirDueno(n)` | dueño | `NoEsDueno` · `DireccionInvalida` (cero, heredero o guardián) | señal → `DuenoTransferido` |
| `iniciarReclamo()` | heredero | `NoEsHeredero` · `NotPerson(quien,tier,2)` · `RepartoEnCurso` · `ReclamoYaIniciado` · `SigueVivo(venceEn)` | `reclamoIniciadoEn = now` → `ReclamoIniciado(heredero, now+gracia)` |
| `cobrar()` | heredero | `NoEsHeredero` · `SinReclamo` · `GraciaEnCurso(terminaEn)` · `YaCobraste` · `NotPerson` (**se re-chequea KUMPLY en este momento**) | si `foto==0` → `foto = saldo` + `RepartoIniciado`; `cobro=true`; transfiere `foto*bps/10000` → `Cobrado`. La parte de quien no está verificado **queda en la bóveda** esperándolo; no se reparte entre los demás |
| `proponerEmergencia(d,m,txt)` | guardián | `NoEsGuardian` · `NotPerson` · `RepartoEnCurso` · `MontoInvalido` · `NotBusiness(d,tier)` · `TopeEmergenciaSuperado(m, disponible)` | guarda la emergencia con 1 voto → `EmergenciaPropuesta` + `EmergenciaVotada(id, g, 1)` |
| `aprobarEmergencia(id)` | otro guardián | `NoEsGuardian` · `NotPerson` · `EmergenciaInexistente` · `EmergenciaCerrada` (ejecutada o vetada) · `YaVotaste` | +1 voto → `EmergenciaVotada`; al llegar a 2: `aprobadaEn=now`; si `demoraVeto==0`, ejecuta en la misma tx |
| `ejecutarEmergencia(id)` | cualquiera | `EmergenciaInexistente` · `EmergenciaCerrada` · `FaltanVotos` · `VetoEnCurso(id, aprobadaEn+demora)` · `RepartoEnCurso` · **re-chequea** `NotBusiness(destino)` y `TopeEmergenciaSuperado` | `ejecutada=true`, `usadoEmergencia += m`, transfiere al destino → `EmergenciaEjecutada` |
| `vetarEmergencia(id)` | dueño | `NoEsDueno` · `EmergenciaInexistente` · `EmergenciaCerrada` | `vetada=true` + señal → `EmergenciaVetada` |
| `emergenciaDisponible()` | — | — | `min(baseEmergencia*topeBps/10000 − usadoEmergencia, saldo)` (0 si negativo) |

Notas de seguridad para P1: CEI + `nonReentrant` en todo lo que transfiere; sin `tx.origin`; sin `onlyOwner` de plataforma; el loop de herederos está acotado a 5. **Ojo con la demo:** como `baseEmergencia` se fija en la señal del dueño, hasta que Marta no toca "Estoy bien" por primera vez el tope de emergencia es 0. Por eso la demo arranca con "Estoy bien".

### 2.4 `MockPesos.sol` y `DemoAttestationStore.sol`
```solidity
// src/MockPesos.sol — "plata de juguete" de testnet. Sin gate KUMPLY.
contract MockPesos is ERC20 {                       // OZ v5.1.0, 18 decimales
    uint256 public constant MONTO_FAUCET = 1_000_000 ether;   // $1.000.000
    constructor() ERC20("Pesos de Prueba (Fuji)", "mPESO") {}
    function faucet() external;                     // _mint(msg.sender, MONTO_FAUCET). Sin límite: es testnet.
    function faucetPara(address a) external;        // _mint(a, MONTO_FAUCET)
}

// src/demo/DemoAttestationStore.sol — escrito de cero (no copiar AttestationStore.sol). Tests + plan B.
contract DemoAttestationStore {
    address public immutable admin;                 // = msg.sender del constructor
    error SoloAdmin();
    event Emitida(address indexed cuenta, uint32 tier, uint64 vence);
    event Revocada(address indexed cuenta);
    function emitir(address cuenta, uint32 tier, uint64 vence) external;   // solo admin
    function revocar(address cuenta) external;                            // solo admin (delete)
    function verify(address cuenta) external view returns (bool ok, uint32 tier, uint64 ts, uint64 expiry);
    // misma regla que el store real: (true,…) solo si ok && expiry > block.timestamp; si no, (false,0,0,0)
}
```

**Token: se recomienda `MockPesos` y no USDC de Fuji.** Motivos:
1. **Control de la demo:** `faucet()` da $1.000.000 en 1 tx patrocinada. USDC de Fuji sale del faucet de Circle, con montos chicos y límites por dirección [SIN VERIFICAR los límites de hoy], y hay que pasarlo a mano a cada smart account.
2. **Sin riesgo de lista negra:** USDC puede bloquear direcciones y hacer revertir un `cobrar()` en vivo.
3. **Pesos para un jurado argentino:** "$1.000.000" se entiende sin explicar decimales (USDC tiene 6; el mock tiene 18).
4. **No se pierde nada:** el token es parámetro del constructor. Si P4 consigue USDC del faucet antes de las 16:00, P1 despliega una **segunda instancia con USDC** (mismo código, 1 comando) y se pone en el README como "stablecoin real" (le suma ~1 punto a Uso de Avalanche según `EVAL_LLAVE.md`). La web lee `decimals()` del token, no lo asume.

### 2.5 `deployments/fuji.json` (P1 lo escribe; a las 13:30 con ceros)
```json
{
  "chainId": 43113,
  "actualizado": "2026-11-07T14:30:00-03:00",
  "kumplyStore": "0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD",
  "attestationStoreEnUso": "0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD",
  "mockPesos": "0x0000000000000000000000000000000000000000",
  "llave": { "A": "0x0000000000000000000000000000000000000000", "B": "0x0000000000000000000000000000000000000000" },
  "demo": { "periodoMinimo": 1, "plazoInactividad": 60, "plazoGracia": 30, "topeEmergenciaBps": 2000, "demoraVeto": 0 },
  "cuentas": {
    "marta":   { "rol": "dueno",              "cuenta": "0x…", "tipo": "SA 0xGasless" },
    "lucia":   { "rol": "heredera+guardiana", "cuenta": "0x…", "tipo": "SA 0xGasless", "tier": 2 },
    "tomas":   { "rol": "heredero SIN verificar (el 'impostor')", "cuenta": "0x…", "tipo": "EOA con AVAX" },
    "pablo":   { "rol": "guardian",           "cuenta": "0x…", "tipo": "SA 0xGasless", "tier": 2 },
    "rosa":    { "rol": "guardiana",          "cuenta": "0x…", "tipo": "SA 0xGasless", "tier": 2 },
    "clinica": { "rol": "destino emergencia", "cuenta": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", "tipo": "fixture KUMPLY", "tier": 4 }
  }
}
```
`llave.A` = instancia de la demo en vivo. `llave.B` = instancia "pre-envejecida" (plan B de tiempos, ver §5). Las direcciones de cuentas las completa P1 con lo que le pasa P4 (`docs/cuentas.md`).

### 2.6 ABI exportado a la web
`contracts/script/export-abi.mjs` (P1), se corre después de cada `forge build` o deploy:
```js
// node script/export-abi.mjs  (desde contracts/)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const out = "../web/src/abi"; mkdirSync(out, { recursive: true });
for (const [c, nombre] of [["LlaveEmergencia", "llaveAbi"], ["MockPesos", "pesosAbi"]]) {
  const { abi } = JSON.parse(readFileSync(`out/${c}.sol/${c}.json`, "utf8"));
  writeFileSync(`${out}/${c}.ts`, `export const ${nombre} = ${JSON.stringify(abi, null, 2)} as const;\n`);
}
writeFileSync(`${out}/KumplyStore.ts`, `export const kumplyStoreAbi = [{"type":"function","name":"verify","stateMutability":"view","inputs":[{"name":"subject","type":"address"}],"outputs":[{"name":"verified","type":"bool"},{"name":"tier","type":"uint32"},{"name":"timestamp","type":"uint64"},{"name":"expiry","type":"uint64"}]}] as const;\n`);
writeFileSync(`${out}/deployments.fuji.json`, readFileSync("../deployments/fuji.json"));
console.log("ABI + direcciones exportados a web/src/abi/");
```
El `as const` hace que viem tipe solo los argumentos y los retornos.

### 2.7 Contrato TypeScript que consume la web (`web/src/lib/tipos.ts`, congelado 13:30)
P3 lo pega tal cual en el scaffold. Desde las 13:30 es de P2. P3 implementa el **mock** (`web/src/mock/cliente-mock.ts`) y P2 la versión **real** (`web/src/lib/cliente-fuji.ts`). Las pantallas solo conocen `LlaveCliente`.
```ts
import type { Address, Hash } from "viem";

export type Fase = "Activa" | "Vencida" | "EnGracia" | "Ejecutable" | "Repartiendo";
export const FASES: Fase[] = ["Activa", "Vencida", "EnGracia", "Ejecutable", "Repartiendo"]; // índice = enum Solidity

export interface Verificacion { ok: boolean; tier: number; esPersona: boolean; esEmpresa: boolean; fuente: "kumply-sdk" | "contrato" | "mock"; }

export interface EstadoLlave {
  direccion: Address; dueno: Address; fase: Fase;
  saldo: bigint; decimales: number; simbolo: string;
  ultimaSenal: number; venceEn: number;                 // segundos unix
  reclamoIniciadoEn: number; graciaTerminaEn: number;   // 0 = no hay
  foto: bigint; emergenciaDisponible: bigint; cantidadEmergencias: number;
  ahoraCadena: number;                                  // block.timestamp de la última lectura
}
export interface HerederoVista { cuenta: Address; alias: string; bps: number; parte: bigint; cobro: boolean; verificacion: Verificacion; }
export interface GuardianVista { cuenta: Address; alias: string; verificacion: Verificacion; }
export interface EmergenciaVista {
  id: number; proponente: Address; destino: Address; aliasDestino: string; monto: bigint; motivo: string;
  propuestaEn: number; aprobadaEn: number; votos: number; ejecutada: boolean; vetada: boolean; yoVote: boolean;
}
export interface EventoLlave { nombre: string; args: Record<string, unknown>; hash: Hash; url: string; cuando: number; }
export interface ResultadoTx { ok: boolean; hash?: Hash; url?: string; ms?: number; error?: { nombre: string; mensaje: string } }
export interface Sesion { email: string; cuenta: Address; alias: string; }

export interface LlaveCliente {
  // lectura (sin sesión)
  estado(): Promise<EstadoLlave>;
  herederos(): Promise<HerederoVista[]>;
  guardianes(): Promise<GuardianVista[]>;
  emergencias(): Promise<EmergenciaVista[]>;
  saldoDe(cuenta: Address): Promise<bigint>;
  verificacion(cuenta: Address): Promise<Verificacion>;
  escucharEventos(cb: (e: EventoLlave) => void): () => void;   // devuelve "desuscribir"
  // sesión 0xGasless
  sesion(): Sesion | null;
  entrar(email: string): Promise<Sesion>;
  salir(): Promise<void>;
  // escritura: todas patrocinadas; SIEMPRE simulan antes y, si revierte, devuelven ok:false sin mandar
  estoyBien(): Promise<ResultadoTx>;
  cargarPesosDePrueba(monto: bigint): Promise<ResultadoTx>;    // batch: faucet + approve + depositar
  retirar(a: Address, monto: bigint): Promise<ResultadoTx>;
  iniciarReclamo(): Promise<ResultadoTx>;
  cobrar(): Promise<ResultadoTx>;
  proponerEmergencia(destino: Address, monto: bigint, motivo: string): Promise<ResultadoTx>;
  aprobarEmergencia(id: number): Promise<ResultadoTx>;
  ejecutarEmergencia(id: number): Promise<ResultadoTx>;
  vetarEmergencia(id: number): Promise<ResultadoTx>;
}
// web/src/lib/index.ts: export const cliente: LlaveCliente = import.meta.env.VITE_MODO === "fuji" ? crearClienteFuji() : crearClienteMock();
```
Dirección de la llave: `?llave=0x…` en la URL **>** `VITE_LLAVE_ADDRESS` **>** `deployments.fuji.json → llave.A`. Así, para cada ensayo con una instancia nueva no hay que recompilar la web.

**Errores → texto en castellano** (`web/src/lib/errores.ts`, P2; P3 los muestra tal cual):
| Error del contrato | Mensaje en pantalla |
|---|---|
| `NotPerson(quien, 0, 2)` | "Esta cuenta no tiene identidad verificada en KUMPLY. No puede cobrar ni aprobar." |
| `NotPerson(quien, 4 o 5, 2)` | "Esta cuenta es una empresa o un agente, no una persona." |
| `NotBusiness(destino, t)` | "El destino tiene que ser un comercio o clínica verificada (KUMPLY empresa)." |
| `NoEsDueno` / `NoEsHeredero` / `NoEsGuardian` | "Esta cuenta no es la dueña / no es heredera / no es guardiana de esta llave." |
| `SigueVivo(venceEn)` | "Todavía no venció el plazo: faltan mm:ss." |
| `GraciaEnCurso(terminaEn)` | "Período de gracia: la dueña todavía puede cancelar. Faltan mm:ss." |
| `ReclamoYaIniciado` / `SinReclamo` | "Ya hay un reclamo en curso." / "Primero hay que iniciar el reclamo." |
| `YaCobraste` | "Ya cobraste tu parte." |
| `RepartoEnCurso` | "La herencia ya se está repartiendo: la bóveda no acepta más cambios." |
| `TopeEmergenciaSuperado(m, disp)` | "Supera el tope de emergencia. Disponible: $disp." |
| `YaVotaste` / `EmergenciaCerrada` / `FaltanVotos` / `VetoEnCurso` | "Ya aprobaste." / "Este pedido ya se cerró." / "Falta 1 aprobación." / "La dueña puede vetarlo por mm:ss más." |
| otro / red | "No se pudo mandar. Probá de nuevo." (y el nombre crudo en chico) |

---

## 3. Tareas por persona (listas para copiar a issues)

Formato del issue: `[P#-n] título` · rama · carpeta · minutos · **Terminado cuando**. Commits convencionales: `feat(contratos): …`, `feat(web): …`, `test(contratos): …`, `docs: …`, `chore: …`. Revisar en `CONTRIBUTING.md` el patrón exacto de rama que valida el CI antes de crear la primera.

### P1 · Contratos, tests, deploy y verificación (carpetas: `contracts/`, `deployments/`, `web/src/abi/`)
| # | Tarea | Hora | Min | Rama | Terminado cuando |
|---|---|---|---|---|---|
| P1-1 | `forge init contracts --use-parent-git`, borrar Counter, `forge install OpenZeppelin/openzeppelin-contracts@v5.1.0`, `foundry.toml` (§8), `remappings.txt`, `.env.example`, `.gitignore`; copiar `IKumplyAttestationStore` + `KumplyGated` | 13:00 | 15 | `feature/contratos-interfaz` | `forge build` sin errores |
| P1-2 | `LlaveEmergencia.sol` con **todas** las firmas, structs, eventos y errores de §2.2 (cuerpos `revert("TODO")`), `MockPesos` completo, `DemoAttestationStore` completo, `export-abi.mjs`, `deployments/fuji.json` con ceros | 13:15 | 15 | idem | **13:30 PR mergeado a develop** y existen `web/src/abi/LlaveEmergencia.ts` y `MockPesos.ts` |
| P1-3 | Deploy + verificación de **`MockPesos` solo** (prueba temprana del verificador de Routescan) | 13:30 | 15 | `feature/contratos-llave` | `https://testnet.snowtrace.io/address/<pesos>#code` muestra el código verificado; dirección en `deployments/fuji.json` y avisada a P2 |
| P1-4 | Implementar `LlaveEmergencia` según §2.3 | 13:45 | 35 | idem | `forge build` limpio, sin warnings de shadowing |
| P1-5 | Tests (§3.1) con `DemoAttestationStore` + `vm.warp` | 14:00 | 30 | idem | **`forge test` → ≥18 passed, 0 failed** |
| P1-6 | `DeployLlave.s.sol` (§8) + deploy de la **instancia A** con las SA reales (o el deployer como dueño + `transferirDueno` después) + verificación + `export-abi` | 14:15 | 15 | idem | **14:30:** `…/address/<llave>#code` verificado + `deployments/fuji.json` mergeado |
| P1-7 | Test fork contra el store real (`ForkFuji.t.sol`, fixtures de PLAN_TAREA2) | 14:30 | 10 | idem | `forge test --match-contract ForkFuji` pasa con `FUJI_RPC_URL` |
| P1-8 | Tx de evidencia desde `cast`: (a) `cobrar()` de Tomás revertido con `cast send --gas-limit 300000` (cuando la instancia esté Ejecutable); (b) desplegar una instancia corta con `DEMO_DEMORA_VETO=20` para que P2 grabe desde la web el reclamo cancelado por "Estoy bien" y el veto (esas tx las firma la SA de Marta, no `cast`) | 14:45 | 25 | — | hash de (a) y dirección de (b) en el chat → P4 los pega en `docs/evidencias.md` |
| P1-9 | Soporte de integración a P2 (decodificar errores, gas, eventos) | 15:10 | 20 | — | P2 confirma que todos los botones mandan tx |
| P1-10 | **Solo si a las 15:00 no hay atestaciones:** deploy de `DemoAttestationStore`, emitir tier 2 a Lucía/Pablo/Rosa y redeploy de la llave apuntando a él | 15:00 | 20 | idem | `verify(lucía)` del store demo = `(true, 2, …)`; README avisado |
| P1-11 | `contracts/README.md`: instalar, `forge test`, deploy, verificación, direcciones | 15:30 | 15 | `feature/contratos-docs` | P4 lo puede enlazar desde el README raíz |
| P1-12 | **16:15 instancias finales:** A (nueva, para el video y la demo) y B ("pre-envejecida": reclamo ya iniciado hace >30 s), ambas **verificadas**; `deployments/fuji.json` final | 16:15 | 20 | `feature/contratos-final` | los 2 links `#code` en verde; web abre con `?llave=` de cada una |
| P1-13 | (opcional) instancia con USDC Fuji si P4 consiguió USDC | 16:40 | 10 | — | link en README |

#### 3.1 Tests mínimos de P1 (`test/LlaveEmergencia.t.sol`)
1. El constructor guarda la config y `ultimaSenal = now`. 2. El constructor revierte con: bps ≠ 10.000, 0 o 6 herederos, heredero = dueño/cero/repetido, guardianes repetidos, plazo < `periodoMinimo`, tope > 2.000. 3. `estoyBien` de otro → `NoEsDueno`. 4. `fase()` pasa de Activa a Vencida con `vm.warp`. 5. `iniciarReclamo` antes de tiempo → `SigueVivo`. 6. `iniciarReclamo` de un no heredero → `NoEsHeredero`; de Tomás sin KYC → `NotPerson(tomas, 0, 2)`. 7. Reclamo OK → EnGracia; segundo reclamo → `ReclamoYaIniciado`. 8. `estoyBien` en gracia → `ReclamoCancelado` y vuelve a Activa. 9. `cobrar` en gracia → `GraciaEnCurso`. 10. Lucía cobra **exacto** 60% de la foto; Tomás → `NotPerson` y su 40% queda; se le emite tier 2 y cobra **exacto** 40% de la misma foto. 11. Cobrar dos veces → `YaCobraste`. 12. Heredero empresa (tier 4) → `NotPerson` (la trampa de `hasTier`). 13. El KYC vence entre `iniciarReclamo` y `cobrar` → `NotPerson`. 14. En Repartiendo, `estoyBien`/`retirar`/`depositar`/`proponerEmergencia` → `RepartoEnCurso`. 15. Emergencia de un no guardián → `NoEsGuardian`; de un guardián sin KYC → `NotPerson`. 16. Destino persona → `NotBusiness(destino, 2)`; destino tier 4 → OK. 17. 2 de 3 con demora 0 → la clínica recibe; voto doble → `YaVotaste`; voto después de ejecutada → `EmergenciaCerrada`. 18. Tope total: 20% de la base; la segunda que lo pasa → `TopeEmergenciaSuperado`; después de `estoyBien` se resetea. 19. `demoraVeto>0`: ejecutar antes → `VetoEnCurso`; el dueño veta → `EmergenciaVetada`; después de la demora, ejecuta. 20. `retirar` solo el dueño y cuenta como señal. 21. Fuzz de bps: lo cobrado suma ≤ foto y la diferencia es < cantidad de herederos (polvo de redondeo).

### P2 · Integración web ↔ contrato + 0xGasless + login (carpeta: `web/src/lib/`)
| # | Tarea | Hora | Min | Rama | Terminado cuando |
|---|---|---|---|---|---|
| P2-1 | Crear proyecto Fuji + API key en el dashboard de 0xGasless. Sandbox **fuera del repo** (`npm create vite` en `~/gasless-sandbox`) con `@0xgasless/core`: `OxGasClient` → login con email → `setupSmartAccount` → mostrar la dirección. Confirmar las firmas reales del SDK [SIN VERIFICAR las de este plan] | 12:55 | 30 | — | **13:25: 4 direcciones de SA (Marta, Lucía, Pablo, Rosa) en el chat → P4** |
| P2-2 | `lib/config.ts` (env, chain Fuji de viem, dirección por `?llave=`) + `lib/gasless.ts` (entrar, salir, sesión persistida, `enviar(calls[])` con `sendTransaction` / `sendBatchTransactions`) | 13:30 | 30 | `feature/web-gasless` | en la web real, "Entrar" con email muestra la SA y sobrevive a un F5 |
| P2-3 | 1.ª tx patrocinada: `MockPesos.faucet()` desde la SA de Marta | 14:00 | 15 | idem | hash en Snowtrace, **saldo AVAX de la SA = 0** (captura para el README) |
| P2-4 | `lib/cliente-fuji.ts` lecturas: `estado()`, `herederos()`, `guardianes()`, `emergencias()`, `saldoDe`, eventos con `getLogs` cada 2 s | 14:15 | 35 | `feature/web-integracion` | con `VITE_MODO=fuji` el panel muestra el estado real de la instancia A |
| P2-5 | Escrituras: `simulateContract` (con `account` = SA) → si revierte, `decodeErrorResult` + `errores.ts`; si no, `enviar` y medir ms hasta el receipt. `cargarPesosDePrueba` = batch faucet+approve+depositar | 14:50 | 35 | idem | los 9 métodos de escritura mandan tx patrocinadas; un error del contrato se ve en castellano **sin** mandar la tx |
| P2-6 | `lib/kumply.ts`: `@kumply/sdk` `new KumplyClient({ network: "fuji", contractAddress })` + `isPersonAtLeast(addr, 2)` / `isBusiness(addr)`; si el SDK no instala, fallback a `verify()` con viem | 15:25 | 15 | idem | badge verde en Lucía, rojo en Tomás, "empresa" en la Clínica, con `fuente` correcta |
| P2-7 | **15:30 punta a punta** con P3 en Fuji: estoyBien → emergencia 2/3 → reclamo → cobrar (Lucía OK, Tomás bloqueado). En la instancia corta de P1-8 (b): grabar **reclamo cancelado** por "Estoy bien" y un **veto** | 15:30 | 30 | — | los hashes del recorrido completo + `ReclamoCancelado` + `EmergenciaVetada` en `docs/evidencias.md` (vía P4) |
| P2-8 | (opcional, 10 min) "política de patrocinio" en el cliente: solo se manda userOp si la SA es la dueña o pasa `isPersonAtLeast(sa, 2)`. **No es un paymaster:** no reclamar el combo +20 salvo que el staff diga que cuenta | 16:00 | 10 | idem | un email sin verificar ve "Tu cuenta tiene que estar verificada para operar sin gas" |
| P2-9 | `web/README.md` (correr la web, variables, cómo se usa 0xGasless) + deploy público de la web si hay hosting a mano [SIN VERIFICAR cuál] | 16:20 | 25 | `feature/web-docs` | `npm ci && npm run dev` anda en una compu limpia siguiendo el README |

### P3 · UI/UX de las 4 pantallas, primero con mock (carpetas: `web/` scaffold, `web/src/{pages,components,mock,styles}`)
| # | Tarea | Hora | Min | Rama | Terminado cuando |
|---|---|---|---|---|---|
| P3-1 | Scaffold: `npm create vite@latest web -- --template react-ts`; instalar **todas** las deps (§8); `react-router-dom` con rutas `/`, `/dueno`, `/heredero`, `/guardian`, `/demo`; pegar `lib/tipos.ts` de §2.7; `.env.example` | 13:00 | 25 | `feature/web-base` | **13:30 PR mergeado**; `npm run dev` levanta las 5 rutas vacías |
| P3-2 | `mock/cliente-mock.ts`: misma máquina de estados que §2.3 con reloj real (60 s / 30 s), 1.000.000 en bóveda, cuentas de §2.5, demora de 1,5 s por "tx" y hashes falsos | 13:30 | 30 | `feature/web-pantallas` | se puede jugar la demo entera en mock, incluidos los errores |
| P3-3 | Componentes: `Monto` ($ con miles es-AR), `TxLink` (Snowtrace + ms), `BadgeKumply` (verde persona / azul empresa / rojo sin verificar), `CuentaRegresiva` (usa `ahoraCadena` para corregir el reloj, +2 s de margen), `LineaDeFases`, `BotonTx` (inactivo → firmando → enviada → confirmada / error) | 14:00 | 40 | idem | en `/demo` se ven todos con datos mock |
| P3-4 | **Pantalla Dueño** `/dueno`: saldo grande, cuenta regresiva "Te quedan mm:ss", botón enorme **"Estoy bien"**, banner rojo "Alguien inició un reclamo: tocá Estoy bien para cancelarlo", herederos y guardianes con badge, emergencias con "Vetar", botón "Cargar $1.000.000 de prueba" | 14:40 | 30 | idem | todos los botones funcionan en mock y muestran `TxLink` |
| P3-5 | **Pantalla Heredero** `/heredero` (con sesión o `?cuenta=0x…` solo lectura): mi %, mi parte, mi badge, fase, botones "Iniciar reclamo" / "Cobrar mi parte" habilitados según la fase; si no está verificado, cartel rojo con el texto de `NotPerson` | 15:10 | 20 | idem | Lucía puede cobrar y Tomás ve el bloqueo, en mock |
| P3-6 | **Pantalla Guardianes** `/guardian`: tope disponible ("Podés pedir hasta $200.000"), formulario destino (selector con "Clínica (empresa verificada)" + campo libre), monto y motivo; lista de pedidos con votos 1/2, "Aprobar", "Ejecutar" si hay demora | 15:30 | 25 | idem | la emergencia 2/3 y los 2 errores (tope, destino persona) se ven en mock **y** en Fuji |
| P3-7 | **Panel de demo** `/demo` (proyector, sin sesión): `LineaDeFases` grande con cuenta regresiva, saldo de la bóveda y de Lucía/Tomás/Clínica, feed de eventos en vivo con `TxLink`, chip "Gas pagado por 0xGasless · AVAX de Marta: 0" | 15:55 | 20 | idem | se lee bien a 5 m de distancia; se actualiza solo cada 2 s |
| P3-8 | Pasar a `VITE_MODO=fuji` con P2 y pulir lo que se rompa | 15:30 | (dentro de P2-7) | — | idem P2-7 |
| P3-9 | Mobile (las pantallas de Marta y Lucía se usan en el celu), textos sin palabras cripto, capturas para el README | 16:15 | 15 | `feature/web-pulido` | 4 capturas en `docs/capturas/` (vía P4) |

Si a las 15:30 P3 está atrasado, el orden de recorte es: Guardianes "Ejecutar" con demora → filtro de destino libre → `LineaDeFases` animada. **Nunca** se recortan "Estoy bien", "Cobrar" ni el panel.

### P4 · KUMPLY, cuentas de prueba, faucet, README, pitch y video (carpetas: `README.md`, `docs/`)
| # | Tarea | Hora | Min | Rama | Terminado cuando |
|---|---|---|---|---|---|
| P4-1 | **YA:** stand de KUMPLY: avisar que en ~30 min llegan 4 smart accounts para **tier 2** y preguntar el proceso (¿staff o flujo self-service?, ¿cuánto tarda?). Stand de 0xGasless: las 3 preguntas de §8.4. Pedir AVAX de Fuji (faucet o mentores) para el deployer de P1 y para Tomás | 12:50 | 20 | — | AVAX en el deployer (≥0,5) y respuesta de KUMPLY sobre el proceso |
| P4-2 | Crear los emails de prueba (ej. `equipo+marta@…`, `+lucia`, `+pablo`, `+rosa`) [SIN VERIFICAR que 0xGasless los tome como cuentas distintas; si no, 4 casillas reales] y pasárselos a P2 | 12:55 | 10 | — | P2 tiene los 4 emails a las 13:00 |
| P4-3 | EOA de Tomás: `cast wallet new` → `cast wallet import tomas --interactive` en la compu de P1; 0,1 AVAX | 13:05 | 10 | — | `cast balance <tomas>` > 0 |
| P4-4 | **13:25-13:30 pedido formal a KUMPLY:** tier 2 sobre las SA de **Lucía, Pablo, Rosa** (y Marta, para la política de P2-8). Que Tomás quede **sin** atestación | 13:25 | 10 | — | pedido entregado con las 4 direcciones; `docs/cuentas.md` con la tabla alias → dirección (solo públicas) |
| P4-5 | Control cada 20 min: `cast call 0xa3Bc…22dD "verify(address)(bool,uint32,uint64,uint64)" <sa> --rpc-url $FUJI_RPC_URL` sobre las 4 | 13:40→15:00 | 5 c/u | — | a las 15:00, decisión: oficial o plan B (P1-10) |
| P4-6 | README raíz con las 6 secciones obligatorias + bonus (esqueleto en §7), "Por qué Avalanche" empezando por **compliance on-chain** (KUMPLY leído en la misma tx), negocio de `PLAN_LLAVE_EMERGENCIA.md` §8, aviso legal y "Hecho hoy vs. reutilizado" | 13:45 | 75 | `feature/docs-readme` | las 6 secciones con encabezado propio; los links que falten marcados `TODO-link` |
| P4-7 | `docs/evidencias.md`: tabla acción → hash → link, que se va llenando con lo que pasan P1 y P2 | 14:30→16:15 | — | idem | ≥8 tx reales con link (ver §7) |
| P4-8 | Pitch de 2:45 + 5 slides (gancho por la **internación**, demo, por qué Avalanche, negocio, cierre) y tarjeta de preguntas difíciles (de `PLAN_LLAVE_EMERGENCIA.md` §13) | 15:00 | 45 | `feature/docs-pitch` | ensayado con reloj: ≤2:50 |
| P4-9 | QA "como jurado" en una compu limpia: clonar, `forge test`, `npm ci && npm run dev`, abrir cada link del README | 16:15 | 15 | — | lista de bugs entregada a P2/P3 antes de las 16:30 |
| P4-10 | **Video de respaldo** (≤3 min, pantalla + voz, instancia A nueva) | 16:30 | 30 | — | video subido y linkeado en el README a las 17:00 |
| P4-11 | (si sobra) 5 mensajes de validación ("¿pagarías USD 2/mes?") y poner el resultado real | 17:00 | 10 | — | sección "Validación" con números reales, aunque sean chicos |
| P4-12 | Checklist §7, repo público, PR `develop → main`, formulario de entrega | 17:15 | 30 | — | **entrega cargada antes de las 17:45** |

---

## 4. Dependencias entre personas y cómo destrabarlas
| Quién espera | Qué | De quién | Para cuándo | Cómo no quedarse parado |
|---|---|---|---|---|
| P3 | Tipos y forma de los datos | este plan | 13:00 | `tipos.ts` está en §2.7: se pega y se programa contra el **mock**. P3 nunca espera a P1 ni a P2 |
| P2 | ABI | P1 | 13:30 | Hasta las 13:30 hace el sandbox de 0xGasless (P2-1), que no necesita el ABI |
| P2 | Un contrato desplegado para probar el gas | P1 | 13:45 | `MockPesos` se despliega primero (P1-3): `faucet()` sirve para la 1.ª tx patrocinada y para probar el batch |
| P4 | Direcciones de las SA | P2 | 13:25 | P4 ya pre-avisó a KUMPLY a las 12:50. Si P2 se atrasa, P4 se sienta con P2 y hace los logins en su compu |
| P1 | SA de Marta para el constructor | P2 → P4 | 14:15 | Desplegar con el deployer como dueño y después `transferirDueno(saMarta)` (1 tx con AVAX). Nunca bloquea el deploy |
| P1 | Atestaciones KUMPLY | staff | 15:00 | El contrato no las necesita para desplegar (§2 cambio 4). Los tests usan `DemoAttestationStore`. Plan B a las 15:00 (P1-10) |
| P2/P3 | Instancia real con datos | P1 | 14:30 | Mock hasta las 14:30. Después, `?llave=` permite cambiar de instancia sin recompilar |
| P4 | Hashes y links para el README | P1, P2 | 14:30→16:15 | Placeholders `TODO-link`; cada uno pega su hash en el chat apenas sale y P4 los pasa a `docs/evidencias.md` |
| Todos | Un cambio de interfaz | P1 | después de 13:30 | Solo se **agrega**; se avisa en el chat; P1 corre `export-abi` y avisa "ABI v2" |

**Merges a `develop`:** 13:30 (interfaz + scaffold), 14:30 (contratos desplegados), 15:30 (integración), 16:15 (freeze), 17:15 (final). Cada PR lo revisa una sola persona en ≤5 min (P1↔P2, P3↔P4). Solo P1 escribe `deployments/` y `web/src/abi/`.

---

## 5. Cronograma 12:50-18:00 con cortes duros
| Hora | Hito (corte duro en **negrita**) | P1 | P2 | P3 | P4 | Plan B si no se cumple |
|---|---|---|---|---|---|---|
| 12:50 | Lectura de este plan (10 min) | lee §2 | dashboard 0xGasless | lee §2.7 | **ya en los stands** | — |
| 13:00 | Kickoff 5 min: roles, ramas, chat | P1-1 | P2-1 | P3-1 | P4-2/3 | — |
| **13:25** | **4 SA entregadas a P4 → KUMPLY** | | P2-1 | | P4-4 | Si P2 no tiene login: P4 pide igual con el proceso self-service si existe; si no, a las 13:45 como máximo. Cada 10 min de atraso acá se come el margen del plan B de 15:00 |
| **13:30** | **ABI CONGELADO** (PR de interfaz mergeado) + **scaffold web mergeado** | P1-2 | P2-2 | P3-2 | P4-6 | Si P1 no llegó: P2/P3 siguen con `tipos.ts` y el mock (no dependen del ABI). Tope 13:45 |
| 13:45 | `MockPesos` verificado en Fuji | P1-3 | | | | Si la verificación falla acá, P1 prueba las 3 alternativas **ahora** (§8.3), cuando todavía hay tiempo |
| 14:00 | 1.ª tx patrocinada (faucet) · `forge test` verde | P1-5 | P2-3 | P3-3 | P4-6 | Sin patrocinio: P4 va al stand de 0xGasless con el error exacto; P2 prueba el paymaster por defecto del dashboard [SIN VERIFICAR si exige depósito] |
| **14:30** | **`LlaveEmergencia` (instancia A) DESPLEGADA Y VERIFICADA** + `deployments/fuji.json` | P1-6 | P2-4 | P3-4 | P4-7 | **14:45: todos con P1** hasta que esté verificada (es el obligatorio 1). Si falla la lógica, se despliega igual y se corrige después: redeploy = 1 comando |
| 15:00 | Control de atestaciones | P1-8 | P2-5 | P3-5 | P4-5 | **Sin tier 2 en Lucía/Pablo:** P1-10 (store demo propio, declarado en el README). La "bloqueada" con el store oficial no depende de nadie (Tomás). Si las reales llegan antes de las 16:15, se vuelve al oficial (1 comando) |
| **15:30** | **PUNTA A PUNTA EN LA WEB contra Fuji** (estoyBien → emergencia → reclamo → cobrar/bloqueo) | P1-9 | P2-7 | P3-6/8 | P4-8 | Botón que no anda → se muestra con la tx grabada + panel. Si 0xGasless se cae del todo: Core/MetaMask con AVAX **solo para esa acción** (cambia `msg.sender`: atestar esas EOAs) y se pierde el core +10 |
| 15:30-16:15 | Arreglos + panel + pulido | P1-11 | P2-6/8 | P3-7 | P4-8 | — |
| **16:15** | **FREEZE de features.** Solo bugs. Instancias finales A y B verificadas | P1-12 | P2-9 | P3-9 | P4-9 | Si un bug no se arregla en 15 min, se saca el botón de la demo |
| **16:30** | **README completo + video de respaldo grabado** (ensayo 1 = grabación) | | | | P4-10 | Sin demo limpia: el video se arma con los hashes de los ensayos y la UI en mock, **declarado** |
| 17:00 | Ensayo 2 con reloj (instancia nueva) | | | | | — |
| 17:15 | Último merge `feature/* → develop` | | | | P4-12 | Lo que no esté mergeado a las 17:20 no entra |
| **17:30** | **Repo PÚBLICO + PR `develop → main` + entrega del formulario** | | | | P4-12 | 17:30-18:00 = colchón. No se toca código |

**Almuerzo:** en la silla o escalonado. Nunca se van a la vez P1 y P2.

**Instancia B "pre-envejecida" (plan B de tiempos):** P1 la despliega a las 16:15 con la misma config. A los 60 s queda Vencida (nadie toca "Estoy bien") y quien tenga la sesión de Lucía abre la web con `?llave=<B>` y toca "Iniciar reclamo". A los 30 s queda Ejecutable y se queda así (sin cobrar) hasta la demo. Ojo: en B nunca hubo "Estoy bien", así que su tope de emergencia es 0; B solo sirve para la parte de herencia. Si en vivo el reloj de la instancia A no acompaña, se cambia a `?llave=<B>` y se sigue desde "Tomás intenta cobrar".

**Ojo para el demo day (19:00):** cada ensayo deja la instancia en Repartiendo (terminal). Para la demo en vivo, P1 despliega una instancia nueva a las 18:45 con el mismo script (`--verify` incluido) y la abre con `?llave=`. La que está en el README es la verificada de las 16:15.

---

## 6. Guion de la demo (3 min) — instancia A, 60 s / 30 s, tope 20%, demoraVeto 0

**Cuentas de prueba**
| Alias | Rol | Tipo | KUMPLY | Dónde está abierta |
|---|---|---|---|---|
| **Marta** | dueña | SA 0xGasless (email) | tier 2 pedido (opcional) | Celular 1 (o perfil de Chrome "Marta") |
| **Lucía** | heredera 60% + guardiana | SA 0xGasless (email) | **tier 2** (la que PASA) | Celular 2 (o perfil "Lucía") |
| **Tomás** | heredero 40% **sin verificar** (el "impostor" para KUMPLY) | EOA con AVAX | **ninguna** (la BLOQUEADA) | Laptop: `cast` + vista `?cuenta=` |
| **Pablo** | guardián | SA 0xGasless (email) | **tier 2** | Perfil de Chrome "Pablo" |
| **Rosa** | guardiana de reserva | SA 0xGasless (email) | **tier 2** | no se usa en vivo (si falla Pablo, aprueba ella) |
| **Clínica** | destino de la emergencia | fixture KUMPLY `0x7Fc6…DaE9` | tier 4 (empresa) | solo recibe |

Proyector: `/demo`. Que varias sesiones de 0xGasless convivan en perfiles distintos de Chrome está [SIN VERIFICAR]: P2 lo prueba a las 14:00. Si no, Marta y Lucía en celulares y Pablo en la laptop.

| t | Quién habla / qué pantalla | Acción | Tx / evidencia |
|---|---|---|---|
| 0:00-0:15 | Slide 1 | "Marta, 67, ahorra en dólares digitales. Si mañana la internan, nadie puede pagar la clínica con esa plata. Si se muere, sus hijos esperan meses." | — |
| 0:15 | `/demo` + celu de Marta | Bóveda con $1.000.000. Herederos: Lucía ✓ verde, Tomás ✗ rojo. Guardianes ✓. Marta toca **"Estoy bien"** | `SenalDeVida` patrocinada; chip "AVAX de Marta: 0"; cronómetro "confirmada en X ms" |
| 0:30 | `/guardian` como Pablo | "Marta se internó." Pablo pide **$150.000 a la Clínica** (empresa verificada). Tope visible: $200.000 | `EmergenciaPropuesta` |
| 0:45 | `/guardian` como Lucía | Lucía aprueba → 2 de 3 → la plata llega a la Clínica | `EmergenciaVotada` + `EmergenciaEjecutada` (link) |
| 0:55 | `/guardian` como Pablo | Intenta otros $100.000 → **"Supera el tope. Disponible: $50.000"**. Intenta mandarse plata a sí mismo → **"El destino tiene que ser un comercio o clínica verificada"** | simulación en vivo (no se manda); `TopeEmergenciaSuperado`, `NotBusiness(pablo, 2)` |
| 1:10 | `/demo` | "Marta no vuelve a dar señales." La cuenta regresiva llega a 0 → **Vencida** | — |
| 1:15 | celu de Lucía `/heredero` | **"Iniciar reclamo"** → empieza la gracia de 30 s. "Si Marta estuviera bien, toca un botón y se cancela" (link a la cancelación grabada) | `ReclamoIniciado` · `ReclamoCancelado` (grabada) |
| 1:20-1:45 | Mientras corre la gracia | **Por qué Avalanche:** las reglas viven en el contrato que guarda la plata; KUMPLY se lee **en la misma transacción**; finalidad en <1 s (el pago a la clínica ya estaba firme); nadie pagó gas | — |
| 1:45 | `/heredero?cuenta=<tomás>` + Snowtrace | Tomás intenta cobrar → **BLOQUEADO: "no tiene identidad verificada"**. Su 40% queda en la bóveda esperándolo | simulación en vivo + **tx revertida grabada** `NotPerson(tomás, 0, 2)` |
| 1:55 | celu de Lucía | **"Cobrar mi parte"** → Lucía recibe **$510.000** (60% de $850.000) | `RepartoIniciado` + `Cobrado` (link) |
| 2:10 | Snowtrace | Contrato verificado: la línea que llama a `verify()` de KUMPLY, pestaña de eventos | página `#code` |
| 2:25 | Slide negocio | USD 2/mes o 1% al liberar; marca blanca para billeteras y exchanges que ya tienen el KYC | — |
| 2:45 | Cierre | "Si te pasa algo, tu plata llega a quien vos elegiste. Y nadie más la puede tocar." | — |

Si algo falla en vivo: no pelearla. Pasar a la instancia B (`?llave=<B>`, desde 1:45) o al video en ese mismo momento.

---

## 7. Checklist de entrega final
| # | Ítem | Evidencia (link / tx) | Dueño |
|---|---|---|---|
| O1 | Contrato verificado en Avalanche | `https://testnet.snowtrace.io/address/<llave A final>#code` + `MockPesos#code` | P1 |
| O2 | Interfaz web conectada | URL pública o "cómo correrla" + video + tx hechas desde la web (`SenalDeVida`, `Cobrado`) | P2 + P3 |
| O3 | "Por qué Avalanche" en el repo | `README.md#por-qué-avalanche`: compliance on-chain (KUMPLY en la misma tx), finalidad medida, gasless, visión L1 institucional + ICM (roadmap, sin desplegar) | P4 |
| O4 | Modelo de negocio | `README.md#modelo-de-negocio`: problema, cliente B2C/B2B, ingresos, competencia, ventaja (+ validación si la hubo) | P4 |
| O5 | Repo **público** con instalación, despliegue y arquitectura | README raíz + `contracts/README.md` + `web/README.md` + diagrama §1.2 en `docs/arquitectura.md` | P4 (P1, P2 sus partes) |
| O6 | README separa lo hecho hoy | "Hecho en el evento (7/11)": todo el código, con `git log`. "Reutilizado": `KumplyGated` (plan de la mañana, también de hoy), OpenZeppelin v5.1.0, forge-std, `@0xgasless/core`, `@kumply/sdk`, viem, Vite/React | P4 |
| K1 | KUMPLY: `@kumply/sdk` en la web | `web/src/lib/kumply.ts` con `isPersonAtLeast(addr, 2)` e `isBusiness` (semáforo) | P2 |
| K2 | KUMPLY: gate on-chain | `iniciarReclamo`/`cobrar`/emergencias con `_requirePersonAtLeast(…, 2)`; destino con `_requireBusiness` | P1 |
| K3 | KUMPLY: dirección que **pasa** | tx `Cobrado` de Lucía + `EmergenciaVotada` de Pablo (links) | P1/P2 → P4 |
| K4 | KUMPLY: dirección **bloqueada** | tx revertida `NotPerson(tomás, 0, 2)` (link) + `NotBusiness` simulado | P1 → P4 |
| K5 | KUMPLY: sin `hasTier` + aviso de demo | `grep -r hasTier` vacío; frase: "Las atestaciones de KUMPLY en Fuji son de DEMO, emitidas por el staff, sin verificación KYC real" | P4 |
| G1 | 0xGasless en el flujo principal (core) | `@0xgasless/core` login con email; links de tx patrocinadas: `SenalDeVida`, `EmergenciaPropuesta`, `ReclamoIniciado`, `Cobrado`; captura con AVAX = 0 en las SA | P2 → P4 |
| G2 | 0xGasless explicado en el README | componente, por qué ("Marta no compra AVAX"), links | P4 |
| C | Combo +20 | **No se reclama** salvo que el staff confirme que cuenta (P2-8 es política en el cliente, no un paymaster) | P4 decide |
| E1 | Video de respaldo ≤3 min | link en el README | P4 |
| E2 | Aviso legal | "No reemplaza la sucesión; es un plan de continuidad y liquidez. No es asesoramiento legal." | P4 |
| E3 | `forge test` en verde | salida pegada o captura en `contracts/README.md` | P1 |
| E4 | Repo público + PR `develop → main` mergeado + formulario | captura del formulario enviado | P4 |

### Esqueleto del README raíz (P4)
`# Llave de Emergencia` · demo (video + URL) · **Qué es** (5 líneas) · **El problema** (datos con fuente) · **Cómo funciona** · **Arquitectura** (diagrama) · **Contratos desplegados** (tabla nombre → dirección → link `#code`) · **Por qué Avalanche** · **Bonus KUMPLY** (pasa / bloqueada / aviso de demo) · **Bonus 0xGasless** · **Evidencias** (tabla de tx) · **Instalación y despliegue** (→ `contracts/README.md`, `web/README.md`) · **Modelo de negocio** · **Validación** · **Hecho en el evento vs. reutilizado** · **Límites y aviso legal** · **Equipo**.

---

## 8. Comandos clave, variables y riesgos

### 8.1 Contratos (P1)
```bash
# desde la raíz del repo, en feature/contratos-interfaz
forge init contracts --use-parent-git          # (si falla: --no-git)
cd contracts && rm -f src/Counter.sol test/Counter.t.sol script/Counter.s.sol
forge install OpenZeppelin/openzeppelin-contracts@v5.1.0
printf "forge-std/=lib/forge-std/src/\n@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/\n" > remappings.txt
forge build && forge test -vv
node script/export-abi.mjs
cast wallet import hackatwin-deployer --interactive      # la clave entra una sola vez, con prompt oculto
```
```toml
# contracts/foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.28"
evm_version = "cancun"
optimizer = true
optimizer_runs = 200
fs_permissions = [{ access = "read", path = "./" }]

[rpc_endpoints]
fuji = "${FUJI_RPC_URL}"
```
```bash
# contracts/.env.example  (NUNCA claves privadas en archivos)
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
KUMPLY_STORE=0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD
DEPLOYER_ACCOUNT=hackatwin-deployer
DEPLOYER_ADDRESS=0x...
PESOS_ADDRESS=                     # vacío = despliega MockPesos nuevo
PERIODO_MINIMO=1                   # demo: 1 s. Prod: 2592000
DEMO_DUENO=0x...                   # SA de Marta (o el deployer + transferirDueno)
DEMO_HEREDEROS=0xLucia,0xTomas
DEMO_BPS=6000,4000
DEMO_GUARDIANES=0xLucia,0xPablo,0xRosa
DEMO_INACTIVIDAD=60
DEMO_GRACIA=30
DEMO_TOPE_BPS=2000
DEMO_DEMORA_VETO=0
DEMO_SIEMBRA=1000000000000000000000000   # 1.000.000 mPESO (el deployer hace faucet + approve + depositar)
```
Boceto del script (`script/DeployLlave.s.sol`): `require(block.chainid == 43113)`; `vm.startBroadcast()`; si `PESOS_ADDRESS` está vacío, `new MockPesos()`; arma `Config` con `vm.envAddress("DEMO_HEREDEROS", ",")`, `vm.envUint("DEMO_BPS", ",")` (convertir a `uint16[]`) y `vm.envAddress("DEMO_GUARDIANES", ",")`; `new LlaveEmergencia(store, pesos, periodoMinimo, c)`; siembra: `faucet()` + `approve` + `depositar`; `console2.log` de las direcciones. Después P1 copia las direcciones a `deployments/fuji.json` y corre `export-abi`.
```bash
# deploy + verificación en un paso
source .env
forge script script/DeployLlave.s.sol:DeployLlave --rpc-url fuji \
  --account $DEPLOYER_ACCOUNT --sender $DEPLOYER_ADDRESS --broadcast \
  --verify --verifier etherscan \
  --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --delay 15 --retries 10

# evidencia: Tomás intenta cobrar (tx REVERTIDA real; --gas-limit evita que la estimación la frene)
cast send <LLAVE> "cobrar()" --gas-limit 300000 --account tomas --rpc-url $FUJI_RPC_URL
# lecturas útiles
cast call <LLAVE> "fase()(uint8)" --rpc-url $FUJI_RPC_URL
cast call <LLAVE> "isPersonAtLeast(address,uint32)(bool)" <SA_LUCIA> 2 --rpc-url $FUJI_RPC_URL
cast call 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD "verify(address)(bool,uint32,uint64,uint64)" <SA> --rpc-url $FUJI_RPC_URL
```

### 8.2 Web (P3 scaffold, P2 integración)
```bash
npm create vite@latest web -- --template react-ts
cd web && npm i viem react-router-dom @0xgasless/core @kumply/sdk
npm run dev        # http://localhost:5173
npm run build      # dist/ para el deploy
```
Versiones: `@0xgasless/core@1.3.0` y `@kumply/sdk@1.3.0` según los planes anteriores [SIN VERIFICAR que instalen hoy]. Si `@0xgasless/core` pide polyfills de Node (`Buffer`, `process`) en Vite: `npm i -D vite-plugin-node-polyfills` y agregarlo en `vite.config.ts` [SIN VERIFICAR si hace falta].
```bash
# web/.env.example  (la API key de 0xGasless va en .env.local, NUNCA en el repo)
VITE_MODO=mock                     # mock | fuji
VITE_CHAIN_ID=43113
VITE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_EXPLORER=https://testnet.snowtrace.io
VITE_LLAVE_ADDRESS=                # vacío = usa deployments.fuji.json → llave.A
VITE_PESOS_ADDRESS=
VITE_KUMPLY_STORE=0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD
VITE_OXGASLESS_API_KEY=
VITE_PAYMASTER_URL=                # opcional: solo si el staff habilita un lane para personas
```

### 8.3 Verificación en Routescan: 3 alternativas (en este orden, probadas a las 13:45 con `MockPesos`)
1. **`--verifier custom`** con la misma URL y `--etherscan-api-key verifyContract`.
2. URL con sufijo **`/etherscan/api`**: `https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api`.
3. **A mano:** `forge flatten src/LlaveEmergencia.sol > flat.sol` y subirlo en `https://routescan.io/verifycontract` (o en la UI de testnet.snowtrace.io) con solc 0.8.28, optimizer 200 runs, EVM cancun. Constructor args: `forge verify-contract <ADDR> src/LlaveEmergencia.sol:LlaveEmergencia --chain 43113 --verifier etherscan --verifier-url '<url>' --etherscan-api-key verifyContract --guess-constructor-args --watch` (los saca de la tx de creación).
Que `--verifier etherscan` + Fuji ande en forge 1.7.1 está [SIN VERIFICAR] hasta correrlo: por eso se prueba primero con `MockPesos`, que no tiene argumentos de constructor.

### 8.4 Preguntas para los stands (P4, 12:50)
- **KUMPLY:** ¿quién emite tier 2 y cuánto tarda? ¿Atestan smart accounts de 0xGasless? ¿Aceptan un store propio declarado como plan B? ¿El lane KUMPLY+0xGasless puede patrocinar personas (tier 1-3)? Si dicen que sí, el combo +20 sale con `VITE_PAYMASTER_URL`.
- **0xGasless:** ¿el paymaster de un proyecto del dashboard patrocina en Fuji sin depósito previo? ¿El bundler acepta userOps cuya llamada revierte? ¿Hay políticas de patrocinio (allowlist, webhook) para patrocinar solo cuentas verificadas?
- **Mentores:** AVAX de Fuji (≥0,5 para el deployer y 0,1 para Tomás). Confirmar hora y lugar de la entrega.

### 8.5 Riesgos técnicos y mitigación
| Riesgo | Señal temprana | Mitigación |
|---|---|---|
| **El gas patrocinado falla** (key sin saldo, paymaster exige depósito, SDK con otra firma, polyfills) | P2-3 a las 14:00 sin hash | Pregunta al stand con el error exacto; probar el paymaster por defecto del dashboard; polyfills. Último recurso (15:30): Core/MetaMask con AVAX para la acción rota, atestando esas EOAs; se pierde el core +10, no la demo |
| **El bundler rechaza userOps que revierten** | — | La web **siempre simula antes** y no manda lo que revierte. Las tx revertidas de evidencia se mandan desde la EOA de Tomás con `cast` |
| **Las atestaciones no llegan** | P4-5 a las 15:00 sin `true` | P1-10: `DemoAttestationStore` propio, declarado en el README. La "bloqueada" con el store oficial (Tomás) no necesita a nadie. Lecturas con fixtures (`0x1F98…F984` tier 2, `0x2260…C599` tier 3, `0x7Fc6…DaE9` tier 4) en el README |
| **La atestación queda sobre la dirección equivocada** (EOA en vez de SA) | `verify(sa)` da false pero el staff dice que emitió | Pasar SIEMPRE la dirección que muestra la web después del login (la SA). Revisar con `cast call` |
| **La verificación en Routescan falla** | P1-3 a las 13:45 | Se prueba temprano con `MockPesos`; 3 alternativas (§8.3). 14:45 todos con P1. Sin verificación no hay elegibilidad |
| **El reloj de la web no coincide con la cadena** | la cuenta regresiva llega a 0 y `iniciarReclamo` da `SigueVivo` | La web corrige con `ahoraCadena`, deja +2 s de margen y **simula** antes de habilitar el botón. Plan B: instancia B |
| **Varias sesiones de 0xGasless no conviven** | P2 a las 14:00 | Un dispositivo por rol (2 celus + laptop); Rosa de reserva |
| **El RPC público limita las lecturas** | errores 429 en la consola | Polling cada 2 s, un solo `estado()` por ciclo; RPC alternativo en `VITE_RPC_URL` [SIN VERIFICAR cuál] |
| **`forge install` o los submódulos fallan** | P1-1 | `forge install --no-git` y commitear solo lo necesario, o `git submodule update --init --recursive` en el README |
| **Cambio de interfaz a mitad de la tarde** | — | Solo se agrega; P1 regenera `web/src/abi/` y avisa; `tipos.ts` no cambia sin acuerdo P2+P3 |
| **El wifi o Fuji andan lentos en el demo day** | — | Video de respaldo, instancia B, hashes en `docs/evidencias.md` |

---

## Resumen (10 líneas)
1. **P1 — Contratos:** `LlaveEmergencia` (is `KumplyGated`, `ReentrancyGuard`) + `MockPesos` + `DemoAttestationStore`, ≥18 tests, deploy y verificación en Fuji, `deployments/fuji.json` y ABI en `web/src/abi/`. Carpetas `contracts/`, `deployments/`. Ramas `feature/contratos-*`.
2. **P2 — Integración:** login con email y tx patrocinadas con `@0xgasless/core`, `cliente-fuji.ts` (viem: lecturas, simular antes de mandar, errores en castellano), `@kumply/sdk` para el semáforo. Carpeta `web/src/lib/`. Las 4 SA a las 13:25.
3. **P3 — UI/UX:** scaffold de `web/`, mock completo y 4 pantallas (Dueño con "Estoy bien", Heredero, Guardianes, Panel `/demo` con cuenta regresiva). Carpetas `web/src/{pages,components,mock}`.
4. **P4 — Sponsors y entrega:** atestaciones tier 2 (Lucía, Pablo, Rosa, Marta) YA, AVAX, EOA de Tomás, README con 6 obligatorios + bonus, evidencias, pitch de 2:45, video y entrega.
5. **Interfaz congelada a las 13:30:** §2.2 (Solidity) y §2.7 (TypeScript). Después de esa hora, solo se agrega.
6. **Cortes:** 13:25 SA a KUMPLY · 13:30 ABI · 13:45 `MockPesos` verificado · 14:30 Llave verificada · 15:00 decisión de atestaciones · 15:30 punta a punta · 16:15 freeze · 16:30 README + video · 17:30 entrega.
7. **Token:** `MockPesos` (control, sin lista negra, "pesos" para el jurado); USDC Fuji como segunda instancia opcional (mismo código).
8. **Red team aplicado:** tope total de emergencias hasta el próximo "Estoy bien", destino = empresa KUMPLY (la Clínica, tier 4), veto opcional y KYC re-chequeado al cobrar.
9. **Demo:** Estoy bien (sin gas) → emergencia 2/3 a la Clínica → reclamo → Tomás BLOQUEADO → Lucía cobra el 60%. Plan B: instancia B pre-envejecida y video.
10. **Riesgos top:** patrocinio de 0xGasless, atestaciones tarde (store demo declarado) y verificación en Routescan (probada temprano con `MockPesos`).
