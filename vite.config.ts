import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const manualChunks = (id: string) => {
  if (id.includes("/node_modules/@react-pdf/renderer/")) return "vendor-react-pdf"
  if (id.includes("/node_modules/react-select/")) return "vendor-react-select"
  if (id.includes("/node_modules/@dnd-kit/")) return "vendor-dnd"
  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
