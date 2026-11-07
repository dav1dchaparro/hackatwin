import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
// nodePolyfills: @0xgasless/core (vía @0xgasless/smart-account-sdk → merkletreejs) usa Buffer/process en el navegador
// (PLAN_CONSTRUCCION_LLAVE.md §8.2). `globals` deja Buffer/process/global disponibles en window.
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "util", "stream", "events"],
      globals: { Buffer: true, process: true, global: true },
    }),
  ],
  build: { chunkSizeWarningLimit: 3000 },
});
