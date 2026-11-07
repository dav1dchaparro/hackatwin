# Llave · web

Vite + React + TypeScript + viem. Pantallas: `/` (entrar con email, pantalla completa), `/dueno` (Marta), `/heredero` (solo lectura, también con `?cuenta=0x…`) y `/demo` (panel para el proyector, siempre en tema oscuro). Sistema visual en `src/styles/base.css`: tokens de color claro/oscuro con la paleta del equipo, Inter + JetBrains Mono, shell con barra lateral, cabecera + módulos por pantalla.

```bash
cd web
npm ci
cp .env.example .env.local   # VITE_MODO=mock no necesita nada más
npm run dev                  # http://localhost:5173
npm run build                # dist/
```

- `VITE_MODO=mock` (por defecto): cliente simulado (`src/mock/cliente-mock.ts`) con la misma máquina de estados que `contracts/src/Llave.sol` y reloj real (60 s sin señales, 30 s de gracia). El estado vive en `localStorage` (varias pestañas comparten la bóveda) y la sesión en `sessionStorage` (cada pestaña es una persona). En `/demo` hay controles de ensayo: adelantar el reloj, agente simulado que avisa y libera, bot sin verificar que rebota, reiniciar.
- `VITE_MODO=fuji`: cliente real (`src/lib/cliente-fuji.ts`, P2) contra Avalanche Fuji, con login por email y transacciones patrocinadas por 0xGasless. La API key va en `.env.local`, nunca en el repo.
- Dirección de la Llave: `?llave=0x…` en la URL > `VITE_LLAVE_ADDRESS` > `src/abi/deployments.fuji.json` (`llave.A`).

Flujo de la demo (`/demo` en el proyector, `/dueno` en el celular de Marta): Marta toca «Estoy bien» → pasa el plazo sin señales → el agente verificado por KUMPLY (tier 5) avisa y abre la espera → Marta puede cancelar → termina la espera → el agente libera: comisión 1% a la tesorería y el resto a Lucía (60%) y Tomás (40%) en la misma operación. Un bot sin atestación que intenta lo mismo rebota con `NotAgent`.

Quién es dueño de qué carpeta (PLAN_CONSTRUCCION_LLAVE.md §1.1): `src/abi/` P1 (generado) · `src/lib/` P2 · `src/{pages,components,mock,styles}` P3.
