const CHAT_FIELD_LABELS: Record<string, string> = {
  fullName: "Full name",
  jobTitle: "Job title",
  defaultAddress: "Address",
  defaultEmail: "Email",
  defaultPhoneNumber: "Phone number",
  socialGithub: "GitHub",
  socialLinkedin: "LinkedIn",
  summary: "About me",
  knownLanguages: "Languages",
  schoolName: "School name",
  courseDegree: "Degree or course",
  startYear: "Start date",
  endYear: "End date",
  currentEnrolled: "Currently enrolled",
  companyName: "Company name",
  briefSummary: "Description",
  bulletSummary: "Bullet points",
  bulletType: "Use bullet points",
  currentlyHired: "Currently employed",
  projectName: "Project name",
  projectSubtitle: "Project subtitle",
  preview: "Project link",
  certificateName: "Certificate title",
  certificateIssuer: "Issuer",
  yearIssued: "Year issued",
  certificateDescription: "Certificate description",
  title: "Title",
  achievementName: "Achievement title",
  achievementIssuer: "Issuer",
  achievementDescription: "Achievement description",
  description: "Description",
  issuer: "Issuer",
  year: "Year",
  devLanguage: "Skill group",
  devFramework: "Skills",
  items: "Items",
}

const CHAT_SECTION_FIELD_LABELS: Record<string, Record<string, string>> = {
  references: {
    fullName: "Reference name",
    jobTitle: "Reference job title",
    companyName: "Reference company",
    defaultPhoneNumber: "Reference phone number",
    defaultEmail: "Reference email",
  },
}

const CHAT_SECTION_LABELS: Record<string, string> = {
  personalDetails: "Personal details",
  personalProjects: "Personal projects",
  workExperiences: "Work experience",
  education: "Education",
  certificates: "Certificates",
  achievements: "Achievements",
  references: "References",
  coreSkills: "Core skills",
  softSkills: "Soft skills",
  knownLanguages: "Languages",
}

const PLAIN_TEXT_FIELD_REPLACEMENTS = [
  "fullName",
  "jobTitle",
  "briefSummary",
  "bulletSummary",
  "bulletType",
  "knownLanguages",
  "defaultPhoneNumber",
  "defaultAddress",
  "defaultEmail",
  "socialGithub",
  "socialLinkedin",
  "devLanguage",
  "devFramework",
  "projectName",
  "projectSubtitle",
  "startYear",
  "endYear",
  "currentEnrolled",
  "currentlyHired",
  "certificateName",
  "certificateIssuer",
  "yearIssued",
  "certificateDescription",
  "achievementName",
  "achievementIssuer",
  "achievementDescription",
  "courseDegree",
  "schoolName",
  "companyName",
] as const

const humanizeIdentifier = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const getChatFieldLabel = (field: string | null) => {
  if (!field) return "Field"

  return CHAT_FIELD_LABELS[field] ?? humanizeIdentifier(field)
}

export const getChatFieldLabelForSection = (field: string | null, section?: string | null) => {
  if (!field) return "Field"

  if (section) {
    const sectionLabel = CHAT_SECTION_FIELD_LABELS[section]?.[field]
    if (sectionLabel) return sectionLabel
  }

  return getChatFieldLabel(field)
}

export const getChatSectionLabel = (section: string | null) => {
  if (!section) return "Section"
  return CHAT_SECTION_LABELS[section] ?? humanizeIdentifier(section)
}

const replaceWholeWord = (text: string, rawValue: string, label: string) =>
  text.replace(new RegExp(`\\b${escapeRegExp(rawValue)}\\b`, "g"), label)

export const toChatDisplayText = (text: string) => {
  let nextText = text

  for (const section of Object.keys(CHAT_SECTION_LABELS)) {
    for (const [field, fieldLabel] of Object.entries(CHAT_FIELD_LABELS)) {
      nextText = nextText.replace(
        new RegExp(`\\b${escapeRegExp(section)}\\.${escapeRegExp(field)}\\b`, "g"),
        CHAT_SECTION_FIELD_LABELS[section]?.[field] ?? fieldLabel,
      )
    }

    for (const [field, fieldLabel] of Object.entries(CHAT_SECTION_FIELD_LABELS[section] ?? {})) {
      nextText = nextText.replace(
        new RegExp(`\\b${escapeRegExp(section)}\\.${escapeRegExp(field)}\\b`, "g"),
        fieldLabel,
      )
    }
  }

  for (const [section, sectionLabel] of Object.entries(CHAT_SECTION_LABELS)) {
    nextText = replaceWholeWord(nextText, section, sectionLabel)
  }

  for (const field of PLAIN_TEXT_FIELD_REPLACEMENTS) {
    nextText = replaceWholeWord(nextText, field, CHAT_FIELD_LABELS[field])
  }

  return nextText
}
