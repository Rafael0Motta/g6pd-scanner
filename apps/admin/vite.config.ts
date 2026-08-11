import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Ver comentario equivalente em apps/mobile/vite.config.ts.
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 5174,
  },
});
