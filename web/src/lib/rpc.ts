import { createPublicClient, http, type PublicClient } from "viem";
import { chain, config } from "./config";

let publico: PublicClient | null = null;

/** Un solo cliente de lectura para toda la web (RPC público de Fuji: polling cada 2 s, batch de llamadas). */
export function clientePublico(): PublicClient {
  if (!publico) {
    publico = createPublicClient({ chain, transport: http(config.rpcUrl, { batch: true }) });
  }
  return publico;
}
