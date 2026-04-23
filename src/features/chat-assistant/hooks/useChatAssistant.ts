import { useShallow } from "zustand/react/shallow"
import { createResumeImportData } from "@/entities/resume/lib/importExport"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { sendChatAssistantRequest, ChatAssistantRequestError } from "@/features/chat-assistant/api/sendChatAssistantRequest"
import { applyAiDraftChanges } from "@/features/chat-assistant/lib/applyDraft"
import { buildConversationWindow } from "@/features/chat-assistant/lib/buildConversationWindow"
import { inferPendingAction } from "@/features/chat-assistant/lib/inferPendingAction"
import { parseChatUserDecision } from "@/features/chat-assistant/lib/parseChatUserDecision"
import { createChatResumeData } from "@/features/chat-assistant/lib/resumePayload"
import { useChatAssistantStore } from "@/features/chat-assistant/store/useChatAssistantStore"
import type {
  AiActiveDraft,
  AiChatResponse,
  AiDraft,
  ChatActionableDraft,
  ChatResumeData,
  ChatUserDecision,
} from "@/features/chat-assistant/types"

const REJECTED_DRAFT_MESSAGE =
  "This draft is still not applied. Let me know if you want to add something or if you've changed your mind."
const NOT_READY_TO_APPLY_MESSAGE =
  "The latest reply is not ready to apply yet. Please continue the conversation until the assistant confirms the final draft."
const APPLIED_DRAFT_MESSAGE =
  "Done. I applied that update to your resume. What would you like to improve next?"

const formatWarning = (warning: string) => warning.trim()

const formatError = (error: unknown) => {
  if (error instanceof ChatAssistantRequestError) {
    return error.message
  }

  return "Something went wrong while talking to the chat service."
}

const buildActiveDraftPayload = (
  activeDraft: ChatActionableDraft | null,
): AiActiveDraft | undefined => {
  if (!activeDraft?.mode) return undefined

  return {
    mode: activeDraft.mode,
    target: activeDraft.target,
    draft: activeDraft.draft,
  }
}

export function useChatAssistant() {
  const {
    hasHydrated,
    entries,
    activeDraft,
    activeClarification,
    pendingAction,
    lastUserMessage,
    pending,
    appendMessage,
    appendNotice,
    setActiveDraft,
    setActiveClarification,
    setPendingAction,
    setLastUserMessage,
    setPending,
    clearConversation,
  } = useChatAssistantStore(useShallow((state) => ({
    hasHydrated: state.hasHydrated,
    entries: state.entries,
    activeDraft: state.activeDraft,
    activeClarification: state.activeClarification,
    pendingAction: state.pendingAction,
    lastUserMessage: state.lastUserMessage,
    pending: state.pending,
    appendMessage: state.appendMessage,
    appendNotice: state.appendNotice,
    setActiveDraft: state.setActiveDraft,
    setActiveClarification: state.setActiveClarification,
    setPendingAction: state.setPendingAction,
    setLastUserMessage: state.setLastUserMessage,
    setPending: state.setPending,
    clearConversation: state.clearConversation,
  })))
  const applyResumeData = useResumeStore((state) => state.setData)

  const applyDraftLocally = (draft: AiDraft) => {
    const currentResumeData = createResumeImportData(useResumeStore.getState())
    const applyResult = applyAiDraftChanges(currentResumeData, draft.proposedChanges)

    if (!applyResult.ok) {
      appendNotice("error", applyResult.error)
      return false
    }

    applyResumeData(applyResult.data)
    setActiveDraft(null)
    setActiveClarification(null)
    setPendingAction(null)
    appendMessage("assistant", APPLIED_DRAFT_MESSAGE)
    return true
  }

  const consumeResponse = (
    response: AiChatResponse,
    requestMessage: string,
    requestResumeData: ChatResumeData,
    requestDecision: ChatUserDecision | null,
  ) => {
    appendMessage("assistant", response.reply)

    for (const warning of response.warnings.map(formatWarning).filter(Boolean)) {
      appendNotice("warning", warning)
    }

    setActiveClarification(null)
    setActiveDraft(null)

    const nextPendingAction = inferPendingAction(response, requestResumeData)
    setPendingAction(nextPendingAction)

    if (response.status === "clarification_needed") {
      if (response.clarificationQuestion) {
        setActiveClarification({
          question: response.clarificationQuestion,
        })
      } else {
        appendNotice("warning", "The assistant needs clarification, but no explicit question was returned.")
      }
      return
    }

    if (response.status === "draft_ready" || response.status === "awaiting_confirmation") {
      if (requestDecision) {
        setPendingAction(null)
      }
      if (response.draft) {
        setActiveDraft({
          requestMessage,
          mode: response.mode,
          draft: response.draft,
          target: response.target,
        })
      }
      if (!response.readyToApply) return
    }

    if (response.status === "blocked") {
      if (requestDecision) {
        setPendingAction(null)
      }
      return
    }

    if (!response.readyToApply) {
      if (response.draft) {
        appendNotice("warning", NOT_READY_TO_APPLY_MESSAGE)
      }
      return
    }

    if (!response.draft) {
      appendNotice("error", "The AI confirmed a change, but it did not provide a draft to apply.")
      return
    }

    applyDraftLocally(response.draft)
  }

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || pending) return false

    const resumeState = useResumeStore.getState()
    const conversation = buildConversationWindow(entries)
    const requestActiveDraft = buildActiveDraftPayload(activeDraft)
    const requestResumeData = createChatResumeData(resumeState)
    const userDecision = pendingAction ? parseChatUserDecision(trimmedMessage) : null
    const requestPendingAction = userDecision ? pendingAction : null
    const pendingDecisionPayload = requestPendingAction && userDecision
      ? {
          pendingAction: requestPendingAction,
          userDecision,
        }
      : {}

    if (pendingAction && !userDecision) {
      setPendingAction(null)
    }

    appendMessage("user", trimmedMessage)
    setLastUserMessage(trimmedMessage)
    setPending(true)
    setActiveClarification(null)

    try {
      const response = await sendChatAssistantRequest({
        message: trimmedMessage,
        resumeData: requestResumeData,
        conversation,
        activeDraft: requestActiveDraft,
        ...pendingDecisionPayload,
      })

      consumeResponse(response, trimmedMessage, requestResumeData, userDecision)
      return true
    } catch (error) {
      appendNotice("error", formatError(error))
      return false
    } finally {
      setPending(false)
    }
  }

  const acceptDraft = async () => {
    if (!activeDraft || pending) return

    setPending(true)

    try {
      applyDraftLocally(activeDraft.draft)
    } finally {
      setPending(false)
    }
  }

  const rejectDraft = () => {
    if (!activeDraft) return
    setActiveDraft(null)
    setActiveClarification(null)
    setPendingAction(null)
    appendMessage("assistant", REJECTED_DRAFT_MESSAGE)
  }

  return {
    hasHydrated,
    entries,
    activeDraft,
    activeClarification,
    pendingAction,
    lastUserMessage,
    pending,
    sendMessage,
    acceptDraft,
    rejectDraft,
    clearConversation,
  }
}
