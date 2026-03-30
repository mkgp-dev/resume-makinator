import { View, StyleSheet } from "@react-pdf/renderer"
import Header from "@/features/viewer/templates/classic/Header"
import Section from "@/features/viewer/templates/classic/Section"
import { createTemplateSections } from "@/features/viewer/templates/blocks/createSections"
import type { ResumePreviewData, TemplateSectionKey } from "@/entities/resume/types"

type ClassicProps = {
    data: ResumePreviewData
}

export default function Classic({ data }: ClassicProps) {
    const templateConfig = data.template.classic
    const baseFontSize = data.configuration.fontSize

    const styles = StyleSheet.create({
        page: {
            fontFamily: data.configuration.fontStyle,
            fontSize: baseFontSize,
            gap: templateConfig.blockSpace,
        },
    })

    const visibleSections = createTemplateSections({
        data,
        config: templateConfig,
        variant: "classic",
        titles: {
            summary: "Profile",
            coreSkills: "Skills",
            workExperiences: "Professional Experience",
            personalProjects: "Projects",
            certificates: "Certificates",
            achievements: "Awards",
            softSkills: "Soft Skills",
            education: "Education",
            knownLanguages: "Languages",
            references: "References",
        } satisfies Record<TemplateSectionKey, string>,
        baseFontSize,
    })

    return (
        <View style={styles.page}>
            {data.personalDetails.fullName ? (
                <Header data={data.personalDetails} config={templateConfig} />
            ) : null}

            {visibleSections.map(section => (
                <Section key={section.key} title={section.title}>
                    {section.content}
                </Section>
            ))}
        </View>
    )
}
