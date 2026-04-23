import { REQUIRED_DATA_KEYS, RENDER_SECTION_KEYS } from "@/entities/resume/constants/sectionKeys"
import {
    MODERN_ALT_SECTION_ORDER_DEFAULT,
    MODERN_MAIN_SECTIONS_DEFAULT,
    MODERN_SIDEBAR_SECTIONS_DEFAULT,
    TEMPLATE_SECTION_ORDER_DEFAULT,
} from "@/entities/resume/constants/templateSections"
import { normalizeModernSectionZones } from "@/entities/resume/lib/templateSections"
import { normalizeTemplateId } from "@/entities/resume/validation/template"
import type {
    AchievementItem,
    CertificateItem,
    ClassicTemplateConfig,
    ModernAltTemplateConfig,
    ModernTemplateConfig,
    Configuration,
    CoreSkillItem,
    EducationItem,
    PersonalDetails,
    ProjectItem,
    ReferenceItem,
    RenderConfig,
    ResumeImportData,
    SharedTemplateConfig,
    TemplateConfig,
    TemplateSectionKey,
    WorkExperienceItem,
    WhitepaperTemplateConfig,
} from "@/entities/resume/types"
import { isActivePage } from "@/app/navigation"

type UnknownRecord = Record<string, unknown>

export const MAX_IMPORT_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_PROFILE_PICTURE_CHARS = 3 * 1024 * 1024

export const isJsonFile = (file: File) =>
    file.type === "application/json" ||
    file.type === "text/json" ||
    file.name.toLowerCase().endsWith(".json")

const isPlainObject = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === "string"
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)
const hasKeys = (value: UnknownRecord, keys: string[]) => keys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
const isImageDataUrl = (value: string) => !value || value.startsWith("data:image/")
const isShortString = (value: unknown, max: number): value is string =>
    isString(value) && value.length <= max
const toString = (value: unknown, fallback = "") => (isString(value) ? value : fallback)

const toNumber = (value: unknown) => {
    if (typeof value === "number") return value
    if (typeof value === "string" && value.trim()) return Number(value)
    return NaN
}

const isNumberLike = (value: unknown) => Number.isFinite(toNumber(value))
const toPositiveNumber = (value: unknown, fallback: number) => {
    const parsed = toNumber(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
    whitepaper: {
        blockSpace: 12,
        enablePicture: false,
        pictureSize: 100,
        bulletText: false,
        inlineInformation: true,
        sectionOrder: TEMPLATE_SECTION_ORDER_DEFAULT,
    },
    classic: {
        blockSpace: 12,
        bulletText: true,
        enablePicture: false,
        pictureSize: 100,
        inlineInformation: true,
        sectionOrder: TEMPLATE_SECTION_ORDER_DEFAULT,
    },
    modern: {
        blockSpace: 12,
        enablePicture: true,
        pictureSize: 88,
        bulletText: false,
        accentColor: "#1f4b99",
        sidebarSections: MODERN_SIDEBAR_SECTIONS_DEFAULT,
        mainSections: MODERN_MAIN_SECTIONS_DEFAULT,
    },
    "modern-alt": {
        blockSpace: 12,
        enablePicture: true,
        pictureSize: 92,
        bulletText: true,
        bannerColor: "#475569",
        sectionOrder: MODERN_ALT_SECTION_ORDER_DEFAULT,
    },
}

const DEFAULT_RENDER_CONFIG: RenderConfig = {
    summary: true,
    workExperiences: false,
    personalProjects: false,
    certificates: false,
    education: false,
    coreSkills: false,
    references: false,
    softSkills: false,
    achievements: false,
    language: false,
}

const normalizeRenderConfig = (value: unknown): RenderConfig | null => {
    if (!isPlainObject(value)) return null

    const result: RenderConfig = { ...DEFAULT_RENDER_CONFIG }

    for (const key of RENDER_SECTION_KEYS) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            if (!isBoolean(value[key])) return null
            result[key as keyof RenderConfig] = value[key] as boolean
        }
    }

    return result
}

const normalizeTemplateSectionOrder = (value: unknown): TemplateSectionKey[] => {
    if (!Array.isArray(value)) return DEFAULT_TEMPLATE_CONFIG.whitepaper.sectionOrder
    const keys = value.filter(isString)
    const allowed = new Set(TEMPLATE_SECTION_ORDER_DEFAULT)
    if (keys.length !== value.length || !keys.every(key => allowed.has(key as TemplateSectionKey))) {
        return DEFAULT_TEMPLATE_CONFIG.whitepaper.sectionOrder
    }

    return keys as TemplateSectionKey[]
}

const normalizeTemplateSettings = (
    value: unknown,
    defaults: SharedTemplateConfig
): SharedTemplateConfig => {
    if (!isPlainObject(value)) return defaults
    return {
        blockSpace: toPositiveNumber(value.blockSpace, defaults.blockSpace),
        enablePicture: isBoolean(value.enablePicture) ? value.enablePicture : defaults.enablePicture,
        pictureSize: toPositiveNumber(value.pictureSize, defaults.pictureSize),
        bulletText: isBoolean(value.bulletText) ? value.bulletText : defaults.bulletText,
        inlineInformation: isBoolean(value.inlineInformation)
            ? value.inlineInformation
            : defaults.inlineInformation,
        sectionOrder: normalizeTemplateSectionOrder(value.sectionOrder),
    }
}

const normalizeWhitepaperTemplate = (value: unknown): WhitepaperTemplateConfig =>
    normalizeTemplateSettings(value, DEFAULT_TEMPLATE_CONFIG.whitepaper)

const normalizeClassicTemplate = (value: unknown): ClassicTemplateConfig => {
    return normalizeTemplateSettings(value, DEFAULT_TEMPLATE_CONFIG.classic)
}

const isHexColor = (value: unknown): value is string =>
    isString(value) && /^#[0-9A-Fa-f]{6}$/.test(value)

const normalizeModernTemplate = (value: unknown): ModernTemplateConfig => {
    if (!isPlainObject(value)) return DEFAULT_TEMPLATE_CONFIG.modern

    const normalizedZones = normalizeModernSectionZones(
        Array.isArray(value.sidebarSections) ? value.sidebarSections.filter(isString) as TemplateSectionKey[] : undefined,
        Array.isArray(value.mainSections) ? value.mainSections.filter(isString) as TemplateSectionKey[] : undefined,
    )

    return {
        blockSpace: toPositiveNumber(value.blockSpace, DEFAULT_TEMPLATE_CONFIG.modern.blockSpace),
        enablePicture: isBoolean(value.enablePicture) ? value.enablePicture : DEFAULT_TEMPLATE_CONFIG.modern.enablePicture,
        pictureSize: toPositiveNumber(value.pictureSize, DEFAULT_TEMPLATE_CONFIG.modern.pictureSize),
        bulletText: isBoolean(value.bulletText) ? value.bulletText : DEFAULT_TEMPLATE_CONFIG.modern.bulletText,
        accentColor: isHexColor(value.accentColor) ? value.accentColor : DEFAULT_TEMPLATE_CONFIG.modern.accentColor,
        sidebarSections: normalizedZones.sidebar,
        mainSections: normalizedZones.main,
    }
}

const normalizeModernAltTemplate = (value: unknown): ModernAltTemplateConfig => {
    if (!isPlainObject(value)) return DEFAULT_TEMPLATE_CONFIG["modern-alt"]

    return {
        blockSpace: toPositiveNumber(value.blockSpace, DEFAULT_TEMPLATE_CONFIG["modern-alt"].blockSpace),
        enablePicture: isBoolean(value.enablePicture) ? value.enablePicture : DEFAULT_TEMPLATE_CONFIG["modern-alt"].enablePicture,
        pictureSize: toPositiveNumber(value.pictureSize, DEFAULT_TEMPLATE_CONFIG["modern-alt"].pictureSize),
        bulletText: isBoolean(value.bulletText) ? value.bulletText : DEFAULT_TEMPLATE_CONFIG["modern-alt"].bulletText,
        bannerColor: isHexColor(value.bannerColor) ? value.bannerColor : DEFAULT_TEMPLATE_CONFIG["modern-alt"].bannerColor,
        sectionOrder: normalizeTemplateSectionOrder(value.sectionOrder),
    }
}

const normalizeTemplateConfig = (value: unknown): TemplateConfig => {
    if (!isPlainObject(value)) return DEFAULT_TEMPLATE_CONFIG

    return {
        whitepaper: normalizeWhitepaperTemplate(value.whitepaper),
        classic: normalizeClassicTemplate(value.classic),
        modern: normalizeModernTemplate(value.modern),
        "modern-alt": normalizeModernAltTemplate(value["modern-alt"]),
    }
}

const isPersonalDetails = (value: unknown): value is PersonalDetails => (
    isPlainObject(value) &&
    hasKeys(value, [
        "fullName",
        "jobTitle",
        "defaultAddress",
        "defaultEmail",
        "defaultPhoneNumber",
        "socialGithub",
        "socialLinkedin",
        "summary",
        "profilePicture",
        "knownLanguages",
    ]) &&
    isString(value.fullName) &&
    isString(value.jobTitle) &&
    isString(value.defaultAddress) &&
    isString(value.defaultEmail) &&
    isString(value.defaultPhoneNumber) &&
    isString(value.socialGithub) &&
    isString(value.socialLinkedin) &&
    isString(value.summary) &&
    isShortString(value.profilePicture, MAX_PROFILE_PICTURE_CHARS) &&
    isImageDataUrl(value.profilePicture) &&
    isStringArray(value.knownLanguages)
)

const isEducationItem = (value: unknown): value is EducationItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "schoolName", "courseDegree", "startYear", "endYear", "currentEnrolled"]) &&
    isString(value.id) &&
    isString(value.schoolName) &&
    isString(value.courseDegree) &&
    isString(value.startYear) &&
    isString(value.endYear) &&
    isBoolean(value.currentEnrolled)
)

const isReferenceItem = (value: unknown): value is ReferenceItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "fullName", "jobTitle", "companyName", "defaultPhoneNumber", "defaultEmail"]) &&
    isString(value.id) &&
    isString(value.fullName) &&
    isString(value.jobTitle) &&
    isString(value.companyName) &&
    isString(value.defaultPhoneNumber) &&
    isString(value.defaultEmail)
)

const isCoreSkillItem = (value: unknown): value is CoreSkillItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "devLanguage", "devFramework"]) &&
    isString(value.id) &&
    isString(value.devLanguage) &&
    isStringArray(value.devFramework)
)

const isWorkExperienceItem = (value: unknown): value is WorkExperienceItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "companyName", "jobTitle", "briefSummary", "startYear", "endYear", "currentlyHired", "bulletType", "bulletSummary"]) &&
    isString(value.id) &&
    isString(value.companyName) &&
    isString(value.jobTitle) &&
    isString(value.briefSummary) &&
    isString(value.startYear) &&
    isString(value.endYear) &&
    isBoolean(value.currentlyHired) &&
    isBoolean(value.bulletType) &&
    isStringArray(value.bulletSummary)
)

const getLegacyProjectSubtitle = (value: UnknownRecord) => {
    if (isString(value.projectSubtitle)) return value.projectSubtitle
    if (isString(value.projectFramework)) return value.projectFramework
    if (isString(value.projectFrameworks)) return value.projectFrameworks
    if (isStringArray(value.projectFrameworks)) return value.projectFrameworks.join(", ")
    return ""
}

const normalizeProjectItem = (value: unknown): ProjectItem | null => {
    if (!isPlainObject(value)) return null
    if (!isString(value.id) || !isString(value.projectName)) return null

    return {
        id: value.id,
        projectName: value.projectName,
        projectSubtitle: getLegacyProjectSubtitle(value),
        preview: isString(value.preview) ? value.preview : "",
        briefSummary: isString(value.briefSummary) ? value.briefSummary : toString(value.projectDescription),
        bulletType: isBoolean(value.bulletType) ? value.bulletType : false,
        bulletSummary: isStringArray(value.bulletSummary) ? value.bulletSummary : [],
    }
}

const normalizeProjectItems = (value: unknown): ProjectItem[] | null => {
    if (!Array.isArray(value)) return null
    const normalized = value.map(item => normalizeProjectItem(item))
    if (normalized.some(item => item === null)) return null
    return normalized.filter((item): item is ProjectItem => item !== null)
}

const isCertificateItem = (value: unknown): value is CertificateItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "certificateName", "certificateIssuer", "yearIssued", "certificateDescription"]) &&
    isString(value.id) &&
    isString(value.certificateName) &&
    isString(value.certificateIssuer) &&
    isString(value.yearIssued) &&
    isString(value.certificateDescription)
)

const isAchievementItem = (value: unknown): value is AchievementItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "achievementName", "achievementIssuer", "yearIssued", "achievementDescription"]) &&
    isString(value.id) &&
    isString(value.achievementName) &&
    isString(value.achievementIssuer) &&
    isString(value.yearIssued) &&
    isString(value.achievementDescription)
)

const isConfiguration = (value: unknown): value is Configuration => (
    isPlainObject(value) &&
    hasKeys(value, ["template", "fontStyle", "fontSize", "pageSize"]) &&
    isString(value.template) &&
    isString(value.fontStyle) &&
    isNumberLike(value.fontSize) &&
    toNumber(value.fontSize) > 0 &&
    isString(value.pageSize) &&
    (
        !Object.prototype.hasOwnProperty.call(value, "pollinationsApiKey") ||
        isString(value.pollinationsApiKey)
    )
)

export const validateImportData = (data: unknown): ResumeImportData | null => {
    if (!isPlainObject(data)) return null
    if (!hasKeys(data, REQUIRED_DATA_KEYS)) return null
    if (!isPersonalDetails(data.personalDetails)) return null
    if (!Array.isArray(data.education) || !data.education.every(isEducationItem)) return null
    if (!Array.isArray(data.references) || !data.references.every(isReferenceItem)) return null
    if (!isStringArray(data.softSkills)) return null
    if (!Array.isArray(data.coreSkills) || !data.coreSkills.every(isCoreSkillItem)) return null
    if (!Array.isArray(data.workExperiences) || !data.workExperiences.every(isWorkExperienceItem)) return null
    const normalizedProjects = normalizeProjectItems(data.personalProjects)
    if (!normalizedProjects) return null
    if (!Array.isArray(data.certificates) || !data.certificates.every(isCertificateItem)) return null
    if (!Array.isArray(data.achievements) || !data.achievements.every(isAchievementItem)) return null
    if (!isConfiguration(data.configuration)) return null
    const renderConfig = normalizeRenderConfig(data.enableInRender)
    if (!renderConfig) return null
    const templateConfig = normalizeTemplateConfig(data.template)
    if (data.activePage !== undefined && (!isString(data.activePage) || !isActivePage(data.activePage))) return null

    const sanitized: ResumeImportData = {
        personalDetails: data.personalDetails,
        education: data.education,
        references: data.references,
        softSkills: data.softSkills,
        coreSkills: data.coreSkills,
        workExperiences: data.workExperiences,
        personalProjects: normalizedProjects,
        certificates: data.certificates,
        achievements: data.achievements,
        configuration: {
            ...data.configuration,
            template: normalizeTemplateId(data.configuration.template),
            fontSize: toNumber(data.configuration.fontSize),
            pollinationsApiKey: toString(data.configuration.pollinationsApiKey),
        },
        enableInRender: renderConfig,
        template: templateConfig,
    }

    if (isString(data.activePage) && isActivePage(data.activePage)) {
        sanitized.activePage = data.activePage
    }

    return sanitized
}
