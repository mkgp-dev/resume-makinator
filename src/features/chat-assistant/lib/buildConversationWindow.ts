import type {
  AiChatConversationMessage,
  ChatConversationEntry,
  ChatMessageEntry,
} from "@/features/chat-assistant/types"

const MAX_CONVERSATION_MESSAGES = 6

const isConversationMessage = (entry: ChatConversationEntry): entry is ChatMessageEntry =>
  entry.kind === "message" && (entry.role === "user" || entry.role === "assistant")

export const buildConversationWindow = (
  entries: ChatConversationEntry[],
): AiChatConversationMessage[] | undefined => {
  const messages = entries
    .filter(isConversationMessage)
    .map(({ role, text }) => ({ role, text }))
    .slice(-MAX_CONVERSATION_MESSAGES)

  return messages.length ? messages : undefined
}
