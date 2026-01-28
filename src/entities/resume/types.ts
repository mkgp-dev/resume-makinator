import type { ActivePage } from "@/app/navigation"

export type TemplateId = "whitepaper" | "classic"

export type PageSize = "A4" | "LETTER"

export type FontStyle = "Lora" | "Playfair-Display" | "Helvetica" | "Montserrat"

export type PersonalDetails = {
  fullName: string
  jobTitle: string
  defaultAddress: string
  defaultEmail: string
  defaultPhoneNumber: string
  socialGithub: string
  socialLinkedin: string
  summary: string
  profilePicture: string
  knownLanguages: string[]
}

export type EducationItem = {
  id: string
  schoolName: string
  courseDegree: string
  startYear: string
  endYear: string
  currentEnrolled: boolean
}

export type ReferenceItem = {
  id: string
  fullName: string
  jobTitle: string
  companyName: string
  defaultPhoneNumber: string
  defaultEmail: string
}

export type CoreSkillItem = {
  id: string
  devLanguage: string
  devFramework: string[]
}

export type WorkExperienceItem = {
  id: string
  companyName: string
  jobTitle: string
  briefSummary: string
  startYear: string
  endYear: string
  currentlyHired: boolean
  bulletType: boolean
  bulletSummary: string[]
}

export type ProjectItem = {
  id: string
  projectName: string
  sourceCode: string
  preview: string
  projectDescription: string
}

export type CertificateItem = {
  id: string
  certificateName: string
  certificateIssuer: string
  yearIssued: string
  certificateDescription: string
}

export type AchievementItem = {
  id: string
  achievementName: string
  achievementIssuer: string
  yearIssued: string
  achievementDescription: string
}

export type RenderConfig = {
  workExperiences: boolean
  personalProjects: boolean
  certificates: boolean
  education: boolean
  coreSkills: boolean
  references: boolean
  softSkills: boolean
  achievements: boolean
  language: boolean
}

export type Configuration = {
  template: TemplateId
  fontStyle: FontStyle
  fontSize: number
  pageSize: PageSize
}

export type WhitepaperTemplateConfig = {
  blockSpace: number
  enablePicture: boolean
  pictureSize: number
  bulletText: boolean
  inlineInformation: boolean
}

export type ClassicTemplateConfig = {
  blockSpace: number
  bulletText: boolean
  enablePicture?: boolean
  pictureSize?: number
  inlineInformation?: boolean
}

export type TemplateConfig = {
  whitepaper: WhitepaperTemplateConfig
  classic: ClassicTemplateConfig
}

export type SectionItemMap = {
  education: EducationItem
  references: ReferenceItem
  coreSkills: CoreSkillItem
  workExperiences: WorkExperienceItem
  personalProjects: ProjectItem
  certificates: CertificateItem
  achievements: AchievementItem
}

export type ItemSectionKey = keyof SectionItemMap

export type ResumeData = {
  activePage: ActivePage
  personalDetails: PersonalDetails
  education: EducationItem[]
  references: ReferenceItem[]
  softSkills: string[]
  coreSkills: CoreSkillItem[]
  workExperiences: WorkExperienceItem[]
  personalProjects: ProjectItem[]
  certificates: CertificateItem[]
  achievements: AchievementItem[]
  configuration: Configuration
  enableInRender: RenderConfig
  template: TemplateConfig
}

export type ResumePreviewData = Omit<ResumeData, "activePage">

export type ResumeImportData = Omit<ResumeData, "template" | "activePage"> & {
  activePage?: ActivePage
}
