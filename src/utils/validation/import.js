import { REQUIRED_DATA_KEYS, RENDER_SECTION_KEYS } from "@/data/constants/sectionKeys";
import { normalizeTemplateId } from "@/utils/validation/template";

export const MAX_IMPORT_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_PROFILE_PICTURE_CHARS = 3 * 1024 * 1024;

export const isJsonFile = (file) =>
    file.type === "application/json" ||
    file.type === "text/json" ||
    file.name.toLowerCase().endsWith(".json");

const isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value) => typeof value === "string";
const isBoolean = (value) => typeof value === "boolean";
const isStringArray = (value) => Array.isArray(value) && value.every(isString);
const hasKeys = (value, keys) => keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
const isImageDataUrl = (value) => !value || value.startsWith("data:image/");
const isShortString = (value, max) => isString(value) && value.length <= max;

const toNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) return Number(value);
    return NaN;
};

const isNumberLike = (value) => Number.isFinite(toNumber(value));

const isPersonalDetails = (value) => (
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
);

const isEducationItem = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "schoolName", "courseDegree", "startYear", "endYear", "currentEnrolled"]) &&
    isString(value.id) &&
    isString(value.schoolName) &&
    isString(value.courseDegree) &&
    isString(value.startYear) &&
    isString(value.endYear) &&
    isBoolean(value.currentEnrolled)
);

const isReferenceItem = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "fullName", "jobTitle", "companyName", "defaultPhoneNumber", "defaultEmail"]) &&
    isString(value.id) &&
    isString(value.fullName) &&
    isString(value.jobTitle) &&
    isString(value.companyName) &&
    isString(value.defaultPhoneNumber) &&
    isString(value.defaultEmail)
);

const isCoreSkillItem = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "devLanguage", "devFramework"]) &&
    isString(value.id) &&
    isString(value.devLanguage) &&
    isStringArray(value.devFramework)
);

const isWorkExperienceItem = (value) => (
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
);

const isProjectItem = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "projectName", "projectFrameworks", "projectDescription"]) &&
    isString(value.id) &&
    isString(value.projectName) &&
    isString(value.projectFrameworks) &&
    isString(value.projectDescription)
);

const isCertificateItem = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "certificateName", "certificateIssuer", "yearIssued", "certificateDescription"]) &&
    isString(value.id) &&
    isString(value.certificateName) &&
    isString(value.certificateIssuer) &&
    isString(value.yearIssued) &&
    isString(value.certificateDescription)
);

const isAchievementItem = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["id", "achievementName", "achievementIssuer", "yearIssued", "achievementDescription"]) &&
    isString(value.id) &&
    isString(value.achievementName) &&
    isString(value.achievementIssuer) &&
    isString(value.yearIssued) &&
    isString(value.achievementDescription)
);

const isConfiguration = (value) => (
    isPlainObject(value) &&
    hasKeys(value, ["template", "fontStyle", "fontSize", "pageSize"]) &&
    isString(value.template) &&
    isString(value.fontStyle) &&
    isNumberLike(value.fontSize) &&
    toNumber(value.fontSize) > 0 &&
    isString(value.pageSize)
);

const isRenderConfig = (value) => (
    isPlainObject(value) &&
    hasKeys(value, RENDER_SECTION_KEYS) &&
    RENDER_SECTION_KEYS.every((key) => isBoolean(value[key]))
);

export const validateImportData = (data) => {
    if (!isPlainObject(data)) return null;
    if (!hasKeys(data, REQUIRED_DATA_KEYS)) return null;
    if (!isPersonalDetails(data.personalDetails)) return null;
    if (!Array.isArray(data.education) || !data.education.every(isEducationItem)) return null;
    if (!Array.isArray(data.references) || !data.references.every(isReferenceItem)) return null;
    if (!isStringArray(data.softSkills)) return null;
    if (!Array.isArray(data.coreSkills) || !data.coreSkills.every(isCoreSkillItem)) return null;
    if (!Array.isArray(data.workExperiences) || !data.workExperiences.every(isWorkExperienceItem)) return null;
    if (!Array.isArray(data.personalProjects) || !data.personalProjects.every(isProjectItem)) return null;
    if (!Array.isArray(data.certificates) || !data.certificates.every(isCertificateItem)) return null;
    if (!Array.isArray(data.achievements) || !data.achievements.every(isAchievementItem)) return null;
    if (!isConfiguration(data.configuration)) return null;
    if (!isRenderConfig(data.enableInRender)) return null;
    if (data.activePage !== undefined && !isString(data.activePage)) return null;

    const sanitized = {
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
        enableInRender: data.enableInRender,
    };

    if (isString(data.activePage)) {
        sanitized.activePage = data.activePage;
    }

    return sanitized;
};