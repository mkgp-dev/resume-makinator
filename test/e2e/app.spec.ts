import { expect, test } from "@playwright/test"
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const validImportPath = path.join(__dirname, "..", "fixtures", "resume-import-valid.json")
const classicImportPath = path.join(__dirname, "..", "fixtures", "resume-import-classic.json")
const modernImportPath = path.join(__dirname, "..", "fixtures", "resume-import-modern.json")
const modernAltImportPath = path.join(__dirname, "..", "fixtures", "resume-import-modern-alt.json")

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

  test("classic template is selectable, exposes parity controls, and persists after reload", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()

    const themeField = page.getByRole("group").filter({
      has: page.getByText("Select your theme", { exact: true }),
    }).first()
    const themeSelect = page.getByLabel("Select your theme")
    await themeSelect.click()
    await page.getByText("Classic", { exact: true }).click()

    await expect(themeField).toContainText("Classic")
    await expect(page.getByRole("checkbox", { name: "Enable profile picture" })).toBeVisible()
    await expect(page.getByRole("checkbox", { name: "Inline information" })).toBeVisible()
    await expect(page.getByRole("textbox", { name: "Profile picture size" })).toBeVisible()
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()

    await page.reload()
    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(themeField).toContainText("Classic")
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()
  })

  test("classic import remains selected and exposes template controls", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Data" }).click()
    await page.locator('input[type="file"]').setInputFiles(classicImportPath)
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Katherine Johnson")

    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(page.getByRole("group").filter({
      has: page.getByText("Select your theme", { exact: true }),
    }).first()).toContainText("Classic")
    await expect(page.getByRole("checkbox", { name: "Enable profile picture" })).toBeVisible()
    await expect(page.getByRole("checkbox", { name: "Inline information" })).toBeVisible()
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()
  })

  test("modern template is selectable, exposes accent color and layout organizer, and persists after reload", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()

    await page.getByLabel("Select your theme").click()
    await page.getByText("Modern", { exact: true }).click()

    const bulletsToggle = page.getByRole("checkbox", { name: "Enable bullets" })

    await expect(page.getByLabel("Accent color")).toBeVisible()
    await expect(bulletsToggle).toBeVisible()
    await expect(page.getByRole("group", { name: "Section layout" })).toBeVisible()
    await expect(page.getByTestId("modern-sidebar-sections")).toBeVisible()
    await expect(page.getByTestId("modern-main-sections")).toBeVisible()

    await bulletsToggle.click()
    await expect(bulletsToggle).toBeChecked()

    await page.reload()
    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(page.getByLabel("Accent color")).toBeVisible()
    await expect(page.getByRole("checkbox", { name: "Enable bullets" })).toBeChecked()
    await expect(page.getByRole("group", { name: "Section layout" })).toBeVisible()
  })

  test("modern import remains selected and preserves modern controls", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Data" }).click()
    await page.locator('input[type="file"]').setInputFiles(modernImportPath)
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Dorothy Vaughan")

    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(page.getByRole("group").filter({
      has: page.getByText("Select your theme", { exact: true }),
    }).first()).toContainText("Modern")
    await expect(page.getByLabel("Accent color")).toHaveValue("#1f4b99")
    await expect(page.getByRole("checkbox", { name: "Enable bullets" })).toBeChecked()
    await expect(page.getByTestId("modern-sidebar-sections")).toContainText("Achievements")
    await expect(page.getByTestId("modern-main-sections")).toContainText("Experience")
  })

  test("modern section organizer moves a section from sidebar to main and persists after reload", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByLabel("Select your theme").click()
    await page.getByText("Modern", { exact: true }).click()

    await page.getByTestId("modern-move-achievements").click()

    await expect(page.getByTestId("modern-sidebar-sections")).not.toContainText("Achievements")
    await expect(page.getByTestId("modern-main-sections")).toContainText("Achievements")

    await page.reload()
    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(page.getByTestId("modern-main-sections")).toContainText("Achievements")
  })

  test("modern configuration remains usable on narrower desktop widths", async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 768 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByLabel("Select your theme").click()
    await page.getByText("Modern", { exact: true }).click()

    await expect(page.getByLabel("Accent color")).toBeVisible()
    await expect(page.getByTestId("modern-move-achievements")).toBeVisible()

    const sidebarBox = await page.getByTestId("modern-sidebar-sections").boundingBox()
    const mainBox = await page.getByTestId("modern-main-sections").boundingBox()

    if (!sidebarBox || !mainBox) {
      throw new Error("Modern section layout did not render its containers.")
    }

    expect(mainBox.y).toBeGreaterThan(sidebarBox.y + sidebarBox.height - 1)
  })

  test("modern alt template is selectable, exposes banner color and linear section ordering, and persists after reload", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByLabel("Select your theme").click()
    await page.getByText("Modern Alt", { exact: true }).click()

    await expect(page.getByLabel("Banner color")).toBeVisible()
    await expect(page.getByRole("checkbox", { name: "Enable bullets" })).toBeVisible()
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()
    await expect(page.getByRole("group", { name: "Section layout" })).toHaveCount(0)

    await page.reload()
    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(page.getByLabel("Banner color")).toBeVisible()
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()
  })

  test("modern alt import remains selected and normalizes invalid banner color", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Data" }).click()
    await page.locator('input[type="file"]').setInputFiles(modernAltImportPath)
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Harold Finch")

    await page.getByRole("button", { name: "Configuration" }).click()

    await expect(page.getByRole("group").filter({
      has: page.getByText("Select your theme", { exact: true }),
    }).first()).toContainText("Modern Alt")
    await expect(page.getByLabel("Banner color")).toHaveValue("#475569")
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()
  })

  test("modern alt configuration remains usable on narrower desktop widths", async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 768 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByLabel("Select your theme").click()
    await page.getByText("Modern Alt", { exact: true }).click()

    const spacingBox = await page.getByRole("textbox", { name: "Component spacing" }).boundingBox()
    const bannerColorBox = await page.getByLabel("Banner color").boundingBox()

    if (!spacingBox || !bannerColorBox) {
      throw new Error("Modern Alt template controls did not render.")
    }

    expect(bannerColorBox.y).toBeGreaterThan(spacingBox.y + spacingBox.height - 1)
    await expect(page.getByRole("group", { name: "Modify components" })).toBeVisible()
  })
})
