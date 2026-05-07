import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ensureBuilderHasActiveResume,
  resetRouterInitializationForTests,
  shouldRedirectLandingToBuilder,
} from '@/app/router/router-init'

const initializeAppSettingsMock = vi.fn(async () => undefined)
const initializeDocumentsMock = vi.fn(async () => undefined)
const createDocumentMock = vi.fn(async () => ({ id: 'resume-created' }))
const setActiveResumeIdMock = vi.fn(async () => undefined)
const loadActiveResumeByIdMock = vi.fn(async () => undefined)

let documents: Array<{ id: string }> = []
let activeResumeId: string | null = null

vi.mock('@/entities/resume/store', () => {
  return {
    useAppSettingsStore: {
      getState: () => ({
        appSettings: { activeResumeId },
        initialize: initializeAppSettingsMock,
        setActiveResumeId: setActiveResumeIdMock,
      }),
    },
    useResumeDocumentsStore: {
      getState: () => ({
        documents,
        initialize: initializeDocumentsMock,
        createDocument: createDocumentMock,
      }),
    },
    useActiveResumeStore: {
      getState: () => ({
        loadActiveResumeById: loadActiveResumeByIdMock,
      }),
    },
  }
})

describe('router guards', () => {
  beforeEach(() => {
    documents = []
    activeResumeId = null
    initializeAppSettingsMock.mockClear()
    initializeDocumentsMock.mockClear()
    createDocumentMock.mockClear()
    setActiveResumeIdMock.mockClear()
    loadActiveResumeByIdMock.mockClear()
    resetRouterInitializationForTests()
  })

  it('redirects landing to builder when documents exist', async () => {
    documents = [{ id: 'resume-1' }]

    await expect(shouldRedirectLandingToBuilder()).resolves.toBe(true)
  })

  it('does not redirect landing when no documents exist', async () => {
    await expect(shouldRedirectLandingToBuilder()).resolves.toBe(false)
  })

  it('creates and loads a resume when none exists', async () => {
    const activeId = await ensureBuilderHasActiveResume()

    expect(createDocumentMock).toHaveBeenCalledTimes(1)
    expect(setActiveResumeIdMock).toHaveBeenCalledWith('resume-created')
    expect(loadActiveResumeByIdMock).toHaveBeenCalledWith('resume-created')
    expect(activeId).toBe('resume-created')
  })

  it('uses existing active resume id when available', async () => {
    documents = [{ id: 'resume-1' }]
    activeResumeId = 'resume-1'

    const activeId = await ensureBuilderHasActiveResume()

    expect(createDocumentMock).not.toHaveBeenCalled()
    expect(setActiveResumeIdMock).not.toHaveBeenCalled()
    expect(loadActiveResumeByIdMock).toHaveBeenCalledWith('resume-1')
    expect(activeId).toBe('resume-1')
  })
})
