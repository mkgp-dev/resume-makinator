import { Box, Text } from '@mantine/core'
import { lazy, Suspense } from 'react'

import type { ResumeDocument } from '@/entities/resume/model'

const ResumePreviewPdf = lazy(async () => import('./ResumePreviewPdf').then((module) => ({ default: module.ResumePreviewPdf })))

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function hasItemContent(item: Record<string, unknown>): boolean {
  return Object.entries(item).some(([key, value]) => {
    if (key === 'id') {
      return false
    }
    if (typeof value === 'boolean') {
      return value
    }
    if (hasNonEmptyString(value)) {
      return true
    }
    if (Array.isArray(value)) {
      return value.some((entry) => hasNonEmptyString(entry))
    }
    return false
  })
}

function hasMeaningfulResumeContent(resume: ResumeDocument): boolean {
  const { personalDetails, workExperiences, personalProjects, education, certificates, achievements, references, coreSkills, softSkills, knownLanguages } = resume.content

  const hasPersonalDetails = Object.values(personalDetails).some(hasNonEmptyString)
  const hasWork = workExperiences.some((item) => hasItemContent(item))
  const hasProjects = personalProjects.some((item) => hasItemContent(item))
  const hasEducation = education.some((item) => hasItemContent(item))
  const hasCertificates = certificates.some((item) => hasItemContent(item))
  const hasAchievements = achievements.some((item) => hasItemContent(item))
  const hasReferences = references.some((item) => hasItemContent(item))
  const hasCoreSkills = coreSkills.some((item) => hasItemContent(item))
  const hasSoftSkills = softSkills.some((skill) => hasNonEmptyString(skill))
  const hasKnownLanguages = knownLanguages.some((item) => hasItemContent(item))

  return (
    hasPersonalDetails ||
    hasWork ||
    hasProjects ||
    hasEducation ||
    hasCertificates ||
    hasAchievements ||
    hasReferences ||
    hasCoreSkills ||
    hasSoftSkills ||
    hasKnownLanguages
  )
}

export function ResumePreviewPanel({ resume }: { resume: ResumeDocument | null }) {
  if (!resume) {
    return (
      <Box
        p={20}
        data-testid="builder-preview-region"
        style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text size="xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
          No resume loaded.
        </Text>
      </Box>
    )
  }

  const isResumeEmpty = !hasMeaningfulResumeContent(resume)

  if (isResumeEmpty) {
    return (
      <Box
        p={24}
        data-testid="builder-preview-region"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <Box
          style={{
            width: 160,
            height: 220,
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {[60, 100, 80, 90, 70, 85].map((width, index) => (
            <Box
              key={index}
              style={{
                width: `${width}%`,
                height: 2,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 1,
              }}
            />
          ))}
        </Box>

        <Text
          size="xs"
          ta="center"
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
            maxWidth: 200,
          }}
        >
          Fill in your details to see a live preview
        </Text>
      </Box>
    )
  }

  return (
    <Box
      p={0}
      data-testid="builder-preview-region"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Suspense
        fallback={
          <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text size="xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
              Rendering...
            </Text>
          </Box>
        }
      >
        <ResumePreviewPdf resume={resume} />
      </Suspense>
    </Box>
  )
}
