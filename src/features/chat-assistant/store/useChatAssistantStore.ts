import { nanoid } from "nanoid"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import localforage from "@/shared/lib/localForage"
import type {
  AiAssistantMode,
  AiDraft,
  AiModel,
  AiPlanTarget,
  ChatAssistantPersistedState,
  ChatMessageRecord,
  ChatNoticeRecord,
  ChatNoticeVariant,
} from "@/features/chat-assistant/types"

type ChatAssistantStore = {
  hasHydrated: boolean
  messages: ChatMessageRecord[]
  notices: ChatNoticeRecord[]
  activeDraft: AiDraft | null
  selectedModel: AiModel
  selectedMode: AiAssistantMode
  selectedPlanSection?: AiPlanTarget["section"]
  pending: boolean
  setHasHydrated: () => void
  appendMessage: (role: ChatMessageRecord["role"], content: string) => void
  appendNotice: (variant: ChatNoticeVariant, text: string) => void
  clearNotices: () => void
  setActiveDraft: (draft: AiDraft | null) => void
  setSelectedModel: (model: AiModel) => void
  setSelectedMode: (mode: AiAssistantMode) => void
  setSelectedPlanSection: (section?: AiPlanTarget["section"]) => void
  setPending: (value: boolean) => void
  clearConversation: () => void
}

const INITIAL_PERSISTED_STATE: ChatAssistantPersistedState = {
  messages: [],
  selectedModel: "gemini",
  selectedMode: "chat",
  selectedPlanSection: undefined,
  activeDraft: null,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isValidModel = (value: unknown): value is AiModel =>
  value === "gemini" || value === "nova" || value === "mistral" || value === "openai"

const isValidMode = (value: unknown): value is AiAssistantMode =>
  value === "chat" || value === "plan"

const isValidPlanSection = (value: unknown): value is AiPlanTarget["section"] =>
  value === "summary" ||
  value === "languages" ||
  value === "coreSkills" ||
  value === "softSkills" ||
  value === "workExperiences" ||
  value === "personalProjects" ||
  value === "education" ||
  value === "certificates" ||
  value === "achievements" ||
  value === "references"

const isValidMessage = (value: unknown): value is ChatMessageRecord =>
  isRecord(value) &&
  typeof value.id === "string" &&
  (value.role === "user" || value.role === "assistant") &&
  typeof value.content === "string"

const sanitizePersistedState = (persistedState: unknown): ChatAssistantPersistedState => {
  if (!isRecord(persistedState)) return INITIAL_PERSISTED_STATE

  const messages = Array.isArray(persistedState.messages)
    ? persistedState.messages.filter(isValidMessage)
    : []

  return {
    messages,
    selectedModel: isValidModel(persistedState.selectedModel)
      ? persistedState.selectedModel
      : INITIAL_PERSISTED_STATE.selectedModel,
    selectedMode: isValidMode(persistedState.selectedMode)
      ? persistedState.selectedMode
      : INITIAL_PERSISTED_STATE.selectedMode,
    selectedPlanSection: isValidPlanSection(persistedState.selectedPlanSection)
      ? persistedState.selectedPlanSection
      : undefined,
    activeDraft: isRecord(persistedState.activeDraft)
      ? (persistedState.activeDraft as AiDraft)
      : null,
  }
}

export const useChatAssistantStore = create<ChatAssistantStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      notices: [],
      pending: false,
      ...INITIAL_PERSISTED_STATE,
      setHasHydrated: () => set({ hasHydrated: true }),
      appendMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { id: nanoid(), role, content },
          ],
        })),
      appendNotice: (variant, text) =>
        set((state) => ({
          notices: [
            ...state.notices,
            { id: nanoid(), variant, text },
          ],
        })),
      clearNotices: () => set({ notices: [] }),
      setActiveDraft: (activeDraft) => set({ activeDraft }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setSelectedMode: (selectedMode) => set({ selectedMode }),
      setSelectedPlanSection: (selectedPlanSection) => set({ selectedPlanSection }),
      setPending: (pending) => set({ pending }),
      clearConversation: () =>
        set((state) => ({
          messages: [],
          notices: [],
          activeDraft: null,
          pending: false,
          selectedModel: state.selectedModel,
          selectedMode: state.selectedMode,
          selectedPlanSection: state.selectedPlanSection,
        })),
    }),
    {
      name: "chatAssistantData",
      version: 2,
      storage: createJSONStorage(() => localforage),
      partialize: (state): ChatAssistantPersistedState => ({
        messages: state.messages,
        activeDraft: state.activeDraft,
        selectedModel: state.selectedModel,
        selectedMode: state.selectedMode,
        selectedPlanSection: state.selectedPlanSection,
      }),
      migrate: (persistedState) => sanitizePersistedState(persistedState),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
        state?.setPending(false)
        state?.clearNotices()
      },
    },
  ),
)
