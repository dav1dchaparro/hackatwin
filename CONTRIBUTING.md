# Cómo contribuir (HackaTwin)

## Flujo

1. Actualiza `develop` y crea tu rama desde ahí: `git switch develop && git pull && git switch -c feature/mi-cambio`
2. Commits chicos, push y abre un PR **hacia `develop`** (usa la plantilla).
3. El CI tiene que pasar y necesitas **1 aprobación**.
4. Merge con **Squash and merge** (el título del PR queda como commit).
5. `main` es solo para la entrega final: PR `develop` → `main`.

## Ramas

`feature/`, `fix/`, `docs/`, `chore/`, `hotfix/`, `release/` + nombre en minúsculas con guiones.
Ej.: `feature/wallet-connect`, `fix/tx-timeout`, `docs/readme-demo`.

## Commits y títulos de PR ([Conventional Commits](https://www.conventionalcommits.org/es/))

`tipo(alcance opcional): descripción en minúscula`
Tipos: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`, `style`, `perf`, `build`.
Ej.: `feat(contracts): add escrow deposit`, `fix(web): handle rejected signature`.

## Seguridad

**Nunca subir claves privadas, seeds, keystores ni archivos `.env`.** Usa `.env.example` con valores vacíos.
