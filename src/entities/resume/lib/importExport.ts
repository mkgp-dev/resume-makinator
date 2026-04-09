import type { ResumeData, ResumeImportData } from "@/entities/resume/types"

export const createResumeImportData = (data: ResumeData): ResumeImportData => ({
    activePage: data.activePage,
    personalDetails: {
        ...data.personalDetails,
        knownLanguages: [...data.personalDetails.knownLanguages],
    },
    education: data.education.map(item => ({ ...item })),
    references: data.references.map(item => ({ ...item })),
    softSkills: [...data.softSkills],
    coreSkills: data.coreSkills.map(item => ({
        ...item,
        devFramework: [...item.devFramework],
    })),
    workExperiences: data.workExperiences.map(item => ({
        ...item,
        bulletSummary: [...item.bulletSummary],
    })),
    personalProjects: data.personalProjects.map(item => ({
        ...item,
        bulletSummary: [...item.bulletSummary],
    })),
    certificates: data.certificates.map(item => ({ ...item })),
    achievements: data.achievements.map(item => ({ ...item })),
    configuration: { ...data.configuration },
    enableInRender: { ...data.enableInRender },
    template: {
        whitepaper: {
            ...data.template.whitepaper,
            sectionOrder: [...data.template.whitepaper.sectionOrder],
        },
        classic: {
            ...data.template.classic,
            sectionOrder: [...data.template.classic.sectionOrder],
        },
        modern: {
            ...data.template.modern,
            sidebarSections: [...data.template.modern.sidebarSections],
            mainSections: [...data.template.modern.mainSections],
        },
        "modern-alt": {
            ...data.template["modern-alt"],
            sectionOrder: [...data.template["modern-alt"].sectionOrder],
        },
    },
})
