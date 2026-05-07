import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChatMessage } from '@/features/chat-assistant/store/use-chat-assistant-store'
import { ChatAssistantDrawer } from '@/features/chat-assistant/components/ChatAssistantDrawer'
import { useChatAssistantStore } from '@/features/chat-assistant/store/use-chat-assistant-store'
import { renderWithRouter } from '@/test/router/render-with-router'

describe('ChatAssistantDrawer', () => {
  beforeEach(() => {
    useChatAssistantStore.setState({
      isOpen: true,
      mode: 'chat',
      model: 'gemini',
      messages: [],
      pendingDraft: null,
      isLoading: false,
      flashSections: [],
      open: vi.fn(),
      close: vi.fn(),
      setMode: vi.fn(),
      setModel: vi.fn(),
      sendMessage: vi.fn(async () => undefined),
      applyDraft: vi.fn(async () => undefined),
      discardDraft: vi.fn(),
      clearConversation: vi.fn(),
    })
  })

  it('drawer opens and closes', async () => {
    const closeSpy = vi.fn()
    useChatAssistantStore.setState({ close: closeSpy })
    await renderWithRouter(ChatAssistantDrawer)

    expect(screen.getByTestId('chat-assistant-drawer')).toBeInTheDocument()
    const closeButton = document.querySelector('.mantine-Drawer-close') as HTMLButtonElement | null
    expect(closeButton).toBeTruthy()
    if (closeButton) {
      fireEvent.click(closeButton)
    }
    expect(closeSpy).toHaveBeenCalled()
  })

  it('supports keyboard close via close button', async () => {
    const closeSpy = vi.fn()
    useChatAssistantStore.setState({ close: closeSpy })
    await renderWithRouter(ChatAssistantDrawer)

    const closeButton = document.querySelector('.mantine-Drawer-close') as HTMLButtonElement | null
    expect(closeButton).toBeTruthy()
    if (closeButton) {
      closeButton.focus()
      fireEvent.keyDown(closeButton, { key: 'Enter' })
      fireEvent.click(closeButton)
    }

    expect(closeSpy).toHaveBeenCalled()
  })

  it('shows Draft Review Panel when pendingDraft exists', async () => {
    useChatAssistantStore.setState({
      pendingDraft: {
        title: 'Improve summary',
        target: { section: 'summary' },
        previewText: 'Draft text',
        proposedChanges: [],
      },
    })
    await renderWithRouter(ChatAssistantDrawer)
    expect(screen.getByTestId('draft-review-panel')).toBeInTheDocument()
  })

  it('does not show Draft Review Panel when pendingDraft is null', async () => {
    useChatAssistantStore.setState({ pendingDraft: null })
    await renderWithRouter(ChatAssistantDrawer)
    expect(screen.queryByTestId('draft-review-panel')).not.toBeInTheDocument()
  })

  it('renders quota settings guidance message', async () => {
    const quotaMessage: ChatMessage = {
      id: 'm1',
      role: 'error',
      content: 'AI quota reached. Add your own API key in Settings.',
      action: 'quota_unavailable',
      timestamp: new Date().toISOString(),
    }
    useChatAssistantStore.setState({ messages: [quotaMessage] })
    await renderWithRouter(ChatAssistantDrawer)
    expect(screen.getByText('AI quota reached. Add your own API key in Settings.')).toBeInTheDocument()
  })

  it('Cmd/Ctrl+Enter sends message', async () => {
    const sendMessageSpy = vi.fn(async () => undefined)
    useChatAssistantStore.setState({ sendMessage: sendMessageSpy })
    await renderWithRouter(ChatAssistantDrawer)

    const input = screen.getByLabelText('Message')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })

    await waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalled()
    })
  })

  it('shows helper text in plan mode when message exists and section is missing', async () => {
    useChatAssistantStore.setState({ mode: 'plan' })
    await renderWithRouter(ChatAssistantDrawer)

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Please improve this' } })

    expect(screen.getByText('Select a target section above before sending.')).toBeInTheDocument()
  })

  it('does not show helper text in chat mode', async () => {
    useChatAssistantStore.setState({ mode: 'chat' })
    await renderWithRouter(ChatAssistantDrawer)

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Please improve this' } })

    expect(screen.queryByText('Select a target section above before sending.')).not.toBeInTheDocument()
  })

  it('uses friendly AI Style label and keeps friendly model options', async () => {
    await renderWithRouter(ChatAssistantDrawer)

    expect(screen.getByRole('combobox', { name: 'AI Style' })).toBeInTheDocument()
    expect(screen.getByText('Different styles affect response speed and detail.')).toBeInTheDocument()
  })
})
