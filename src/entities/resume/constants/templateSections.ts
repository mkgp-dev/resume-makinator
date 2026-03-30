import type { TemplateSectionKey } from "@/entities/resume/types"

export const TEMPLATE_SECTION_ORDER_DEFAULT: TemplateSectionKey[] = [
    "summary",
    "coreSkills",
    "workExperiences",
    "personalProjects",
    "certificates",
    "achievements",
    "softSkills",
    "education",
    "knownLanguages",
    "references",
]

export const TEMPLATE_SECTION_LABELS: Record<TemplateSectionKey, string> = {
    summary: "About me",
    coreSkills: "Core skills",
    workExperiences: "Experience",
    personalProjects: "Personal projects",
    certificates: "Certificates",
    achievements: "Achievements",
    softSkills: "Soft skills",
    education: "Education",
    knownLanguages: "Languages",
    references: "References",
}

export const MODERN_SIDEBAR_SECTIONS_DEFAULT: TemplateSectionKey[] = [
    "summary",
    "knownLanguages",
    "softSkills",
    "achievements",
    "references",
]

export const MODERN_MAIN_SECTIONS_DEFAULT: TemplateSectionKey[] = [
    "coreSkills",
    "workExperiences",
    "personalProjects",
    "certificates",
    "education",
]

export const MODERN_ALT_SECTION_ORDER_DEFAULT: TemplateSectionKey[] = [
    "summary",
    "workExperiences",
    "education",
    "coreSkills",
    "softSkills",
    "knownLanguages",
    "achievements",
    "references",
    "certificates",
    "personalProjects",
]
