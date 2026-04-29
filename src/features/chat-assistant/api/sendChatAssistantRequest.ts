import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import type { AiChatRequestDto, AiChatResponseDto, ProposedChange } from "@/features/chat-assistant/types"

type ErrorShape = {
  error?: {
    code?: string
    message?: string
    requestId?: string
  }
}

const VALID_ACTIONS = new Set([
  "chat_reply",
  "resume_review",
  "section_advice",
  "ask_clarification",
  "propose_change",
  "unsupported_service",
  "quota_unavailable",
  "error",
] as const)

const REPLACE_LIST_SECTIONS = new Set([
  "personalDetails.knownLanguages",
  "softSkills",
  "coreSkills",
] as const)

const APPEND_ITEM_SECTIONS = new Set([
  "personalDetails.knownLanguages",
  "softSkills",
  "coreSkills",
  "workExperiences",
  "personalProjects",
  "education",
  "certificates",
  "achievements",
  "references",
] as const)

const ITEM_SECTIONS = new Set([
  "coreSkills",
  "workExperiences",
  "personalProjects",
  "education",
  "certificates",
  "achievements",
  "references",
] as const)

const SHOW_SECTION_KEYS = new Set([
  "summary",
  "language",
  "coreSkills",
  "softSkills",
  "workExperiences",
  "personalProjects",
  "education",
  "certificates",
  "achievements",
  "references",
] as const)

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

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")

const hasAllowedSection = <Section extends string>(
  sections: Set<Section>,
  value: unknown,
): value is Section => typeof value === "string" && sections.has(value as Section)

const isProposedChange = (value: unknown): value is ProposedChange => {
  if (!isObject(value) || typeof value.type !== "string") return false

  switch (value.type) {
    case "replace_field":
      return value.section === "personalDetails" && value.field === "summary" && typeof value.value === "string"
    case "replace_list":
      return (
        (value.section === "personalDetails.knownLanguages" && isStringArray(value.value)) ||
        (value.section === "softSkills" && isStringArray(value.value)) ||
        (value.section === "coreSkills" &&
          hasAllowedSection(REPLACE_LIST_SECTIONS, value.section) &&
          Array.isArray(value.value))
      )
    case "append_item":
      return (
        value.section === "personalDetails.knownLanguages"
          ? typeof value.value === "string"
          : value.section === "softSkills"
            ? typeof value.value === "string"
            : hasAllowedSection(APPEND_ITEM_SECTIONS, value.section) &&
              isObject(value.value)
      )
    case "update_item":
      return (
        hasAllowedSection(ITEM_SECTIONS, value.section) &&
        typeof value.itemId === "string" &&
        isObject(value.value)
      )
    case "delete_item":
      return hasAllowedSection(ITEM_SECTIONS, value.section) && typeof value.itemId === "string"
    case "show_section":
      return (
        hasAllowedSection(SHOW_SECTION_KEYS, value.section) &&
        value.value === true &&
        value.required === true
      )
    default:
      return false
  }
}

const isAiChatResponse = (value: unknown): value is AiChatResponseDto => {
  if (!isObject(value)) return false
  if (typeof value.reply !== "string") return false
  if (typeof value.action !== "string" || !VALID_ACTIONS.has(value.action as AiChatResponseDto["action"])) return false
  if (value.warnings !== undefined && !isStringArray(value.warnings)) return false

  if (value.draft !== undefined) {
    if (!isObject(value.draft)) return false
    if (typeof value.draft.title !== "string") return false
    if (typeof value.draft.previewText !== "string") return false
    if (!isObject(value.draft.target) || typeof value.draft.target.section !== "string") return false
    if (!Array.isArray(value.draft.proposedChanges) || !value.draft.proposedChanges.every(isProposedChange)) {
      return false
    }
    if (value.draft.assumptions !== undefined && !isStringArray(value.draft.assumptions)) return false
    if (value.draft.questions !== undefined && !isStringArray(value.draft.questions)) return false
  }

  if (value.debugMeta !== undefined && !isObject(value.debugMeta)) return false

  return true
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
  payload: AiChatRequestDto,
): Promise<AiChatResponseDto> => {
  let response: Response
  const pollinationsApiKey = useResumeStore.getState().configuration.pollinationsApiKey?.trim() ?? ""
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (pollinationsApiKey) {
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
