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
    sectionOrder: ['workExperiences', 'personalProjects', 'education', 'certificates'],
    sectionVisibility: {
      workExperiences: true,
      personalProjects: true,
      education: true,
      certificates: true,
    },
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
    workExperiences: [{
      id: 'work-1',
      companyName: 'ACME',
      jobTitle: 'Engineer',
      startDate: '2024-01',
      endDate: '',
      current: false,
      location: 'Manila',
      summary: '',
      bulletPoints: ['Built feature A'],
    }],
    personalProjects: [{
      id: 'project-1',
      projectName: 'Resume Makinator',
      role: 'Lead',
      techStack: ['React'],
      url: '',
      summary: '',
      bulletPoints: ['Shipped MVP'],
    }],
    education: [{
      id: 'edu-1',
      schoolName: 'State University',
      degree: 'BS',
      fieldOfStudy: '',
      startDate: '2018-01',
      endDate: '',
      current: false,
      location: '',
      description: '',
    }],
    certificates: [{
      id: 'cert-1',
      name: 'Cloud Cert',
      issuer: 'Cert Org',
      issueDate: '',
      credentialId: '',
      credentialUrl: '',
      description: '',
    }],
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

describe('ResumeEditor missing fields', () => {
  it('renders and updates the required missing fields', async () => {
    await renderWithRouter(ResumeEditor)

    for (const expandButton of screen.getAllByRole('button', { name: 'Expand' })) {
      fireEvent.click(expandButton)
    }

    expect(screen.getAllByLabelText('Start Date').length).toBeGreaterThan(1)
    expect(screen.getAllByLabelText('End Date').length).toBeGreaterThan(1)
    expect(screen.getByLabelText('Currently working here')).toBeInTheDocument()
    expect(screen.getByLabelText('Project URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Field of Study')).toBeInTheDocument()
    expect(screen.getByLabelText('Issue Date')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Built feature A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Shipped MVP')).toBeInTheDocument()

    fireEvent.change(screen.getAllByLabelText('Start Date')[0]!, {
      target: { value: '2023-01' },
    })
    fireEvent.click(screen.getByLabelText('Currently working here'))
    fireEvent.change(screen.getByLabelText('Project URL'), {
      target: { value: 'https://project.example.com' },
    })
    fireEvent.change(screen.getAllByLabelText('Summary')[1]!, {
      target: { value: 'Project summary' },
    })
    fireEvent.change(screen.getByLabelText('Field of Study'), {
      target: { value: 'Computer Science' },
    })
    fireEvent.change(screen.getAllByLabelText('Description')[1]!, {
      target: { value: 'Certification notes' },
    })
    fireEvent.change(screen.getByLabelText('Issue Date'), {
      target: { value: '2025-01' },
    })

    await waitFor(() => {
      expect(updateActiveResumeContentMock).toHaveBeenCalled()
    })
  }, 15000)
})
