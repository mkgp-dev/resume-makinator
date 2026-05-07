import type { ResumeContent } from '@/entities/resume/model'
import type { ResumeDataForAi } from '@/features/chat-assistant/model/ai-contract'

export function mapToAiResumeData(content: ResumeContent): ResumeDataForAi {
  const knownLanguages = content.knownLanguages
    .map((item) => {
      const name = item.name.trim()
      const proficiency = item.proficiency.trim()
      if (!name) {
        return ''
      }

      return proficiency ? `${name} (${proficiency})` : name
    })
    .filter(Boolean)

  return {
    personalDetails: {
      summary: content.personalDetails.summary,
      knownLanguages,
    },
    coreSkills: content.coreSkills.map((item) => ({
      id: item.id,
      devLanguage: item.devLanguage,
      devFramework: item.devFrameworks,
    })),
    softSkills: content.softSkills,
    workExperiences: content.workExperiences.map((item) => ({
      id: item.id,
      company: item.companyName,
      position: item.jobTitle,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      briefSummary: item.summary,
      bulletSummary: item.bulletPoints,
    })),
    personalProjects: content.personalProjects.map((item) => ({
      id: item.id,
      projectName: item.projectName,
      projectDescription: item.role,
      projectLink: item.url,
      technologies: item.techStack,
      briefSummary: item.summary,
      bulletSummary: item.bulletPoints,
    })),
    education: content.education.map((item) => ({
      id: item.id,
      school: item.schoolName,
      degree: item.degree,
      course: item.fieldOfStudy,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      description: item.description,
    })),
    certificates: content.certificates.map((item) => ({
      id: item.id,
      certificateName: item.name,
      issuer: item.issuer,
      date: item.issueDate,
      credentialUrl: item.credentialUrl,
      description: item.description,
    })),
    achievements: content.achievements.map((item) => ({
      id: item.id,
      achievementName: item.title,
      achievementDescription: item.description,
      date: item.date,
    })),
    references: content.references.map((item) => ({
      id: item.id,
      referenceName: item.name,
      referenceRole: item.role,
      company: item.company,
      referenceEmail: item.email,
      referencePhone: item.phone,
    })),
  }
}
