import { nanoid } from "nanoid"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import localforage from "@/shared/lib/localForage"
import type {
  ChatActionableDraft,
  ChatClarificationState,
  ChatConversationEntry,
  ChatMessageRole,
  ChatNoticeVariant,
  ChatPendingAction,
} from "@/features/chat-assistant/types"

type ChatAssistantStore = {
  hasHydrated: boolean
  entries: ChatConversationEntry[]
  activeDraft: ChatActionableDraft | null
  activeClarification: ChatClarificationState | null
  pendingAction: ChatPendingAction | null
  lastUserMessage: string | null
  pending: boolean
  setHasHydrated: () => void
  appendMessage: (role: ChatMessageRole, text: string) => void
  appendNotice: (variant: ChatNoticeVariant, text: string) => void
  setActiveDraft: (draft: ChatActionableDraft | null) => void
  setActiveClarification: (clarification: ChatClarificationState | null) => void
  setPendingAction: (pendingAction: ChatPendingAction | null) => void
  setLastUserMessage: (message: string | null) => void
  setPending: (value: boolean) => void
  clearConversation: () => void
}

type PersistedChatAssistantState = Pick<
  ChatAssistantStore,
  "entries" | "activeDraft" | "activeClarification" | "pendingAction" | "lastUserMessage"
>

export const useChatAssistantStore = create<ChatAssistantStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      entries: [],
      activeDraft: null,
      activeClarification: null,
      pendingAction: null,
      lastUserMessage: null,
      pending: false,
      setHasHydrated: () => set({ hasHydrated: true }),
      appendMessage: (role, text) =>
        set((state) => ({
          entries: [
            ...state.entries,
            { id: nanoid(), kind: "message", role, text },
          ],
        })),
      appendNotice: (variant, text) =>
        set((state) => ({
          entries: [
            ...state.entries,
            { id: nanoid(), kind: "notice", variant, text },
          ],
        })),
      setActiveDraft: (activeDraft) => set({ activeDraft }),
      setActiveClarification: (activeClarification) => set({ activeClarification }),
      setPendingAction: (pendingAction) => set({ pendingAction }),
      setLastUserMessage: (lastUserMessage) => set({ lastUserMessage }),
      setPending: (pending) => set({ pending }),
      clearConversation: () =>
        set({
          entries: [],
          activeDraft: null,
          activeClarification: null,
          pendingAction: null,
          lastUserMessage: null,
          pending: false,
        }),
    }),
    {
      name: "chatAssistantData",
      storage: createJSONStorage(() => localforage),
      partialize: (state): PersistedChatAssistantState => ({
        entries: state.entries,
        activeDraft: state.activeDraft,
        activeClarification: state.activeClarification,
        pendingAction: state.pendingAction,
        lastUserMessage: state.lastUserMessage,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
        state?.setPending(false)
      },
    },
  ),
)
