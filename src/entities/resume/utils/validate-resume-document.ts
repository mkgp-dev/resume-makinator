import { z } from 'zod'

import type { ResumeDocument } from '@/entities/resume/model'

const personalDetailsSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  headline: z.string(),
  website: z.string(),
  linkedin: z.string(),
  github: z.string(),
  summary: z.string(),
})

const workExperienceItemSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  jobTitle: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  location: z.string(),
  summary: z.string(),
  bulletPoints: z.array(z.string()),
})

const projectItemSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  role: z.string(),
  techStack: z.array(z.string()),
  url: z.string(),
  summary: z.string(),
  bulletPoints: z.array(z.string()),
})

const educationItemSchema = z.object({
  id: z.string(),
  schoolName: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  location: z.string(),
  description: z.string(),
})

const certificateItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string(),
  credentialId: z.string(),
  credentialUrl: z.string(),
  description: z.string(),
})

const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  description: z.string(),
})

const referenceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
})

const knownLanguageItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  proficiency: z.string(),
})

const coreSkillItemSchema = z.object({
  id: z.string(),
  devLanguage: z.string(),
  devFrameworks: z.array(z.string()),
})

const resumeSectionKeySchema = z.enum([
  'personalDetails',
  'workExperiences',
  'personalProjects',
  'education',
  'certificates',
  'achievements',
  'references',
  'coreSkills',
  'softSkills',
  'knownLanguages',
])

const sectionVisibilitySchema = z.object({
  personalDetails: z.boolean().optional(),
  workExperiences: z.boolean().optional(),
  personalProjects: z.boolean().optional(),
  education: z.boolean().optional(),
  certificates: z.boolean().optional(),
  achievements: z.boolean().optional(),
  references: z.boolean().optional(),
  coreSkills: z.boolean().optional(),
  softSkills: z.boolean().optional(),
  knownLanguages: z.boolean().optional(),
})

const resumeContentSchema = z.object({
  personalDetails: personalDetailsSchema,
  workExperiences: z.array(workExperienceItemSchema),
  personalProjects: z.array(projectItemSchema),
  education: z.array(educationItemSchema),
  certificates: z.array(certificateItemSchema),
  achievements: z.array(achievementItemSchema),
  references: z.array(referenceItemSchema),
  coreSkills: z.array(coreSkillItemSchema),
  softSkills: z.array(z.string()),
  knownLanguages: z.array(knownLanguageItemSchema),
})

const resumeSettingsSchema = z.object({
  template: z.literal('whitepaper'),
  sectionOrder: z.array(resumeSectionKeySchema),
  sectionVisibility: sectionVisibilitySchema,
  fontScale: z.union([z.literal(0.85), z.literal(1.0), z.literal(1.15)]),
  accentColor: z.string(),
})

export const resumeDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  content: resumeContentSchema,
  settings: resumeSettingsSchema,
})

export function validateResumeDocument(input: unknown): ResumeDocument {
  return resumeDocumentSchema.parse(input)
}
