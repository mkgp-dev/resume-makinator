import { defineConfig, devices } from "@playwright/test"

const PORT = 4173
const HOST = "127.0.0.1"
const BASE_URL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --host ${HOST} --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
