import type { AiChatMode, AiChatRequest, AiChatResponse } from "@/features/chat-assistant/types"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"

const POLLINATIONS_KEY_PATTERN = /^(sk|pk)_[A-Za-z0-9]{32}$/

type ErrorShape = {
  error?: {
    code?: string
    message?: string
    requestId?: string
  }
}

export class ChatAssistantRequestError extends Error {
  status: number
  code?: string
  requestId?: string

  constructor({
    message,
    status,
    code,
    requestId,
  }: {
    message: string
    status: number
    code?: string
    requestId?: string
  }) {
    super(message)
    this.name = "ChatAssistantRequestError"
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

const createEndpoint = () => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "")
  return `${baseUrl}/v1/ai/chat`
}

const isAiChatMode = (value: unknown): value is AiChatMode =>
  value === "exact_edit" ||
  value === "grounded_suggestion" ||
  value === "role_targeted_suggestion"

const isAiChatResponse = (value: unknown): value is AiChatResponse => {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Partial<AiChatResponse>
  const hasClarificationQuestion =
    typeof candidate.clarificationQuestion === "string" ||
    candidate.clarificationQuestion === null

  return (
    typeof candidate.reply === "string" &&
    typeof candidate.provider === "string" &&
    isAiChatMode(candidate.mode) &&
    typeof candidate.status === "string" &&
    hasClarificationQuestion &&
    typeof candidate.needsClarification === "boolean" &&
    typeof candidate.needsConfirmation === "boolean" &&
    typeof candidate.readyToApply === "boolean" &&
    Array.isArray(candidate.warnings)
  )
}

const parseErrorResponse = async (response: Response) => {
  let payload: ErrorShape | null = null

  try {
    payload = (await response.json()) as ErrorShape
  } catch {
    payload = null
  }

  const message = payload?.error?.message?.trim() || response.statusText || "Request failed"

  throw new ChatAssistantRequestError({
    status: response.status,
    code: payload?.error?.code,
    requestId: payload?.error?.requestId,
    message,
  })
}

export const sendChatAssistantRequest = async (
  payload: AiChatRequest,
): Promise<AiChatResponse> => {
  let response: Response
  const pollinationsApiKey = useResumeStore.getState().configuration.pollinationsApiKey.trim()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (POLLINATIONS_KEY_PATTERN.test(pollinationsApiKey)) {
    headers.Authorization = `Bearer ${pollinationsApiKey}`
  }

  try {
    response = await fetch(createEndpoint(), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ChatAssistantRequestError({
      status: 0,
      message: "The chat service could not be reached. Check your API base URL and try again.",
    })
  }

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data = (await response.json()) as unknown
  if (!isAiChatResponse(data)) {
    throw new ChatAssistantRequestError({
      status: 502,
      message: "The chat service returned an unexpected response shape.",
    })
  }

  return data
}
