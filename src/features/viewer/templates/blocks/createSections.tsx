import { Text } from "@react-pdf/renderer"
import Achievement from "@/features/viewer/templates/blocks/Achievement"
import Certificate from "@/features/viewer/templates/blocks/Certificate"
import CoreSkill from "@/features/viewer/templates/blocks/CoreSkill"
import Education from "@/features/viewer/templates/blocks/Education"
import Experience from "@/features/viewer/templates/blocks/Experience"
import Language from "@/features/viewer/templates/blocks/Language"
import Project from "@/features/viewer/templates/blocks/Project"
import Reference from "@/features/viewer/templates/blocks/Reference"
import SoftSkill from "@/features/viewer/templates/blocks/SoftSkill"
import { normalizeTemplateSectionOrder } from "@/entities/resume/lib/templateSections"
import type {
    ResumePreviewData,
    SharedTemplateConfig,
    TemplateId,
    TemplateSectionKey,
} from "@/entities/resume/types"
import type { ReactNode } from "react"

type SectionTitleMap = Record<TemplateSectionKey, string>

type TemplateSection = {
    key: TemplateSectionKey
    title: string
    show: boolean
    content: ReactNode
}

type CreateTemplateSectionsParams = {
    data: ResumePreviewData
    config: SharedTemplateConfig
    variant: TemplateId
    titles: SectionTitleMap
    baseFontSize: number
    modernLayoutBySection?: Partial<Record<TemplateSectionKey, "sidebar" | "main">>
}

export const createTemplateSections = ({
    data,
    config,
    variant,
    titles,
    baseFontSize,
    modernLayoutBySection,
}: CreateTemplateSectionsParams) => {
    const sections: Record<TemplateSectionKey, TemplateSection> = {
        summary: {
            key: "summary",
            title: titles.summary,
            show: data.enableInRender.summary && Boolean(data.personalDetails.summary),
            content: <Text>{data.personalDetails.summary}</Text>,
        },
        coreSkills: {
            key: "coreSkills",
            title: titles.coreSkills,
            show: data.enableInRender.coreSkills && data.coreSkills.length > 0,
            content: <CoreSkill items={data.coreSkills} />,
        },
        workExperiences: {
            key: "workExperiences",
            title: titles.workExperiences,
            show: data.enableInRender.workExperiences && data.workExperiences.length > 0,
            content: <Experience items={data.workExperiences} variant={variant} baseFontSize={baseFontSize} />,
        },
        personalProjects: {
            key: "personalProjects",
            title: titles.personalProjects,
            show: data.enableInRender.personalProjects && data.personalProjects.length > 0,
            content: <Project items={data.personalProjects} variant={variant} baseFontSize={baseFontSize} />,
        },
        certificates: {
            key: "certificates",
            title: titles.certificates,
            show: data.enableInRender.certificates && data.certificates.length > 0,
            content: <Certificate items={data.certificates} config={config} variant={variant} baseFontSize={baseFontSize} />,
        },
        achievements: {
            key: "achievements",
            title: titles.achievements,
            show: data.enableInRender.achievements && data.achievements.length > 0,
            content: <Achievement items={data.achievements} config={config} variant={variant} baseFontSize={baseFontSize} />,
        },
        softSkills: {
            key: "softSkills",
            title: titles.softSkills,
            show: data.enableInRender.softSkills && data.softSkills.length > 0,
            content: <SoftSkill items={data.softSkills} variant={variant} baseFontSize={baseFontSize} />,
        },
        education: {
            key: "education",
            title: titles.education,
            show: data.enableInRender.education && data.education.length > 0,
            content: <Education items={data.education} variant={variant} />,
        },
        knownLanguages: {
            key: "knownLanguages",
            title: titles.knownLanguages,
            show: data.enableInRender.language && data.personalDetails.knownLanguages.length > 0,
            content: <Language items={data.personalDetails.knownLanguages} variant={variant} />,
        },
        references: {
            key: "references",
            title: titles.references,
            show: data.enableInRender.references && data.references.length > 0,
            content: <Reference
                items={data.references}
                variant={variant}
                modernLayout={modernLayoutBySection?.references}
            />,
        },
    }

    return normalizeTemplateSectionOrder(config.sectionOrder)
        .map((key) => sections[key])
        .filter((section) => section.show)
}
