import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ResumeEditor } from '@/features/resume-editor/components/ResumeEditor'
import { renderWithRouter } from '@/test/router/render-with-router'

const updateActiveResumeContentMock = vi.fn(async () => undefined)

const activeResume = {
  id: 'resume-1',
  title: 'My Resume',
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  settings: {
    template: 'whitepaper',
    sectionOrder: ['softSkills'],
    sectionVisibility: { softSkills: false },
    fontScale: 1.0,
    accentColor: '#10B981',
  },
  content: {
    personalDetails: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
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
    softSkills: ['Collaboration'],
    knownLanguages: [],
  },
} as const

vi.mock('@/entities/resume/store', () => {
  return {
    useActiveResumeStore: (selector: (state: {
      activeResume: typeof activeResume
      updateActiveResumeContent: typeof updateActiveResumeContentMock
    }) => unknown) =>
      selector({
        activeResume,
        updateActiveResumeContent: updateActiveResumeContentMock,
      }),
  }
})

describe('ResumeEditor hidden sections', () => {
  it('shows hidden badge and preserves section data', async () => {
    await renderWithRouter(ResumeEditor)

    expect(screen.getByText('Hidden in preview')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Collaboration')).toBeInTheDocument()
  })
})
