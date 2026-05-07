import { describe, expect, it } from 'vitest'

import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { mapToAiResumeData } from '@/features/chat-assistant/lib/map-to-ai-resume-data'

describe('mapToAiResumeData', () => {
  it('strips non-AI document metadata fields', () => {
    const document = createResumeDocument({
      title: 'My Private Title',
      version: 99,
    })

    const mapped = mapToAiResumeData(document.content)

    expect(mapped).not.toHaveProperty('title')
    expect(mapped).not.toHaveProperty('version')
    expect(mapped).not.toHaveProperty('createdAt')
    expect(mapped).not.toHaveProperty('updatedAt')
    expect(mapped).not.toHaveProperty('settings')
  })

  it('maps content to backend-compatible resume shape', () => {
    const document = createResumeDocument({
      content: {
        ...createResumeDocument().content,
        personalDetails: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '123',
          location: 'Manila',
          headline: 'Engineer',
          website: '',
          linkedin: '',
          github: '',
          summary: 'Summary text',
        },
        knownLanguages: [
          { id: 'lang-1', name: 'English', proficiency: 'Professional' },
        ],
        coreSkills: [
          { id: 'core-1', devLanguage: 'TypeScript', devFrameworks: ['React', 'Vite'] },
        ],
        softSkills: ['Communication'],
        workExperiences: [
          {
            id: 'work-1',
            companyName: 'Acme',
            jobTitle: 'Frontend Engineer',
            startDate: '2024',
            endDate: '2025',
            current: false,
            location: 'Remote',
            summary: 'Built features',
            bulletPoints: ['Shipped release'],
          },
        ],
        personalProjects: [
          {
            id: 'proj-1',
            projectName: 'Resume App',
            role: 'Lead Dev',
            techStack: ['React'],
            url: 'https://example.com',
            summary: 'Portfolio project',
            bulletPoints: ['Implemented export'],
          },
        ],
        education: [
          {
            id: 'edu-1',
            schoolName: 'State U',
            degree: 'BS',
            fieldOfStudy: 'CS',
            startDate: '2018',
            endDate: '2022',
            current: false,
            location: 'City',
            description: 'Graduated',
          },
        ],
        certificates: [
          {
            id: 'cert-1',
            name: 'Cert A',
            issuer: 'Org',
            issueDate: '2024',
            credentialId: 'abc',
            credentialUrl: 'https://cert',
            description: 'Certificate',
          },
        ],
        achievements: [
          {
            id: 'ach-1',
            title: 'Winner',
            issuer: 'Hackathon',
            date: '2025',
            description: 'Top prize',
          },
        ],
        references: [
          {
            id: 'ref-1',
            name: 'John',
            role: 'Manager',
            company: 'Acme',
            email: 'john@example.com',
            phone: '555',
          },
        ],
      },
    })

    const mapped = mapToAiResumeData(document.content)

    expect(mapped.personalDetails?.summary).toBe('Summary text')
    expect(mapped.personalDetails?.knownLanguages).toEqual(['English (Professional)'])
    expect(mapped.coreSkills?.[0]).toEqual({
      id: 'core-1',
      devLanguage: 'TypeScript',
      devFramework: ['React', 'Vite'],
    })
    expect(mapped.workExperiences?.[0]).toMatchObject({
      id: 'work-1',
      company: 'Acme',
      position: 'Frontend Engineer',
      briefSummary: 'Built features',
      bulletSummary: ['Shipped release'],
    })
    expect(mapped.personalProjects?.[0]).toMatchObject({
      id: 'proj-1',
      projectName: 'Resume App',
      projectDescription: 'Lead Dev',
      technologies: ['React'],
    })
    expect(mapped.education?.[0]).toMatchObject({
      school: 'State U',
      course: 'CS',
    })
    expect(mapped.certificates?.[0]).toMatchObject({
      certificateName: 'Cert A',
      date: '2024',
    })
    expect(mapped.achievements?.[0]).toMatchObject({
      achievementName: 'Winner',
      achievementDescription: 'Top prize',
    })
    expect(mapped.references?.[0]).toMatchObject({
      referenceName: 'John',
      referenceRole: 'Manager',
      referenceEmail: 'john@example.com',
    })
  })
})
