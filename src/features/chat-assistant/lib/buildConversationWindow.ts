import type { AiChatMessage, ChatMessageRecord } from "@/features/chat-assistant/types"

const MAX_RECENT_MESSAGES = 8
const MAX_MESSAGE_CHARS = 1200

export const buildRecentMessages = (
  messages: ChatMessageRecord[],
): AiChatMessage[] | undefined => {
  const recentMessages = messages
    .slice(-MAX_RECENT_MESSAGES)
    .map(({ role, content }) => ({
      role,
      content: content.slice(0, MAX_MESSAGE_CHARS),
    }))

  return recentMessages.length ? recentMessages : undefined
}
