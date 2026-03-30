import type { ActivePage } from "@/app/navigation"

export type TemplateId = "whitepaper" | "classic" | "modern" | "modern-alt"

export type PageSize = "A4" | "LETTER"

export type FontStyle = "Lora" | "Playfair-Display" | "Helvetica" | "Montserrat"

export type TemplateSectionKey =
  | "summary"
  | "coreSkills"
  | "workExperiences"
  | "personalProjects"
  | "certificates"
  | "achievements"
  | "softSkills"
  | "education"
  | "knownLanguages"
  | "references"

export type WhitepaperSectionKey = TemplateSectionKey

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
  projectSubtitle: string
  preview: string
  briefSummary: string
  bulletType: boolean
  bulletSummary: string[]
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
  summary: boolean
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

export type SharedTemplateConfig = {
  blockSpace: number
  enablePicture: boolean
  pictureSize: number
  bulletText: boolean
  inlineInformation: boolean
  sectionOrder: TemplateSectionKey[]
}

export type WhitepaperTemplateConfig = SharedTemplateConfig

export type ClassicTemplateConfig = SharedTemplateConfig

export type ModernTemplateConfig = {
  blockSpace: number
  enablePicture: boolean
  pictureSize: number
  bulletText: boolean
  accentColor: string
  sidebarSections: TemplateSectionKey[]
  mainSections: TemplateSectionKey[]
}

export type ModernAltTemplateConfig = {
  blockSpace: number
  enablePicture: boolean
  pictureSize: number
  bulletText: boolean
  bannerColor: string
  sectionOrder: TemplateSectionKey[]
}

export type TemplateConfig = {
  whitepaper: WhitepaperTemplateConfig
  classic: ClassicTemplateConfig
  modern: ModernTemplateConfig
  "modern-alt": ModernAltTemplateConfig
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

export type ResumeImportData = Omit<ResumeData, "activePage"> & {
  activePage?: ActivePage
}
