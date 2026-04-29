import type { ResumeData, ResumeImportData } from "@/entities/resume/types"
import type { ResumeDataForAi } from "@/features/chat-assistant/types"

export const createChatResumeData = (resumeData: ResumeData | ResumeImportData): ResumeDataForAi => {
  return {
    personalDetails: {
      summary: resumeData.personalDetails.summary,
      knownLanguages: [...resumeData.personalDetails.knownLanguages],
    },
    coreSkills: resumeData.coreSkills.map((item) => ({
      id: item.id,
      devLanguage: item.devLanguage,
      devFramework: [...item.devFramework],
    })),
    softSkills: [...resumeData.softSkills],
    workExperiences: resumeData.workExperiences.map((item) => ({
      ...item,
      bulletSummary: [...item.bulletSummary],
    })),
    personalProjects: resumeData.personalProjects.map((item) => ({
      ...item,
      bulletSummary: [...item.bulletSummary],
    })),
    education: resumeData.education.map((item) => ({ ...item })),
    certificates: resumeData.certificates.map((item) => ({ ...item })),
    achievements: resumeData.achievements.map((item) => ({ ...item })),
    references: resumeData.references.map((item) => ({ ...item })),
    enableInRender: { ...resumeData.enableInRender },
  }
}
