import type { ResumeImportData } from "@/entities/resume/types"
import type { AiChatResponse } from "@/features/chat-assistant/types"

type TargetLabelResumeData = Pick<
  ResumeImportData,
  | "personalProjects"
  | "workExperiences"
  | "education"
  | "certificates"
  | "achievements"
  | "references"
  | "coreSkills"
>

export const resolveTargetItemLabel = (
  target: AiChatResponse["target"],
  resumeData: TargetLabelResumeData,
) => {
  if (!target.itemId || !target.section) return null

  const { itemId, section } = target

  if (section === "personalProjects") {
    return resumeData.personalProjects.find((item) => item.id === itemId)?.projectName ?? null
  }

  if (section === "workExperiences") {
    return resumeData.workExperiences.find((item) => item.id === itemId)?.companyName ?? null
  }

  if (section === "education") {
    return resumeData.education.find((item) => item.id === itemId)?.schoolName ?? null
  }

  if (section === "certificates") {
    return resumeData.certificates.find((item) => item.id === itemId)?.certificateName ?? null
  }

  if (section === "achievements") {
    return resumeData.achievements.find((item) => item.id === itemId)?.achievementName ?? null
  }

  if (section === "references") {
    return resumeData.references.find((item) => item.id === itemId)?.fullName ?? null
  }

  if (section === "coreSkills") {
    return resumeData.coreSkills.find((item) => item.id === itemId)?.devLanguage ?? null
  }

  return null
}
