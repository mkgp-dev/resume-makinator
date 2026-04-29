import type { ResumeImportData } from "@/entities/resume/types"
import { buildRecentMessages } from "@/features/chat-assistant/lib/buildConversationWindow"
import { createChatResumeData } from "@/features/chat-assistant/lib/resumePayload"
import type {
  AiAssistantMode,
  AiChatRequestDto,
  AiModel,
  AiPlanTarget,
  ChatMessageRecord,
} from "@/features/chat-assistant/types"

type CreateChatAssistantRequestArgs = {
  message: string
  messages: ChatMessageRecord[]
  mode: AiAssistantMode
  model: AiModel
  selectedPlanSection?: AiPlanTarget["section"]
  resumeData: ResumeImportData
}

export const createChatAssistantRequest = ({
  message,
  messages,
  mode,
  model,
  selectedPlanSection,
  resumeData,
}: CreateChatAssistantRequestArgs): AiChatRequestDto => {
  const request: AiChatRequestDto = {
    service: "resume",
    mode,
    model,
    message,
    resumeData: createChatResumeData(resumeData),
  }

  const recentMessages = buildRecentMessages(messages)
  if (recentMessages) {
    request.recentMessages = recentMessages
  }

  if (mode === "plan" && selectedPlanSection) {
    request.target = {
      section: selectedPlanSection,
    }
  }

  return request
}
