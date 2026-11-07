#!/usr/bin/env node
// Exporta el ABI de los contratos y las direcciones de Fuji a web/src/abi/ (P2 y P3 los importan desde ahí).
// Se corre después de cada `forge build` o deploy:
//
//   cd contracts && forge build && node script/export-abi.mjs
//   node script/export-abi.mjs --out out-t1      # si se compiló con otro --out
//
// Genera (nadie los edita a mano):
//   web/src/abi/Llave.ts               export const llaveAbi = [...] as const
//   web/src/abi/MockPesos.ts           export const pesosAbi = [...] as const
//   web/src/abi/KumplyStore.ts         export const kumplyStoreAbi = [...] as const   (solo verify)
//   web/src/abi/deployments.fuji.json  copia de deployments/fuji.json
// El `as const` hace que viem tipe los argumentos y los retornos.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const contracts = resolve(dirname(fileURLToPath(import.meta.url)), ".."); // funciona desde cualquier carpeta
const raiz = resolve(contracts, "..");
const destino = join(raiz, "web", "src", "abi");
const deployments = join(raiz, "deployments", "fuji.json");

const iOut = process.argv.indexOf("--out");
const outForge = resolve(contracts, iOut > -1 && process.argv[iOut + 1] ? process.argv[iOut + 1] : "out");

const CABECERA = "// GENERADO por contracts/script/export-abi.mjs. No editar a mano: correr `node script/export-abi.mjs`.\n";

/** Lo mínimo que la web y el agente necesitan de cada ABI; si falta algo, el build no es el esperado. */
const REQUERIDOS = {
  Llave: [
    "estado", "fase", "herederos", "esHeredero", "parteDe", "venceEn", "graciaTerminaEn",
    "estoyBien", "depositar", "retirar", "configurar", "transferirDueno", "iniciarReclamo", "liberar",
    "isAgent", "kumply", "token", "comisionBps", "tesoreria",
    "ReclamoIniciado", "ReclamoCancelado", "SenalDeVida", "HerenciaEnviada", "ComisionCobrada", "Liberada",
    "VerificadoKumply", "NotAgent", "SigueVivo", "GraciaEnCurso", "YaLiberada", "SinReclamo", "SinSaldo",
  ],
  MockPesos: ["faucet", "faucetPara", "approve", "balanceOf", "decimals", "symbol", "MONTO_FAUCET"],
};

/** verify(address subject) → (bool verified, uint32 tier, uint64 timestamp, uint64 expiry). Solo verify: nunca la función deprecada que compara `tier >= N`. */
const KUMPLY_STORE_ABI = [
  {
    type: "function",
    name: "verify",
    stateMutability: "view",
    inputs: [{ name: "subject", type: "address", internalType: "address" }],
    outputs: [
      { name: "verified", type: "bool", internalType: "bool" },
      { name: "tier", type: "uint32", internalType: "uint32" },
      { name: "timestamp", type: "uint64", internalType: "uint64" },
      { name: "expiry", type: "uint64", internalType: "uint64" },
    ],
  },
];

function fallar(mensaje) {
  console.error(`export-abi: ${mensaje}`);
  process.exit(1);
}

function leerAbi(contrato) {
  const artefacto = join(outForge, `${contrato}.sol`, `${contrato}.json`);
  if (!existsSync(artefacto)) {
    fallar(`no existe ${relative(raiz, artefacto)}. Corré \`forge build\` (o pasá --out <carpeta>) antes.`);
  }
  const { abi } = JSON.parse(readFileSync(artefacto, "utf8"));
  if (!Array.isArray(abi) || abi.length === 0) fallar(`${contrato}: el artefacto no tiene ABI.`);
  const nombres = new Set(abi.map((x) => x.name).filter(Boolean));
  const faltan = (REQUERIDOS[contrato] ?? []).filter((n) => !nombres.has(n));
  if (faltan.length > 0) fallar(`${contrato}: faltan en el ABI ${faltan.join(", ")}.`);
  return abi;
}

function escribirTs(archivo, nombre, abi) {
  const ruta = join(destino, archivo);
  writeFileSync(ruta, `${CABECERA}export const ${nombre} = ${JSON.stringify(abi, null, 2)} as const;\n`);
  console.log(`  ${relative(raiz, ruta)}  (${nombre}, ${abi.length} entradas)`);
}

mkdirSync(destino, { recursive: true });
console.log(`ABI desde ${relative(raiz, outForge)}/ → ${relative(raiz, destino)}/`);
escribirTs("Llave.ts", "llaveAbi", leerAbi("Llave"));
escribirTs("MockPesos.ts", "pesosAbi", leerAbi("MockPesos"));
escribirTs("KumplyStore.ts", "kumplyStoreAbi", KUMPLY_STORE_ABI);

// Direcciones: se valida que sea JSON (el CI corre `jq empty`) y se copia tal cual.
if (!existsSync(deployments)) fallar(`no existe ${relative(raiz, deployments)}.`);
const textoDeployments = readFileSync(deployments, "utf8");
let fuji;
try {
  fuji = JSON.parse(textoDeployments);
} catch (e) {
  fallar(`${relative(raiz, deployments)} no es JSON válido: ${e.message}`);
}
if (fuji.chainId !== 43113) fallar(`${relative(raiz, deployments)}: chainId tiene que ser 43113.`);
const copia = join(destino, "deployments.fuji.json");
writeFileSync(copia, textoDeployments);
console.log(`  ${relative(raiz, copia)}  (llave.A ${fuji.llave?.A ?? "?"}, llave.B ${fuji.llave?.B ?? "?"})`);
console.log("ABI + direcciones exportados a web/src/abi/");
