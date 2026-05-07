import { z } from 'zod'

const aiModelSchema = z.enum(['gemini', 'nova', 'mistral', 'openai'])
const aiModeSchema = z.enum(['chat', 'plan'])
const aiSectionSchema = z.enum([
  'summary',
  'languages',
  'coreSkills',
  'softSkills',
  'workExperiences',
  'personalProjects',
  'education',
  'certificates',
  'achievements',
  'references',
])

const aiPlanTargetSchema = z.object({
  section: aiSectionSchema,
  operation: z.enum(['create', 'update', 'delete']).optional(),
  itemId: z.string().min(1).optional(),
})

const aiChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const resumeCoreSkillSchema = z.object({
  id: z.string().optional(),
  devLanguage: z.string(),
  devFramework: z.array(z.string()),
})

const resumeWorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  briefSummary: z.string().optional(),
  bulletSummary: z.array(z.string()).optional(),
})

const resumeProjectSchema = z.object({
  id: z.string().optional(),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  projectLink: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  briefSummary: z.string().optional(),
  bulletSummary: z.array(z.string()).optional(),
})

const resumeEducationSchema = z.object({
  id: z.string().optional(),
  school: z.string().optional(),
  degree: z.string().optional(),
  course: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
})

const resumeCertificateSchema = z.object({
  id: z.string().optional(),
  certificateName: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  credentialUrl: z.string().optional(),
  description: z.string().optional(),
})

const resumeAchievementSchema = z.object({
  id: z.string().optional(),
  achievementName: z.string().optional(),
  achievementDescription: z.string().optional(),
  date: z.string().optional(),
})

const resumeReferenceSchema = z.object({
  id: z.string().optional(),
  referenceName: z.string().optional(),
  referenceRole: z.string().optional(),
  company: z.string().optional(),
  referenceEmail: z.string().optional(),
  referencePhone: z.string().optional(),
})

const resumeSectionVisibilitySchema = z.object({
  summary: z.boolean().optional(),
  language: z.boolean().optional(),
  coreSkills: z.boolean().optional(),
  softSkills: z.boolean().optional(),
  workExperiences: z.boolean().optional(),
  personalProjects: z.boolean().optional(),
  education: z.boolean().optional(),
  certificates: z.boolean().optional(),
  achievements: z.boolean().optional(),
  references: z.boolean().optional(),
})

export const resumeDataForAiSchema = z.object({
  personalDetails: z.object({
    summary: z.string().optional(),
    knownLanguages: z.array(z.string()).optional(),
  }).optional(),
  coreSkills: z.array(resumeCoreSkillSchema).optional(),
  softSkills: z.array(z.string()).optional(),
  workExperiences: z.array(resumeWorkExperienceSchema).optional(),
  personalProjects: z.array(resumeProjectSchema).optional(),
  education: z.array(resumeEducationSchema).optional(),
  certificates: z.array(resumeCertificateSchema).optional(),
  achievements: z.array(resumeAchievementSchema).optional(),
  references: z.array(resumeReferenceSchema).optional(),
  enableInRender: resumeSectionVisibilitySchema.optional(),
})

const proposedChangeSchema = z.union([
  z.object({
    type: z.literal('replace_field'),
    section: z.literal('personalDetails'),
    field: z.literal('summary'),
    value: z.string(),
  }),
  z.object({
    type: z.literal('replace_list'),
    section: z.literal('personalDetails.knownLanguages'),
    value: z.array(z.string()),
  }),
  z.object({
    type: z.literal('append_item'),
    section: z.literal('personalDetails.knownLanguages'),
    value: z.string(),
  }),
  z.object({
    type: z.literal('replace_list'),
    section: z.literal('coreSkills'),
    value: z.array(resumeCoreSkillSchema),
  }),
  z.object({
    type: z.literal('append_item'),
    section: z.literal('coreSkills'),
    value: resumeCoreSkillSchema,
  }),
  z.object({
    type: z.literal('update_item'),
    section: z.literal('coreSkills'),
    itemId: z.string(),
    value: resumeCoreSkillSchema.partial(),
  }),
  z.object({
    type: z.literal('delete_item'),
    section: z.literal('coreSkills'),
    itemId: z.string(),
  }),
  z.object({
    type: z.literal('replace_list'),
    section: z.literal('softSkills'),
    value: z.array(z.string()),
  }),
  z.object({
    type: z.literal('append_item'),
    section: z.literal('softSkills'),
    value: z.string(),
  }),
  z.object({
    type: z.literal('append_item'),
    section: z.enum(['workExperiences', 'personalProjects', 'education', 'certificates', 'achievements', 'references']),
    value: z.union([
      resumeWorkExperienceSchema,
      resumeProjectSchema,
      resumeEducationSchema,
      resumeCertificateSchema,
      resumeAchievementSchema,
      resumeReferenceSchema,
    ]),
  }),
  z.object({
    type: z.literal('update_item'),
    section: z.enum(['workExperiences', 'personalProjects', 'education', 'certificates', 'achievements', 'references']),
    itemId: z.string(),
    value: z.union([
      resumeWorkExperienceSchema.partial(),
      resumeProjectSchema.partial(),
      resumeEducationSchema.partial(),
      resumeCertificateSchema.partial(),
      resumeAchievementSchema.partial(),
      resumeReferenceSchema.partial(),
    ]),
  }),
  z.object({
    type: z.literal('delete_item'),
    section: z.enum(['workExperiences', 'personalProjects', 'education', 'certificates', 'achievements', 'references']),
    itemId: z.string(),
  }),
  z.object({
    type: z.literal('show_section'),
    section: z.enum([
      'summary',
      'language',
      'coreSkills',
      'softSkills',
      'workExperiences',
      'personalProjects',
      'education',
      'certificates',
      'achievements',
      'references',
    ]),
    value: z.literal(true),
    required: z.literal(true),
  }),
])

const aiDraftSchema = z.object({
  title: z.string(),
  target: aiPlanTargetSchema,
  previewText: z.string(),
  proposedChanges: z.array(proposedChangeSchema),
  assumptions: z.array(z.string()).optional(),
  questions: z.array(z.string()).optional(),
})

export const aiChatRequestSchema = z.object({
  service: z.literal('resume'),
  mode: aiModeSchema,
  model: aiModelSchema,
  message: z.string().min(1),
  resumeData: resumeDataForAiSchema.optional(),
  recentMessages: z.array(aiChatMessageSchema).optional(),
  target: aiPlanTargetSchema.optional(),
})

export const aiChatResponseSchema = z.object({
  action: z.enum([
    'chat_reply',
    'resume_review',
    'section_advice',
    'ask_clarification',
    'propose_change',
    'quota_unavailable',
    'error',
  ]),
  reply: z.string(),
  draft: aiDraftSchema.optional(),
  warnings: z.array(z.string()).optional(),
})

export type AiModel = z.infer<typeof aiModelSchema>
export type AiMode = z.infer<typeof aiModeSchema>
export type ResumeDataForAi = z.infer<typeof resumeDataForAiSchema>
export type AiPlanTarget = z.infer<typeof aiPlanTargetSchema>
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>
export type AiChatResponse = z.infer<typeof aiChatResponseSchema>
export type AiDraft = z.infer<typeof aiDraftSchema>
export type ProposedChange = z.infer<typeof proposedChangeSchema>
