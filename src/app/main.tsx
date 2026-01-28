import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Buffer } from "buffer"
import "@/app/index.css"
import App from "@/app/App"

globalThis.Buffer = Buffer
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
