import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { SettingsPage } from '@/features/settings/SettingsPage'
import { renderWithRouter } from '@/test/router/render-with-router'

const {
  setAiApiKeyMock,
  setColorSchemeMock,
  setActiveResumeIdMock,
  initializeDocumentsMock,
  setActiveResumeMock,
  openConfirmModalMock,
  notificationsShowMock,
} = vi.hoisted(() => ({
  setAiApiKeyMock: vi.fn(async () => undefined),
  setColorSchemeMock: vi.fn(async () => undefined),
  setActiveResumeIdMock: vi.fn(async () => undefined),
  initializeDocumentsMock: vi.fn(async () => undefined),
  setActiveResumeMock: vi.fn(),
  openConfirmModalMock: vi.fn(),
  notificationsShowMock: vi.fn(),
}))

const activeResume = {
  id: 'resume-1',
  title: 'My Resume',
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  settings: {
    template: 'whitepaper',
    sectionOrder: [],
    sectionVisibility: {},
    fontScale: 1.0,
    accentColor: '#10B981',
  },
  content: {
    personalDetails: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      location: '',
      headline: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
    },
    workExperiences: [],
    personalProjects: [],
    education: [],
    certificates: [],
    achievements: [],
    references: [],
    coreSkills: [],
    softSkills: [],
    knownLanguages: [],
  },
} as const

vi.mock('@/entities/resume/store', () => {
  const appSettings = {
    id: 'singleton' as const,
    aiApiKey: 'existing-key',
    colorScheme: 'light' as const,
    activeResumeId: 'resume-1',
  }

  return {
    useAppSettingsStore: (selector: (state: {
      appSettings: typeof appSettings
      setAiApiKey: typeof setAiApiKeyMock
      setColorScheme: typeof setColorSchemeMock
      setActiveResumeId: typeof setActiveResumeIdMock
    }) => unknown) => {
      return selector({
        appSettings,
        setAiApiKey: setAiApiKeyMock,
        setColorScheme: setColorSchemeMock,
        setActiveResumeId: setActiveResumeIdMock,
      })
    },
    useActiveResumeStore: (selector: (state: {
      activeResume: typeof activeResume
      setActiveResume: typeof setActiveResumeMock
    }) => unknown) => {
      return selector({
        activeResume,
        setActiveResume: setActiveResumeMock,
      })
    },
    useResumeDocumentsStore: (selector: (state: { initialize: typeof initializeDocumentsMock }) => unknown) => {
      return selector({ initialize: initializeDocumentsMock })
    },
  }
})

vi.mock('@mantine/modals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/modals')>()
  return {
    ...actual,
    modals: {
      ...actual.modals,
      openConfirmModal: openConfirmModalMock,
    },
  }
})

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

describe('SettingsPage', () => {
  beforeEach(() => {
    setAiApiKeyMock.mockClear()
    setColorSchemeMock.mockClear()
    setActiveResumeIdMock.mockClear()
    initializeDocumentsMock.mockClear()
    setActiveResumeMock.mockClear()
    openConfirmModalMock.mockClear()
    notificationsShowMock.mockClear()
  })

  it('API key save and clear call settings store actions', async () => {
    await renderWithRouter(SettingsPage)

    fireEvent.change(screen.getByLabelText('AI Service API Key'), { target: { value: 'new-key' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save API Key' }))

    await waitFor(() => {
      expect(setAiApiKeyMock).toHaveBeenCalledWith('new-key')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear API Key' }))
    await waitFor(() => {
      expect(setAiApiKeyMock).toHaveBeenCalledWith(undefined)
    })
  })

  it('clear all data requires confirmation', async () => {
    await renderWithRouter(SettingsPage)
    fireEvent.click(screen.getByRole('button', { name: 'Clear all data' }))

    expect(openConfirmModalMock).toHaveBeenCalled()
  })
})
