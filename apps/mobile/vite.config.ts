import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Mantem o pacote de workspace @g6pd/shared-types resolvido "como se"
  // estivesse em node_modules, para o interop CJS->ESM do Rollup funcionar
  // (sem isso, o link simbolico do workspace escapa de node_modules e o
  // build falha com "X is not exported by .../dist/index.js").
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 5173,
  },
});
