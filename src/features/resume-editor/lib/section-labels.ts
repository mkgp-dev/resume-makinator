import type { ResumeSectionKey } from '@/entities/resume/model'

export const sectionLabels: Record<ResumeSectionKey, string> = {
  personalDetails: 'Personal Details',
  workExperiences: 'Work Experience',
  personalProjects: 'Projects',
  education: 'Education',
  certificates: 'Certificates',
  achievements: 'Achievements',
  references: 'References',
  coreSkills: 'Core Skills',
  softSkills: 'Soft Skills',
  knownLanguages: 'Known Languages',
}
