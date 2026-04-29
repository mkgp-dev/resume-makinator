import { useShallow } from "zustand/react/shallow"
import { createResumeImportData } from "@/entities/resume/lib/importExport"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import {
  ChatAssistantRequestError,
  sendChatAssistantRequest,
} from "@/features/chat-assistant/api/sendChatAssistantRequest"
import { createChatAssistantRequest } from "@/features/chat-assistant/lib/createChatAssistantRequest"
import { applyAiDraftChanges } from "@/features/chat-assistant/lib/applyDraft"
import { useChatAssistantStore } from "@/features/chat-assistant/store/useChatAssistantStore"

const APPLIED_DRAFT_MESSAGE =
  "Done. I applied that update to your resume. What would you like to improve next?"
const REJECTED_DRAFT_MESSAGE =
  "Okay, I left your resume unchanged. If you want, I can suggest a different revision."

const waitForNextFrame = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })

const formatError = (error: unknown) => {
  if (error instanceof ChatAssistantRequestError) {
    return error.message
  }

  return "Something went wrong while talking to the chat service."
}

export function useChatAssistant() {
  const {
    hasHydrated,
    messages,
    notices,
    activeDraft,
    selectedModel,
    selectedMode,
    selectedPlanSection,
    pending,
    appendMessage,
    appendNotice,
    clearNotices,
    setActiveDraft,
    setSelectedModel,
    setSelectedMode,
    setSelectedPlanSection,
    setPending,
    clearConversation,
  } = useChatAssistantStore(useShallow((state) => ({
    hasHydrated: state.hasHydrated,
    messages: state.messages,
    notices: state.notices,
    activeDraft: state.activeDraft,
    selectedModel: state.selectedModel,
    selectedMode: state.selectedMode,
    selectedPlanSection: state.selectedPlanSection,
    pending: state.pending,
    appendMessage: state.appendMessage,
    appendNotice: state.appendNotice,
    clearNotices: state.clearNotices,
    setActiveDraft: state.setActiveDraft,
    setSelectedModel: state.setSelectedModel,
    setSelectedMode: state.setSelectedMode,
    setSelectedPlanSection: state.setSelectedPlanSection,
    setPending: state.setPending,
    clearConversation: state.clearConversation,
  })))
  const applyResumeData = useResumeStore((state) => state.setData)

  const applyDraftLocally = (draft = activeDraft) => {
    if (!draft) return false

    const currentResumeData = createResumeImportData(useResumeStore.getState())
    const applyResult = applyAiDraftChanges(currentResumeData, draft.proposedChanges)

    if (!applyResult.ok) {
      appendNotice("error", applyResult.error)
      return false
    }

    applyResumeData(applyResult.data)
    setActiveDraft(null)
    appendMessage("assistant", APPLIED_DRAFT_MESSAGE)
    return true
  }

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || pending) return false

    if (selectedMode === "plan" && !selectedPlanSection) {
      appendNotice("error", "Select a section before sending a plan request.")
      return false
    }

    clearNotices()
    appendMessage("user", trimmedMessage)
    setPending(true)

    try {
      const response = await sendChatAssistantRequest(
        createChatAssistantRequest({
          message: trimmedMessage,
          messages,
          mode: selectedMode,
          model: selectedModel,
          selectedPlanSection,
          resumeData: createResumeImportData(useResumeStore.getState()),
        }),
      )

      appendMessage("assistant", response.reply)

      for (const warning of response.warnings ?? []) {
        if (warning.trim()) {
          appendNotice("warning", warning.trim())
        }
      }

      switch (response.action) {
        case "propose_change":
          if (response.draft) {
            setActiveDraft(response.draft)
          } else {
            setActiveDraft(null)
            appendNotice("error", "The assistant proposed a change but did not return a draft to review.")
          }
          break
        case "unsupported_service":
        case "error":
          setActiveDraft(null)
          appendNotice("error", response.reply)
          break
        case "quota_unavailable":
          setActiveDraft(null)
          appendNotice("warning", response.reply)
          break
        default:
          setActiveDraft(null)
          break
      }

      return true
    } catch (error) {
      appendNotice("error", formatError(error))
      return false
    } finally {
      await waitForNextFrame()
      setPending(false)
    }
  }

  const acceptDraft = async () => {
    if (pending || !activeDraft) return
    applyDraftLocally(activeDraft)
  }

  const rejectDraft = () => {
    if (!activeDraft) return
    setActiveDraft(null)
    appendMessage("assistant", REJECTED_DRAFT_MESSAGE)
  }

  return {
    hasHydrated,
    messages,
    notices,
    activeDraft,
    selectedModel,
    selectedMode,
    selectedPlanSection,
    pending,
    sendMessage,
    acceptDraft,
    rejectDraft,
    clearConversation,
    setSelectedModel,
    setSelectedMode,
    setSelectedPlanSection,
  }
}
