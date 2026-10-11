import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "icons.svg"],
      devOptions: {
        enabled: true, // Mengaktifkan PWA di lokal
      },
      manifest: {
        name: "Lapkeu - Laporan Keuangan",
        short_name: "LapKeu",
        lang: "id",
        description: "Aplikasi Pengelola Keuangan",
        theme_color: "#0f172a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Mengubah batas warning menjadi 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Pustaka grafik & ekspor
            if (id.includes("recharts")) return "vendor-recharts";
            if (id.includes("html2canvas")) return "vendor-html2canvas";
            
            // Pustaka ikon
            if (id.includes("lucide-react")) return "vendor-icons";

            // Core React & Router
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-router-dom/")
            ) {
              return "vendor-react";
            }

            // Sisanya dijadikan chunk vendor umum
            return "vendor";
          }
        },
      },
    },
  },
});