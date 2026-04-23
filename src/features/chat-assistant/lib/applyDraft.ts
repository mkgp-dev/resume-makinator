import { nanoid } from "nanoid"
import { validateImportData } from "@/entities/resume/validation/import"
import { dedupeDraftListItems, normalizeDraftListItem, parseDraftStringList } from "@/features/chat-assistant/lib/stringListDraft"
import { parseDraftJsonObject } from "@/features/chat-assistant/lib/structuredDraftJson"
import type { ResumeImportData } from "@/entities/resume/types"
import type { AiDraftChange } from "@/features/chat-assistant/types"

type ApplyDraftResult =
  | { ok: true; data: ResumeImportData }
  | { ok: false; error: string }

type UnknownRecord = Record<string, unknown>

const isPlainObject = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")

const parseDraftBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase()

  if (normalized === "true") return true
  if (normalized === "false") return false

  return null
}

const parseDraftString = (value: unknown) => {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return null
}

const isEmptyListPayload = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value !== "string") {
    return false
  }

  const normalized = value.trim()
  if (normalized === "[]") {
    return true
  }

  try {
    const parsed = JSON.parse(normalized) as unknown
    return typeof parsed === "string"
      ? isEmptyListPayload(parsed)
      : Array.isArray(parsed) && parsed.length === 0
  } catch {
    return false
  }
}

const isRemoveItemDraft = (proposedText: unknown) => {
  if (proposedText === null) return true

  if (typeof proposedText !== "string") {
    return isEmptyListPayload(proposedText)
  }

  const normalized = proposedText.trim()
  return normalized === "" || isEmptyListPayload(proposedText)
}

const isClearSectionDraft = (change: AiDraftChange) =>
  !change.itemId && !change.field && isEmptyListPayload(change.proposedText)

const parseCoreSkillsCreateDraft = (proposedText: string) => {
  const parsed = parseDraftJsonObject(proposedText)
  if (!parsed) return null

  const devLanguage =
    typeof parsed.devLanguage === "string"
      ? normalizeDraftListItem(parsed.devLanguage)
      : ""
  const devFramework = isStringArray(parsed.devFramework)
    ? dedupeDraftListItems(
        parsed.devFramework
          .map(normalizeDraftListItem)
          .filter(Boolean),
      )
    : []

  if (!devLanguage || devFramework.length === 0) {
    return null
  }

  return {
    devLanguage,
    devFramework,
  }
}

const parsePersonalProjectCreateDraft = (proposedText: string) => {
  const parsed = parseDraftJsonObject(proposedText)
  if (!parsed) return null

  if (
    typeof parsed.projectName !== "string" ||
    typeof parsed.projectSubtitle !== "string" ||
    typeof parsed.preview !== "string" ||
    typeof parsed.briefSummary !== "string" ||
    typeof parsed.bulletType !== "boolean" ||
    !isStringArray(parsed.bulletSummary)
  ) {
    return null
  }

  return {
    projectName: parsed.projectName.trim(),
    projectSubtitle: parsed.projectSubtitle.trim(),
    preview: parsed.preview.trim(),
    briefSummary: parsed.briefSummary.trim(),
    bulletType: parsed.bulletType,
    bulletSummary: dedupeDraftListItems(
      parsed.bulletSummary
        .map(normalizeDraftListItem)
        .filter(Boolean),
    ),
  }
}

const parseWorkExperienceCreateDraft = (proposedText: string) => {
  const parsed = parseDraftJsonObject(proposedText)
  if (!parsed) return null

  if (
    typeof parsed.companyName !== "string" ||
    typeof parsed.jobTitle !== "string" ||
    typeof parsed.briefSummary !== "string" ||
    typeof parsed.startYear !== "string" ||
    typeof parsed.endYear !== "string" ||
    typeof parsed.currentlyHired !== "boolean" ||
    typeof parsed.bulletType !== "boolean" ||
    !isStringArray(parsed.bulletSummary)
  ) {
    return null
  }

  return {
    companyName: parsed.companyName.trim(),
    jobTitle: parsed.jobTitle.trim(),
    briefSummary: parsed.briefSummary.trim(),
    startYear: parsed.startYear.trim(),
    endYear: parsed.endYear.trim(),
    currentlyHired: parsed.currentlyHired,
    bulletType: parsed.bulletType,
    bulletSummary: dedupeDraftListItems(
      parsed.bulletSummary
        .map(normalizeDraftListItem)
        .filter(Boolean),
    ),
  }
}

const parseCertificateCreateDraft = (proposedText: string) => {
  const parsed = parseDraftJsonObject(proposedText)
  if (!parsed) return null

  const certificateName = parseDraftString(parsed.certificateName)
  const certificateIssuer = parseDraftString(parsed.certificateIssuer)
  const yearIssued = parseDraftString(parsed.yearIssued)
  const certificateDescription = parseDraftString(parsed.certificateDescription)

  if (
    certificateName === null ||
    certificateIssuer === null ||
    yearIssued === null ||
    certificateDescription === null
  ) {
    return null
  }

  return {
    certificateName,
    certificateIssuer,
    yearIssued,
    certificateDescription,
  }
}

const parseAchievementCreateDraft = (proposedText: string) => {
  const parsed = parseDraftJsonObject(proposedText)
  if (!parsed) return null

  const achievementName = parseDraftString(parsed.achievementName)
  const achievementIssuer = parseDraftString(parsed.achievementIssuer)
  const yearIssued = parseDraftString(parsed.yearIssued)
  const achievementDescription = parseDraftString(parsed.achievementDescription)

  if (
    achievementName === null ||
    achievementIssuer === null ||
    yearIssued === null ||
    achievementDescription === null
  ) {
    return null
  }

  return {
    achievementName,
    achievementIssuer,
    yearIssued,
    achievementDescription,
  }
}

const assignFieldValue = (
  record: UnknownRecord,
  field: string,
  proposedText: string,
): ApplyDraftResult | null => {
  if (!Object.prototype.hasOwnProperty.call(record, field)) {
    return { ok: false, error: `The AI draft targeted an unsupported field: ${field}.` }
  }

  const currentValue = record[field]

  if (typeof currentValue === "string") {
    record[field] = proposedText
    return null
  }

  if (isStringArray(currentValue)) {
    if (isEmptyListPayload(proposedText)) {
      record[field] = []
      return null
    }

    const nextValues = parseDraftStringList(proposedText)
    if (!nextValues.ok) {
      return { ok: false, error: `The AI draft for ${field} did not include usable text to apply.` }
    }

    record[field] = nextValues.items
    return null
  }

  if (typeof currentValue === "boolean") {
    const nextValue = parseDraftBoolean(proposedText)
    if (nextValue === null) {
      return { ok: false, error: `The AI draft for ${field} did not include a usable true/false value.` }
    }

    record[field] = nextValue
    return null
  }

  return { ok: false, error: `The AI draft targeted a field that cannot be safely applied: ${field}.` }
}

export const applyAiDraftChanges = (
  resumeData: ResumeImportData,
  changes: AiDraftChange[],
): ApplyDraftResult => {
  const nextData: ResumeImportData = structuredClone(resumeData)

  for (const change of changes) {
    const isRemoveItemChange = Boolean(change.itemId) && !change.field && isRemoveItemDraft(change.proposedText)

    if (isRemoveItemChange) {
      const sectionValue = (nextData as UnknownRecord)[change.section]
      if (!Array.isArray(sectionValue)) {
        return { ok: false, error: `The AI draft targeted an unsupported section: ${change.section}.` }
      }

      const nextSectionItems = sectionValue.filter(
        (item) => !(isPlainObject(item) && typeof item.id === "string" && item.id === change.itemId),
      )

      if (nextSectionItems.length === sectionValue.length) {
        return {
          ok: false,
          error: "The AI draft referenced a resume item that does not exist in local data anymore.",
        }
      }

      ;(nextData as UnknownRecord)[change.section] = nextSectionItems
      continue
    }

    if (isClearSectionDraft(change)) {
      const sectionValue = (nextData as UnknownRecord)[change.section]
      if (!Array.isArray(sectionValue)) {
        return { ok: false, error: `The AI draft targeted an unsupported section: ${change.section}.` }
      }

      ;(nextData as UnknownRecord)[change.section] = []
      continue
    }

    if (typeof change.proposedText !== "string") {
      return { ok: false, error: "The AI draft did not include text that can be applied safely." }
    }

    if (change.section === "personalDetails") {
      if (!change.field) {
        return { ok: false, error: "The AI draft did not specify which personal details field to update." }
      }

      const outcome = assignFieldValue(
        nextData.personalDetails as UnknownRecord,
        change.field,
        change.proposedText,
      )

      if (outcome) return outcome
      continue
    }

    if (change.section === "softSkills") {
      if (isEmptyListPayload(change.proposedText)) {
        nextData.softSkills = []
        continue
      }

      const nextSoftSkills = parseDraftStringList(change.proposedText)
      if (!nextSoftSkills.ok) {
        return {
          ok: false,
          error: "The AI draft for softSkills did not include usable text to apply.",
        }
      }

      nextData.softSkills = nextSoftSkills.items
      continue
    }

    if (change.section === "coreSkills" && !change.itemId && !change.field) {
      const nextCoreSkill = parseCoreSkillsCreateDraft(change.proposedText)
      if (!nextCoreSkill) {
        return {
          ok: false,
          error: "The AI draft did not include a valid core skill group to create.",
        }
      }

      const hasDuplicateGroup = nextData.coreSkills.some(
        (item) => item.devLanguage.trim().toLowerCase() === nextCoreSkill.devLanguage.toLowerCase(),
      )

      if (hasDuplicateGroup) {
        return {
          ok: false,
          error: `A core skill group named ${nextCoreSkill.devLanguage} already exists in local data.`,
        }
      }

      nextData.coreSkills = [
        ...nextData.coreSkills,
        {
          id: nanoid(),
          devLanguage: nextCoreSkill.devLanguage,
          devFramework: nextCoreSkill.devFramework,
        },
      ]
      continue
    }

    if (change.section === "personalProjects" && !change.itemId && !change.field) {
      const nextProject = parsePersonalProjectCreateDraft(change.proposedText)
      if (!nextProject) {
        return {
          ok: false,
          error: "The AI draft did not include a valid personal project item to create.",
        }
      }

      nextData.personalProjects = [
        ...nextData.personalProjects,
        {
          id: nanoid(),
          projectName: nextProject.projectName,
          projectSubtitle: nextProject.projectSubtitle,
          preview: nextProject.preview,
          briefSummary: nextProject.briefSummary,
          bulletType: nextProject.bulletType,
          bulletSummary: nextProject.bulletSummary,
        },
      ]
      continue
    }

    if (change.section === "workExperiences" && !change.itemId && !change.field) {
      const nextWorkExperience = parseWorkExperienceCreateDraft(change.proposedText)
      if (!nextWorkExperience) {
        return {
          ok: false,
          error: "The AI draft did not include a valid work experience item to create.",
        }
      }

      nextData.workExperiences = [
        ...nextData.workExperiences,
        {
          id: nanoid(),
          companyName: nextWorkExperience.companyName,
          jobTitle: nextWorkExperience.jobTitle,
          briefSummary: nextWorkExperience.briefSummary,
          startYear: nextWorkExperience.startYear,
          endYear: nextWorkExperience.endYear,
          currentlyHired: nextWorkExperience.currentlyHired,
          bulletType: nextWorkExperience.bulletType,
          bulletSummary: nextWorkExperience.bulletSummary,
        },
      ]
      continue
    }

    if (change.section === "certificates" && !change.itemId && !change.field) {
      const nextCertificate = parseCertificateCreateDraft(change.proposedText)
      if (!nextCertificate) {
        return {
          ok: false,
          error: "The AI draft did not include a valid certificate item to create.",
        }
      }

      nextData.certificates = [
        ...nextData.certificates,
        {
          id: nanoid(),
          certificateName: nextCertificate.certificateName,
          certificateIssuer: nextCertificate.certificateIssuer,
          yearIssued: nextCertificate.yearIssued,
          certificateDescription: nextCertificate.certificateDescription,
        },
      ]
      continue
    }

    if (change.section === "achievements" && !change.itemId && !change.field) {
      const nextAchievement = parseAchievementCreateDraft(change.proposedText)
      if (!nextAchievement) {
        return {
          ok: false,
          error: "The AI draft did not include a valid achievement item to create.",
        }
      }

      nextData.achievements = [
        ...nextData.achievements,
        {
          id: nanoid(),
          achievementName: nextAchievement.achievementName,
          achievementIssuer: nextAchievement.achievementIssuer,
          yearIssued: nextAchievement.yearIssued,
          achievementDescription: nextAchievement.achievementDescription,
        },
      ]
      continue
    }

    const sectionValue = (nextData as UnknownRecord)[change.section]
    if (!Array.isArray(sectionValue)) {
      return { ok: false, error: `The AI draft targeted an unsupported section: ${change.section}.` }
    }

    if (!change.itemId || !change.field) {
      return {
        ok: false,
        error: "The AI draft did not include enough detail to safely update a resume item.",
      }
    }

    const targetItem = sectionValue.find((item) =>
      isPlainObject(item) && typeof item.id === "string" && item.id === change.itemId,
    )

    if (!isPlainObject(targetItem)) {
      return {
        ok: false,
        error: "The AI draft referenced a resume item that does not exist in local data anymore.",
      }
    }

    const outcome = assignFieldValue(targetItem, change.field, change.proposedText)
    if (outcome) return outcome
  }

  const sanitizedData = validateImportData(nextData)
  if (!sanitizedData) {
    return {
      ok: false,
      error: "The confirmed draft could not be validated against the current resume schema.",
    }
  }

  return { ok: true, data: sanitizedData }
}
