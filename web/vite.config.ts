import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
// nodePolyfills: @0xgasless/core arrastra dependencias que usan Buffer/process (PLAN_CONSTRUCCION_LLAVE.md §8.2).
export default defineConfig({
  plugins: [react(), nodePolyfills({ include: ["buffer", "process", "util", "stream", "events"] })],
  build: { chunkSizeWarningLimit: 3000 },
});
