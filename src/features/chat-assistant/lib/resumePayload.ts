import { createResumeImportData } from "@/entities/resume/lib/importExport"
import type { ResumeData } from "@/entities/resume/types"
import type { ChatResumeData } from "@/features/chat-assistant/types"

export const createChatResumeData = (resumeData: ResumeData): ChatResumeData => {
  const snapshot = createResumeImportData(resumeData)
  const {
    activePage: _activePage,
    configuration: _configuration,
    enableInRender: _enableInRender,
    template: _template,
    personalDetails,
    ...rest
  } = snapshot
  const { profilePicture: _profilePicture, ...safePersonalDetails } = personalDetails

  return {
    ...rest,
    personalDetails: safePersonalDetails,
  }
}
