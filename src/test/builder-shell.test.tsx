import { screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BuilderShell } from '@/app/shell/BuilderShell'
import { renderWithRouter } from '@/test/router/render-with-router'

const updateActiveResumeSettingsMock = vi.fn(async (updater: (value: unknown) => unknown) => updater)

const resume = {
  id: 'resume-1',
  title: 'My Resume',
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  settings: {
    template: 'whitepaper',
    sectionOrder: [
      'personalDetails',
      'workExperiences',
      'personalProjects',
      'education',
      'coreSkills',
      'softSkills',
      'knownLanguages',
      'certificates',
      'achievements',
      'references',
    ],
    sectionVisibility: {},
    fontScale: 1.0,
    accentColor: '#10B981',
  },
  content: {
    personalDetails: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      headline: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
    },
    workExperiences: [
      {
        id: 'work-1',
        companyName: 'Acme',
        jobTitle: 'Engineer',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        summary: '',
        bulletPoints: [],
      },
      {
        id: 'work-2',
        companyName: 'Beta',
        jobTitle: 'Developer',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        summary: '',
        bulletPoints: [],
      },
    ],
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

const useMediaQueryMock = vi.fn((query: string) => query === '(max-width: 767px)' ? false : false)

vi.mock('@mantine/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/hooks')>()
  return {
    ...actual,
    useMediaQuery: (query: string) => useMediaQueryMock(query),
  }
})

vi.mock('@react-pdf/renderer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-pdf/renderer')>()
  return {
    ...actual,
    PDFViewer: ({ children }: { children: ReactNode }) => <div data-testid="pdf-viewer">{children}</div>,
    Document: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Page: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    View: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    StyleSheet: { create: <T,>(value: T) => value },
    Font: { register: vi.fn() },
  }
})

vi.mock('@/entities/resume/store', () => {
  return {
    useActiveResumeStore: (selector: (state: {
      activeResume: typeof resume
      updateActiveResumeSettings: typeof updateActiveResumeSettingsMock
    }) => unknown) => {
      return selector({
        activeResume: resume,
        updateActiveResumeSettings: updateActiveResumeSettingsMock,
      })
    },
  }
})

vi.mock('@/features/chat-assistant/components/ChatAssistantDrawer', () => ({
  ChatAssistantDrawer: () => <div data-testid="chat-assistant-drawer" />,
}))

vi.mock('@/features/resume-editor/components/ResumeEditor', () => ({
  ResumeEditor: () => <input aria-label="Full Name" />,
}))

vi.mock('@/features/resume-preview/components/ResumePreviewPanel', () => ({
  ResumePreviewPanel: () => <div data-testid="builder-preview-region" />,
}))

describe('BuilderShell', () => {
  beforeEach(() => {
    useMediaQueryMock.mockReturnValue(false)
  })

  it('renders header text Resume Makinator', async () => {
    await renderWithRouter(BuilderShell)

    expect(screen.getByText('Resume Makinator')).toBeInTheDocument()
  })

  it('renders desktop navigation, editor, and preview regions', async () => {
    await renderWithRouter(BuilderShell)

    expect(screen.getByTestId('builder-navigation-region')).toBeInTheDocument()
    expect(screen.getByTestId('builder-editor-region')).toBeInTheDocument()
    expect(screen.getByTestId('builder-preview-region')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
  })

  it('renders mobile tabs for Editor, Sections, and Preview', async () => {
    useMediaQueryMock.mockReturnValue(true)

    await renderWithRouter(BuilderShell)

    expect(screen.getByRole('tab', { name: 'Editor' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Sections' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument()
  })

  it('applies section count badge rules', async () => {
    await renderWithRouter(BuilderShell)
    const navigationRegion = screen.getByTestId('builder-navigation-region')

    expect(within(navigationRegion).queryByText(/0 entries/i)).not.toBeInTheDocument()
    expect(within(navigationRegion).queryByText(/1 entries/i)).not.toBeInTheDocument()

    const personalDetailsLabel = within(navigationRegion).getByText('Personal Details')
    const personalDetailsRow = personalDetailsLabel.closest('.section-nav-row')
    expect(personalDetailsRow).not.toBeNull()
    expect(within(personalDetailsRow as HTMLElement).queryByText(/entry|entries/i)).not.toBeInTheDocument()

    const workLabel = within(navigationRegion).getByText('Work Experience')
    const workRow = workLabel.closest('.section-nav-row')
    expect(workRow).not.toBeNull()
    expect(within(workRow as HTMLElement).getByText('2 entries')).toBeInTheDocument()
  })
})
