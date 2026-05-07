import type {
  AchievementItem,
  CertificateItem,
  CoreSkillItem,
  EducationItem,
  KnownLanguageItem,
  ProjectItem,
  ReferenceItem,
  WorkExperienceItem,
} from '@/entities/resume/model'

export const emptyWorkExperience = (): WorkExperienceItem => ({
  id: crypto.randomUUID(),
  companyName: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  summary: '',
  bulletPoints: [],
})

export const emptyProject = (): ProjectItem => ({
  id: crypto.randomUUID(),
  projectName: '',
  role: '',
  techStack: [],
  url: '',
  summary: '',
  bulletPoints: [],
})

export const emptyEducation = (): EducationItem => ({
  id: crypto.randomUUID(),
  schoolName: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  description: '',
})

export const emptyCertificate = (): CertificateItem => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  issueDate: '',
  credentialId: '',
  credentialUrl: '',
  description: '',
})

export const emptyAchievement = (): AchievementItem => ({
  id: crypto.randomUUID(),
  title: '',
  issuer: '',
  date: '',
  description: '',
})

export const emptyReference = (): ReferenceItem => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  company: '',
  email: '',
  phone: '',
})

export const emptyCoreSkill = (): CoreSkillItem => ({
  id: crypto.randomUUID(),
  devLanguage: '',
  devFrameworks: [],
})

export const emptyKnownLanguage = (): KnownLanguageItem => ({
  id: crypto.randomUUID(),
  name: '',
  proficiency: 'Conversational',
})
