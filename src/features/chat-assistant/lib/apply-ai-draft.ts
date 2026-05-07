import type {
  CoreSkillItem,
  KnownLanguageItem,
  ResumeContent,
  ResumeSectionKey,
  WorkExperienceItem,
  ProjectItem,
  EducationItem,
  CertificateItem,
  AchievementItem,
  ReferenceItem,
} from '@/entities/resume/model'
import type { ProposedChange } from '@/features/chat-assistant/model/ai-contract'

type BackendListSection =
  | 'workExperiences'
  | 'personalProjects'
  | 'education'
  | 'certificates'
  | 'achievements'
  | 'references'

function toKnownLanguageItems(items: string[]): KnownLanguageItem[] {
  return items.map((value) => ({
    id: crypto.randomUUID(),
    name: value,
    proficiency: '',
  }))
}

function toCoreSkillItem(value: Record<string, unknown>): CoreSkillItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    devLanguage: typeof value.devLanguage === 'string' ? value.devLanguage : '',
    devFrameworks: Array.isArray(value.devFramework)
      ? value.devFramework.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

function toWorkExperienceItem(value: Record<string, unknown>): WorkExperienceItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    companyName: typeof value.company === 'string' ? value.company : '',
    jobTitle: typeof value.position === 'string' ? value.position : '',
    startDate: typeof value.startDate === 'string' ? value.startDate : '',
    endDate: typeof value.endDate === 'string' ? value.endDate : '',
    current: false,
    location: typeof value.location === 'string' ? value.location : '',
    summary: typeof value.briefSummary === 'string' ? value.briefSummary : '',
    bulletPoints: Array.isArray(value.bulletSummary)
      ? value.bulletSummary.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

function toProjectItem(value: Record<string, unknown>): ProjectItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    projectName: typeof value.projectName === 'string' ? value.projectName : '',
    role: typeof value.projectDescription === 'string' ? value.projectDescription : '',
    techStack: Array.isArray(value.technologies)
      ? value.technologies.filter((item): item is string => typeof item === 'string')
      : [],
    url: typeof value.projectLink === 'string' ? value.projectLink : '',
    summary: typeof value.briefSummary === 'string' ? value.briefSummary : '',
    bulletPoints: Array.isArray(value.bulletSummary)
      ? value.bulletSummary.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

function toEducationItem(value: Record<string, unknown>): EducationItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    schoolName: typeof value.school === 'string' ? value.school : '',
    degree: typeof value.degree === 'string' ? value.degree : '',
    fieldOfStudy: typeof value.course === 'string' ? value.course : '',
    startDate: typeof value.startDate === 'string' ? value.startDate : '',
    endDate: typeof value.endDate === 'string' ? value.endDate : '',
    current: false,
    location: typeof value.location === 'string' ? value.location : '',
    description: typeof value.description === 'string' ? value.description : '',
  }
}

function toCertificateItem(value: Record<string, unknown>): CertificateItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    name: typeof value.certificateName === 'string' ? value.certificateName : '',
    issuer: typeof value.issuer === 'string' ? value.issuer : '',
    issueDate: typeof value.date === 'string' ? value.date : '',
    credentialId: '',
    credentialUrl: typeof value.credentialUrl === 'string' ? value.credentialUrl : '',
    description: typeof value.description === 'string' ? value.description : '',
  }
}

function toAchievementItem(value: Record<string, unknown>): AchievementItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    title: typeof value.achievementName === 'string' ? value.achievementName : '',
    issuer: '',
    date: typeof value.date === 'string' ? value.date : '',
    description: typeof value.achievementDescription === 'string' ? value.achievementDescription : '',
  }
}

function toReferenceItem(value: Record<string, unknown>): ReferenceItem {
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : crypto.randomUUID(),
    name: typeof value.referenceName === 'string' ? value.referenceName : '',
    role: typeof value.referenceRole === 'string' ? value.referenceRole : '',
    company: typeof value.company === 'string' ? value.company : '',
    email: typeof value.referenceEmail === 'string' ? value.referenceEmail : '',
    phone: typeof value.referencePhone === 'string' ? value.referencePhone : '',
  }
}

function mapBackendItem(section: BackendListSection, value: Record<string, unknown>) {
  switch (section) {
    case 'workExperiences':
      return toWorkExperienceItem(value)
    case 'personalProjects':
      return toProjectItem(value)
    case 'education':
      return toEducationItem(value)
    case 'certificates':
      return toCertificateItem(value)
    case 'achievements':
      return toAchievementItem(value)
    case 'references':
      return toReferenceItem(value)
  }
}

function collectSectionFlashKeys(changes: ProposedChange[]): ResumeSectionKey[] {
  const sectionMap: Record<string, ResumeSectionKey> = {
    summary: 'personalDetails',
    language: 'knownLanguages',
    coreSkills: 'coreSkills',
    softSkills: 'softSkills',
    workExperiences: 'workExperiences',
    personalProjects: 'personalProjects',
    education: 'education',
    certificates: 'certificates',
    achievements: 'achievements',
    references: 'references',
    personalDetails: 'personalDetails',
    'personalDetails.knownLanguages': 'knownLanguages',
  }

  const flashSet = new Set<ResumeSectionKey>()
  for (const change of changes) {
    const mapped = sectionMap[change.section]
    if (mapped) {
      flashSet.add(mapped)
    }
  }
  return [...flashSet]
}

export function applyProposedChanges(content: ResumeContent, changes: ProposedChange[]): ResumeContent {
  const next = structuredClone(content)

  for (const change of changes) {
    switch (change.type) {
      case 'replace_field': {
        if (change.section === 'personalDetails' && change.field === 'summary') {
          next.personalDetails.summary = change.value
        }
        break
      }
      case 'replace_list': {
        if (change.section === 'personalDetails.knownLanguages') {
          next.knownLanguages = toKnownLanguageItems(change.value)
          break
        }
        if (change.section === 'softSkills') {
          next.softSkills = [...change.value]
          break
        }
        if (change.section === 'coreSkills') {
          next.coreSkills = change.value.map((item) => toCoreSkillItem(item as unknown as Record<string, unknown>))
        }
        break
      }
      case 'append_item': {
        if (change.section === 'personalDetails.knownLanguages') {
          next.knownLanguages.push({
            id: crypto.randomUUID(),
            name: change.value,
            proficiency: '',
          })
          break
        }
        if (change.section === 'softSkills') {
          next.softSkills.push(change.value)
          break
        }
        if (change.section === 'coreSkills') {
          next.coreSkills.push(toCoreSkillItem(change.value as unknown as Record<string, unknown>))
          break
        }
        if (
          change.section === 'workExperiences'
          || change.section === 'personalProjects'
          || change.section === 'education'
          || change.section === 'certificates'
          || change.section === 'achievements'
          || change.section === 'references'
        ) {
          const mapped = mapBackendItem(change.section, change.value as unknown as Record<string, unknown>)
          switch (change.section) {
            case 'workExperiences':
              next.workExperiences.push(mapped as WorkExperienceItem)
              break
            case 'personalProjects':
              next.personalProjects.push(mapped as ProjectItem)
              break
            case 'education':
              next.education.push(mapped as EducationItem)
              break
            case 'certificates':
              next.certificates.push(mapped as CertificateItem)
              break
            case 'achievements':
              next.achievements.push(mapped as AchievementItem)
              break
            case 'references':
              next.references.push(mapped as ReferenceItem)
              break
          }
        }
        break
      }
      case 'update_item': {
        if (change.section === 'coreSkills') {
          next.coreSkills = next.coreSkills.map((item) => {
            if (item.id !== change.itemId) {
              return item
            }
            const nextValue = change.value as unknown as Record<string, unknown>
            return {
              ...item,
              ...(typeof nextValue.devLanguage === 'string' ? { devLanguage: nextValue.devLanguage } : {}),
              ...(Array.isArray(nextValue.devFramework)
                ? {
                    devFrameworks: nextValue.devFramework.filter((entry): entry is string => typeof entry === 'string'),
                  }
                : {}),
            }
          })
          break
        }
        if (
          change.section === 'workExperiences'
          || change.section === 'personalProjects'
          || change.section === 'education'
          || change.section === 'certificates'
          || change.section === 'achievements'
          || change.section === 'references'
        ) {
          switch (change.section) {
            case 'workExperiences':
              next.workExperiences = next.workExperiences.map((item) => {
                if (item.id !== change.itemId) {
                  return item
                }
                return mapBackendItem('workExperiences', { ...item, ...(change.value as unknown as Record<string, unknown>), id: item.id }) as WorkExperienceItem
              })
              break
            case 'personalProjects':
              next.personalProjects = next.personalProjects.map((item) => {
                if (item.id !== change.itemId) {
                  return item
                }
                return mapBackendItem('personalProjects', { ...item, ...(change.value as unknown as Record<string, unknown>), id: item.id }) as ProjectItem
              })
              break
            case 'education':
              next.education = next.education.map((item) => {
                if (item.id !== change.itemId) {
                  return item
                }
                return mapBackendItem('education', { ...item, ...(change.value as unknown as Record<string, unknown>), id: item.id }) as EducationItem
              })
              break
            case 'certificates':
              next.certificates = next.certificates.map((item) => {
                if (item.id !== change.itemId) {
                  return item
                }
                return mapBackendItem('certificates', { ...item, ...(change.value as unknown as Record<string, unknown>), id: item.id }) as CertificateItem
              })
              break
            case 'achievements':
              next.achievements = next.achievements.map((item) => {
                if (item.id !== change.itemId) {
                  return item
                }
                return mapBackendItem('achievements', { ...item, ...(change.value as unknown as Record<string, unknown>), id: item.id }) as AchievementItem
              })
              break
            case 'references':
              next.references = next.references.map((item) => {
                if (item.id !== change.itemId) {
                  return item
                }
                return mapBackendItem('references', { ...item, ...(change.value as unknown as Record<string, unknown>), id: item.id }) as ReferenceItem
              })
              break
          }
        }
        break
      }
      case 'delete_item': {
        if (change.section === 'coreSkills') {
          next.coreSkills = next.coreSkills.filter((item) => item.id !== change.itemId)
          break
        }
        if (
          change.section === 'workExperiences'
          || change.section === 'personalProjects'
          || change.section === 'education'
          || change.section === 'certificates'
          || change.section === 'achievements'
          || change.section === 'references'
        ) {
          switch (change.section) {
            case 'workExperiences':
              next.workExperiences = next.workExperiences.filter((item) => item.id !== change.itemId)
              break
            case 'personalProjects':
              next.personalProjects = next.personalProjects.filter((item) => item.id !== change.itemId)
              break
            case 'education':
              next.education = next.education.filter((item) => item.id !== change.itemId)
              break
            case 'certificates':
              next.certificates = next.certificates.filter((item) => item.id !== change.itemId)
              break
            case 'achievements':
              next.achievements = next.achievements.filter((item) => item.id !== change.itemId)
              break
            case 'references':
              next.references = next.references.filter((item) => item.id !== change.itemId)
              break
          }
        }
        break
      }
      case 'show_section': {
        break
      }
    }
  }

  return next
}

export function extractFlashSectionsFromDraft(changes: ProposedChange[]): ResumeSectionKey[] {
  return collectSectionFlashKeys(changes)
}
