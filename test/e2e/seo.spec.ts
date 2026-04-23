import { expect, test } from "@playwright/test"

const SITE_TITLE = "Resume Makinator | Free Resume Builder & PDF Export"
const SITE_DESCRIPTION =
  "Build a polished resume in your browser with Resume Makinator. Fill structured sections, reorder content, preview live PDFs, and export fast."
const SITE_URL = "https://rm.mkgpdev.xyz/"
const OG_IMAGE_URL = "https://rm.mkgpdev.xyz/logo.png"

test.describe("seo", () => {
  test("homepage exposes the expected metadata", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(SITE_TITLE)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", SITE_DESCRIPTION)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE_URL)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow")
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", SITE_TITLE)
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", SITE_DESCRIPTION)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", SITE_URL)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", OG_IMAGE_URL)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", SITE_TITLE)
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", SITE_DESCRIPTION)
  })

  test("homepage includes structured data and semantic landing content", async ({ page }) => {
    await page.goto("/")

    const structuredData = page.locator('script[type="application/ld+json"]')
    await expect(structuredData).toHaveCount(1)

    const payload = JSON.parse((await structuredData.textContent()) ?? "{}")
    expect(payload["@type"]).toBe("WebApplication")
    expect(payload.name).toBe("Resume Makinator")
    expect(payload.url).toBe(SITE_URL)

    await expect(page.getByRole("heading", { level: 1, name: /resume builder/i })).toHaveCount(1)
    await expect(page.getByRole("main")).toBeVisible()
    await expect(page.getByRole("navigation")).toHaveCount(0)
  })

  test("content security policy allows Cloudflare Web Analytics", async ({ page }) => {
    await page.goto("/")

    const csp = page.locator('meta[http-equiv="Content-Security-Policy"]')
    await expect(csp).toHaveAttribute("content", /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/)
    await expect(csp).toHaveAttribute("content", /script-src[^;]*'sha256-rXmU8JD8rCiy\/8Z78bNJPA7QrlG8kghDfG9cuSY\+xHo='/)
    await expect(csp).toHaveAttribute("content", /connect-src[^;]*https:\/\/cloudflareinsights\.com/)
  })

  test("crawlability assets are reachable", async ({ request }) => {
    const robotsResponse = await request.get("/robots.txt")
    expect(robotsResponse.ok()).toBeTruthy()
    await expect(await robotsResponse.text()).toContain("Sitemap: https://rm.mkgpdev.xyz/sitemap.xml")

    const sitemapResponse = await request.get("/sitemap.xml")
    expect(sitemapResponse.ok()).toBeTruthy()
    await expect(await sitemapResponse.text()).toContain("<loc>https://rm.mkgpdev.xyz/</loc>")
  })

  test("document title updates when the editor becomes active", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(SITE_TITLE)
    await page.getByRole("button", { name: "Get started" }).click()
    await expect(page).toHaveTitle("About You | Resume Makinator")
  })
})
