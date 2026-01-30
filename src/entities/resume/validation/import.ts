import { REQUIRED_DATA_KEYS, RENDER_SECTION_KEYS } from "@/entities/resume/constants/sectionKeys"
import { normalizeTemplateId } from "@/entities/resume/validation/template"
import type {
    AchievementItem,
    CertificateItem,
    Configuration,
    CoreSkillItem,
    EducationItem,
    PersonalDetails,
    ProjectItem,
    ReferenceItem,
    RenderConfig,
    ResumeImportData,
    WorkExperienceItem,
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

const toNumber = (value: unknown) => {
    if (typeof value === "number") return value
    if (typeof value === "string" && value.trim()) return Number(value)
    return NaN
}

const isNumberLike = (value: unknown) => Number.isFinite(toNumber(value))

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

const isProjectItem = (value: unknown): value is ProjectItem => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "projectName", "sourceCode", "preview", "projectDescription"]) &&
    isString(value.id) &&
    isString(value.projectName) &&
    isString(value.sourceCode) &&
    isString(value.preview) &&
    isString(value.projectDescription)
)

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
    isString(value.pageSize)
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
    if (!Array.isArray(data.personalProjects) || !data.personalProjects.every(isProjectItem)) return null
    if (!Array.isArray(data.certificates) || !data.certificates.every(isCertificateItem)) return null
    if (!Array.isArray(data.achievements) || !data.achievements.every(isAchievementItem)) return null
    if (!isConfiguration(data.configuration)) return null
    const renderConfig = normalizeRenderConfig(data.enableInRender)
    if (!renderConfig) return null
    if (data.activePage !== undefined && (!isString(data.activePage) || !isActivePage(data.activePage))) return null

    const sanitized: ResumeImportData = {
        personalDetails: data.personalDetails,
        education: data.education,
        references: data.references,
        softSkills: data.softSkills,
        coreSkills: data.coreSkills,
        workExperiences: data.workExperiences,
        personalProjects: data.personalProjects,
        certificates: data.certificates,
        achievements: data.achievements,
        configuration: {
            ...data.configuration,
            template: normalizeTemplateId(data.configuration.template),
            fontSize: toNumber(data.configuration.fontSize),
        },
        enableInRender: renderConfig,
    }

    if (isString(data.activePage) && isActivePage(data.activePage)) {
        sanitized.activePage = data.activePage
    }

    return sanitized
}
