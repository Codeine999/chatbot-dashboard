import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://4b9b-2405-9800-b640-e82b-34e9-be08-f59c-dbd1.ngrok-free.app",
        changeOrigin: true,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
