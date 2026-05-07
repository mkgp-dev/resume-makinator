import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { ResumeSectionKey } from '@/entities/resume/model'
import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { WhitepaperTemplate } from '@/features/resume-preview/templates/whitepaper/WhitepaperTemplate'

vi.mock('@react-pdf/renderer', async () => {
  return {
    Document: ({ children }: { children: ReactNode }) => <div data-testid="pdf-document">{children}</div>,
    Page: ({ children }: { children: ReactNode }) => <div data-testid="pdf-page">{children}</div>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    View: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    StyleSheet: { create: <T,>(value: T) => value },
    Font: { register: vi.fn() },
  }
})

describe('WhitepaperTemplate', () => {
  it('renders a valid ResumeDocument without throwing', () => {
    const resume = createResumeDocument({
      content: {
        ...createResumeDocument().content,
        personalDetails: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '',
          location: '',
          headline: 'Senior Frontend Engineer',
          website: '',
          linkedin: '',
          github: '',
          summary: '',
        },
      },
    })

    expect(() => render(<WhitepaperTemplate resume={resume} />)).not.toThrow()
  })

  it('does not render hidden sections', () => {
    const base = createResumeDocument()
    const resume = {
      ...base,
      settings: {
        ...base.settings,
        sectionOrder: ['workExperiences', 'education'] as ResumeSectionKey[],
        sectionVisibility: {
          ...base.settings.sectionVisibility,
          workExperiences: false,
          education: true,
        },
      },
      content: {
        ...base.content,
        workExperiences: [{ id: 'w1', companyName: 'ACME', jobTitle: '', startDate: '', endDate: '', current: false, location: '', summary: '', bulletPoints: [] }],
        education: [{ id: 'e1', schoolName: 'State University', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, location: '', description: '' }],
      },
    }

    render(<WhitepaperTemplate resume={resume} />)

    expect(screen.queryByText('Work Experience')).not.toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('respects section ordering', () => {
    const base = createResumeDocument()
    const resume = {
      ...base,
      settings: {
        ...base.settings,
        sectionOrder: ['education', 'workExperiences'] as ResumeSectionKey[],
        sectionVisibility: {
          ...base.settings.sectionVisibility,
          workExperiences: true,
          education: true,
        },
      },
      content: {
        ...base.content,
        workExperiences: [{ id: 'w1', companyName: 'ACME', jobTitle: '', startDate: '', endDate: '', current: false, location: '', summary: '', bulletPoints: [] }],
        education: [{ id: 'e1', schoolName: 'State University', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, location: '', description: '' }],
      },
    }

    const { container } = render(<WhitepaperTemplate resume={resume} />)
    const output = container.textContent ?? ''

    expect(output.indexOf('Education')).toBeLessThan(output.indexOf('Work Experience'))
  })
})
