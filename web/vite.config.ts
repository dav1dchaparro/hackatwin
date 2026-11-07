import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // @0xgasless/core (vía @0xgasless/smart-account-sdk → merkletreejs) usa Buffer/process en el navegador.
    nodePolyfills({
      include: ["buffer", "process", "util", "events", "stream"],
      globals: { Buffer: true, process: true, global: true },
    }),
  ],
  build: { chunkSizeWarningLimit: 3000 },
});
