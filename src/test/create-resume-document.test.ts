import { describe, expect, it, vi } from 'vitest'

import { createResumeDocument } from '@/entities/resume/utils'

describe('createResumeDocument', () => {
  it('creates v4 default shape and settings', () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-1111-1111-111111111111',
    )

    const document = createResumeDocument()

    expect(document.id).toBe('11111111-1111-1111-1111-111111111111')
    expect(document.title).toBe('My Resume')
    expect(document.version).toBe(1)
    expect(document.settings.template).toBe('whitepaper')
    expect(document.settings.sectionOrder).toEqual([
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
    ])
    expect(document.settings.sectionVisibility).toEqual({
      personalDetails: true,
      workExperiences: true,
      personalProjects: true,
      education: true,
      coreSkills: true,
      softSkills: true,
      knownLanguages: false,
      certificates: false,
      achievements: false,
      references: false,
    })
    expect(document.content.personalDetails).toEqual({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      headline: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
    })
  })
})
