import { View, StyleSheet } from "@react-pdf/renderer"
import Header from "@/features/viewer/templates/whitepaper/Header"
import Section from "@/features/viewer/templates/whitepaper/Section"
import { createTemplateSections } from "@/features/viewer/templates/blocks/createSections"
import type { ResumePreviewData, TemplateSectionKey } from "@/entities/resume/types"

type WhitepaperProps = {
    data: ResumePreviewData
}

export default function Whitepaper({ data }: WhitepaperProps) {
    const baseFontSize = data.configuration.fontSize
    const templateConfig = data.template.whitepaper
    const style = StyleSheet.create({
        page: {
            fontFamily: data.configuration.fontStyle,
            fontSize: baseFontSize,
            gap: templateConfig.blockSpace,
        },
    })

    const sectionTitles: Record<TemplateSectionKey, string> = {
        summary: "About me",
        coreSkills: "Core skills",
        workExperiences: "Experience",
        personalProjects: "Personal Projects",
        certificates: "Certificates",
        achievements: "Achievements",
        softSkills: "Soft Skills",
        education: "Education",
        knownLanguages: "Languages",
        references: "References",
    }

    const visibleSections = createTemplateSections({
        data,
        config: templateConfig,
        variant: "whitepaper",
        titles: sectionTitles,
        baseFontSize,
    })

    return (
        <View style={style.page}>
            {data.personalDetails.fullName ? (
                <Header data={data.personalDetails} config={templateConfig} baseFontSize={baseFontSize} />
            ) : null}

            {visibleSections.map((section, index) => (
                <Section
                    key={section.key}
                    title={section.title}
                    disableBorder={index === visibleSections.length - 1}
                    baseFontSize={baseFontSize}
                >
                    {section.content}
                </Section>
            ))}
        </View>
    )
}
