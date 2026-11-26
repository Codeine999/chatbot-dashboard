import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Connect, type Plugin } from "vite"

/**
 * /privacy เป็นไฟล์ static (public/privacy.html) ไม่ใช่หน้าในแอป React
 * production ใช้ nginx.conf ส่วนนี้ทำให้ dev server และ preview เสิร์ฟแบบเดียวกัน
 */
const privacyPage = (): Plugin => {
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const path = req.url?.split("?")[0]
    if (path === "/privacy" || path === "/privacy/") req.url = "/privacy.html"
    next()
  }
  return {
    name: "privacy-static-page",
    configureServer: (server) => {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(rewrite)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [privacyPage(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://c9c1-2405-9800-b640-e82b-34e9-be08-f59c-dbd1.ngrok-free.app",
        changeOrigin: true,
        headers: {
          "Content-Type": "application/json",
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
