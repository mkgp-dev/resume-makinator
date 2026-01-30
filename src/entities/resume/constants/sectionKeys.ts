export const SECTION_KEYS = {
    workExperiences: "workExperiences",
    personalProjects: "personalProjects",
    certificates: "certificates",
    education: "education",
    coreSkills: "coreSkills",
    references: "references",
    softSkills: "softSkills",
    achievements: "achievements",
}

export const RENDER_SECTION_KEYS = [
    "summary",
    ...Object.values(SECTION_KEYS),
    "language",
]

export const REQUIRED_DATA_KEYS = [
    "personalDetails",
    "education",
    "references",
    "softSkills",
    "coreSkills",
    "workExperiences",
    "personalProjects",
    "certificates",
    "achievements",
    "configuration",
    "enableInRender",
]
