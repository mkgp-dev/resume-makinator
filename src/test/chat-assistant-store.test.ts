import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useActiveResumeStore } from '@/entities/resume/store'
import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import type { AiDraft } from '@/features/chat-assistant/model/ai-contract'
import { useChatAssistantStore } from '@/features/chat-assistant/store/use-chat-assistant-store'

const { postAiChatMock, notificationsShowMock } = vi.hoisted(() => {
  return {
    postAiChatMock: vi.fn(),
    notificationsShowMock: vi.fn(),
  }
})

vi.mock('@/features/chat-assistant/api/post-ai-chat', () => ({
  postAiChat: postAiChatMock,
}))

vi.mock('@mantine/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/notifications')>()
  return {
    ...actual,
    notifications: {
      ...actual.notifications,
      show: notificationsShowMock,
    },
  }
})

describe('useChatAssistantStore', () => {
  beforeEach(() => {
    postAiChatMock.mockReset()
    notificationsShowMock.mockReset()
    useChatAssistantStore.setState({
      isOpen: false,
      mode: 'chat',
      model: 'gemini',
      messages: [],
      pendingDraft: null,
      isLoading: false,
      flashSections: [],
    })

    const active = createResumeDocument()
    useActiveResumeStore.setState({
      activeResume: active,
      setActiveResume: vi.fn(),
      loadActiveResumeById: vi.fn(),
      updateActiveResumeContent: vi.fn(async (updater) => {
        const current = useActiveResumeStore.getState().activeResume
        if (!current) {
          return
        }
        useActiveResumeStore.setState({
          activeResume: {
            ...current,
            content: updater(current.content),
          },
        })
      }),
      updateActiveResumeSettings: vi.fn(async (updater) => {
        const current = useActiveResumeStore.getState().activeResume
        if (!current) {
          return
        }
        useActiveResumeStore.setState({
          activeResume: {
            ...current,
            settings: updater(current.settings),
          },
        })
      }),
    })
  })

  it('applyDraft handles show_section via settings update', async () => {
    const draft: AiDraft = {
      title: 'Show section',
      target: { section: 'coreSkills' as const },
      previewText: 'Enable core skills',
      proposedChanges: [
        { type: 'show_section', section: 'coreSkills', value: true, required: true },
      ],
    }

    await useChatAssistantStore.getState().applyDraft(draft)
    const active = useActiveResumeStore.getState().activeResume
    expect(active?.settings.sectionVisibility.coreSkills).toBe(true)
  })

  it('discardDraft clears pendingDraft', () => {
    useChatAssistantStore.setState({
      pendingDraft: {
        title: 'Draft',
        target: { section: 'summary' },
        previewText: 'x',
        proposedChanges: [],
      },
    })

    useChatAssistantStore.getState().discardDraft()
    expect(useChatAssistantStore.getState().pendingDraft).toBeNull()
  })

  it('sendMessage maps unknown action to safe inline error', async () => {
    postAiChatMock.mockResolvedValue({
      action: 'unexpected',
      reply: 'Unknown',
    })

    await useChatAssistantStore.getState().sendMessage('Hello')
    const last = useChatAssistantStore.getState().messages.at(-1)
    expect(last?.role).toBe('error')
    expect(last?.content).toContain('unexpected response')
  })
})
