import { describe, expect, it } from 'vitest'

import type { ResumeContent } from '@/entities/resume/model'
import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { applyProposedChanges } from '@/features/chat-assistant/lib/apply-ai-draft'
import type { ProposedChange } from '@/features/chat-assistant/model/ai-contract'

describe('applyProposedChanges', () => {
  it('handles every ProposedChange variant from Appendix A', () => {
    const base = createResumeDocument().content
    const seeded: ResumeContent = {
      ...base,
      coreSkills: [{ id: 'core-1', devLanguage: 'TypeScript', devFrameworks: ['React'] }],
      workExperiences: [{ id: 'w1', companyName: 'Acme', jobTitle: 'Dev', startDate: '', endDate: '', current: false, location: '', summary: '', bulletPoints: [] }],
      personalProjects: [{ id: 'p1', projectName: 'Proj', role: '', techStack: [], url: '', summary: '', bulletPoints: [] }],
      education: [{ id: 'e1', schoolName: 'School', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, location: '', description: '' }],
      certificates: [{ id: 'c1', name: 'Cert', issuer: '', issueDate: '', credentialId: '', credentialUrl: '', description: '' }],
      achievements: [{ id: 'a1', title: 'Award', issuer: '', date: '', description: '' }],
      references: [{ id: 'r1', name: 'Ref', role: '', company: '', email: '', phone: '' }],
      softSkills: ['Communication'],
      knownLanguages: [{ id: 'l1', name: 'English', proficiency: 'Native' }],
      personalDetails: { ...base.personalDetails, summary: 'Old summary' },
    }

    const changes: ProposedChange[] = [
      { type: 'replace_field', section: 'personalDetails', field: 'summary', value: 'New summary' },
      { type: 'replace_list', section: 'personalDetails.knownLanguages', value: ['English', 'Spanish'] },
      { type: 'append_item', section: 'personalDetails.knownLanguages', value: 'French' },
      { type: 'replace_list', section: 'coreSkills', value: [{ devLanguage: 'Go', devFramework: ['Gin'] }] },
      { type: 'append_item', section: 'coreSkills', value: { devLanguage: 'Rust', devFramework: ['Actix'] } },
      { type: 'update_item', section: 'coreSkills', itemId: 'core-1', value: { devLanguage: 'TS', devFramework: ['React', 'Vite'] } },
      { type: 'delete_item', section: 'coreSkills', itemId: 'core-1' },
      { type: 'replace_list', section: 'softSkills', value: ['Leadership'] },
      { type: 'append_item', section: 'softSkills', value: 'Mentoring' },
      { type: 'append_item', section: 'workExperiences', value: { company: 'Beta', position: 'Engineer' } },
      { type: 'update_item', section: 'workExperiences', itemId: 'w1', value: { company: 'Acme Updated' } },
      { type: 'delete_item', section: 'workExperiences', itemId: 'w1' },
      { type: 'append_item', section: 'personalProjects', value: { projectName: 'Proj B' } },
      { type: 'update_item', section: 'personalProjects', itemId: 'p1', value: { projectName: 'Proj Updated' } },
      { type: 'delete_item', section: 'personalProjects', itemId: 'p1' },
      { type: 'append_item', section: 'education', value: { school: 'Uni' } },
      { type: 'update_item', section: 'education', itemId: 'e1', value: { school: 'Uni Updated' } },
      { type: 'delete_item', section: 'education', itemId: 'e1' },
      { type: 'append_item', section: 'certificates', value: { certificateName: 'Cert B' } },
      { type: 'update_item', section: 'certificates', itemId: 'c1', value: { certificateName: 'Cert Updated' } },
      { type: 'delete_item', section: 'certificates', itemId: 'c1' },
      { type: 'append_item', section: 'achievements', value: { achievementName: 'Award B' } },
      { type: 'update_item', section: 'achievements', itemId: 'a1', value: { achievementName: 'Award Updated' } },
      { type: 'delete_item', section: 'achievements', itemId: 'a1' },
      { type: 'append_item', section: 'references', value: { referenceName: 'Ref B' } },
      { type: 'update_item', section: 'references', itemId: 'r1', value: { referenceName: 'Ref Updated' } },
      { type: 'delete_item', section: 'references', itemId: 'r1' },
      { type: 'show_section', section: 'coreSkills', value: true, required: true },
    ]

    const result = applyProposedChanges(seeded, changes)

    expect(result.personalDetails.summary).toBe('New summary')
    expect(result.knownLanguages.length).toBe(3)
    expect(result.softSkills).toEqual(['Leadership', 'Mentoring'])
    expect(result.workExperiences[0]?.companyName).toBe('Beta')
  })
})
