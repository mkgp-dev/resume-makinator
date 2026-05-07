import { Stack, Text } from '@mantine/core'
import { useMemo } from 'react'

import type { ResumeSectionKey } from '@/entities/resume/model'
import { useActiveResumeStore } from '@/entities/resume/store'
import { useChatAssistantStore } from '@/features/chat-assistant/store/use-chat-assistant-store'
import { AchievementsEditor } from '@/features/resume-editor/components/AchievementsEditor'
import { CertificatesEditor } from '@/features/resume-editor/components/CertificatesEditor'
import { CoreSkillsEditor } from '@/features/resume-editor/components/CoreSkillsEditor'
import { EducationEditor } from '@/features/resume-editor/components/EducationEditor'
import { KnownLanguagesEditor } from '@/features/resume-editor/components/KnownLanguagesEditor'
import { PersonalDetailsForm } from '@/features/resume-editor/components/PersonalDetailsForm'
import { ProjectsEditor } from '@/features/resume-editor/components/ProjectsEditor'
import { ReferencesEditor } from '@/features/resume-editor/components/ReferencesEditor'
import { SectionShell } from '@/features/resume-editor/components/SectionShell'
import { SoftSkillsEditor } from '@/features/resume-editor/components/SoftSkillsEditor'
import { WorkExperienceEditor } from '@/features/resume-editor/components/WorkExperienceEditor'

export function ResumeEditor() {
  const activeResume = useActiveResumeStore((state) => state.activeResume)
  const updateActiveResumeContent = useActiveResumeStore((state) => state.updateActiveResumeContent)
  const flashSections = useChatAssistantStore((state) => state.flashSections)

  const sectionOrder = activeResume?.settings.sectionOrder ?? []
  const sectionVisibility = activeResume?.settings.sectionVisibility ?? {}

  const editors = useMemo(() => {
    if (!activeResume) {
      return {}
    }

    const content = activeResume.content

    return {
      personalDetails: (
        <PersonalDetailsForm
          details={content.personalDetails}
          onChange={(nextDetails) => {
            void updateActiveResumeContent((prev) => ({ ...prev, personalDetails: nextDetails }))
          }}
        />
      ),
      workExperiences: (
        <WorkExperienceEditor
          items={content.workExperiences}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, workExperiences: nextItems }))
          }}
        />
      ),
      personalProjects: (
        <ProjectsEditor
          items={content.personalProjects}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, personalProjects: nextItems }))
          }}
        />
      ),
      education: (
        <EducationEditor
          items={content.education}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, education: nextItems }))
          }}
        />
      ),
      certificates: (
        <CertificatesEditor
          items={content.certificates}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, certificates: nextItems }))
          }}
        />
      ),
      achievements: (
        <AchievementsEditor
          items={content.achievements}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, achievements: nextItems }))
          }}
        />
      ),
      references: (
        <ReferencesEditor
          items={content.references}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, references: nextItems }))
          }}
        />
      ),
      coreSkills: (
        <CoreSkillsEditor
          items={content.coreSkills}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, coreSkills: nextItems }))
          }}
        />
      ),
      softSkills: (
        <SoftSkillsEditor
          items={content.softSkills}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, softSkills: nextItems }))
          }}
        />
      ),
      knownLanguages: (
        <KnownLanguagesEditor
          items={content.knownLanguages}
          onChange={(nextItems) => {
            void updateActiveResumeContent((prev) => ({ ...prev, knownLanguages: nextItems }))
          }}
        />
      ),
    } satisfies Partial<Record<ResumeSectionKey, React.ReactNode>>
  }, [activeResume, updateActiveResumeContent])

  if (!activeResume) {
    return <Text c="dimmed">Loading editor...</Text>
  }

  return (
    <Stack gap={0}>
      {sectionOrder.map((sectionKey) => {
        const hidden = sectionVisibility[sectionKey] === false

        return (
          <SectionShell
            key={sectionKey}
            sectionKey={sectionKey}
            hidden={hidden}
            isFlashing={flashSections.includes(sectionKey)}
          >
            {editors[sectionKey]}
          </SectionShell>
        )
      })}
    </Stack>
  )
}
