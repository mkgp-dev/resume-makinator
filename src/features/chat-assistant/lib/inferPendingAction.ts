import type {
  AiChatResponse,
  ChatPendingAction,
  ChatPendingActionType,
  ChatResumeData,
} from "@/features/chat-assistant/types"

const CONFIRMATION_PATTERN =
  /\b(do you want|please confirm|confirm that|are you sure|should i|would you like me)\b/i

const createActionText = (response: AiChatResponse) =>
  [response.reply, response.clarificationQuestion].filter(Boolean).join(" ")

const classifyPendingAction = (text: string): ChatPendingActionType | null => {
  if (/\breplace\s+(all|everything)\b|\boverwrite\b/i.test(text)) {
    return "replace_all"
  }

  if (/\b(delete|remove|clear)\b/i.test(text)) {
    return "delete"
  }

  if (/\b(destructive|permanent|permanently|cannot be undone|can't be undone)\b/i.test(text)) {
    return "destructive_edit"
  }

  return CONFIRMATION_PATTERN.test(text) ? "clarification" : null
}

const getSectionItemIds = (
  resumeData: ChatResumeData,
  section: string,
): string[] => {
  const value = resumeData[section as keyof ChatResumeData]
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null
      const candidate = item as { id?: unknown }
      return typeof candidate.id === "string" && candidate.id.trim()
        ? candidate.id
        : null
    })
    .filter((id): id is string => Boolean(id))
}

export const inferPendingAction = (
  response: AiChatResponse,
  resumeData: ChatResumeData,
): ChatPendingAction | null => {
  if (response.draft !== null || !response.target.section) return null

  const text = createActionText(response)
  if (!CONFIRMATION_PATTERN.test(text)) return null

  const type = classifyPendingAction(text)
  if (!type) return null

  const targetItemIds = response.target.itemId
    ? [response.target.itemId]
    : type === "delete" && response.target.scope === "section"
      ? getSectionItemIds(resumeData, response.target.section)
      : []

  return {
    type,
    targetSection: response.target.section,
    ...(targetItemIds.length ? { targetItemIds } : {}),
  }
}
