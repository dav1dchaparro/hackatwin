# Web de Llave de Emergencia

Vite + React + TypeScript + viem. Login con email y gas patrocinado con 0xGasless, identidad con KUMPLY, en Avalanche Fuji.

```bash
cd web && npm ci && cp .env.example .env.local && npm run dev
```

La API key de 0xGasless va en `web/.env.local` (ignorado por git). El README completo (variables, cómo se usa 0xGasless y
KUMPLY, cómo usa P3 la lib) llega con la rama `feature/web-docs`.
