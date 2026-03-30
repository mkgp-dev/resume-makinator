import {
    MODERN_MAIN_SECTIONS_DEFAULT,
    MODERN_SIDEBAR_SECTIONS_DEFAULT,
    TEMPLATE_SECTION_LABELS,
    TEMPLATE_SECTION_ORDER_DEFAULT,
} from "@/entities/resume/constants/templateSections"
import type { RenderConfig, TemplateSectionKey } from "@/entities/resume/types"

export const normalizeTemplateSectionOrder = (value?: TemplateSectionKey[]) => {
    const seen = new Set<TemplateSectionKey>()
    const sanitized = (value || []).filter((key) => {
        if (!TEMPLATE_SECTION_LABELS[key]) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    const missing = TEMPLATE_SECTION_ORDER_DEFAULT.filter((key) => !seen.has(key))
    return [...sanitized, ...missing]
}

export const isSameTemplateSectionOrder = (
    current: TemplateSectionKey[] | undefined,
    next: TemplateSectionKey[]
) => {
    if (!current || current.length !== next.length) return false
    return current.every((key, index) => key === next[index])
}

export const TEMPLATE_SECTION_TOGGLE_KEYS: Record<TemplateSectionKey, keyof RenderConfig> = {
    summary: "summary",
    coreSkills: "coreSkills",
    workExperiences: "workExperiences",
    personalProjects: "personalProjects",
    certificates: "certificates",
    achievements: "achievements",
    softSkills: "softSkills",
    education: "education",
    knownLanguages: "language",
    references: "references",
}

const normalizeSectionZone = (value: TemplateSectionKey[] | undefined, defaults: TemplateSectionKey[]) => {
    const seen = new Set<TemplateSectionKey>()

    return (value || []).filter((key) => {
        if (!TEMPLATE_SECTION_LABELS[key]) return false
        if (seen.has(key)) return false
        if (!defaults.includes(key)) return false
        seen.add(key)
        return true
    })
}

export const normalizeModernSectionZones = (
    sidebarSections?: TemplateSectionKey[],
    mainSections?: TemplateSectionKey[]
) => {
    const sidebar = normalizeSectionZone(sidebarSections, TEMPLATE_SECTION_ORDER_DEFAULT)
    const main = normalizeSectionZone(mainSections, TEMPLATE_SECTION_ORDER_DEFAULT)
    const taken = new Set<TemplateSectionKey>([...sidebar, ...main])

    const defaultSidebar = MODERN_SIDEBAR_SECTIONS_DEFAULT.filter((key) => !taken.has(key))
    defaultSidebar.forEach((key) => taken.add(key))

    const defaultMain = [...MODERN_MAIN_SECTIONS_DEFAULT, ...TEMPLATE_SECTION_ORDER_DEFAULT]
        .filter((key, index, items) => items.indexOf(key) === index)
        .filter((key) => !taken.has(key))

    return {
        sidebar: [...sidebar, ...defaultSidebar],
        main: [...main, ...defaultMain],
    }
}

export const isSameModernSectionZones = (
    currentSidebar: TemplateSectionKey[] | undefined,
    currentMain: TemplateSectionKey[] | undefined,
    nextSidebar: TemplateSectionKey[],
    nextMain: TemplateSectionKey[]
) => (
    isSameTemplateSectionOrder(currentSidebar, nextSidebar) &&
    isSameTemplateSectionOrder(currentMain, nextMain)
)
