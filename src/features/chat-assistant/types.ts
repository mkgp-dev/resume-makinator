import type { ResumeImportData } from "@/entities/resume/types"

export type AiProviderName = "pollinations" | "llama"

export type AiChatMode =
  | "exact_edit"
  | "grounded_suggestion"
  | "role_targeted_suggestion"

export type AiResponseStatus =
  | "clarification_needed"
  | "draft_ready"
  | "awaiting_confirmation"
  | "blocked"

export type AiTargetScope = "single_item" | "section" | "resume_wide" | "unknown"

export type AiDraftChange = {
  section: string
  itemId: string | null
  field: string | null
  instruction: string
  proposedText: string | null
}

export type AiDraft = {
  summary: string
  proposedChanges: AiDraftChange[]
}

export type AiChatTarget = {
  section: string | null
  itemId: string | null
  field: string | null
  scope: AiTargetScope
}

export type AiChatResponse = {
  provider: AiProviderName
  mode: AiChatMode
  reply: string
  status: AiResponseStatus
  clarificationQuestion: string | null
  needsClarification: boolean
  needsConfirmation: boolean
  readyToApply: boolean
  target: AiChatTarget
  draft: AiDraft | null
  warnings: string[]
}

export type ChatResumeData = Omit<
  ResumeImportData,
  "activePage" | "configuration" | "enableInRender" | "template" | "personalDetails"
> & {
  personalDetails: Omit<ResumeImportData["personalDetails"], "profilePicture">
}

export type ChatMessageRole = "user" | "assistant"

export type AiChatConversationMessage = {
  role: ChatMessageRole
  text: string
}

export type AiActiveDraft = {
  mode: AiChatMode
  target: AiChatTarget
  draft: AiDraft
}

export type ChatPendingActionType =
  | "delete"
  | "replace_all"
  | "destructive_edit"
  | "clarification"

export type ChatPendingAction = {
  type: ChatPendingActionType
  targetSection: string | null
  targetItemIds?: string[]
}

export type ChatUserDecision = "confirm" | "reject"

export type AiChatRequest = {
  message: string
  resumeData: ChatResumeData
  conversation?: AiChatConversationMessage[]
  activeDraft?: AiActiveDraft | null
  pendingAction?: ChatPendingAction
  userDecision?: ChatUserDecision
}

export type ChatMessageEntry = {
  id: string
  kind: "message"
  role: ChatMessageRole
  text: string
}

export type ChatNoticeVariant = "error" | "warning"

export type ChatNoticeEntry = {
  id: string
  kind: "notice"
  variant: ChatNoticeVariant
  text: string
}

export type ChatConversationEntry = ChatMessageEntry | ChatNoticeEntry

export type ChatActionableDraft = {
  requestMessage: string
  mode: AiChatMode
  draft: AiDraft
  target: AiChatTarget
}

export type ChatClarificationState = {
  question: string
}
