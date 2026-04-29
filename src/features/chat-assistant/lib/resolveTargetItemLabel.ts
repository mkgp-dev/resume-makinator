import type { AiPlanTarget, TargetLabelResumeData } from "@/features/chat-assistant/types"

export const resolveTargetItemLabel = (
  target: AiPlanTarget,
  resumeData: TargetLabelResumeData,
) => {
  if (!target.itemId) return null

  switch (target.section) {
    case "personalProjects":
      return resumeData.personalProjects.find((item) => item.id === target.itemId)?.projectName ?? null
    case "workExperiences":
      return resumeData.workExperiences.find((item) => item.id === target.itemId)?.companyName ?? null
    case "education":
      return resumeData.education.find((item) => item.id === target.itemId)?.schoolName ?? null
    case "certificates":
      return resumeData.certificates.find((item) => item.id === target.itemId)?.certificateName ?? null
    case "achievements":
      return resumeData.achievements.find((item) => item.id === target.itemId)?.achievementName ?? null
    case "references":
      return resumeData.references.find((item) => item.id === target.itemId)?.fullName ?? null
    case "coreSkills":
      return resumeData.coreSkills.find((item) => item.id === target.itemId)?.devLanguage ?? null
    default:
      return null
  }
}
