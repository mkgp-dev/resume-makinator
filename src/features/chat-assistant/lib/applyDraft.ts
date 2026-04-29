import { nanoid } from "nanoid"
import { validateImportData } from "@/entities/resume/validation/import"
import type {
  CoreSkillItem,
  EducationItem,
  ReferenceItem,
  ResumeImportData,
  WorkExperienceItem,
  ProjectItem,
  CertificateItem,
  AchievementItem,
} from "@/entities/resume/types"
import type {
  AppendListItemChange,
  ProposedChange,
  ShowSectionChange,
  UpdateListItemChange,
} from "@/features/chat-assistant/types"

type ApplyDraftResult =
  | { ok: true; data: ResumeImportData }
  | { ok: false; error: string }

type ObjectWithId = { id: string }

const withId = <T extends { id?: string }>(value: T): T & { id: string } => ({
  ...value,
  id: value.id ?? nanoid(),
})

const appendObjectItem = <T extends ObjectWithId, TValue extends Omit<T, "id"> & { id?: string }>(
  items: T[],
  value: TValue,
): T[] => [...items, withId(value) as unknown as T]

const updateObjectItem = <T extends ObjectWithId>(
  items: T[],
  itemId: string,
  value: Partial<T>,
) => {
  const index = items.findIndex((item) => item.id === itemId)
  if (index === -1) return null

  const nextItems = [...items]
  nextItems[index] = {
    ...nextItems[index],
    ...value,
    id: itemId,
  }

  return nextItems
}

const deleteObjectItem = <T extends ObjectWithId>(items: T[], itemId: string) => {
  const nextItems = items.filter((item) => item.id !== itemId)
  return nextItems.length === items.length ? null : nextItems
}

const applyShowSectionChange = (
  data: ResumeImportData,
  change: ShowSectionChange,
) => {
  data.enableInRender[change.section] = true
}

const appendListSectionItem = (
  data: ResumeImportData,
  change: AppendListItemChange,
) => {
  switch (change.section) {
    case "workExperiences":
      data.workExperiences = appendObjectItem(data.workExperiences, change.value as Omit<WorkExperienceItem, "id"> & { id?: string })
      return
    case "personalProjects":
      data.personalProjects = appendObjectItem(data.personalProjects, change.value as Omit<ProjectItem, "id"> & { id?: string })
      return
    case "education":
      data.education = appendObjectItem(data.education, change.value as Omit<EducationItem, "id"> & { id?: string })
      return
    case "certificates":
      data.certificates = appendObjectItem(data.certificates, change.value as Omit<CertificateItem, "id"> & { id?: string })
      return
    case "achievements":
      data.achievements = appendObjectItem(data.achievements, change.value as Omit<AchievementItem, "id"> & { id?: string })
      return
    case "references":
      data.references = appendObjectItem(data.references, change.value as Omit<ReferenceItem, "id"> & { id?: string })
      return
  }
}

const updateListSectionItem = (
  data: ResumeImportData,
  change: UpdateListItemChange,
): boolean => {
  switch (change.section) {
    case "workExperiences": {
      const nextItems = updateObjectItem(data.workExperiences, change.itemId, change.value as Partial<WorkExperienceItem>)
      if (!nextItems) return false
      data.workExperiences = nextItems
      return true
    }
    case "personalProjects": {
      const nextItems = updateObjectItem(data.personalProjects, change.itemId, change.value as Partial<ProjectItem>)
      if (!nextItems) return false
      data.personalProjects = nextItems
      return true
    }
    case "education": {
      const nextItems = updateObjectItem(data.education, change.itemId, change.value as Partial<EducationItem>)
      if (!nextItems) return false
      data.education = nextItems
      return true
    }
    case "certificates": {
      const nextItems = updateObjectItem(data.certificates, change.itemId, change.value as Partial<CertificateItem>)
      if (!nextItems) return false
      data.certificates = nextItems
      return true
    }
    case "achievements": {
      const nextItems = updateObjectItem(data.achievements, change.itemId, change.value as Partial<AchievementItem>)
      if (!nextItems) return false
      data.achievements = nextItems
      return true
    }
    case "references": {
      const nextItems = updateObjectItem(data.references, change.itemId, change.value as Partial<ReferenceItem>)
      if (!nextItems) return false
      data.references = nextItems
      return true
    }
  }
}

const deleteListSectionItem = (
  data: ResumeImportData,
  section: Exclude<AppendListItemChange["section"], never>,
  itemId: string,
): boolean => {
  switch (section) {
    case "workExperiences": {
      const nextItems = deleteObjectItem(data.workExperiences, itemId)
      if (!nextItems) return false
      data.workExperiences = nextItems
      return true
    }
    case "personalProjects": {
      const nextItems = deleteObjectItem(data.personalProjects, itemId)
      if (!nextItems) return false
      data.personalProjects = nextItems
      return true
    }
    case "education": {
      const nextItems = deleteObjectItem(data.education, itemId)
      if (!nextItems) return false
      data.education = nextItems
      return true
    }
    case "certificates": {
      const nextItems = deleteObjectItem(data.certificates, itemId)
      if (!nextItems) return false
      data.certificates = nextItems
      return true
    }
    case "achievements": {
      const nextItems = deleteObjectItem(data.achievements, itemId)
      if (!nextItems) return false
      data.achievements = nextItems
      return true
    }
    case "references": {
      const nextItems = deleteObjectItem(data.references, itemId)
      if (!nextItems) return false
      data.references = nextItems
      return true
    }
  }
}

export const applyAiDraftChanges = (
  resumeData: ResumeImportData,
  changes: ProposedChange[],
): ApplyDraftResult => {
  const nextData = structuredClone(resumeData)

  for (const change of changes) {
    if (change.type === "show_section") {
      applyShowSectionChange(nextData, change)
    }
  }

  for (const change of changes) {
    if (change.type === "show_section") continue

    switch (change.type) {
      case "replace_field":
        nextData.personalDetails.summary = change.value
        break
      case "replace_list":
        if (change.section === "personalDetails.knownLanguages") {
          nextData.personalDetails.knownLanguages = [...change.value]
          break
        }
        if (change.section === "softSkills") {
          nextData.softSkills = [...change.value]
          break
        }
        nextData.coreSkills = change.value.map((item) => withId(item) as CoreSkillItem)
        break
      case "append_item":
        if (change.section === "personalDetails.knownLanguages") {
          nextData.personalDetails.knownLanguages = [
            ...nextData.personalDetails.knownLanguages,
            change.value,
          ]
          break
        }
        if (change.section === "softSkills") {
          nextData.softSkills = [...nextData.softSkills, change.value]
          break
        }
        if (change.section === "coreSkills") {
          nextData.coreSkills = appendObjectItem(nextData.coreSkills, change.value)
          break
        }
        appendListSectionItem(nextData, change)
        break
      case "update_item":
        if (change.section === "coreSkills") {
          const nextItems = updateObjectItem(nextData.coreSkills, change.itemId, change.value as Partial<CoreSkillItem>)
          if (!nextItems) {
            return {
              ok: false,
              error: "The AI draft referenced a resume item that does not exist in local data anymore.",
            }
          }
          nextData.coreSkills = nextItems
          break
        }
        if (!updateListSectionItem(nextData, change)) {
          return {
            ok: false,
            error: "The AI draft referenced a resume item that does not exist in local data anymore.",
          }
        }
        break
      case "delete_item":
        if (change.section === "coreSkills") {
          const nextItems = deleteObjectItem(nextData.coreSkills, change.itemId)
          if (!nextItems) {
            return {
              ok: false,
              error: "The AI draft referenced a resume item that does not exist in local data anymore.",
            }
          }
          nextData.coreSkills = nextItems
          break
        }
        if (!deleteListSectionItem(nextData, change.section, change.itemId)) {
          return {
            ok: false,
            error: "The AI draft referenced a resume item that does not exist in local data anymore.",
          }
        }
        break
    }
  }

  const validatedData = validateImportData(nextData)
  if (!validatedData) {
    return {
      ok: false,
      error: "The AI draft could not be applied safely to the current resume data.",
    }
  }

  return {
    ok: true,
    data: validatedData,
  }
}
