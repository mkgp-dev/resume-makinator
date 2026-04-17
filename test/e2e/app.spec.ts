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
  test("landing page uses a two-part hero with builder-inspired proof on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")

    await expect(page.getByText("This is Resume Makinator")).toBeVisible()
    await expect(page.getByText("Slate Resume Workflow")).toHaveCount(0)
    await expect(page.getByText("Built with React")).toHaveCount(0)
    await expect(page.getByText(/Developed by Mark Kenneth Pelayo/i)).toHaveCount(0)
    await expect(page.getByTestId("landing-hero-copy")).toBeVisible()
    await expect(page.getByTestId("landing-hero-visual")).toBeVisible()
    await expect(page.getByTestId("landing-proof-grid")).toBeVisible()
    await expect(page.getByTestId("landing-proof-grid").getByText("Structured editing")).toBeVisible()
    await expect(page.getByTestId("landing-proof-grid").getByText("Live PDF preview")).toBeVisible()
    await expect(page.getByTestId("landing-proof-grid").getByText("Export and reorder")).toBeVisible()

    const copyBox = await page.getByTestId("landing-hero-copy").boundingBox()
    const visualBox = await page.getByTestId("landing-hero-visual").boundingBox()
    const proofCards = page.getByTestId("landing-proof-card")

    if (!copyBox || !visualBox) {
      throw new Error("Landing hero did not render for desktop layout verification.")
    }

    expect(visualBox.x).toBeGreaterThan(copyBox.x + copyBox.width - 24)
    await expect(proofCards).toHaveCount(3)
    expect(
      await page.getByTestId("landing-shell").evaluate((element) => getComputedStyle(element).overflowY)
    ).toBe("hidden")
  })

  test("landing page stacks cleanly on mobile and keeps the primary CTA reachable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")

    const heroCopy = page.getByTestId("landing-hero-copy")
    const heroVisual = page.getByTestId("landing-hero-visual")
    const cta = page.getByRole("button", { name: "Get started" })

    await expect(heroCopy).toBeVisible()
    await expect(heroVisual).toBeVisible()
    await expect(cta).toBeVisible()

    const copyBox = await heroCopy.boundingBox()
    const visualBox = await heroVisual.boundingBox()

    if (!copyBox || !visualBox) {
      throw new Error("Landing hero did not render for mobile layout verification.")
    }

    expect(visualBox.y).toBeGreaterThan(copyBox.y + copyBox.height - 24)
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390)
    expect(
      await page.getByTestId("landing-shell").evaluate((element) => getComputedStyle(element).overflowY)
    ).toBe("hidden")
  })

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

  test("desktop navigation uses a floating grouped rail and keeps the preview visible", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    const nav = page.getByTestId("editor-sidebar-desktop")
    await expect(nav).toBeVisible()
    await expect(page.getByTestId("editor-sidebar-main-group")).toContainText("About you")
    await expect(page.getByTestId("editor-sidebar-secondary-group")).toContainText("Configuration")
    await expect(page.getByTestId("editor-sidebar-secondary-group")).toContainText("Data")
    await expect(page.getByTestId("editor-preview-panel")).toBeVisible()
    await expect(page.getByText("Resume editor")).toHaveCount(0)

    const navBox = await nav.boundingBox()
    const previewBox = await page.getByTestId("editor-preview-panel").boundingBox()
    const previewFrameBox = await page.locator('iframe[title="Resume Preview"]').boundingBox()

    if (!navBox || !previewBox || !previewFrameBox) {
      throw new Error("Desktop navigation or preview panel did not render.")
    }

    expect(previewBox.x).toBeGreaterThan(navBox.x + navBox.width)
    expect(previewFrameBox.height).toBeGreaterThanOrEqual(previewBox.height - 24)
  })

  test("mobile navigation stays usable without hover and education exposes a full-width add action", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Open navigation" }).click()
    await expect(page.getByTestId("editor-sidebar-mobile")).toBeVisible()
    await page.getByRole("button", { name: "Education" }).click()

    const addButton = page.getByRole("button", { name: "Add an item" })
    await expect(addButton).toBeVisible()

    const addButtonBox = await addButton.boundingBox()
    const educationSectionBox = await page.getByTestId("editor-section-education").boundingBox()

    if (!addButtonBox || !educationSectionBox) {
      throw new Error("Education section did not render on mobile.")
    }

    expect(addButtonBox.width).toBeGreaterThanOrEqual(educationSectionBox.width - 24)

    await addButton.click()
    await expect(page.getByRole("textbox", { name: "Degree" })).toBeVisible()
  })

  test("template checkboxes stay framed while repeated-entry present toggles remain borderless", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    const templateCheckboxFrame = page
      .getByRole("checkbox", { name: "Enable profile picture" })
      .locator("..")

    await expect(templateCheckboxFrame).toBeVisible()
    expect(await templateCheckboxFrame.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe("1px")

    await page.getByRole("button", { name: "Education" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()

    const presentCheckboxFrame = page
      .getByRole("checkbox", { name: "Present" })
      .locator("..")

    await expect(presentCheckboxFrame).toBeVisible()
    expect(await presentCheckboxFrame.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe("0px")
  })

  test("desktop editor fade appears as soon as repeated-entry content starts overflowing", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Personal Project" }).click()

    const addButton = page.getByRole("button", { name: "Add an item" })
    for (let index = 0; index < 4; index += 1) {
      await addButton.click()
    }

    const bottomFade = page.locator(".editor-scroll-fade-bottom")

    await expect.poll(async () => {
      return bottomFade.evaluate((element) => getComputedStyle(element).opacity)
    }).toBe("1")
  })

  test("bullet mode and delete actions animate before removal", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Work Experience" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()

    const bulletToggle = page.getByRole("checkbox", { name: "Use bullet points" }).first()
    await bulletToggle.click()

    const bulletPanel = page.getByTestId("bullet-list-panel").first()
    await expect(bulletPanel).toBeVisible()
    expect(await bulletPanel.evaluate((element) => getComputedStyle(element).animationName)).not.toBe("none")

    await page.getByRole("button", { name: "Add a bullet" }).click()

    const bulletRow = page.getByTestId("bullet-row").first()
    await expect(bulletRow).toBeVisible()
    expect(await bulletRow.evaluate((element) => getComputedStyle(element).animationName)).not.toBe("none")

    await page.getByRole("button", { name: "Delete bullet" }).first().click()
    await expect(bulletRow).toHaveAttribute("data-state", "removing")
    await expect(page.getByTestId("bullet-row")).toHaveCount(0)

    await page.getByRole("button", { name: "Add an item" }).click()
    await expect(page.getByTestId("sortable-item")).toHaveCount(2)

    const firstSortableItem = page.getByTestId("sortable-item").first()
    await page.getByLabel("Delete item").first().click()
    await expect(firstSortableItem).toHaveAttribute("data-state", "removing")
    await expect(page.getByTestId("sortable-item")).toHaveCount(1)
  })

  test("dragging repeated entries shows active and drop-target feedback before reorder", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Work Experience" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()

    const dragHandle = page.getByTestId("sortable-handle").first()
    const activeCard = page.getByTestId("sortable-item").first()
    const targetCard = page.getByTestId("sortable-item").nth(1)
    const handleBox = await dragHandle.boundingBox()
    const targetBox = await targetCard.boundingBox()

    if (!handleBox || !targetBox) {
      throw new Error("Sortable handles did not render for drag feedback test.")
    }

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * 0.78, { steps: 10 })

    await expect(activeCard).toHaveAttribute("data-state", "dragging")
    await expect(targetCard).toHaveAttribute("data-drop-position", /before|after/)

    await page.mouse.up()
  })

  test("repeated entries collapse into accordions and still reorder when collapsed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Work Experience" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByRole("textbox", { name: "Position" }).fill("Backend Engineer")

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByRole("textbox", { name: "Position" }).last().fill("Frontend Engineer")

    const backendAccordion = page.getByRole("button", { name: /Backend Engineer/i })
    await expect(backendAccordion).toBeVisible()

    await backendAccordion.click()
    await expect(page.getByTestId("sortable-item").first()).toHaveAttribute("data-expanded", "true")

    const frontendAccordion = page.getByRole("button", { name: /Frontend Engineer/i })
    await frontendAccordion.click()
    await expect(page.getByTestId("sortable-item").first()).toHaveAttribute("data-expanded", "false")

    const dragHandle = page.getByTestId("sortable-handle").first()
    const targetCard = page.getByTestId("sortable-item").nth(1)
    const handleBox = await dragHandle.boundingBox()
    const targetBox = await targetCard.boundingBox()

    if (!handleBox || !targetBox) {
      throw new Error("Accordion drag handles did not render.")
    }

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * 0.78, { steps: 10 })
    await expect(targetCard).toHaveAttribute("data-drop-position", /before|after/)
    await page.mouse.up()
  })

  test("dragging the last repeated entry keeps the real item visible without a separate overlay ghost", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Work Experience" }).click()

    const labels = ["First Engineer", "Second Engineer", "Third Engineer", "Fourth Engineer"]
    for (const label of labels) {
      await page.getByRole("button", { name: "Add an item" }).click()
      await page.getByRole("textbox", { name: "Position" }).last().fill(label)
    }

    const lastHandle = page.getByTestId("sortable-handle").last()
    const lastCard = page.getByTestId("sortable-item").last()
    const handleBox = await lastHandle.boundingBox()
    const lastCardBox = await lastCard.boundingBox()

    if (!handleBox || !lastCardBox) {
      throw new Error("Last sortable entry did not render for drag preview test.")
    }

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(lastCardBox.x + lastCardBox.width / 2 - 20, lastCardBox.y - 24, { steps: 12 })

    await expect(lastCard).toHaveAttribute("data-state", "dragging")
    await expect(lastCard).toBeVisible()
    await expect(page.getByTestId("sortable-drag-overlay")).toHaveCount(0)

    await page.mouse.up()
  })

  test("expanded repeated entries keep their content visible while dragging", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Work Experience" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()

    const firstItem = page.getByTestId("sortable-item").first()
    await page.getByRole("textbox", { name: "Position" }).first().fill("Lead Engineer")
    await page.getByRole("textbox", { name: "Company" }).first().fill("OpenAI")
    await firstItem.locator("button[aria-expanded]").click()

    const companyField = page.getByRole("textbox", { name: "Company" }).first()
    const dragHandle = page.getByTestId("sortable-handle").first()
    const targetCard = page.getByTestId("sortable-item").nth(1)
    const handleBox = await dragHandle.boundingBox()
    const targetBox = await targetCard.boundingBox()

    if (!handleBox || !targetBox) {
      throw new Error("Expanded sortable item did not render for drag-stability test.")
    }

    await expect(firstItem).toHaveAttribute("data-expanded", "true")
    await expect(companyField).toBeVisible()

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * 0.78, { steps: 10 })

    await expect(firstItem).toHaveAttribute("data-state", "dragging")
    await expect(companyField).toBeVisible()

    await page.mouse.up()
  })

  test("language multiselect selects an option on the first click", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByLabel("Languages").click()
    await page.getByLabel("Languages").fill("Tagalog")
    await page.getByRole("option", { name: "Tagalog" }).click()
    await page.keyboard.press("Escape")

    await expect(page.getByText("Tagalog", { exact: true }).first()).toBeVisible()
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

  test("downloaded app data can be imported back into a newly created resume", async ({ page }, testInfo) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Data" }).click()

    const downloadPromise = page.waitForEvent("download", (download) =>
      download.suggestedFilename().endsWith(".json"),
    )
    await page.getByRole("button", { name: "Download your data" }).click()

    const download = await downloadPromise
    const exportedPath = testInfo.outputPath("resume-roundtrip.json")
    await download.saveAs(exportedPath)

    await page.locator('input[type="file"]').setInputFiles(exportedPath)

    await expect(page.getByRole("alert").filter({ hasText: "Data import completed without issues" })).toBeVisible()
    await expect(page.getByRole("alert").filter({ hasText: "The selected file does not match the required format" })).toHaveCount(0)
  })

  test("downloaded app data restores a non-default template after reset and re-import", async ({ page }, testInfo) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByLabel("Select your theme").click()
    await page.getByText("Modern", { exact: true }).click()
    await page.getByRole("checkbox", { name: "Enable bullets" }).click()
    await expect(page.getByRole("checkbox", { name: "Enable bullets" })).toBeChecked()

    await page.getByRole("button", { name: "Data" }).click()

    const downloadPromise = page.waitForEvent("download", (download) =>
      download.suggestedFilename().endsWith(".json"),
    )
    await page.getByRole("button", { name: "Download your data" }).click()

    const download = await downloadPromise
    const exportedPath = testInfo.outputPath("resume-modern-roundtrip.json")
    await download.saveAs(exportedPath)

    await page.getByRole("button", { name: "Reset everything" }).click()
    await page.getByRole("button", { name: "Reset everything" }).nth(1).click()

    await page.getByRole("button", { name: "Configuration" }).click()
    await expect(page.getByRole("group").filter({
      has: page.getByText("Select your theme", { exact: true }),
    }).first()).toContainText("Simple Whitepaper")

    await page.getByRole("button", { name: "Data" }).click()
    await page.locator('input[type="file"]').setInputFiles(exportedPath)

    await expect(page.getByRole("alert").filter({ hasText: "Data import completed without issues" })).toBeVisible()

    await page.getByRole("button", { name: "Configuration" }).click()
    await expect(page.getByRole("group").filter({
      has: page.getByText("Select your theme", { exact: true }),
    }).first()).toContainText("Modern")
    await expect(page.getByRole("checkbox", { name: "Enable bullets" })).toBeChecked()
  })

  test("reset dialog closes cleanly from cancel and backdrop", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Get started" }).click()
    await page.getByRole("button", { name: "I understand" }).click()

    await page.getByRole("button", { name: "Data" }).click()
    await page.getByRole("button", { name: "Reset everything" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole("button", { name: "Reset everything" }).click()
    await expect(dialog).toBeVisible()
    await page.mouse.click(10, 10)
    await expect(dialog).toBeHidden()
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
