import { expect, test } from "@playwright/test"
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const validImportPath = path.join(__dirname, "..", "fixtures", "resume-import-valid.json")

test.describe("resume editor", () => {
  test("first-run onboarding acknowledges privacy and stays dismissed after reload", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { level: 1, name: /free resume builder/i })).toBeVisible()
    await page.getByRole("button", { name: "Get started" }).click()

    const privacyDialog = page.getByRole("dialog")
    await expect(privacyDialog).toBeVisible()
    await page.getByRole("button", { name: "I understand" }).click()
    await expect(page.getByRole("button", { name: "I understand" })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole("button", { name: "I understand" })).toHaveCount(0)
  })

  test("about form values persist after reload", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("textbox", { name: "Name" }).fill("Ada Lovelace")
    await page.getByRole("textbox", { name: "Position (Optional)" }).fill("Analyst")

    await page.reload()

    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Ada Lovelace")
    await expect(page.getByRole("textbox", { name: "Position (Optional)" })).toHaveValue("Analyst")
    await expect(page.getByRole("button", { name: "I understand" })).toHaveCount(0)
  })

  test("data import rejects invalid json and accepts a valid exported shape", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Data" }).click()
    const fileInput = page.locator('input[type="file"]')

    await fileInput.setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ invalid: true })),
    })

    await expect(page.getByRole("alert").filter({ hasText: "The selected file does not match the required format" })).toBeVisible()

    await fileInput.setInputFiles(validImportPath)
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Grace Hopper")
    await expect(page.getByRole("textbox", { name: "Position (Optional)" })).toHaveValue("Computer Scientist")
  })
})
