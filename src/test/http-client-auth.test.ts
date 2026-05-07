import { describe, expect, it, vi, afterEach } from 'vitest'

import { httpClient } from '@/shared/api/http-client'

describe('httpClient authorization header', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds Authorization header when apiKey exists', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await httpClient.post({
      path: '/ai/chat',
      body: { x: 1 },
      baseUrl: 'http://localhost:3000',
      apiKey: 'secret',
    })

    const calls = fetchMock.mock.calls as unknown[][]
    const call = calls.at(0)
    expect(call).toBeTruthy()
    const init = (call ? call[1] : {}) as RequestInit
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer secret')
  })

  it('omits Authorization header when apiKey is missing', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await httpClient.post({
      path: '/ai/chat',
      body: { x: 1 },
      baseUrl: 'http://localhost:3000',
    })

    const calls = fetchMock.mock.calls as unknown[][]
    const call = calls.at(0)
    expect(call).toBeTruthy()
    const init = (call ? call[1] : {}) as RequestInit
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })
})
