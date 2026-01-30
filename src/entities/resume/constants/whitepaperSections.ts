import type { WhitepaperSectionKey } from "@/entities/resume/types"

export const WHITEPAPER_SECTION_ORDER_DEFAULT: WhitepaperSectionKey[] = [
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

export const WHITEPAPER_SECTION_LABELS: Record<WhitepaperSectionKey, string> = {
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
