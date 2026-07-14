import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo local, /api se redirige al backend (herramientas-node-api).
// Cambia el target si tu backend corre en otro puerto.
// En producción (Coolify), nginx dentro del contenedor frontend
// es quien enruta /api hacia el servicio backend (ver nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // herramientas-node-api usa PORT=3000 por defecto (ver .env.example
        // del backend). Ajusta VITE_API_PROXY_TARGET si tu backend corre
        // en otro puerto.
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
