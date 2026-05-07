import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { ResumeDocument } from '@/entities/resume/model'
import { ResumePreviewPanel } from '@/features/resume-preview/components/ResumePreviewPanel'
import { renderWithRouter } from '@/test/router/render-with-router'

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

function createResume(overrides?: Partial<ResumeDocument['content']['personalDetails']>): ResumeDocument {
  return {
    id: 'resume-1',
    title: 'My Resume',
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    settings: {
      template: 'whitepaper',
      sectionOrder: ['personalDetails', 'workExperiences'],
      sectionVisibility: { personalDetails: true, workExperiences: true },
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
        ...overrides,
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
  }
}

describe('ResumePreviewPanel', () => {
  it('shows no resume loaded when resume is null', async () => {
    await renderWithRouter(() => <ResumePreviewPanel resume={null} />)

    expect(screen.getByText('No resume loaded.')).toBeInTheDocument()
    expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument()
  })

  it('shows placeholder when personal details are empty', async () => {
    await renderWithRouter(() => <ResumePreviewPanel resume={createResume()} />)

    expect(screen.getByText('Fill in your details to see a live preview')).toBeInTheDocument()
    expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument()
  })

  it('renders PDF viewer when resume has meaningful details', async () => {
    await renderWithRouter(() => <ResumePreviewPanel resume={createResume({ fullName: 'Jane Doe' })} />)

    expect(await screen.findByTestId('pdf-viewer', {}, { timeout: 5000 })).toBeInTheDocument()
  }, 10000)

  it('renders PDF viewer when non-personal section has content', async () => {
    const resumeWithWork = createResume()
    resumeWithWork.content.workExperiences.push({
      id: 'work-1',
      companyName: 'Acme Corp',
      jobTitle: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      summary: '',
      bulletPoints: [],
    })

    await renderWithRouter(() => <ResumePreviewPanel resume={resumeWithWork} />)

    expect(await screen.findByTestId('pdf-viewer', {}, { timeout: 5000 })).toBeInTheDocument()
  }, 10000)
})
