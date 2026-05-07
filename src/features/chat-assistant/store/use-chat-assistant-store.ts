import { notifications } from '@mantine/notifications'
import { create } from 'zustand'

import type { ResumeSectionKey, ResumeSettings } from '@/entities/resume/model'
import { useActiveResumeStore, useAppSettingsStore } from '@/entities/resume/store'
import { postAiChat } from '@/features/chat-assistant/api/post-ai-chat'
import { applyProposedChanges, extractFlashSectionsFromDraft } from '@/features/chat-assistant/lib/apply-ai-draft'
import { mapToAiResumeData } from '@/features/chat-assistant/lib/map-to-ai-resume-data'
import type { AiDraft, AiModel, AiPlanTarget, AiChatResponse, AiChatRequest } from '@/features/chat-assistant/model/ai-contract'

type ChatAssistantMode = 'chat' | 'plan'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
  action?: AiChatResponse['action']
  timestamp: string
}

type ChatAssistantState = {
  isOpen: boolean
  mode: ChatAssistantMode
  model: AiModel
  messages: ChatMessage[]
  pendingDraft: AiDraft | null
  isLoading: boolean
  isApplyingDraft: boolean
  flashSections: ResumeSectionKey[]
  open: () => void
  close: () => void
  setMode: (mode: ChatAssistantMode) => void
  setModel: (model: AiModel) => void
  sendMessage: (text: string, target?: AiPlanTarget) => Promise<void>
  applyDraft: (draft: AiDraft) => Promise<void>
  discardDraft: () => void
  clearConversation: () => void
}

function toMessage(role: ChatMessage['role'], content: string, action?: ChatMessage['action']): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    action,
    timestamp: new Date().toISOString(),
  }
}

function buildRecentMessages(messages: ChatMessage[]): AiChatRequest['recentMessages'] {
  const isAiConversationMessage = (
    message: ChatMessage,
  ): message is ChatMessage & { role: 'user' | 'assistant' } =>
    message.role === 'user' || message.role === 'assistant'

  return messages
    .filter(isAiConversationMessage)
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
}

function mapResponseToThreadMessage(response: AiChatResponse): ChatMessage {
  if (response.action === 'quota_unavailable') {
    return toMessage('error', 'AI quota reached. Add your own API key in Settings.', response.action)
  }
  if (response.action === 'error') {
    return toMessage('error', 'AI is temporarily unavailable. Please try again.', response.action)
  }
  if (
    response.action === 'chat_reply'
    || response.action === 'resume_review'
    || response.action === 'section_advice'
    || response.action === 'ask_clarification'
    || response.action === 'propose_change'
  ) {
    return toMessage('assistant', response.reply, response.action)
  }
  return toMessage('error', 'AI returned an unexpected response. Please try again.', 'error')
}

function convertShowSection(section: string): ResumeSectionKey | null {
  const map: Record<string, ResumeSectionKey> = {
    summary: 'personalDetails',
    language: 'knownLanguages',
    coreSkills: 'coreSkills',
    softSkills: 'softSkills',
    workExperiences: 'workExperiences',
    personalProjects: 'personalProjects',
    education: 'education',
    certificates: 'certificates',
    achievements: 'achievements',
    references: 'references',
  }
  return map[section] ?? null
}

export const useChatAssistantStore = create<ChatAssistantState>((set, get) => ({
  isOpen: false,
  mode: 'chat',
  model: 'gemini',
  messages: [],
  pendingDraft: null,
  isLoading: false,
  isApplyingDraft: false,
  flashSections: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
  setModel: (model) => set({ model }),
  sendMessage: async (text, target) => {
    const trimmed = text.trim()
    if (!trimmed || get().isLoading) {
      return
    }

    const userMessage = toMessage('user', trimmed)
    const mode = get().mode
    const model = get().model
    const existing = get().messages
    const activeResume = useActiveResumeStore.getState().activeResume
    const aiApiKey = useAppSettingsStore.getState().appSettings.aiApiKey

    set({
      isLoading: true,
      messages: [...existing, userMessage],
    })

    try {
      const response = await postAiChat(
        {
          service: 'resume',
          mode,
          model,
          message: trimmed,
          resumeData: activeResume ? mapToAiResumeData(activeResume.content) : undefined,
          recentMessages: buildRecentMessages([...existing, userMessage]),
          ...(mode === 'plan' ? { target } : {}),
        },
        { apiKey: aiApiKey },
      )

      const nextMessages = [...get().messages, mapResponseToThreadMessage(response)]
      set({
        messages: nextMessages,
        pendingDraft: response.action === 'propose_change' ? response.draft ?? null : get().pendingDraft,
      })
    } catch {
      set({
        messages: [...get().messages, toMessage('error', 'AI is temporarily unavailable. Please try again.', 'error')],
      })
    } finally {
      set({ isLoading: false })
    }
  },
  applyDraft: async (draft) => {
    set({ isApplyingDraft: true })
    const activeStore = useActiveResumeStore.getState()
    try {
      await activeStore.updateActiveResumeContent((content) => applyProposedChanges(content, draft.proposedChanges))

    const showSections = draft.proposedChanges
      .filter((change) => change.type === 'show_section')
      .map((change) => convertShowSection(change.section))
      .filter((section): section is ResumeSectionKey => section !== null)

      if (showSections.length > 0) {
        await activeStore.updateActiveResumeSettings((settings: ResumeSettings) => {
          const nextVisibility = { ...settings.sectionVisibility }
          for (const section of showSections) {
            nextVisibility[section] = true
          }
          return {
            ...settings,
            sectionVisibility: nextVisibility,
          }
        })
      }

      const flashSections = extractFlashSectionsFromDraft(draft.proposedChanges)
      set({
        pendingDraft: null,
        flashSections,
      })

      window.setTimeout(() => {
        useChatAssistantStore.setState({ flashSections: [] })
      }, 1000)

      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Changes applied.',
      })
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to apply draft.',
      })
    } finally {
      set({ isApplyingDraft: false })
    }
  },
  discardDraft: () => set({ pendingDraft: null }),
  clearConversation: () => set({ messages: [], pendingDraft: null }),
}))
