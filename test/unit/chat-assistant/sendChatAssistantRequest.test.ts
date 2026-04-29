import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import {
  ChatAssistantRequestError,
  sendChatAssistantRequest,
} from "@/features/chat-assistant/api/sendChatAssistantRequest"

const createSuccessResponse = () =>
  new Response(
    JSON.stringify({
      action: "chat_reply",
      reply: "Hello there.",
    }),
    { status: 200 },
  )

describe("sendChatAssistantRequest", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    useResumeStore.setState((state) => ({
      configuration: {
        ...state.configuration,
        pollinationsApiKey: "",
      },
    }))
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("sends a bearer token for any non-empty trimmed Pollinations key", async () => {
    const fetchMock = vi.fn(async () => createSuccessResponse())

    global.fetch = fetchMock as typeof fetch
    useResumeStore.setState((state) => ({
      configuration: {
        ...state.configuration,
        pollinationsApiKey: "  not-validated-here  ",
      },
    }))

    await sendChatAssistantRequest({
      service: "resume",
      mode: "chat",
      model: "gemini",
      message: "Hi",
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: expect.objectContaining({
        Authorization: "Bearer not-validated-here",
      }),
    })
  })

  it("omits the bearer token when the Pollinations key is empty", async () => {
    const fetchMock = vi.fn(async () => createSuccessResponse())

    global.fetch = fetchMock as typeof fetch

    await sendChatAssistantRequest({
      service: "resume",
      mode: "chat",
      model: "gemini",
      message: "Hi",
    })

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it("omits the bearer token when the Pollinations key is whitespace only", async () => {
    const fetchMock = vi.fn(async () => createSuccessResponse())

    global.fetch = fetchMock as typeof fetch
    useResumeStore.setState((state) => ({
      configuration: {
        ...state.configuration,
        pollinationsApiKey: "   ",
      },
    }))

    await sendChatAssistantRequest({
      service: "resume",
      mode: "chat",
      model: "gemini",
      message: "Hi",
    })

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it("omits the bearer token when the Pollinations key is missing", async () => {
    const fetchMock = vi.fn(async () => createSuccessResponse())

    global.fetch = fetchMock as typeof fetch
    useResumeStore.setState((state) => ({
      configuration: {
        ...state.configuration,
        pollinationsApiKey: undefined as unknown as string,
      },
    }))

    await sendChatAssistantRequest({
      service: "resume",
      mode: "chat",
      model: "gemini",
      message: "Hi",
    })

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it("rejects unexpected response shapes from the backend", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ reply: "Missing action" }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects a proposed change with an unknown append section", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "append_item",
            section: "randomUnknownSection",
            value: {},
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects a proposed change with an unknown replace_list section", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "replace_list",
            section: "randomUnknownSection",
            value: [],
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects update_item when the value is an array", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "coreSkills" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "update_item",
            section: "coreSkills",
            itemId: "core-1",
            value: ["not", "an", "object"],
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects update_item when the value is null", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "coreSkills" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "update_item",
            section: "coreSkills",
            itemId: "core-1",
            value: null,
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects a proposed change with an unknown update_item section", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "update_item",
            section: "randomUnknownSection",
            itemId: "item-1",
            value: {},
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects a proposed change with an unknown delete_item section", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "delete_item",
            section: "randomUnknownSection",
            itemId: "item-1",
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects show_section with an unsupported section", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "show_section",
            section: "notASection",
            value: true,
            required: true,
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects show_section when value is not true", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "show_section",
            section: "summary",
            value: false,
            required: true,
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects show_section when required is not true", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "show_section",
            section: "summary",
            value: true,
            required: false,
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("rejects propose_change responses that contain unsupported draft entries", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "replace_field",
            section: "personalDetails",
            field: "summary",
            value: 42,
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).rejects.toBeInstanceOf(ChatAssistantRequestError)
  })

  it("accepts valid proposed changes from the supported contract", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      action: "propose_change",
      reply: "Draft",
      draft: {
        title: "Draft",
        target: { section: "summary" },
        previewText: "Preview",
        proposedChanges: [
          {
            type: "show_section",
            section: "summary",
            value: true,
            required: true,
          },
          {
            type: "append_item",
            section: "softSkills",
            value: "Collaboration",
          },
        ],
      },
    }), { status: 200 })) as typeof fetch

    await expect(
      sendChatAssistantRequest({
        service: "resume",
        mode: "chat",
        model: "gemini",
        message: "Hi",
      }),
    ).resolves.toMatchObject({
      action: "propose_change",
      reply: "Draft",
    })
  })
})
