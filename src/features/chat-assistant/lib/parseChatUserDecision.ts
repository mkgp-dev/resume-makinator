import type { ChatUserDecision } from "@/features/chat-assistant/types"

const normalizeDecisionText = (message: string) =>
  message
    .trim()
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")

export const parseChatUserDecision = (message: string): ChatUserDecision | null => {
  const text = normalizeDecisionText(message)
  if (!text) return null

  if (
    /^(no|n|cancel|stop|reject)$/.test(text) ||
    /\b(never mind|do not|don't)\b/.test(text)
  ) {
    return "reject"
  }

  if (
    /^(yes|y|confirm|confirmed|proceed)$/.test(text) ||
    /\b(go ahead|do it)\b/.test(text)
  ) {
    return "confirm"
  }

  return null
}
