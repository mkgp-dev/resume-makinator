import { describe, expect, it, vi, afterEach } from 'vitest'

import { postAiChat } from '@/features/chat-assistant/api/post-ai-chat'
import type { AiChatRequest } from '@/features/chat-assistant/model/ai-contract'

const baseRequest: AiChatRequest = {
  service: 'resume',
  mode: 'chat',
  model: 'gemini',
  message: 'Help me improve my summary',
}

describe('postAiChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('targets /ai/chat endpoint and never /ai/generate', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      action: 'chat_reply',
      reply: 'Sure',
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await postAiChat(baseRequest)

    const calls = fetchMock.mock.calls as unknown[][]
    const call = calls.at(0)
    expect(call).toBeTruthy()
    const url = String(call ? call[0] : '')
    expect(url).toContain('/ai/chat')
    expect(url).not.toContain('/ai/generate')
  })

  it('accepts all required response actions', async () => {
    const actions = [
      'chat_reply',
      'resume_review',
      'section_advice',
      'ask_clarification',
      'propose_change',
      'quota_unavailable',
      'error',
    ] as const

    for (const action of actions) {
      const payload = action === 'propose_change'
        ? {
            action,
            reply: 'Draft ready',
            draft: {
              title: 'Improve summary',
              target: { section: 'summary' },
              previewText: 'Updated summary',
              proposedChanges: [
                { type: 'replace_field', section: 'personalDetails', field: 'summary', value: 'New summary' },
              ],
            },
            warnings: ['Check details'],
          }
        : { action, reply: 'OK', warnings: [] }

      const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }))
      vi.stubGlobal('fetch', fetchMock)

      const result = await postAiChat(baseRequest)
      expect(result.action).toBe(action)
      if (action === 'propose_change') {
        expect(result.draft?.title).toBe('Improve summary')
      }
    }
  })
})
