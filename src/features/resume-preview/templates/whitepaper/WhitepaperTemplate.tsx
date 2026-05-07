import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import type {
  AchievementItem,
  CertificateItem,
  CoreSkillItem,
  EducationItem,
  KnownLanguageItem,
  ProjectItem,
  ReferenceItem,
  ResumeDocument,
  ResumeSectionKey,
  WorkExperienceItem,
} from '@/entities/resume/model'
import { ensurePdfFontsRegistered } from '@/features/resume-preview/pdf/register-fonts'

ensurePdfFontsRegistered()

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Lora',
    color: '#1C1917',
    fontSize: 10,
    lineHeight: 1.4,
  },
  headerName: {
    fontSize: 22,
    fontWeight: 700,
  },
  headerHeadline: {
    fontSize: 11,
    marginTop: 4,
  },
  headerContact: {
    fontSize: 9,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#10B981',
  },
  sectionBody: {
    marginTop: 8,
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 10,
    fontWeight: 700,
  },
  subtle: {
    fontSize: 9,
  },
  text: {
    fontSize: 10,
  },
  bullet: {
    fontSize: 9,
    marginLeft: 12,
    marginTop: 2,
  },
})

const labels: Record<Exclude<ResumeSectionKey, 'personalDetails'>, string> = {
  workExperiences: 'Work Experience',
  personalProjects: 'Projects',
  education: 'Education',
  certificates: 'Certificates',
  achievements: 'Achievements',
  references: 'References',
  coreSkills: 'Core Skills',
  softSkills: 'Soft Skills',
  knownLanguages: 'Known Languages',
}

function formatDateRange(startDate: string, endDate: string, current: boolean): string {
  if (!startDate && !endDate && !current) {
    return ''
  }

  const endValue = current ? 'Present' : endDate || ''
  return [startDate, endValue].filter(Boolean).join(' - ')
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function renderWork(items: WorkExperienceItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{item.companyName || 'Company'}</Text>
        <Text style={styles.subtle}>{formatDateRange(item.startDate, item.endDate, item.current)}</Text>
      </View>
      <Text style={styles.subtle}>{item.jobTitle}</Text>
      {item.summary ? <Text style={styles.text}>{item.summary}</Text> : null}
      {item.bulletPoints.map((bullet) => (
        <Text key={`${item.id}-bullet-${bullet}`} style={styles.bullet}>
          - {bullet}
        </Text>
      ))}
    </View>
  ))
}

function renderProjects(items: ProjectItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <Text style={styles.title}>{item.projectName || 'Project'}</Text>
      {item.role ? <Text style={styles.subtle}>{item.role}</Text> : null}
      {item.summary ? <Text style={styles.text}>{item.summary}</Text> : null}
      {item.techStack.length > 0 ? <Text style={styles.subtle}>{item.techStack.join(', ')}</Text> : null}
      {item.url ? <Text style={styles.subtle}>{item.url}</Text> : null}
      {item.bulletPoints.map((bullet) => (
        <Text key={`${item.id}-bullet-${bullet}`} style={styles.bullet}>
          - {bullet}
        </Text>
      ))}
    </View>
  ))
}

function renderEducation(items: EducationItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{item.schoolName || 'School'}</Text>
        <Text style={styles.subtle}>{formatDateRange(item.startDate, item.endDate, item.current)}</Text>
      </View>
      <Text style={styles.subtle}>{[item.degree, item.fieldOfStudy].filter(Boolean).join(', ')}</Text>
      {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
    </View>
  ))
}

function renderCertificates(items: CertificateItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <Text style={styles.title}>{item.name || 'Certificate'}</Text>
      <Text style={styles.subtle}>{[item.issuer, item.issueDate].filter(Boolean).join(' - ')}</Text>
      {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
    </View>
  ))
}

function renderAchievements(items: AchievementItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <Text style={styles.title}>{item.title || 'Achievement'}</Text>
      <Text style={styles.subtle}>{[item.issuer, item.date].filter(Boolean).join(' - ')}</Text>
      {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
    </View>
  ))
}

function renderReferences(items: ReferenceItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <Text style={styles.title}>{item.name || 'Reference'}</Text>
      <Text style={styles.subtle}>{[item.role, item.company].filter(Boolean).join(' - ')}</Text>
      <Text style={styles.subtle}>{[item.email, item.phone].filter(Boolean).join(' | ')}</Text>
    </View>
  ))
}

function renderCoreSkills(items: CoreSkillItem[]) {
  return items.map((item) => (
    <View key={item.id}>
      <Text style={styles.title}>{item.devLanguage || 'Skill'}</Text>
      {item.devFrameworks.length > 0 ? <Text style={styles.subtle}>{item.devFrameworks.join(', ')}</Text> : null}
    </View>
  ))
}

function renderSoftSkills(items: string[]) {
  if (items.length === 0) {
    return []
  }

  return [<Text key="soft-skills" style={styles.text}>{items.join(', ')}</Text>]
}

function renderKnownLanguages(items: KnownLanguageItem[]) {
  return items.map((item) => (
    <View key={item.id} style={styles.rowBetween}>
      <Text style={styles.text}>{item.name || 'Language'}</Text>
      <Text style={styles.subtle}>{item.proficiency}</Text>
    </View>
  ))
}

function renderSectionContent(resume: ResumeDocument, sectionKey: Exclude<ResumeSectionKey, 'personalDetails'>): ReactNode[] {
  const content = resume.content

  switch (sectionKey) {
    case 'workExperiences':
      return renderWork(content.workExperiences)
    case 'personalProjects':
      return renderProjects(content.personalProjects)
    case 'education':
      return renderEducation(content.education)
    case 'certificates':
      return renderCertificates(content.certificates)
    case 'achievements':
      return renderAchievements(content.achievements)
    case 'references':
      return renderReferences(content.references)
    case 'coreSkills':
      return renderCoreSkills(content.coreSkills)
    case 'softSkills':
      return renderSoftSkills(content.softSkills)
    case 'knownLanguages':
      return renderKnownLanguages(content.knownLanguages)
    default:
      return []
  }
}

export function WhitepaperTemplate({ resume }: { resume: ResumeDocument }) {
  const details = resume.content.personalDetails
  const visibleSections: ReactNode[] = []

  const contactParts = [
    details.email,
    details.phone,
    details.location,
    details.website,
    details.linkedin,
    details.github,
  ].filter(Boolean)

  for (const sectionKey of resume.settings.sectionOrder) {
    if (sectionKey === 'personalDetails') {
      continue
    }

    if (resume.settings.sectionVisibility[sectionKey] === false) {
      continue
    }

    const nodes = renderSectionContent(resume, sectionKey)
    if (nodes.length === 0) {
      continue
    }

    visibleSections.push(
      <Section key={sectionKey} title={labels[sectionKey]}>
        {nodes}
      </Section>,
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerName}>{details.fullName || 'Resume'}</Text>
        {details.headline ? <Text style={styles.headerHeadline}>{details.headline}</Text> : null}
        {contactParts.length > 0 ? <Text style={styles.headerContact}>{contactParts.join(' | ')}</Text> : null}
        {details.summary ? (
          <View style={styles.section}>
            <Text style={styles.text}>{details.summary}</Text>
          </View>
        ) : null}
        {visibleSections}
      </Page>
    </Document>
  )
}
