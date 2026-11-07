# Llave de Emergencia · web

Vite + React + TypeScript + viem. Pantallas: `/` (entrar), `/dueno`, `/heredero`, `/guardian` y `/demo` (panel para el proyector).

```bash
cd web
npm ci
cp .env.example .env.local   # VITE_MODO=mock no necesita nada más
npm run dev                  # http://localhost:5173
npm run build                # dist/
```

- `VITE_MODO=mock` (por defecto): cliente simulado con la misma máquina de estados que el contrato y reloj real (60 s de inactividad, 30 s de gracia). Sirve para ensayar la demo entera sin Fuji.
- `VITE_MODO=fuji`: cliente real (`src/lib/cliente-fuji.ts`, P2) contra Avalanche Fuji, con login por email y transacciones patrocinadas por 0xGasless. La API key va en `.env.local`, nunca en el repo.
- Dirección de la llave: `?llave=0x…` en la URL > `VITE_LLAVE_ADDRESS` > `src/abi/deployments.fuji.json` (`llave.A`).

Quién es dueño de qué carpeta (PLAN_CONSTRUCCION_LLAVE.md §1.1): `src/abi/` P1 (generado) · `src/lib/` P2 · `src/{pages,components,mock,styles}` P3.
