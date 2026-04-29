import type {
  AchievementItem,
  CertificateItem,
  CoreSkillItem,
  EducationItem,
  ProjectItem,
  ReferenceItem,
  RenderConfig,
  ResumeImportData,
  WorkExperienceItem,
} from "@/entities/resume/types"

export type AiAssistantMode = "chat" | "plan"

export type AiModel = "gemini" | "nova" | "mistral" | "openai"

export type AiMessageRole = "user" | "assistant"

export type AiChatMessage = {
  role: AiMessageRole
  content: string
}

export type ChatMessageRecord = AiChatMessage & {
  id: string
}

export type ChatNoticeVariant = "warning" | "error"

export type ChatNoticeRecord = {
  id: string
  variant: ChatNoticeVariant
  text: string
}

export type AiPlanTargetSection =
  | "summary"
  | "languages"
  | "coreSkills"
  | "softSkills"
  | "workExperiences"
  | "personalProjects"
  | "education"
  | "certificates"
  | "achievements"
  | "references"

export type AiPlanTargetOperation = "create" | "read" | "update" | "delete"

export type AiPlanTarget = {
  section: AiPlanTargetSection
  operation?: AiPlanTargetOperation
  itemId?: string
}

export type ResumeDataForAi = {
  personalDetails?: {
    summary?: string
    knownLanguages?: string[]
  }
  coreSkills?: CoreSkillItem[]
  softSkills?: string[]
  workExperiences?: WorkExperienceItem[]
  personalProjects?: ProjectItem[]
  education?: EducationItem[]
  certificates?: CertificateItem[]
  achievements?: AchievementItem[]
  references?: ReferenceItem[]
  enableInRender?: RenderConfig
}

type ResumeCoreSkillValue = Omit<CoreSkillItem, "id"> & { id?: string }
type ResumeWorkExperienceValue = Omit<WorkExperienceItem, "id"> & { id?: string }
type ResumeProjectValue = Omit<ProjectItem, "id"> & { id?: string }
type ResumeEducationValue = Omit<EducationItem, "id"> & { id?: string }
type ResumeCertificateValue = Omit<CertificateItem, "id"> & { id?: string }
type ResumeAchievementValue = Omit<AchievementItem, "id"> & { id?: string }
type ResumeReferenceValue = Omit<ReferenceItem, "id"> & { id?: string }

export type ListSection =
  | "workExperiences"
  | "personalProjects"
  | "education"
  | "certificates"
  | "achievements"
  | "references"

export type ShowSectionKey =
  | "summary"
  | "language"
  | "coreSkills"
  | "softSkills"
  | "workExperiences"
  | "personalProjects"
  | "education"
  | "certificates"
  | "achievements"
  | "references"

export type ReplaceFieldChange = {
  type: "replace_field"
  section: "personalDetails"
  field: "summary"
  value: string
}

export type ReplaceLanguageListChange = {
  type: "replace_list"
  section: "personalDetails.knownLanguages"
  value: string[]
}

export type AppendLanguageChange = {
  type: "append_item"
  section: "personalDetails.knownLanguages"
  value: string
}

export type ReplaceCoreSkillsChange = {
  type: "replace_list"
  section: "coreSkills"
  value: ResumeCoreSkillValue[]
}

export type AppendCoreSkillsChange = {
  type: "append_item"
  section: "coreSkills"
  value: ResumeCoreSkillValue
}

export type UpdateCoreSkillsChange = {
  type: "update_item"
  section: "coreSkills"
  itemId: string
  value: Partial<ResumeCoreSkillValue>
}

export type DeleteCoreSkillsChange = {
  type: "delete_item"
  section: "coreSkills"
  itemId: string
}

export type ReplaceSoftSkillsChange = {
  type: "replace_list"
  section: "softSkills"
  value: string[]
}

export type AppendSoftSkillsChange = {
  type: "append_item"
  section: "softSkills"
  value: string
}

type AppendItemValueMap = {
  workExperiences: ResumeWorkExperienceValue
  personalProjects: ResumeProjectValue
  education: ResumeEducationValue
  certificates: ResumeCertificateValue
  achievements: ResumeAchievementValue
  references: ResumeReferenceValue
}

type UpdateItemValueMap = {
  workExperiences: Partial<ResumeWorkExperienceValue>
  personalProjects: Partial<ResumeProjectValue>
  education: Partial<ResumeEducationValue>
  certificates: Partial<ResumeCertificateValue>
  achievements: Partial<ResumeAchievementValue>
  references: Partial<ResumeReferenceValue>
}

export type AppendListItemChange = {
  [Section in ListSection]: {
    type: "append_item"
    section: Section
    value: AppendItemValueMap[Section]
  }
}[ListSection]

export type UpdateListItemChange = {
  [Section in ListSection]: {
    type: "update_item"
    section: Section
    itemId: string
    value: UpdateItemValueMap[Section]
  }
}[ListSection]

export type DeleteListItemChange = {
  [Section in ListSection]: {
    type: "delete_item"
    section: Section
    itemId: string
  }
}[ListSection]

export type ShowSectionChange = {
  type: "show_section"
  section: ShowSectionKey
  value: true
  required: true
}

export type ProposedChange =
  | ReplaceFieldChange
  | ReplaceLanguageListChange
  | AppendLanguageChange
  | ReplaceCoreSkillsChange
  | AppendCoreSkillsChange
  | UpdateCoreSkillsChange
  | DeleteCoreSkillsChange
  | ReplaceSoftSkillsChange
  | AppendSoftSkillsChange
  | AppendListItemChange
  | UpdateListItemChange
  | DeleteListItemChange
  | ShowSectionChange

export type AiDraft = {
  title: string
  target: AiPlanTarget
  previewText: string
  proposedChanges: ProposedChange[]
  assumptions?: string[]
  questions?: string[]
}

export type AiChatRequestDto = {
  service: "resume"
  mode: AiAssistantMode
  model: AiModel
  message: string
  resumeData?: ResumeDataForAi
  recentMessages?: AiChatMessage[]
  target?: AiPlanTarget
}

export type AiChatAction =
  | "chat_reply"
  | "resume_review"
  | "section_advice"
  | "ask_clarification"
  | "propose_change"
  | "unsupported_service"
  | "quota_unavailable"
  | "error"

export type AiDebugMeta = Record<string, unknown>

export type AiChatResponseDto = {
  action: AiChatAction
  reply: string
  draft?: AiDraft
  warnings?: string[]
  debugMeta?: AiDebugMeta
}

export type ChatAssistantPersistedState = {
  messages: ChatMessageRecord[]
  selectedModel: AiModel
  selectedMode: AiAssistantMode
  selectedPlanSection?: AiPlanTarget["section"]
  activeDraft: AiDraft | null
}

export type TargetLabelResumeData = Pick<
  ResumeImportData,
  | "personalProjects"
  | "workExperiences"
  | "education"
  | "certificates"
  | "achievements"
  | "references"
  | "coreSkills"
>
