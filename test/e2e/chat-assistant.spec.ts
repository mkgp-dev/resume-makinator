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

const selectDropdownOption = async (page: Page, triggerLabel: string, option: string) => {
  await page.getByRole("button", { name: triggerLabel, exact: true }).click()
  await page.getByRole("button", { name: option, exact: true }).click()
}

const selectMode = async (page: Page, mode: "Chat" | "Plan") => {
  await page.getByRole("button", { name: mode, exact: true }).click()
}

const openSettingsMenu = async (page: Page) => {
  await page.getByRole("button", { name: "Chat settings", exact: true }).click()
  await expect(page.getByTestId("chat-settings-menu")).toBeVisible()
}

test.describe("chat assistant", () => {
  test("opens from the edge trigger and shows the empty state with explicit controls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await startEditor(page)

    await expect(page.getByTestId("chat-assistant-panel")).toHaveCount(0)
    await openChatAssistant(page)

    await expect(page.getByText("Ask about your resume")).toBeVisible()
    await expect(page.getByRole("group", { name: "Mode", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Chat", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Chat settings", exact: true })).toBeVisible()
    await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible()
  })

  test("opens the assistant information dialog", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await startEditor(page)
    await openChatAssistant(page)

    await page.getByRole("button", { name: "About your Assistant" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog.getByRole("heading", { name: "About your Assistant" })).toBeVisible()
    await expect(dialog).toContainText("Early stage")
    await expect(dialog).toContainText("Powered by Pollinations AI")
    await expect(dialog).toContainText("Use Chat mode for broad help")
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
    const apiKey = "not-validated-here"

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      expect(route.request().headers().authorization).toBe(`Bearer ${apiKey}`)
      await fulfillJson(route, 200, {
        action: "chat_reply",
        reply: "Hello from the backend.",
      })
    })

    await startEditor(page)
    await page.getByRole("button", { name: "Configuration" }).click()
    await page.getByRole("textbox", { name: "Pollinations API key" }).fill(apiKey)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Improve my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByText("Hello from the backend.")).toBeVisible()
  })

  test("sends chat-mode requests with the new contract, renders markdown, and persists messages after reload", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.service).toBe("resume")
      expect(payload.mode).toBe("chat")
      expect(payload.model).toBe("gemini")
      expect(payload.target).toBeUndefined()
      expect(payload.recentMessages).toBeUndefined()
      expect(payload.resumeData.enableInRender).toBeDefined()
      expect(payload.resumeData.personalDetails.fullName).toBeUndefined()
      expect(payload.conversation).toBeUndefined()
      expect(payload.pendingAction).toBeUndefined()
      expect(payload.userDecision).toBeUndefined()

      await new Promise((resolve) => setTimeout(resolve, 250))

      await fulfillJson(route, 200, {
        action: "chat_reply",
        reply: "**Stronger summary**\n\n- Lead with outcomes.",
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
    await expect(page.getByTestId("chat-response-loading")).toBeVisible()
    await expect(page.getByTestId("chat-message-bubble").filter({ hasText: "Make my summary sharper." })).toBeVisible()
    await expect(page.getByText("Stronger summary")).toBeVisible()
    await expect(page.getByText("Lead with outcomes.")).toBeVisible()
    expect(requestCount).toBe(1)

    await page.reload()
    await openChatAssistant(page)
    await expect(page.getByText("Make my summary sharper.")).toBeVisible()
    await expect(page.getByText("Stronger summary")).toBeVisible()
  })

  test("sends plan-mode requests, shows a review card, and applies accepted changes locally without a second request", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1
      const payload = route.request().postDataJSON()

      expect(payload.mode).toBe("plan")
      expect(payload.target).toEqual({
        section: "summary",
      })

      await new Promise((resolve) => setTimeout(resolve, 250))

      await fulfillJson(route, 200, {
        action: "propose_change",
        reply: "I drafted a sharper summary for review.",
        draft: {
          title: "Summary refresh",
          target: {
            section: "summary",
          },
          previewText: "A concise summary focused on impact.",
          proposedChanges: [
            {
              type: "show_section",
              section: "summary",
              value: true,
              required: true,
            },
            {
              type: "replace_field",
              section: "personalDetails",
              field: "summary",
              value: "Frontend-focused developer delivering polished resume workflows.",
            },
          ],
          assumptions: ["You want a concise positioning statement."],
        },
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await selectMode(page, "Plan")
    await expect(page.getByRole("button", { name: "Plan Section", exact: true })).toBeVisible()
    await selectDropdownOption(page, "Plan Section", "Summary")
    await page.getByRole("textbox", { name: "Message" }).fill("Rewrite my summary.")
    const send = page.getByRole("button", { name: "Send message" })
    await send.click()

    await expect(page.getByRole("button", { name: "Chat", exact: true })).toBeDisabled()
    await expect(page.getByRole("button", { name: "Plan", exact: true })).toBeDisabled()
    await expect(page.getByRole("button", { name: "Plan Section", exact: true })).toBeDisabled()
    await expect(page.getByRole("button", { name: "Chat settings", exact: true })).toBeDisabled()
    await expect(page.getByTestId("chat-response-loading")).toBeVisible()
    await expect(page.getByTestId("chat-draft-review-loading")).toHaveCount(0)
    await expect(page.getByTestId("chat-draft-review")).toBeVisible()
    await expect(page.getByTestId("chat-response-loading")).toHaveCount(0)
    await expect(page.getByTestId("chat-draft-response-loading")).toHaveCount(0)
    await expect(page.getByText("Summary refresh")).toBeVisible()
    const reject = page.getByRole("button", { name: "Reject" })
    await page.getByRole("button", { name: "Accept" }).click()
    await expect(page.getByRole("button", { name: "Applying..." })).toBeVisible()
    await expect(reject).toBeDisabled()
    expect(requestCount).toBe(1)

    await page.getByRole("button", { name: "Close Chat Assistant" }).last().click()
    await expect(page.getByRole("textbox", { name: "Summary" })).toHaveValue(
      "Frontend-focused developer delivering polished resume workflows.",
    )
  })

  test("follow-up requests keep the real draft visible and show loading inside the review card", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      if (requestCount === 1) {
        await new Promise((resolve) => setTimeout(resolve, 250))
        await fulfillJson(route, 200, {
          action: "propose_change",
          reply: "I prepared a draft for review.",
          draft: {
            title: "Summary refresh",
            target: {
              section: "summary",
            },
            previewText: "A concise summary focused on impact.",
            proposedChanges: [
              {
                type: "replace_field",
                section: "personalDetails",
                field: "summary",
                value: "Frontend-focused developer delivering polished resume workflows.",
              },
            ],
          },
        })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      await fulfillJson(route, 200, {
        action: "propose_change",
        reply: "I updated the draft based on your follow-up.",
        draft: {
          title: "Summary refresh v2",
          target: {
            section: "summary",
          },
          previewText: "A sharper summary with stronger outcome language.",
          proposedChanges: [
            {
              type: "replace_field",
              section: "personalDetails",
              field: "summary",
              value: "Frontend-focused developer delivering polished resume workflows with measurable impact.",
            },
          ],
        },
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await selectMode(page, "Plan")
    await selectDropdownOption(page, "Plan Section", "Summary")
    await page.getByRole("textbox", { name: "Message" }).fill("Rewrite my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    const draftCard = page.getByTestId("chat-draft-review")
    await expect(draftCard).toBeVisible()
    await expect(draftCard).toContainText("Summary refresh")

    await page.getByRole("textbox", { name: "Message" }).fill("Make it more results-focused.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(draftCard).toBeVisible()
    await expect(page.getByTestId("chat-draft-response-loading")).toBeVisible()
    await expect(page.getByTestId("chat-draft-response-loading")).toContainText("Updating the review...")
    await expect(page.getByTestId("chat-response-loading")).toHaveCount(0)
    await expect(draftCard).toContainText("Summary refresh v2")
    await expect(page.getByTestId("chat-draft-response-loading")).toHaveCount(0)
    expect(requestCount).toBe(2)
  })

  test("follow-up non-draft responses clear the existing review draft after the response lands", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      if (requestCount === 1) {
        await new Promise((resolve) => setTimeout(resolve, 250))
        await fulfillJson(route, 200, {
          action: "propose_change",
          reply: "I prepared a draft for review.",
          draft: {
            title: "Summary refresh",
            target: {
              section: "summary",
            },
            previewText: "A concise summary focused on impact.",
            proposedChanges: [
              {
                type: "replace_field",
                section: "personalDetails",
                field: "summary",
                value: "Frontend-focused developer delivering polished resume workflows.",
              },
            ],
          },
        })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      await fulfillJson(route, 200, {
        action: "error",
        reply: "Something went wrong while preparing the response.",
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await selectMode(page, "Plan")
    await selectDropdownOption(page, "Plan Section", "Summary")
    await page.getByRole("textbox", { name: "Message" }).fill("Rewrite my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    const draftCard = page.getByTestId("chat-draft-review")
    await expect(draftCard).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Try again with a different angle.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByTestId("chat-draft-response-loading")).toBeVisible()
    await expect(page.getByTestId("chat-response-loading")).toHaveCount(0)
    await expect(page.getByTestId("chat-draft-review")).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toContainText("Something went wrong while preparing the response.")
    expect(requestCount).toBe(2)
  })

  test("malformed follow-up propose_change responses clear the stale draft and show an error", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      if (requestCount === 1) {
        await new Promise((resolve) => setTimeout(resolve, 250))
        await fulfillJson(route, 200, {
          action: "propose_change",
          reply: "I prepared a draft for review.",
          draft: {
            title: "Summary refresh",
            target: {
              section: "summary",
            },
            previewText: "A concise summary focused on impact.",
            proposedChanges: [
              {
                type: "replace_field",
                section: "personalDetails",
                field: "summary",
                value: "Frontend-focused developer delivering polished resume workflows.",
              },
            ],
          },
        })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      await fulfillJson(route, 200, {
        action: "propose_change",
        reply: "I tried to update the draft.",
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await selectMode(page, "Plan")
    await selectDropdownOption(page, "Plan Section", "Summary")
    await page.getByRole("textbox", { name: "Message" }).fill("Rewrite my summary.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-draft-review")).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Try a different version.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByTestId("chat-draft-response-loading")).toBeVisible()
    await expect(page.getByTestId("chat-draft-review")).toHaveCount(0)
    await expect(page.getByTestId("chat-inline-error")).toContainText(
      "The assistant proposed a change but did not return a draft to review.",
    )
    expect(requestCount).toBe(2)
  })

  test("reject clears the active draft and does not mutate resume data", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        action: "propose_change",
        reply: "Here is a draft for your summary.",
        draft: {
          title: "Summary refresh",
          target: {
            section: "summary",
          },
          previewText: "A concise summary focused on impact.",
          proposedChanges: [
            {
              type: "replace_field",
              section: "personalDetails",
              field: "summary",
              value: "This should not be applied.",
            },
          ],
        },
      })
    })

    await startEditor(page)
    await page.getByRole("textbox", { name: "Summary" }).fill("Keep this summary intact.")
    await openChatAssistant(page)
    await selectMode(page, "Plan")
    await selectDropdownOption(page, "Plan Section", "Summary")
    await page.getByRole("textbox", { name: "Message" }).fill("Rewrite my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByTestId("chat-draft-review")).toBeVisible()
    await page.getByRole("button", { name: "Reject" }).click()
    await expect(page.getByTestId("chat-draft-review")).toHaveCount(0)

    await page.getByRole("button", { name: "Close Chat Assistant" }).last().click()
    await expect(page.getByRole("textbox", { name: "Summary" })).toHaveValue("Keep this summary intact.")
  })

  test("plan mode requires a selected section before sending", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await startEditor(page)
    await openChatAssistant(page)
    await selectMode(page, "Plan")
    await page.getByRole("textbox", { name: "Message" }).fill("Rewrite my summary.")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(page.getByTestId("chat-inline-error")).toContainText("Select a section before sending a plan request.")
  })

  test("persists conversation across reload and can clear it from the confirmation dialog", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      await fulfillJson(route, 200, {
        action: "chat_reply",
        reply: "Saved reply.",
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("Persist this.")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Saved reply.")).toBeVisible()

    await page.reload()
    await openChatAssistant(page)
    await expect(page.getByText("Persist this.")).toBeVisible()
    await expect(page.getByText("Saved reply.")).toBeVisible()

    await openSettingsMenu(page)
    await page.getByRole("button", { name: "Delete conversation", exact: true }).click()
    await expect(page.getByRole("heading", { name: "Clear conversation?" })).toBeVisible()
    await page.getByRole("button", { name: "Clear chat" }).click()
    await expect(page.getByText("Ask about your resume")).toBeVisible()
    await expect(page.getByText("Saved reply.")).toHaveCount(0)
  })

  test("shows plan-only section control and friendly model labels inside settings", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await startEditor(page)
    await openChatAssistant(page)

    await expect(page.getByRole("button", { name: "Plan Section", exact: true })).toHaveCount(0)
    await selectMode(page, "Plan")
    await expect(page.getByRole("button", { name: "Plan Section", exact: true })).toBeVisible()

    await openSettingsMenu(page)
    const settingsMenu = page.getByTestId("chat-settings-menu")
    await expect(settingsMenu.getByRole("button", { name: "Gemini 2.5 Flash Lite", exact: true })).toBeVisible()
    await expect(settingsMenu.getByRole("button", { name: "Nova Micro", exact: true })).toBeVisible()
    await expect(settingsMenu.getByRole("button", { name: "Mistral Small 3.2", exact: true })).toBeVisible()
    await expect(settingsMenu.getByRole("button", { name: "GPT-5.4 Nano", exact: true })).toBeVisible()
  })

  test("shows quota and error responses clearly in the UI", async ({ page }) => {
    let requestCount = 0

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/v1/ai/chat", async (route) => {
      requestCount += 1

      if (requestCount === 1) {
        await fulfillJson(route, 200, {
          action: "quota_unavailable",
          reply: "Shared quota is unavailable right now. Add your own key to continue.",
        })
        return
      }

      await fulfillJson(route, 200, {
        action: "error",
        reply: "Something went wrong while preparing the response.",
      })
    })

    await startEditor(page)
    await openChatAssistant(page)
    await page.getByRole("textbox", { name: "Message" }).fill("First request")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByText("Shared quota is unavailable right now. Add your own key to continue.").first()).toBeVisible()

    await page.getByRole("textbox", { name: "Message" }).fill("Second request")
    await page.getByRole("button", { name: "Send message" }).click()
    await expect(page.getByTestId("chat-inline-error")).toContainText("Something went wrong while preparing the response.")
  })
})
