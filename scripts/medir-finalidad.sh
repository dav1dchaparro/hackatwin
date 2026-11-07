#!/usr/bin/env bash
# Mide el tiempo envío → receipt (final) en Fuji C-Chain y el costo de gas.
# Escribe docs/finalidad.md con p50/p95 y los hashes.
#
# Uso (desde la raíz del repo):
#   export FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
#   export CAST_ACCOUNT=deployer            # keystore de `cast wallet import` (nunca una clave en texto plano)
#   # opcional: medir estoyBien() si el dueño de la instancia es una EOA de ese keystore
#   export LLAVE_ADDRESS=0x...
#   bash scripts/medir-finalidad.sh [N=20] [N_ESTOYBIEN=3]
#
# Qué mide: el tiempo que tarda `cast send` en devolver el receipt (cast espera la inclusión,
# y en la C-Chain un bloque aceptado es final). No incluye el bundler de 0xGasless: ese tiempo
# lo muestra la web por separado.
set -euo pipefail

N="${1:-20}"
N_ESTOYBIEN="${2:-3}"
: "${FUJI_RPC_URL:?Falta FUJI_RPC_URL}"
: "${CAST_ACCOUNT:?Falta CAST_ACCOUNT (keystore de cast wallet import)}"
OUT="docs/finalidad.md"

FROM=$(cast wallet address --account "$CAST_ACCOUNT")
TIEMPOS=()
FILAS=()

medir() {  # $1 = etiqueta, resto = argumentos de cast send
  local etiqueta="$1"; shift
  local t0 t1 ms json hash gas precio costo
  t0=$(date +%s%N)
  json=$(cast send "$@" --account "$CAST_ACCOUNT" --rpc-url "$FUJI_RPC_URL" --json)
  t1=$(date +%s%N)
  ms=$(( (t1 - t0) / 1000000 ))
  hash=$(echo "$json" | sed -n 's/.*"transactionHash": *"\([^"]*\)".*/\1/p')
  gas=$(cast to-dec "$(echo "$json" | sed -n 's/.*"gasUsed": *"\([^"]*\)".*/\1/p')")
  precio=$(cast to-dec "$(echo "$json" | sed -n 's/.*"effectiveGasPrice": *"\([^"]*\)".*/\1/p')")
  costo=$(cast from-wei "$(( gas * precio ))")
  TIEMPOS+=("$ms")
  FILAS+=("| $etiqueta | $ms | $gas | $costo | [${hash:0:10}…](https://testnet.snowtrace.io/tx/$hash) |")
  echo "$etiqueta: ${ms} ms · gas $gas · $costo AVAX · $hash"
}

for i in $(seq 1 "$N"); do
  medir "transferencia $i" "$FROM" --value 0
done

if [[ -n "${LLAVE_ADDRESS:-}" ]]; then
  for i in $(seq 1 "$N_ESTOYBIEN"); do
    medir "estoyBien $i" "$LLAVE_ADDRESS" "estoyBien()"
  done
fi

ORDENADOS=($(printf '%s\n' "${TIEMPOS[@]}" | sort -n))
CANT=${#ORDENADOS[@]}
P50=${ORDENADOS[$(( (CANT - 1) * 50 / 100 ))]}
P95=${ORDENADOS[$(( (CANT - 1) * 95 / 100 ))]}

{
  echo "# Finalidad medida en Fuji C-Chain"
  echo
  echo "Medido el $(date '+%d/%m/%Y %H:%M') desde la red del evento con \`scripts/medir-finalidad.sh\` ($CANT tx)."
  echo "Tiempo = envío de la tx → receipt (en la C-Chain, un bloque aceptado es final). **No incluye** el bundler de 0xGasless."
  echo
  echo "- **p50:** ${P50} ms"
  echo "- **p95:** ${P95} ms"
  echo
  echo "| Tx | ms | gas | costo (AVAX) | hash |"
  echo "|---|---|---|---|---|"
  printf '%s\n' "${FILAS[@]}"
} > "$OUT"

echo
echo "p50=${P50} ms · p95=${P95} ms → $OUT"
