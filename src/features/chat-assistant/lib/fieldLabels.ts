const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  personalDetails: "Personal details",
  "personalDetails.knownLanguages": "Languages",
  languages: "Languages",
  language: "Languages",
  coreSkills: "Core skills",
  softSkills: "Soft skills",
  workExperiences: "Work experience",
  personalProjects: "Personal projects",
  education: "Education",
  certificates: "Certificates",
  achievements: "Achievements",
  references: "References",
}

const FIELD_LABELS: Record<string, string> = {
  summary: "Summary",
  knownLanguages: "Languages",
  devLanguage: "Skill group",
  devFramework: "Skills",
}

const humanizeIdentifier = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())

export const getChatSectionLabel = (section: string | null | undefined) => {
  if (!section) return "Section"
  return SECTION_LABELS[section] ?? humanizeIdentifier(section)
}

export const getChatFieldLabel = (field: string | null | undefined) => {
  if (!field) return "Field"
  return FIELD_LABELS[field] ?? humanizeIdentifier(field)
}

export const toChatDisplayText = (text: string) => text.trim()
