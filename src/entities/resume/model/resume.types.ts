export type PersonalDetails = {
  fullName: string
  email: string
  phone: string
  location: string
  headline: string
  website: string
  linkedin: string
  github: string
  summary: string
}

export type WorkExperienceItem = {
  id: string
  companyName: string
  jobTitle: string
  startDate: string
  endDate: string
  current: boolean
  location: string
  summary: string
  bulletPoints: string[]
}

export type ProjectItem = {
  id: string
  projectName: string
  role: string
  techStack: string[]
  url: string
  summary: string
  bulletPoints: string[]
}

export type EducationItem = {
  id: string
  schoolName: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  current: boolean
  location: string
  description: string
}

export type CertificateItem = {
  id: string
  name: string
  issuer: string
  issueDate: string
  credentialId: string
  credentialUrl: string
  description: string
}

export type AchievementItem = {
  id: string
  title: string
  issuer: string
  date: string
  description: string
}

export type ReferenceItem = {
  id: string
  name: string
  role: string
  company: string
  email: string
  phone: string
}

export type KnownLanguageItem = {
  id: string
  name: string
  proficiency: string
}

export type CoreSkillItem = {
  id: string
  devLanguage: string
  devFrameworks: string[]
}

export type ResumeSectionKey =
  | 'personalDetails'
  | 'workExperiences'
  | 'personalProjects'
  | 'education'
  | 'certificates'
  | 'achievements'
  | 'references'
  | 'coreSkills'
  | 'softSkills'
  | 'knownLanguages'

export type SectionVisibility = Partial<Record<ResumeSectionKey, boolean>>

export type ResumeContent = {
  personalDetails: PersonalDetails
  workExperiences: WorkExperienceItem[]
  personalProjects: ProjectItem[]
  education: EducationItem[]
  certificates: CertificateItem[]
  achievements: AchievementItem[]
  references: ReferenceItem[]
  coreSkills: CoreSkillItem[]
  softSkills: string[]
  knownLanguages: KnownLanguageItem[]
}

export type ResumeSettings = {
  template: 'whitepaper'
  sectionOrder: ResumeSectionKey[]
  sectionVisibility: SectionVisibility
  fontScale: 0.85 | 1.0 | 1.15
  accentColor: string
}

export type ResumeDocument = {
  id: string
  title: string
  version: number
  createdAt: string
  updatedAt: string
  content: ResumeContent
  settings: ResumeSettings
}
