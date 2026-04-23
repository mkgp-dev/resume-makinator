import { expect, test, type Page, type Route } from "@playwright/test"

const startEditor = async (page: Page) => {
  await page.goto("/")

  const getStarted = page.getByRole("button", { name: "Get started" })
  if (await getStarted.count()) {
    await getStarted.click({ force: true })
  }

  const privacyAcknowledge = page.getByRole("button", { name: "I understand" })
  if (await privacyAcknowledge.waitFor({ state: "visible", timeout: 1500 }).then(() => true).catch(() => false)) {
    await privacyAcknowledge.click()
  }
}

const openChatAssistant = async (page: Page) => {
  await expect(page.getByTestId("chat-assistant-trigger")).toBeVisible()
  await page.getByTestId("chat-assistant-trigger").click()
  await expect(page.getByTestId("chat-assistant-panel")).toBeVisible()
}

const fulfillJson = async (route: Route, status: number, body: unknown) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  })
}

const expectNoAutoImproveRequestFields = (payload: Record<string, unknown>) => {
  expect(payload.autoImprove).toBeUndefined()
  expect(payload.qualityMode).toBeUndefined()
  expect(payload.wordingMode).toBeUndefined()
  expect(payload.exactWording).toBeUndefined()
  expect(payload.preserveExactWording).toBeUndefined()
}

const expectNoActiveBoundaryState = (payload: Record<string, unknown>) => {
  expect(payload.activeDraft).toBeUndefined()
  expect(payload.pendingAction).toBeUndefined()
  expect(payload.userDecision).toBeUndefined()
}

test.describe("chat assistant", () => {
  test("opens from the desktop edge trigger and shows the empty state", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await startEditor(page)

    await expect(page.getByTestId("chat-assistant-panel")).toHaveCount(0)
    await expect(page.getByTestId("chat-assistant-trigger")).toBeVisible()

    await openChatAssistant(page)
    const panel = page.getByTestId("chat-assistant-panel")
    await expect(panel.getByText("Chat Assistant", { exact: true })).toBeVisible()
    await expect(page.getByText("Powered with Pollinations.ai")).toBeVisible()
    await expect(page.getByText("Resume help, right beside your draft")).toHaveCount(0)
    await expect(page.getByText("Start chatting to improve your resume.")).toHaveCount(0)
    await expect(page.getByText("Start chatting to improve your resume", { exact: true })).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible()
    await expect(panel.locator("label").filter({ hasText: /^Message$/ })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Send message" })).toContainText("Send")
    await expect(page.getByRole("button", { name: "Clear conversation" })).toContainText("Clear conversation")
  })

  test("opens the chat assistant information dialog with beta and provider guidance", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("button", { name: "About your Assistant" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog.getByRole("heading", { name: "About your Assistant" })).toBeVisible()
    await expect(dialog).toContainText("early stage")
    await expect(dialog).toContainText("responses may be slow")
    await expect(dialog).toContainText("Clear intent matters")
    await expect(dialog.getByRole("link", { name: "send a report" })).toHaveAttribute(
      "href",
      "https://github.com/mkgp-dev/resume-makinator/issues/new?template=bug_report.md",
    )
    await expect(dialog).toContainText("Pollinations AI")
    await expect(dialog).toContainText("add your own Pollinations key")
    await expect(dialog).toContainText("shared server allowance is depleted")
    await expect(dialog).toContainText("one section at a time")
    await expect(dialog).toContainText("This limit will be improved further in the future")
  })

  test("uses a full-screen sheet on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await startEditor(page)

    await openChatAssistant(page)

    const panel = page.getByTestId("chat-assistant-panel")
    const panelBox = await panel.boundingBox()

    if (!panelBox) {
      throw new Error("Chat assistant panel did not render on mobile.")
    }

    expect(panelBox.width).toBeGreaterThanOrEqual(360)
    expect(panelBox.height).toBeGreaterThanOrEqual(760)
  })

  test("sends a configured Pollinations key as a bearer token", async ({ page }) => {
    const apiKey = "sk_12345678901234567890123456789012"

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      expect(route.request().headers().authorization).toBe(`Bearer ${apiKey}`)
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready for your summary.",
        status: "clarification_needed",
        clarificationQuestion: "What would you like to change?",
        needsClarification: true,
        needsConfirmation: false,
        readyToApply: false,
        target: { section: "personalDetails", itemId: null, field: "summary", scope: "section" },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByRole("textbox", { name: "Pollinations API key" }).fill(apiKey)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByText("What would you like to change?")).toBeVisible()
  })

  test("sends a message, disables input while waiting, and persists the conversation after reload", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("Make my summary sharper.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()
      expect(payload.resumeData.configuration).toBeUndefined()
      expect(payload.resumeData.template).toBeUndefined()
      expect(payload.resumeData.enableInRender).toBeUndefined()
      expect(payload.resumeData.activePage).toBeUndefined()
      expect(payload.resumeData.personalDetails.profilePicture).toBeUndefined()

      await new Promise((resolve) => setTimeout(resolve, 250))

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Here is a sharper draft for your summary.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: {
          summary: "Refined your professional summary.",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "summary",
              instruction: "Use a sharper summary.",
              proposedText: "Frontend-focused developer building clean resume workflows.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    const input = page.getByRole("textbox", { name: "Message" })
    const send = page.getByRole("button", { name: "Send message" })

    await input.fill("Make my summary sharper.")
    await send.click()

    await expect(input).toBeDisabled()
    await expect(send).toBeDisabled()
    await expect(page.getByText("Hang tight while we prepare a response")).toBeVisible()
    const userBubble = page.getByTestId("chat-message-bubble").filter({ hasText: "Make my summary sharper." })
    await expect(userBubble).toBeVisible()
    await expect(userBubble).toHaveClass(/chat-assistant-bubble--user/)
    await expect(page.getByTestId("chat-message-bubble").filter({ hasText: "Here is a sharper draft for your summary." })).toBeVisible()

    expect(requestCount).toBe(1)

    await page.reload()
    await openChatAssistant(page)
    await expect(page.locator(".chat-bubble").filter({ hasText: "Make my summary sharper." })).toBeVisible()
    await expect(page.locator(".chat-bubble").filter({ hasText: "Here is a sharper draft for your summary." })).toBeVisible()
  })

  test("renders inline backend errors and rate limits inside the conversation flow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 429, {
        error: {
          code: "rate_limited",
          message: "Too Many Requests",
          requestId: "req-rate-limit",
        },
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Help me fix my work summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    const inlineError = page.getByTestId("chat-inline-error")
    await expect(inlineError).toBeVisible()
    await expect(inlineError).toContainText("Too Many Requests")
    await expect(page.locator(".chat", { hasText: "Too Many Requests" })).toHaveCount(0)
  })

  test("sends only the last six visible messages as conversation memory", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      if (requestCount === 1) {
        expect(payload.message).toBe("Turn 1")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
      }

      if (requestCount === 3) {
        expect(payload.message).toBe("Turn 3")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toEqual([
          { role: "user", text: "Turn 1" },
          { role: "assistant", text: "Reply 1" },
          { role: "user", text: "Turn 2" },
          { role: "assistant", text: "Reply 2" },
        ])
        expect(JSON.stringify(payload.conversation)).not.toContain("Backend warning that should not travel")
      }

      if (requestCount === 5) {
        expect(payload.message).toBe("Turn 5")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toEqual([
          { role: "user", text: "Turn 2" },
          { role: "assistant", text: "Reply 2" },
          { role: "user", text: "Turn 3" },
          { role: "assistant", text: "Reply 3" },
          { role: "user", text: "Turn 4" },
          { role: "assistant", text: "Reply 4" },
        ])
      }

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: `Reply ${requestCount}`,
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: null,
          itemId: null,
          field: null,
          scope: "unknown",
        },
        draft: null,
        warnings: requestCount === 2 ? ["Backend warning that should not travel"] : [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    for (let turn = 1; turn <= 5; turn += 1) {
      await page.getByRole("textbox", { name: "Message" }).fill(`Turn ${turn}`)
      await page.getByRole("button", { name: "Send message" }).click()
      await expect(page.locator(".chat-bubble").filter({ hasText: `Reply ${turn}` })).toBeVisible()
    }

    expect(requestCount).toBe(5)
  })

  test("sends pendingAction and confirm decision for conversational delete confirmations", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0
    let projectIds: string[] = []

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.debugProvider).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()

      if (requestCount === 1) {
        expect(payload.message).toBe("Delete all personal projects.")
        expect(payload.pendingAction).toBeUndefined()
        expect(payload.userDecision).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
        projectIds = payload.resumeData.personalProjects.map((item: { id: string }) => item.id)
        expect(projectIds).toHaveLength(2)

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "Do you want to permanently delete both Forecast Me and Alta from Personal projects?",
          status: "clarification_needed",
          clarificationQuestion: "Do you want to permanently delete both Forecast Me and Alta from Personal projects?",
          needsClarification: true,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: null,
            field: null,
            scope: "section",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("yes")
      expect(payload.pendingAction).toEqual({
        type: "delete",
        targetSection: "personalProjects",
        targetItemIds: projectIds,
      })
      expect(payload.userDecision).toBe("confirm")
      expect(payload.conversation).toEqual([
        { role: "user", text: "Delete all personal projects." },
        { role: "assistant", text: "Do you want to permanently delete both Forecast Me and Alta from Personal projects?" },
      ])

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to delete all Personal projects.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Delete all Personal projects.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: null,
              field: null,
              instruction: "Remove all personal project entries.",
              proposedText: "[]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Forecast Me")
    await page.getByLabel("Project subtitle").fill("Weather Web Application")
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").last().fill("Alta")
    await page.getByLabel("Project subtitle").last().fill("Content Management System")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Delete all personal projects.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-message-bubble").filter({
      hasText: "Do you want to permanently delete both Forecast Me and Alta from Personal projects?",
    })).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("yes")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Draft ready to delete all Personal projects.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("sends reject decision for conversational confirmations and clears pendingAction afterwards", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0
    let projectId = ""

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.conversationContext).toBeUndefined()

      if (requestCount === 1) {
        expect(payload.message).toBe("Delete Forecast Me.")
        expect(payload.pendingAction).toBeUndefined()
        expect(payload.userDecision).toBeUndefined()
        projectId = payload.resumeData.personalProjects[0].id

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "Do you want to permanently delete Forecast Me from Personal projects?",
          status: "clarification_needed",
          clarificationQuestion: "Do you want to permanently delete Forecast Me from Personal projects?",
          needsClarification: true,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: projectId,
            field: null,
            scope: "single_item",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      if (requestCount === 2) {
        expect(payload.message).toBe("cancel")
        expect(payload.pendingAction).toEqual({
          type: "delete",
          targetSection: "personalProjects",
          targetItemIds: [projectId],
        })
        expect(payload.userDecision).toBe("reject")

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "Canceled. I did not delete that project.",
          status: "blocked",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: null,
            itemId: null,
            field: null,
            scope: "unknown",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("Make my summary sharper.")
      expect(payload.pendingAction).toBeUndefined()
      expect(payload.userDecision).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I can help with your summary.",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "section",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Forecast Me")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Delete Forecast Me.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-message-bubble").filter({
      hasText: "Do you want to permanently delete Forecast Me from Personal projects?",
    })).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("cancel")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Canceled. I did not delete that project.")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)

    await page.getByRole("textbox", { name: "Message" }).fill("Make my summary sharper.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("I can help with your summary.")).toBeVisible()
    expect(requestCount).toBe(3)
  })

  test("persists pendingAction across reload before sending a confirmation decision", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0
    let certificateId = ""

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.message).toBe("Delete all certificates.")
        certificateId = payload.resumeData.certificates[0].id

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "Do you want to permanently delete all Certificates?",
          status: "clarification_needed",
          clarificationQuestion: "Do you want to permanently delete all Certificates?",
          needsClarification: true,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: "certificates",
            itemId: null,
            field: null,
            scope: "section",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("confirm")
      expect(payload.pendingAction).toEqual({
        type: "delete",
        targetSection: "certificates",
        targetItemIds: [certificateId],
      })
      expect(payload.userDecision).toBe("confirm")

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to clear Certificates.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "certificates",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Clear Certificates.",
          proposedChanges: [
            {
              section: "certificates",
              itemId: null,
              field: null,
              instruction: "Remove all certificates.",
              proposedText: "[]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Certificate" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Name").fill("Responsive Web Design")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Delete all certificates.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-message-bubble").filter({
      hasText: "Do you want to permanently delete all Certificates?",
    })).toBeVisible()

    await page.reload()
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("confirm")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Draft ready to clear Certificates.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("clears pendingAction when the next message is not a confirmation decision", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.message).toBe("Delete all personal projects.")

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "Do you want to permanently delete all Personal projects?",
          status: "clarification_needed",
          clarificationQuestion: "Do you want to permanently delete all Personal projects?",
          needsClarification: true,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: null,
            field: null,
            scope: "section",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("Update my summary instead.")
      expect(payload.pendingAction).toBeUndefined()
      expect(payload.userDecision).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I can help update your summary instead.",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "section",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Delete all personal projects.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-message-bubble").filter({
      hasText: "Do you want to permanently delete all Personal projects?",
    })).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Update my summary instead.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("I can help update your summary instead.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("renders friendly field labels while keeping conversation payloads raw", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.debugProvider).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()

      if (requestCount === 1) {
        expect(payload.message).toBe("Show me the schema labels cleanly.")
        expect(payload.conversation).toBeUndefined()
        expect(payload.activeDraft).toBeUndefined()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I can update personalDetails.summary, briefSummary, bulletSummary, knownLanguages, and devFramework.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalDetails",
            itemId: null,
            field: "summary",
            scope: "resume_wide",
          },
          draft: {
            summary: "Replace personalDetails.summary and devFramework references.",
            proposedChanges: [
              {
                section: "personalDetails",
                itemId: null,
                field: "summary",
                instruction: "Replace the summary with the reviewed draft.",
                proposedText: "A polished frontend developer summary.",
              },
            ],
          },
          warnings: ["Check defaultPhoneNumber and socialGithub before applying."],
        })
        return
      }

      expect(payload.message).toBe("Use that draft but shorter.")
      expect(payload.conversation).toEqual([
        { role: "user", text: "Show me the schema labels cleanly." },
        {
          role: "assistant",
          text: "I can update personalDetails.summary, briefSummary, bulletSummary, knownLanguages, and devFramework.",
        },
      ])
      expect(payload.activeDraft?.draft.summary).toBe("Replace personalDetails.summary and devFramework references.")

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I can revise that draft.",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Show me the schema labels cleanly.")
    await page.getByRole("button", { name: "Send message" }).click()

    const assistantBubble = page.locator(".chat-bubble").filter({
      hasText: "I can update About me, Description, Bullet points, Languages, and Skills.",
    })
    await expect(assistantBubble).toBeVisible()
    await expect(page.locator(".chat-bubble").filter({ hasText: "personalDetails.summary" })).toHaveCount(0)
    await expect(page.getByText("Check Phone number and GitHub before applying.")).toBeVisible()

    const reviewCard = page.getByText("Replace About me and Skills references.").locator("..")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("Personal details")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("About me")
    await expect(reviewCard).not.toContainText("Updating:")
    await expect(reviewCard).not.toContainText("personalDetails.summary")
    await expect(reviewCard).not.toContainText("devFramework")

    await page.getByRole("textbox", { name: "Message" }).fill("Use that draft but shorter.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("I can revise that draft.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("replaces active draft review content with centered loading during follow-up sends", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0
    let releaseSecondResponse: (() => void) | null = null

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      if (requestCount === 1) {
        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I drafted a summary update.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalDetails",
            itemId: null,
            field: "summary",
            scope: "resume_wide",
          },
          draft: {
            summary: "Rewrite the About me summary.",
            proposedChanges: [
              {
                section: "personalDetails",
                itemId: null,
                field: "summary",
                instruction: "Replace the summary with a concise draft.",
                proposedText: "Concise frontend developer summary.",
              },
            ],
          },
          warnings: [],
        })
        return
      }

      await new Promise<void>((resolve) => {
        releaseSecondResponse = resolve
      })

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I revised the draft.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: {
          summary: "Rewrite the About me summary with a shorter version.",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "summary",
              instruction: "Replace the summary with a shorter draft.",
              proposedText: "Short frontend developer summary.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-draft-review")).toContainText("Rewrite the About me summary.")
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Make it shorter.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard.getByTestId("chat-draft-loading")).toBeVisible()
    await expect(reviewCard).toContainText("Updating draft")
    await expect(reviewCard).not.toContainText("Rewrite the About me summary.")
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)

    releaseSecondResponse?.()
    await expect(page.getByText("I revised the draft.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("requires confirmation to clear local history", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Let’s tighten your project description.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Tighten this up.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Let’s tighten your project description.")).toBeVisible()

    await page.getByRole("button", { name: "Clear conversation" }).click()
    await expect(page.getByRole("heading", { name: "Clear conversation?" })).toBeVisible()
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByText("Let’s tighten your project description.")).toBeVisible()

    await page.getByRole("button", { name: "Clear conversation" }).click()
    await page.getByRole("button", { name: "Clear chat" }).click()
    await expect(page.getByText("Ask to add, edit, or remove content in one specific section at a time.")).toBeVisible()
  })

  test("reject keeps the draft local only and leaves resume data unchanged", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()
        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I drafted a stronger summary for review.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalDetails",
            itemId: null,
            field: "summary",
            scope: "resume_wide",
          },
          draft: {
            summary: "A clearer summary draft is ready.",
            proposedChanges: [
              {
                section: "personalDetails",
                itemId: null,
                field: "summary",
                instruction: "Replace the summary with the reviewed draft.",
                proposedText: "Product-minded frontend developer building polished resume tools.",
              },
            ],
          },
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("Improve my summary again.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "Improve my summary." },
        { role: "assistant", text: "I drafted a stronger summary for review." },
        {
          role: "assistant",
          text: "This draft is still not applied. Let me know if you want to add something or if you've changed your mind.",
        },
      ])
      expect(payload.conversationContext).toBeUndefined()
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Let’s try another summary draft.",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()

    const summaryInput = page.getByLabel("Summary")
    await summaryInput.fill("Original summary")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Reject" }).click()
    await expect(summaryInput).toHaveValue("Original summary")
    await expect(page.getByText("This draft is still not applied")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)

    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary again.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Let’s try another summary draft.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("accept applies the displayed draft locally without a second backend request", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a stronger summary for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: {
          summary: "A clearer summary draft is ready.",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "summary",
              instruction: "Replace the summary with the reviewed draft.",
              proposedText: "Product-minded frontend developer building polished resume tools.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()

    const summaryInput = page.getByLabel("Summary")
    await summaryInput.fill("Original summary")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()
    await expect(summaryInput).toHaveValue("Product-minded frontend developer building polished resume tools.")
    await expect(page.getByText("I drafted a stronger summary for review.")).toBeVisible()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByText("A clearer summary draft is ready.")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Message" })).toHaveAttribute("placeholder", "Please be gentle to your assistant.")
    expect(requestCount).toBe(1)

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("Improve my summary again.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "Improve my summary." },
        { role: "assistant", text: "I drafted a stronger summary for review." },
        {
          role: "assistant",
          text: "Done. I applied that update to your resume. What would you like to improve next?",
        },
      ])
      expect(payload.conversationContext).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Ready for another summary update.",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: null,
        warnings: [],
      })
    }, { times: 1 })

    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary again.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Ready for another summary update.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("auto-improved backend wording previews and applies without frontend quality flags", async ({ page }) => {
    const improvedSummary =
      "Frontend developer focused on building accessible, reliable user experiences with clear product impact."
    const exactSummary = "I build stuff with care."
    const improvedProjectDescription =
      "Portfolio website showcasing polished UI work, responsive layouts, and practical frontend delivery."
    const improvedWorkBullets = [
      "Built AI-assisted workflow tools that improved development consistency.",
      "Delivered responsive web interfaces that made key tasks easier for users.",
    ]
    const improvedCertificateDescription =
      "Completed foundational computer science coursework covering programming concepts, algorithms, and problem-solving fundamentals."
    const improvedAchievementDescription =
      "Recognized for sustained academic performance and consistent delivery of high-quality coursework."

    const responses = [
      {
        message: "Make my about me professional from: i make apps good.",
        reply: "Draft ready with a stronger About Me.",
        target: { section: "personalDetails", itemId: null, field: "summary", scope: "resume_wide" },
        draftSummary: "Improve the About Me summary.",
        proposedChanges: [
          {
            section: "personalDetails",
            itemId: null,
            field: "summary",
            instruction: "Replace rough summary wording with an ATS-friendly version.",
            proposedText: improvedSummary,
          },
        ],
      },
      {
        message: "Keep the exact wording: I build stuff with care.",
        reply: "Draft ready using the exact wording you provided.",
        target: { section: "personalDetails", itemId: null, field: "summary", scope: "resume_wide" },
        draftSummary: "Use the exact About Me wording.",
        proposedChanges: [
          {
            section: "personalDetails",
            itemId: null,
            field: "summary",
            instruction: "Replace summary while preserving the user's exact wording.",
            proposedText: exactSummary,
          },
        ],
      },
      {
        message: "Add a rough project called Atlas, it is portfolio, description is made portfolio site.",
        reply: "Draft ready to add an improved Atlas project.",
        target: { section: "personalProjects", itemId: null, field: null, scope: "section" },
        draftSummary: "Create a new Atlas project item.",
        proposedChanges: [
          {
            section: "personalProjects",
            itemId: null,
            field: null,
            instruction: "Add a new project item with improved description wording.",
            proposedText: JSON.stringify({
              projectName: "Atlas",
              projectSubtitle: "Portfolio Website",
              preview: "",
              briefSummary: improvedProjectDescription,
              bulletType: false,
              bulletSummary: [],
            }),
          },
        ],
      },
      {
        message: "Add work at Northstar Labs as Frontend Developer with rough bullets.",
        reply: "Draft ready to add improved work bullets.",
        target: { section: "workExperiences", itemId: null, field: null, scope: "section" },
        draftSummary: "Create a new Northstar Labs work experience.",
        proposedChanges: [
          {
            section: "workExperiences",
            itemId: null,
            field: null,
            instruction: "Add a work item with improved bullet content.",
            proposedText: JSON.stringify({
              companyName: "Northstar Labs",
              jobTitle: "Frontend Developer",
              briefSummary: "",
              startYear: "2025",
              endYear: "present",
              currentlyHired: true,
              bulletType: true,
              bulletSummary: improvedWorkBullets,
            }),
          },
        ],
      },
      {
        message: "Add CS50 certificate with description related to the title.",
        reply: "Draft ready to add an improved certificate description.",
        target: { section: "certificates", itemId: null, field: null, scope: "section" },
        draftSummary: "Create a new CS50 certificate item.",
        proposedChanges: [
          {
            section: "certificates",
            itemId: null,
            field: null,
            instruction: "Add a certificate item with an improved description.",
            proposedText: JSON.stringify({
              certificateName: "CS50x: Introduction to Computer Science",
              certificateIssuer: "HarvardX",
              yearIssued: "January 2025",
              certificateDescription: improvedCertificateDescription,
            }),
          },
        ],
      },
      {
        message: "Add academic excellence achievement with description related to the award.",
        reply: "Draft ready to add an improved achievement description.",
        target: { section: "achievements", itemId: null, field: null, scope: "section" },
        draftSummary: "Create a new Academic Excellence achievement item.",
        proposedChanges: [
          {
            section: "achievements",
            itemId: null,
            field: null,
            instruction: "Add an achievement item with an improved description.",
            proposedText: JSON.stringify({
              achievementName: "Academic Excellence",
              achievementIssuer: "Harvard",
              yearIssued: "November 2024",
              achievementDescription: improvedAchievementDescription,
            }),
          },
        ],
      },
    ] as const
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      const response = responses[requestCount]
      requestCount += 1
      const payload = route.request().postDataJSON() as Record<string, unknown>

      expect(payload.message).toBe(response.message)
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()
      expectNoAutoImproveRequestFields(payload)

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: response.reply,
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: response.target,
        draft: {
          summary: response.draftSummary,
          proposedChanges: response.proposedChanges,
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()

    const summaryInput = page.getByLabel("Summary")
    await summaryInput.fill("i make apps good")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill(responses[0].message)
    await page.getByRole("button", { name: "Send message" }).click()

    let reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText(improvedSummary)
    await expect(reviewCard).not.toContainText("i make apps good")
    await page.getByRole("button", { name: "Accept" }).click()
    await expect(summaryInput).toHaveValue(improvedSummary)

    await page.getByRole("textbox", { name: "Message" }).fill(responses[1].message)
    await page.getByRole("button", { name: "Send message" }).click()

    reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText(exactSummary)
    await page.getByRole("button", { name: "Accept" }).click()
    await expect(summaryInput).toHaveValue(exactSummary)

    await page.getByRole("textbox", { name: "Message" }).fill(responses[2].message)
    await page.getByRole("button", { name: "Send message" }).click()

    reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText(improvedProjectDescription)
    await expect(reviewCard).not.toContainText("made portfolio site")
    await page.getByRole("button", { name: "Accept" }).click()

    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Personal Project" }).click()
    await expect(page.getByRole("button", { name: "Atlas Portfolio Website" })).toBeVisible()
    await expect(page.getByLabel("Brief summary")).toHaveValue(improvedProjectDescription)

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill(responses[3].message)
    await page.getByRole("button", { name: "Send message" }).click()

    reviewCard = page.getByTestId("chat-draft-review")
    for (const bullet of improvedWorkBullets) {
      await expect(reviewCard).toContainText(bullet)
    }
    await expect(reviewCard).not.toContainText("rough bullets")
    await page.getByRole("button", { name: "Accept" }).click()

    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Work Experience" }).click()
    await expect(page.getByRole("button", { name: "Frontend Developer Northstar Labs" })).toBeVisible()
    await expect(page.getByLabel("Use bullet points")).toBeChecked()
    const bulletRows = page.getByTestId("bullet-row")
    await expect(bulletRows.first().getByRole("textbox")).toHaveValue(improvedWorkBullets[0])
    await expect(bulletRows.nth(1).getByRole("textbox")).toHaveValue(improvedWorkBullets[1])

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill(responses[4].message)
    await page.getByRole("button", { name: "Send message" }).click()

    reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText(improvedCertificateDescription)
    await expect(reviewCard).not.toContainText("CS50x: Introduction to Computer Science coursework (HarvardX) in January 2025.")
    await page.getByRole("button", { name: "Accept" }).click()

    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Certificate" }).click()
    await expect(page.getByRole("button", { name: "CS50x: Introduction to Computer Science HarvardX" })).toBeVisible()
    await expect(page.getByLabel("Description")).toHaveValue(improvedCertificateDescription)

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill(responses[5].message)
    await page.getByRole("button", { name: "Send message" }).click()

    reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText(improvedAchievementDescription)
    await expect(reviewCard).not.toContainText("Academic Excellence Harvard November 2024")
    await page.getByRole("button", { name: "Accept" }).click()

    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Achievement" }).click()
    await expect(page.getByRole("button", { name: "Academic Excellence" })).toBeVisible()
    await expect(page.getByLabel("Description")).toHaveValue(improvedAchievementDescription)
    expect(requestCount).toBe(responses.length)
  })

  test("accepted coreSkills drafts do not anchor the next unrelated Kaizer bullet request", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    let requestCount = 0
    let kaizerId = ""

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON() as Record<string, unknown>

      if (requestCount === 1) {
        expect(payload.message).toBe("Create a Testing core skill group.")
        expectNoActiveBoundaryState(payload)
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I drafted a new Testing core skill group for review.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "coreSkills",
            itemId: null,
            field: null,
            scope: "section",
          },
          draft: {
            summary: "Create a new Testing core skill group.",
            proposedChanges: [
              {
                section: "coreSkills",
                itemId: null,
                field: null,
                instruction: "Create the Testing core skill group with the provided tools.",
                proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\"]}",
              },
            ],
          },
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("I want to add Kaizer a bullet point that it uses Codex for implementation and development")
      expectNoActiveBoundaryState(payload)
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "Create a Testing core skill group." },
        { role: "assistant", text: "I drafted a new Testing core skill group for review." },
        { role: "assistant", text: "Done. I applied that update to your resume. What would you like to improve next?" },
      ])
      expect(Array.isArray(payload.resumeData.personalProjects)).toBe(true)
      expect(payload.resumeData.personalProjects).toHaveLength(1)
      kaizerId = (payload.resumeData.personalProjects as Array<{ id: string; projectName: string }>)[0].id
      expect((payload.resumeData.personalProjects as Array<{ projectName: string }>)[0].projectName).toBe("Kaizer")

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a Kaizer bullet for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: kaizerId,
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: {
          summary: "Add Codex usage bullet to Kaizer project.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: kaizerId,
              field: "bulletSummary",
              instruction: "Add the new Codex-related bullet to Kaizer.",
              proposedText: "Used Codex to support implementation and development workflows.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Kaizer")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Create a Testing core skill group.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)

    await page.getByRole("textbox", { name: "Message" }).fill("I want to add Kaizer a bullet point that it uses Codex for implementation and development")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText("Add Codex usage bullet to Kaizer project.")
    await expect(reviewCard).toContainText("Used Codex to support implementation and development workflows.")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("Personal projects")
    expect(requestCount).toBe(2)
  })

  test("accepted project drafts do not reuse stale active draft state for the next new-project request", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON() as Record<string, unknown>

      if (requestCount === 1) {
        expect(payload.message).toBe("I want to add a new project.")
        expectNoActiveBoundaryState(payload)
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "grounded_suggestion",
          reply: "Draft ready to add a new Atlas project.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: null,
            field: null,
            scope: "section",
          },
          draft: {
            summary: "Create a new Atlas project item.",
            proposedChanges: [
              {
                section: "personalProjects",
                itemId: null,
                field: null,
                instruction: "Add the new Atlas project.",
                proposedText: "{\"projectName\":\"Atlas\",\"projectSubtitle\":\"Portfolio Website\",\"preview\":\"\",\"briefSummary\":\"Portfolio site for selected frontend work.\",\"bulletType\":false,\"bulletSummary\":[]}",
              },
            ],
          },
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("I want to add another new project named Nova.")
      expectNoActiveBoundaryState(payload)
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "I want to add a new project." },
        { role: "assistant", text: "Draft ready to add a new Atlas project." },
        { role: "assistant", text: "Done. I applied that update to your resume. What would you like to improve next?" },
      ])
      expect(Array.isArray(payload.resumeData.personalProjects)).toBe(true)
      expect(payload.resumeData.personalProjects).toHaveLength(1)
      expect((payload.resumeData.personalProjects as Array<{ projectName: string }>)[0].projectName).toBe("Atlas")

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to add a new Nova project.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Nova project item.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: null,
              field: null,
              instruction: "Add the new Nova project.",
              proposedText: "{\"projectName\":\"Nova\",\"projectSubtitle\":\"Weather App\",\"preview\":\"\",\"briefSummary\":\"Weather app for daily forecasts.\",\"bulletType\":false,\"bulletSummary\":[]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to add a new project.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("I want to add another new project named Nova.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText("Create a new Nova project item.")
    await expect(reviewCard).toContainText("Nova")
    await expect(reviewCard).not.toContainText("Atlas")
    expect(requestCount).toBe(2)
  })

  test("rejected drafts do not send stale active state on the next unrelated request", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON() as Record<string, unknown>

      if (requestCount === 1) {
        expect(payload.message).toBe("Improve my summary.")
        expectNoActiveBoundaryState(payload)
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I drafted a stronger summary for review.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalDetails",
            itemId: null,
            field: "summary",
            scope: "resume_wide",
          },
          draft: {
            summary: "A clearer summary draft is ready.",
            proposedChanges: [
              {
                section: "personalDetails",
                itemId: null,
                field: "summary",
                instruction: "Replace the summary with the reviewed draft.",
                proposedText: "Product-minded frontend developer building polished resume tools.",
              },
            ],
          },
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("Add a Testing core skill group.")
      expectNoActiveBoundaryState(payload)
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "Improve my summary." },
        { role: "assistant", text: "I drafted a stronger summary for review." },
        { role: "assistant", text: "This draft is still not applied. Let me know if you want to add something or if you've changed your mind." },
      ])

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to create a new Testing core skill group.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Testing core skill group.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Create the Testing core skill group with the provided tools.",
              proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\"]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()
    await page.getByLabel("Summary").fill("Original summary")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Reject" }).click()
    await expect(page.getByText("This draft is still not applied")).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Add a Testing core skill group.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText("Create a new Testing core skill group.")
    await expect(reviewCard).toContainText("Jest, Playwright")
    expect(requestCount).toBe(2)
  })

  test("accept applies empty-string drafts by clearing personal details summary", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("delete about me")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to delete your About Me (summary) from the resume.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "section",
        },
        draft: {
          summary: "Delete About Me/summary",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "summary",
              instruction: "Clear the About Me/summary field",
              proposedText: "",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()

    const summaryInput = page.getByLabel("Summary")
    await summaryInput.fill("Junior software developer focused on delivering clean, maintainable code.")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("delete about me")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(summaryInput).toHaveValue("")
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    expect(requestCount).toBe(1)
  })

  test("accept applies boolean field drafts like work-experience bulletType locally", async ({ page }) => {
    let requestCount = 0
    let workExperienceId = ""

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      expect(Array.isArray(payload.resumeData.workExperiences)).toBe(true)
      expect(payload.resumeData.workExperiences).toHaveLength(1)

      workExperienceId = payload.resumeData.workExperiences[0].id
      expect(workExperienceId).toBeTruthy()
      expect(payload.resumeData.workExperiences[0].jobTitle).toBe("Software Engineer")
      expect(payload.resumeData.workExperiences[0].companyName).toBe("TerniLabs")

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to enable bullet points for the selected work experience.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "workExperiences",
          itemId: workExperienceId,
          field: "bulletType",
          scope: "single_item",
        },
        draft: {
          summary: "Enable bullet points for the work experience item by turning on Use bullet points.",
          proposedChanges: [
            {
              section: "workExperiences",
              itemId: workExperienceId,
              field: "bulletType",
              instruction: "Turn on bullet points for this work experience item.",
              proposedText: "true",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Work Experience" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Position").fill("Software Engineer")
    await page.getByLabel("Company").fill("TerniLabs")
    await page.getByLabel("Brief summary").fill("Built internal product features.")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Enable bullet points for this experience.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)
    await expect(page.getByLabel("Use bullet points")).toBeChecked()
    await expect(page.getByTestId("bullet-list-panel")).toBeVisible()
    await expect(page.getByLabel("Brief summary")).toHaveCount(0)
    expect(requestCount).toBe(1)
  })

  test("accept applies remove-item drafts by deleting the targeted personal project locally", async ({ page }) => {
    let requestCount = 0
    let codexProjectId = ""
    let forecastProjectId = ""

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      expect(Array.isArray(payload.resumeData.personalProjects)).toBe(true)
      expect(payload.resumeData.personalProjects).toHaveLength(2)

      codexProjectId =
        payload.resumeData.personalProjects.find((item: { projectName: string }) => item.projectName === "Codex Skill")?.id ?? ""
      forecastProjectId =
        payload.resumeData.personalProjects.find((item: { projectName: string }) => item.projectName === "Forecast Me")?.id ?? ""

      expect(codexProjectId).toBeTruthy()
      expect(forecastProjectId).toBeTruthy()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to remove Codex Skill project from Personal projects.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: codexProjectId,
          field: null,
          scope: "single_item",
        },
        draft: {
          summary: "Remove Codex Skill project from Personal projects.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: codexProjectId,
              field: null,
              instruction: "Remove the Codex Skill personal project item.",
              proposedText: null,
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Codex Skill")
    await page.getByLabel("Project subtitle").fill("Agent skill")

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").last().fill("Forecast Me")
    await page.getByLabel("Project subtitle").last().fill("Weather Web Application")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Remove Codex Skill.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Codex Skill Agent skill" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Forecast Me Weather Web Application" })).toBeVisible()
    expect(requestCount).toBe(1)
  })

  test("accept applies remove-item drafts globally when the backend sends an empty-array remove payload", async ({ page }) => {
    let requestCount = 0
    let coreSkillId = ""

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      expect(Array.isArray(payload.resumeData.coreSkills)).toBe(true)
      expect(payload.resumeData.coreSkills).toHaveLength(1)

      coreSkillId =
        payload.resumeData.coreSkills.find((item: { devLanguage: string }) => item.devLanguage === "Codex")?.id ?? ""

      expect(coreSkillId).toBeTruthy()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to remove Codex from Core Skills.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: coreSkillId,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Remove Codex core skill item.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: coreSkillId,
              field: null,
              instruction: "Remove the Codex core skill item from the Core Skills array.",
              proposedText: "[]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Skill" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Language").fill("Codex")
    await page.keyboard.press(",")
    await expect(page.getByRole("button", { name: "Codex" })).toBeVisible()

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to remove Codex in Core skill")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Codex" })).toHaveCount(0)
    expect(requestCount).toBe(1)
  })

  test("clarification-needed responses render the exact question in dedicated mode without draft actions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I can update briefSummary or bulletSummary once you confirm the target.",
        status: "clarification_needed",
        clarificationQuestion: "Which Kaizer project should I update? You can also tell me whether to edit briefSummary or bulletSummary.",
        needsClarification: true,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: "kaizer-project",
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Add something in Kaizer related to Codex usage.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.locator(".chat-bubble").filter({ hasText: "I can update Description or Bullet points once you confirm the target." })).toBeVisible()
    await expect(page.locator(".chat-bubble").filter({ hasText: "briefSummary" })).toHaveCount(0)
    await expect(page.getByText("Need details before I can continue")).toBeVisible()
    await expect(page.getByText("Which Kaizer project should I update? You can also tell me whether to edit Description or Bullet points.")).toBeVisible()
    await expect(page.getByText("Which Kaizer project should I update? You can also tell me whether to edit briefSummary or bulletSummary.")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Message" })).toHaveAttribute("placeholder", "Answer the assistant's question to continue.")
  })

  test("clarification follow-up requests include recent conversation memory", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.message).toBe("Add something in Kaizer related to Codex usage.")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()
        expect(payload.debugProvider).toBeUndefined()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "grounded_suggestion",
          reply: "I can update briefSummary or bulletSummary once you confirm the target.",
          status: "clarification_needed",
          clarificationQuestion: "Which Kaizer project should I update? You can also tell me whether to edit briefSummary or bulletSummary.",
          needsClarification: true,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: "kaizer-project",
            field: "bulletSummary",
            scope: "single_item",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("Update the bullet points.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "Add something in Kaizer related to Codex usage." },
        { role: "assistant", text: "I can update briefSummary or bulletSummary once you confirm the target." },
      ])
      expect(payload.conversationContext).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I can help update those bullet points.",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: "kaizer-project",
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Add something in Kaizer related to Codex usage.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("textbox", { name: "Message" }).fill("Update the bullet points.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByText("I can help update those bullet points.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("core-skills create clarification persists recent conversation memory across reload", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.message).toBe("Add something in Core skills for Testing.")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "grounded_suggestion",
          reply: "I do not see a Testing core skill group yet.",
          status: "clarification_needed",
          clarificationQuestion: "I do not see a Testing core skill group yet. Do you want to create a new Testing group, or add the skill under an existing group like Database or Tools?",
          needsClarification: true,
          needsConfirmation: false,
          readyToApply: false,
          target: {
            section: "coreSkills",
            itemId: null,
            field: null,
            scope: "section",
          },
          draft: null,
          warnings: [],
        })
        return
      }

      expect(payload.message).toBe("Yes create")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toEqual([
        { role: "user", text: "Add something in Core skills for Testing." },
        { role: "assistant", text: "I do not see a Testing core skill group yet." },
      ])
      expect(payload.conversationContext).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "What skills should I include in the new Testing core skill group?",
        status: "blocked",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Add something in Core skills for Testing.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("I do not see a Testing core skill group yet. Do you want to create a new Testing group, or add the skill under an existing group like Database or Tools?")).toBeVisible()

    await page.reload()
    await openChatAssistant(page)
    await expect(page.getByText("I do not see a Testing core skill group yet. Do you want to create a new Testing group, or add the skill under an existing group like Database or Tools?")).toBeVisible()
    await expect(page.getByRole("textbox", { name: "Message" })).toHaveAttribute("placeholder", "Answer the assistant's question to continue.")

    await page.getByRole("textbox", { name: "Message" }).fill("Yes create")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByText("What skills should I include in the new Testing core skill group?")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("accept shows an inline error when the local draft cannot be applied safely", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a stronger summary for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "summary",
          scope: "resume_wide",
        },
        draft: {
          summary: "A clearer summary draft is ready.",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "unsupportedField",
              instruction: "Replace the unsupported field with the reviewed draft.",
              proposedText: "Product-minded frontend developer building polished resume tools.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByTestId("chat-inline-error")).toContainText("unsupported field")
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toHaveCount(0)
    expect(requestCount).toBe(1)
  })

  test("bulletSummary draft previews show only the new bullet instead of raw serialized arrays", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted an extra Kaizer bullet for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: "kaizer-project",
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: {
          summary: "Add Codex usage bullet to Kaizer project.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: "kaizer-project",
              field: "bulletSummary",
              instruction: "Add the new Codex-related bullet to Kaizer.",
              proposedText: "[\"Built a cross-platform desktop music player integrating multi-provider search, streaming, downloads, and local persistence.\",\"Implemented Electron IPC workflows, SQLite-backed state management, and fallback logic for offline playback and provider reliability.\",\"Used Codex to support development, debugging, and iteration during Kaizer's build.\"]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Add a Codex bullet to Kaizer.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByText("Add Codex usage bullet to Kaizer project.").locator("..")

    await expect(page.getByText("Used Codex to support development, debugging, and iteration during Kaizer's build.")).toBeVisible()
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("Personal projects")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("Bullet points")
    await expect(reviewCard).not.toContainText("Updating:")
    await expect(reviewCard).not.toContainText("personalProjects")
    await expect(reviewCard).not.toContainText("bulletSummary")
    await expect(reviewCard).not.toContainText("[\"Built a cross-platform desktop music player")
  })

  test("coreSkills draft previews show a readable group and skills instead of raw JSON", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a new core skill group for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Testing core skill group.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Create the Testing core skill group with the provided tools.",
              proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\"]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Create a Testing core skill group.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByText("Create a new Testing core skill group.").locator("..")

    await expect(reviewCard).toContainText("New group")
    await expect(reviewCard).toContainText("Testing")
    await expect(reviewCard).toContainText("Skills")
    await expect(reviewCard).toContainText("Jest, Playwright")
    await expect(reviewCard).not.toContainText("New group:")
    await expect(reviewCard).not.toContainText("Skills:")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("Core skills")
    await expect(reviewCard).not.toContainText("Updating:")
    await expect(reviewCard).not.toContainText("{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\"]}")
    await expect(reviewCard).not.toContainText("devLanguage")
    await expect(reviewCard).not.toContainText("devFramework")
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible()
  })

  test("multi-item coreSkills create drafts render every returned group, not just the first one", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I drafted four new core skill groups for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create four new core skill items for development specialties.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Add a new core skill item named Frontend with common frontend frameworks.",
              proposedText: "{\"devLanguage\":\"Frontend\",\"devFramework\":[\"React\",\"Vue\",\"Angular\"]}",
            },
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Add a new core skill item named Backend with common backend frameworks.",
              proposedText: "{\"devLanguage\":\"Backend\",\"devFramework\":[\"Node.js\",\"Express\",\"Django\"]}",
            },
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Add a new core skill item named Testing with common testing tools.",
              proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\",\"Mocha\"]}",
            },
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Add a new core skill item named Database with common database technologies.",
              proposedText: "{\"devLanguage\":\"Database\",\"devFramework\":[\"PostgreSQL\",\"MySQL\",\"MongoDB\"]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Create four new core skill groups.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText("New group")
    await expect(reviewCard).toContainText("Frontend")
    await expect(reviewCard).toContainText("React, Vue, Angular")
    await expect(reviewCard).toContainText("Backend")
    await expect(reviewCard).toContainText("Node.js, Express, Django")
    await expect(reviewCard).toContainText("Testing")
    await expect(reviewCard).toContainText("Jest, Playwright, Mocha")
    await expect(reviewCard).toContainText("Database")
    await expect(reviewCard).toContainText("PostgreSQL, MySQL, MongoDB")
    await expect(reviewCard).not.toContainText("New group:")
    await expect(reviewCard).not.toContainText("Skills:")
    await expect(reviewCard).not.toContainText("{\"devLanguage\":\"Frontend\"")
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(1)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(1)
  })

  test("coreSkills update drafts show each existing group and proposed frameworks", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(Array.isArray(payload.resumeData.coreSkills)).toBe(true)

      const coreSkills = payload.resumeData.coreSkills as Array<{ id: string; devLanguage: string }>
      const frontend = coreSkills.find((item) => item.devLanguage === "Frontend")
      const backend = coreSkills.find((item) => item.devLanguage === "Backend")
      const tools = coreSkills.find((item) => item.devLanguage === "Tools")

      expect(frontend?.id).toBeTruthy()
      expect(backend?.id).toBeTruthy()
      expect(tools?.id).toBeTruthy()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to update your Core Skills.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: frontend?.id ?? null,
          field: "devFramework",
          scope: "section",
        },
        draft: {
          summary: "Update Core Skills framework lists across Frontend, Backend and Tools.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: frontend?.id ?? null,
              field: "devFramework",
              instruction: "Replace frontend frameworks with the reviewed list.",
              proposedText: "[\"React\",\"Next.js\",\"Tailwind CSS\"]",
            },
            {
              section: "coreSkills",
              itemId: backend?.id ?? null,
              field: "devFramework",
              instruction: "Replace backend frameworks with the reviewed list.",
              proposedText: "[\"Node.js\",\"Express\",\"PostgreSQL\"]",
            },
            {
              section: "coreSkills",
              itemId: tools?.id ?? null,
              field: "devFramework",
              instruction: "Replace tools with the reviewed list.",
              proposedText: "[\"Git\",\"Docker\",\"Vite\"]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Skill" }).click()

    for (const groupName of ["Frontend", "Backend", "Tools"]) {
      await page.getByRole("button", { name: "Add an item" }).click()
      await page.getByLabel("Language").fill(groupName)
      await page.keyboard.press(",")
      await expect(page.getByRole("button", { name: groupName })).toBeVisible()
    }

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to update my core skills.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByText("Update Core Skills framework lists across Frontend, Backend and Tools.").locator("..")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs").filter({ hasText: "Frontend" })).toContainText("Skills")
    await expect(reviewCard).not.toContainText("Updating:")
    await expect(reviewCard).toContainText("Frontend")
    await expect(reviewCard).toContainText("React, Next.js, Tailwind CSS")
    await expect(reviewCard).toContainText("Backend")
    await expect(reviewCard).toContainText("Node.js, Express, PostgreSQL")
    await expect(reviewCard).toContainText("Tools")
    await expect(reviewCard).toContainText("Git, Docker, Vite")
    await expect(reviewCard).not.toContainText("[\"React\"")
    await expect(reviewCard).not.toContainText("devFramework")

    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: /Frontend\s+React, Next\.js, Tailwind CSS/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /Backend\s+Node\.js, Express, PostgreSQL/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /Tools\s+Git, Docker, Vite/ })).toBeVisible()
    expect(requestCount).toBe(1)
  })

  test("structured create-item drafts render friendly field previews instead of raw JSON", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const draftResponses = [
      {
        message: "Please draft a starter project item.",
        reply: "I drafted a starter project item for review.",
        section: "personalProjects",
        summary: "Create a starter project item.",
        proposedText: JSON.stringify({
          projectName: "",
          projectSubtitle: "",
          preview: "",
          briefSummary: "",
          bulletType: false,
          bulletSummary: [],
        }),
        expectedRows: [
          "Project name",
          "Project subtitle",
          "Project link",
          "Description",
          "Use bullet points",
          "Bullet points",
          "Not set yet",
          "No",
          "None yet",
        ],
        rawText: "{\"projectName\"",
        rawKey: "projectName",
      },
      {
        message: "Please draft a starter work experience.",
        reply: "I drafted a starter work experience for review.",
        section: "workExperiences",
        summary: "Create a starter work experience.",
        proposedText: JSON.stringify({
          companyName: "",
          jobTitle: "",
          briefSummary: "",
          startYear: "",
          endYear: "",
          currentlyHired: false,
          bulletType: false,
          bulletSummary: [],
        }),
        expectedRows: [
          "Company name",
          "Job title",
          "Description",
          "Start date",
          "End date",
          "Currently employed",
          "Use bullet points",
          "Bullet points",
          "Not set yet",
          "No",
          "None yet",
        ],
        rawText: "{\"companyName\"",
        rawKey: "companyName",
      },
      {
        message: "Please draft a starter certificate.",
        reply: "I drafted a starter certificate for review.",
        section: "certificates",
        summary: "Create a starter certificate.",
        proposedText: JSON.stringify({
          certificateName: "",
          certificateIssuer: "",
          yearIssued: "",
          certificateDescription: "",
        }),
        expectedRows: [
          "Certificate title",
          "Issuer",
          "Year issued",
          "Certificate description",
          "Not set yet",
        ],
        rawText: "{\"certificateName\"",
        rawKey: "certificateName",
      },
      {
        message: "Please draft a starter achievement.",
        reply: "I drafted a starter achievement for review.",
        section: "achievements",
        summary: "Create a starter achievement.",
        proposedText: JSON.stringify({
          achievementName: "",
          achievementIssuer: "",
          yearIssued: "",
          achievementDescription: "",
        }),
        expectedRows: [
          "Achievement title",
          "Issuer",
          "Year issued",
          "Achievement description",
          "Not set yet",
        ],
        rawText: "{\"achievementName\"",
        rawKey: "achievementName",
      },
    ] as const
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      const draftResponse = draftResponses[requestCount]
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe(draftResponse.message)
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: draftResponse.reply,
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: draftResponse.section,
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: draftResponse.summary,
          proposedChanges: [
            {
              section: draftResponse.section,
              itemId: null,
              field: null,
              instruction: "Create a new item from the reviewed structured draft.",
              proposedText: draftResponse.proposedText,
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    for (const draftResponse of draftResponses) {
      await page.getByRole("textbox", { name: "Message" }).fill(draftResponse.message)
      await page.getByRole("button", { name: "Send message" }).click()

      const reviewCard = page.getByText(draftResponse.summary).locator("..")
      for (const row of draftResponse.expectedRows) {
        await expect(reviewCard).toContainText(row)
      }
      await expect(reviewCard).not.toContainText(draftResponse.rawText)
      await expect(reviewCard).not.toContainText(draftResponse.rawKey)
      await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Reject" })).toBeVisible()

      await page.getByRole("button", { name: "Reject" }).click()
    }

    expect(requestCount).toBe(draftResponses.length)
  })

  test("multi-item structured create drafts render one friendly preview block per proposed change", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I drafted two certificate items for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "certificates",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create two certificate items.",
          proposedChanges: [
            {
              section: "certificates",
              itemId: null,
              field: null,
              instruction: "Create the AWS certificate item.",
              proposedText:
                "{\"certificateName\":\"AWS Cloud Practitioner\",\"certificateIssuer\":\"Amazon Web Services\",\"yearIssued\":\"2024\",\"certificateDescription\":\"Foundational cloud certification.\"}",
            },
            {
              section: "certificates",
              itemId: null,
              field: null,
              instruction: "Create the Google certificate item.",
              proposedText:
                "{\"certificateName\":\"Google UX Design\",\"certificateIssuer\":\"Google\",\"yearIssued\":\"2023\",\"certificateDescription\":\"User experience design coursework.\"}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Draft two certificates.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText("Certificate title")
    await expect(reviewCard).toContainText("AWS Cloud Practitioner")
    await expect(reviewCard).toContainText("Issuer")
    await expect(reviewCard).toContainText("Amazon Web Services")
    await expect(reviewCard).toContainText("Year issued")
    await expect(reviewCard).toContainText("2024")
    await expect(reviewCard).toContainText("Certificate description")
    await expect(reviewCard).toContainText("Foundational cloud certification.")
    await expect(reviewCard).toContainText("Google UX Design")
    await expect(reviewCard).toContainText("Google")
    await expect(reviewCard).toContainText("2023")
    await expect(reviewCard).toContainText("User experience design coursework.")
    await expect(reviewCard).not.toContainText("Certificate title:")
    await expect(reviewCard).not.toContainText("{\"certificateName\":\"AWS Cloud Practitioner\"")
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(1)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(1)

    await page.getByRole("button", { name: "Reject" }).click()
  })

  test("multi-item plain-text field drafts render every proposed text entry", async ({ page }) => {
    let kaizerId = ""
    let novaId = ""

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      const payload = route.request().postDataJSON()

      kaizerId = payload.resumeData.personalProjects.find((item: { projectName: string }) => item.projectName === "Kaizer")?.id ?? ""
      novaId = payload.resumeData.personalProjects.find((item: { projectName: string }) => item.projectName === "Nova")?.id ?? ""

      expect(kaizerId).toBeTruthy()
      expect(novaId).toBeTruthy()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted clearer descriptions for both projects.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: kaizerId,
          field: "briefSummary",
          scope: "section",
        },
        draft: {
          summary: "Refresh both project descriptions.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: kaizerId,
              field: "briefSummary",
              instruction: "Rewrite the Kaizer description.",
              proposedText: "Desktop music platform focused on multi-provider playback and offline reliability.",
            },
            {
              section: "personalProjects",
              itemId: novaId,
              field: "briefSummary",
              instruction: "Rewrite the Nova description.",
              proposedText: "Clean weather experience built around responsive forecasts and practical daily planning.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Kaizer")

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").last().fill("Nova")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Refresh both project descriptions.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs").filter({ hasText: "Kaizer" })).toContainText("Description")
    await expect(reviewCard).toContainText("Desktop music platform focused on multi-provider playback and offline reliability.")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs").filter({ hasText: "Nova" })).toContainText("Description")
    await expect(reviewCard).toContainText("Clean weather experience built around responsive forecasts and practical daily planning.")
    await expect(reviewCard).not.toContainText("Updating:")
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(1)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(1)
  })

  test("accept applies a personalProjects create draft by adding a new local project item", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("I want to add a new project.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to add a new Personal Project item with the provided details.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Personal Project item with the provided details.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: null,
              field: null,
              instruction: "Add a new personal project item with the full item shape (projectName, projectSubtitle, preview, briefSummary, bulletSummary, bulletType).",
              proposedText:
                "{\"projectName\":\"Codex Skill\",\"projectSubtitle\":\"Agent skill\",\"preview\":\"No link\",\"briefSummary\":\"This project would help the user have coding agents to give best practices.\",\"bulletType\":false,\"bulletSummary\":[]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()
    await expect(page.getByText("Untitled project")).toHaveCount(0)

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to add a new project.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Codex Skill Agent skill" })).toBeVisible()
    await expect(page.getByLabel("Project name")).toHaveValue("Codex Skill")
    await expect(page.getByLabel("Project subtitle")).toHaveValue("Agent skill")
    await expect(page.getByLabel("Preview link (optional)")).toHaveValue("No link")
    await expect(page.getByLabel("Brief summary")).toHaveValue(
      "This project would help the user have coding agents to give best practices.",
    )
    await expect(page.getByLabel("Use bullet points")).not.toBeChecked()
    expect(requestCount).toBe(1)
  })

  test("accept applies a workExperiences create draft by adding a new local work item", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("I want to add my experience.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to update the bullets for the TerniLabs Software Engineer entry starting November 2025.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "workExperiences",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Update bullets for TerniLabs Software Engineer entry starting November 2025.",
          proposedChanges: [
            {
              section: "workExperiences",
              itemId: null,
              field: null,
              instruction: "Replace the existing bulletSummary items with improved, achievement-focused bullets.",
              proposedText:
                "{\"companyName\":\"TerniLabs\",\"jobTitle\":\"Software Engineer\",\"briefSummary\":\"\",\"startYear\":\"November 2025\",\"endYear\":\"present\",\"currentlyHired\":true,\"bulletType\":false,\"bulletSummary\":[\"Developed AI-powered software components.\",\"Built responsive web applications to improve user experience and accessibility.\",\"Collaborated with cross-functional teams to enable data-driven decision making and accelerate delivery\"]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Work Experience" }).click()
    await expect(page.getByText("Untitled work experience")).toHaveCount(0)

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to add my experience.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Software Engineer TerniLabs" })).toBeVisible()
    await expect(page.getByLabel("Position")).toHaveValue("Software Engineer")
    await expect(page.getByLabel("Company")).toHaveValue("TerniLabs")
    await expect(page.getByLabel("Year started")).toHaveValue("November 2025")
    await expect(page.getByLabel("Present")).toBeChecked()
    await expect(page.getByLabel("Use bullet points")).not.toBeChecked()
    expect(requestCount).toBe(1)
  })

  test("accept applies a certificates create draft by adding a new local certificate item", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("I want to add a certificate.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to add a new certificate item with the provided details.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "certificates",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new certificate item with the provided details.",
          proposedChanges: [
            {
              section: "certificates",
              itemId: null,
              field: null,
              instruction: "Add a new certificate item with the provided details.",
              proposedText:
                "{\"certificateName\":\"Responsive Web Design\",\"certificateIssuer\":\"freeCodeCamp\",\"yearIssued\":\"September 2025\",\"certificateDescription\":\"Completed coursework in HTML and CSS\"}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Certificate" }).click()

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to add a certificate.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Responsive Web Design freeCodeCamp" })).toBeVisible()
    await expect(page.getByLabel("Name")).toHaveValue("Responsive Web Design")
    await expect(page.getByLabel("Institution")).toHaveValue("freeCodeCamp")
    await expect(page.getByLabel("Year issued")).toHaveValue("September 2025")
    await expect(page.getByLabel("Description")).toHaveValue("Completed coursework in HTML and CSS")
    expect(requestCount).toBe(1)
  })

  test("certificate drafts with escaped JSON and numeric year preview cleanly and apply locally", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("Add my CS50x certificate.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to add a new certificate entry for CS50x: Introduction to Computer Science.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "certificates",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new certificate item for CS50x: Introduction to Computer Science.",
          proposedChanges: [
            {
              section: "certificates",
              itemId: null,
              field: null,
              instruction: "Add a new certificate item with the provided details.",
              proposedText:
                "{\\\"certificateName\\\":\\\"CS50x: Introduction to Computer Science\\\",\\\"certificateIssuer\\\":\\\"HarvardX\\\",\\\"yearIssued\\\":2025,\\\"certificateDescription\\\":\\\"Completed CS50x: Introduction to Computer Science coursework (HarvardX) in January 2025.\\\"}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Add my CS50x certificate.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByTestId("chat-draft-review")
    await expect(reviewCard).toContainText("Certificate title")
    await expect(reviewCard).toContainText("CS50x: Introduction to Computer Science")
    await expect(reviewCard).toContainText("Issuer")
    await expect(reviewCard).toContainText("HarvardX")
    await expect(reviewCard).toContainText("Year issued")
    await expect(reviewCard).toContainText("2025")
    await expect(reviewCard).toContainText("Certificate description")
    await expect(reviewCard).toContainText("Completed CS50x: Introduction to Computer Science coursework (HarvardX) in January 2025.")
    await expect(reviewCard.getByTestId("chat-draft-breadcrumbs")).toContainText("Certificates")
    await expect(reviewCard).not.toContainText("Updating:")
    await expect(reviewCard).not.toContainText("Certificate title:")
    await expect(reviewCard).not.toContainText("{\"certificateName\"")
    await expect(reviewCard).not.toContainText("certificateIssuer")

    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Certificate" })).toBeVisible()
    await page.getByRole("button", { name: "Certificate" }).click()
    await expect(page.getByRole("button", { name: "CS50x: Introduction to Computer Science HarvardX" })).toBeVisible()
    await expect(page.getByLabel("Name")).toHaveValue("CS50x: Introduction to Computer Science")
    await expect(page.getByLabel("Institution")).toHaveValue("HarvardX")
    await expect(page.getByLabel("Year issued")).toHaveValue("2025")
    await expect(page.getByLabel("Description")).toHaveValue("Completed CS50x: Introduction to Computer Science coursework (HarvardX) in January 2025.")
    expect(requestCount).toBe(1)
  })

  test("accept applies an achievements create draft by adding a new local achievement item", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("I want to add an achievement.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to add a new achievement item with the provided details.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "achievements",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new achievement item with the provided details.",
          proposedChanges: [
            {
              section: "achievements",
              itemId: null,
              field: null,
              instruction: "Add a new achievement item with the provided details.",
              proposedText:
                "{\"achievementName\":\"Academic Excellence Award\",\"achievementIssuer\":\"Maritime Studies\",\"yearIssued\":\"October 2021\",\"achievementDescription\":\"Recognized for outstanding scholastic performance.\"}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Achievement" }).click()

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to add an achievement.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Academic Excellence Award Maritime Studies" })).toBeVisible()
    await expect(page.getByLabel("Name")).toHaveValue("Academic Excellence Award")
    await expect(page.getByLabel("Institution")).toHaveValue("Maritime Studies")
    await expect(page.getByLabel("Year issued")).toHaveValue("October 2021")
    await expect(page.getByLabel("Description")).toHaveValue("Recognized for outstanding scholastic performance.")
    expect(requestCount).toBe(1)
  })

  test("accept applies section-clear drafts by deleting every item in an array-backed section", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("I want to remove everything in Certificates.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()
      expect(payload.resumeData.certificates).toHaveLength(2)

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to clear the Certificates section.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "certificates",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Clear all items in Certificates.",
          proposedChanges: [
            {
              section: "certificates",
              itemId: null,
              field: null,
              instruction: "Remove all certificate entries from the Certificates section.",
              proposedText: "[]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Certificate" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Name").fill("Responsive Web Design")
    await page.getByLabel("Institution").fill("freeCodeCamp")

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Name").last().fill("JavaScript Algorithms")
    await page.getByLabel("Institution").last().fill("freeCodeCamp")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to remove everything in Certificates.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Responsive Web Design freeCodeCamp" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "JavaScript Algorithms freeCodeCamp" })).toHaveCount(0)
    expect(requestCount).toBe(1)
  })

  test("accept applies section-clear drafts when the empty-list payload is double-encoded", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "Draft ready to clear the Achievements section.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "achievements",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Clear all items in Achievements.",
          proposedChanges: [
            {
              section: "achievements",
              itemId: null,
              field: null,
              instruction: "Remove all achievement entries from the Achievements section.",
              proposedText: "\"[]\"",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Achievement" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Name").fill("Academic Excellence")
    await page.getByLabel("Institution").fill("Harvard")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("I want to remove everything in Achievements.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Academic Excellence Harvard" })).toHaveCount(0)
    expect(requestCount).toBe(1)
  })

  test("accept applies softSkills field-clear drafts by emptying the soft skills list", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.message).toBe("Delete everything in soft skills.")
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()
      expect(payload.debugProvider).toBeUndefined()
      expect(payload.resumeData.softSkills).toEqual(["Communication", "Problem Solving"])

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "Draft ready to clear all soft skills.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "softSkills",
          itemId: null,
          field: "items",
          scope: "section",
        },
        draft: {
          summary: "Clear all soft skills from the résumé.",
          proposedChanges: [
            {
              section: "softSkills",
              itemId: null,
              field: "items",
              instruction: "Remove all items in softSkills.",
              proposedText: "[]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Skill" }).click()
    const softSkillsField = page.locator("fieldset").filter({ hasText: "Soft skills" })
    await page.getByRole("combobox", { name: "Soft skills" }).fill("Communication")
    await page.keyboard.press(",")
    await page.getByRole("combobox", { name: "Soft skills" }).fill("Problem Solving")
    await page.keyboard.press(",")
    await expect(softSkillsField).toContainText("Communication")
    await expect(softSkillsField).toContainText("Problem solving")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Delete everything in soft skills.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByTestId("chat-inline-error")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(softSkillsField).not.toContainText("Communication")
    await expect(softSkillsField).not.toContainText("Problem solving")
    expect(requestCount).toBe(1)
  })

  test("softSkills JSON-array drafts preview cleanly and apply locally", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I drafted updated soft skills for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "softSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Replace the soft skills list.",
          proposedChanges: [
            {
              section: "softSkills",
              itemId: null,
              field: null,
              instruction: "Replace soft skills with the reviewed list.",
              proposedText: "[\"Problem Solving\",\"Communication\",\"problem solving\"]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Skill" }).click()
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Improve my soft skills.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByText("Replace the soft skills list.").locator("..")
    await expect(reviewCard).toContainText("Problem Solving")
    await expect(reviewCard).toContainText("Communication")
    await expect(reviewCard).not.toContainText("[\"Problem Solving\"")

    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByText("Problem Solving")).toBeVisible()
    await expect(page.getByText("Communication")).toBeVisible()
    await expect(page.getByText("Problem Solving")).toHaveCount(1)
  })

  test("knownLanguages JSON-array drafts preview cleanly and apply locally", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I drafted updated languages for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "knownLanguages",
          scope: "resume_wide",
        },
        draft: {
          summary: "Replace the languages list.",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "knownLanguages",
              instruction: "Replace known languages with the reviewed list.",
              proposedText: "[\"English\",\"Tagalog\"]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Update my languages.")
    await page.getByRole("button", { name: "Send message" }).click()

    const reviewCard = page.getByText("Replace the languages list.").locator("..")
    await expect(reviewCard).toContainText("English")
    await expect(reviewCard).toContainText("Tagalog")
    await expect(reviewCard).not.toContainText("[\"English\"")

    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByText("English")).toBeVisible()
    await expect(page.getByText("Tagalog")).toBeVisible()
  })

  test("malformed structured list drafts fail safely without applying", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I drafted updated languages for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalDetails",
          itemId: null,
          field: "knownLanguages",
          scope: "resume_wide",
        },
        draft: {
          summary: "Replace the languages list.",
          proposedChanges: [
            {
              section: "personalDetails",
              itemId: null,
              field: "knownLanguages",
              instruction: "Replace known languages with the reviewed list.",
              proposedText: "[\"English\", 2]",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "About you" }).click()
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Update my languages.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByTestId("chat-inline-error")).toContainText("Languages")
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toHaveCount(0)
  })

  test("accept applies a coreSkills create draft by adding a new local skill group", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()
      expect(payload.activeDraft).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.conversationContext).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a new Testing core skill group for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Testing core skill group.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Create a new core skill group named Testing with the provided skills.",
              proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\",\"Jest\"]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Skill" }).click()
    await expect(page.getByText("Untitled core skill")).toHaveCount(0)

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Create a Testing core skill group.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByText("Create a new Testing core skill group.")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Skill" }).click()
    await expect(page.getByRole("button", { name: "Testing Jest, Playwright" })).toBeVisible()
    expect(requestCount).toBe(1)
  })

  test("accept shows a user-safe inline error when a coreSkills create draft payload is malformed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a new Testing core skill group for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Testing core skill group.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Create a new core skill group named Testing with the provided skills.",
              proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":\"Jest\"}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Skill" }).click()
    await openChatAssistant(page)

    await page.getByRole("textbox", { name: "Message" }).fill("Create a Testing core skill group.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByTestId("chat-inline-error")).toContainText("The AI draft did not include a valid core skill group to create.")
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toHaveCount(0)
  })

  test("accept blocks duplicate coreSkills group names with an inline error", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    let requestCount = 0

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I drafted a new Testing core skill group for review.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "coreSkills",
          itemId: null,
          field: null,
          scope: "section",
        },
        draft: {
          summary: "Create a new Testing core skill group.",
          proposedChanges: [
            {
              section: "coreSkills",
              itemId: null,
              field: null,
              instruction: "Create a new core skill group named Testing with the provided skills.",
              proposedText: "{\"devLanguage\":\"Testing\",\"devFramework\":[\"Jest\",\"Playwright\"]}",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Create a Testing core skill group.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Create a Testing core skill group again.")
    await page.getByRole("button", { name: "Send message" }).click()
    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByTestId("chat-inline-error")).toContainText("A core skill group named Testing already exists in local data.")
    await expect(page.getByText("Done. I applied that update to your resume. What would you like to improve next?")).toHaveCount(1)
    expect(requestCount).toBe(2)
  })

  test("active-draft follow-ups send raw user text with recent conversation memory", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    let requestCount = 0
    let projectId = ""

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.message).toBe("Add a Codex bullet to Kaizer.")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()
        expect(Array.isArray(payload.resumeData.personalProjects)).toBe(true)
        expect(payload.resumeData.personalProjects).toHaveLength(1)

        projectId = payload.resumeData.personalProjects[0].id
        expect(projectId).toBeTruthy()
        expect(payload.resumeData.personalProjects[0].projectName).toBe("Kaizer")

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I drafted a Kaizer bullet for review.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: projectId,
            field: "bulletSummary",
            scope: "single_item",
          },
          draft: {
            summary: "Add Codex usage bullet to Kaizer project.",
            proposedChanges: [
              {
                section: "personalProjects",
                itemId: projectId,
                field: "bulletSummary",
                instruction: "Add the new Codex-related bullet to Kaizer.",
                proposedText: "Used Codex to support implementation, iteration, and development workflows during Kaizer development.",
              },
            ],
          },
          warnings: [],
        })
        return
      }
      expect(payload.message).toBe("Remove the phrase \"during Kaizer development.\"")
      expect(payload.message).not.toContain("Revise the current draft")
      expect(payload.message).not.toContain("Keep the same target and revise only this draft.")
      expect(payload.activeDraft).toEqual({
        mode: "exact_edit",
        target: {
          section: "personalProjects",
          itemId: projectId,
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: {
          summary: "Add Codex usage bullet to Kaizer project.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: projectId,
              field: "bulletSummary",
              instruction: "Add the new Codex-related bullet to Kaizer.",
              proposedText: "Used Codex to support implementation, iteration, and development workflows during Kaizer development.",
            },
          ],
        },
      })
      expect(payload.conversation).toEqual([
        { role: "user", text: "Add a Codex bullet to Kaizer." },
        { role: "assistant", text: "I drafted a Kaizer bullet for review." },
      ])
      expect(payload.conversationContext).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "exact_edit",
        reply: "I revised the draft and removed that phrase.",
        status: "draft_ready",
        clarificationQuestion: null,
        needsClarification: false,
        needsConfirmation: true,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: projectId,
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: {
          summary: "Revise the Kaizer Codex bullet.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: projectId,
              field: "bulletSummary",
              instruction: "Revise the Kaizer Codex-related bullet.",
              proposedText: "Used Codex to support implementation, iteration, and development workflows.",
            },
          ],
        },
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()
    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Kaizer")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Add a Codex bullet to Kaizer.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    const followUpMessage = "Remove the phrase \"during Kaizer development.\""
    await page.getByRole("textbox", { name: "Message" }).fill(followUpMessage)
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.locator(".chat-bubble").filter({ hasText: followUpMessage })).toBeVisible()
    await expect(page.getByText("Revise the current draft for personalProjects > Kaizer > bulletSummary.")).toHaveCount(0)
    await expect(page.getByText("I revised the draft and removed that phrase.")).toBeVisible()
    expect(requestCount).toBe(2)
  })

  test("explicitly naming a different target sends raw user text with recent conversation memory", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    let requestCount = 0
    let novaId = ""
    let kaizerId = ""

    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      if (requestCount === 1) {
        expect(payload.message).toBe("Add a Codex bullet to Nova.")
        expect(payload.activeDraft).toBeUndefined()
        expect(payload.conversation).toBeUndefined()
        expect(payload.conversationContext).toBeUndefined()

        expect(Array.isArray(payload.resumeData.personalProjects)).toBe(true)
        expect(payload.resumeData.personalProjects).toHaveLength(2)

        novaId = payload.resumeData.personalProjects.find((item: { projectName: string }) => item.projectName === "Nova")?.id ?? ""
        kaizerId = payload.resumeData.personalProjects.find((item: { projectName: string }) => item.projectName === "Kaizer")?.id ?? ""

        expect(novaId).toBeTruthy()
        expect(kaizerId).toBeTruthy()

        await fulfillJson(route, 200, {
          provider: "pollination",
          mode: "exact_edit",
          reply: "I drafted a Nova bullet for review.",
          status: "draft_ready",
          clarificationQuestion: null,
          needsClarification: false,
          needsConfirmation: true,
          readyToApply: false,
          target: {
            section: "personalProjects",
            itemId: novaId,
            field: "bulletSummary",
            scope: "single_item",
          },
          draft: {
            summary: "Add Codex usage bullet to Nova project.",
            proposedChanges: [
              {
                section: "personalProjects",
                itemId: novaId,
                field: "bulletSummary",
                instruction: "Add the new Codex-related bullet to Nova.",
                proposedText: "Used Codex to support Nova implementation and iteration.",
              },
            ],
          },
          warnings: [],
        })
        return
      }
      expect(payload.message).toBe("Update Kaizer instead.")
      expect(payload.message).not.toContain("Revise the current draft for personalProjects > Nova > bulletSummary.")
      expect(payload.message).not.toContain("Keep the same target and revise only this draft.")
      expect(payload.activeDraft).toEqual({
        mode: "exact_edit",
        target: {
          section: "personalProjects",
          itemId: novaId,
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: {
          summary: "Add Codex usage bullet to Nova project.",
          proposedChanges: [
            {
              section: "personalProjects",
              itemId: novaId,
              field: "bulletSummary",
              instruction: "Add the new Codex-related bullet to Nova.",
              proposedText: "Used Codex to support Nova implementation and iteration.",
            },
          ],
        },
      })
      expect(payload.conversation).toEqual([
        { role: "user", text: "Add a Codex bullet to Nova." },
        { role: "assistant", text: "I drafted a Nova bullet for review." },
      ])
      expect(payload.conversationContext).toBeUndefined()

      await fulfillJson(route, 200, {
        provider: "pollination",
        mode: "grounded_suggestion",
        reply: "I can switch to Kaizer.",
        status: "clarification_needed",
        clarificationQuestion: "Which Kaizer bullet should I update?",
        needsClarification: true,
        needsConfirmation: false,
        readyToApply: false,
        target: {
          section: "personalProjects",
          itemId: kaizerId,
          field: "bulletSummary",
          scope: "single_item",
        },
        draft: null,
        warnings: [],
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Personal Project" }).click()

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Nova")

    await page.getByRole("button", { name: "Add an item" }).click()
    await page.getByLabel("Project name").fill("Kaizer")

    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Add a Codex bullet to Nova.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()

    const switchMessage = "Update Kaizer instead."
    await page.getByRole("textbox", { name: "Message" }).fill(switchMessage)
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.locator(".chat-bubble").filter({ hasText: switchMessage })).toBeVisible()
    await expect(page.getByText("Which Kaizer bullet should I update?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0)
    await expect(page.getByText("Revise the current draft for personalProjects > Nova > bulletSummary.")).toHaveCount(0)
    expect(requestCount).toBe(2)
  })
})
