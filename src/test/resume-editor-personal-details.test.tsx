import { fireEvent, screen, waitFor } from '@testing-library/react'
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
    sectionOrder: ['personalDetails'],
    sectionVisibility: { personalDetails: true },
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
    softSkills: [],
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

describe('PersonalDetailsForm', () => {
  it('calls updateActiveResumeContent after field change', async () => {
    await renderWithRouter(ResumeEditor)

    fireEvent.change(screen.getByLabelText('Professional Headline'), {
      target: { value: 'Senior Frontend Engineer' },
    })

    await waitFor(
      () => {
        expect(updateActiveResumeContentMock).toHaveBeenCalled()
      },
      { timeout: 1000 },
    )
  })
})
