import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Header from "@/features/viewer/templates/classic/blocks/Header"
import Section from "@/features/viewer/templates/classic/blocks/Section"
import Experience from "@/features/viewer/templates/classic/blocks/Experience"
import Project from "@/features/viewer/templates/classic/blocks/Project"
import Certificate from "@/features/viewer/templates/classic/blocks/Certificate"
import Education from "@/features/viewer/templates/classic/blocks/Education"
import CoreSkill from "@/features/viewer/templates/classic/blocks/CoreSkill"
import Reference from "@/features/viewer/templates/classic/blocks/Reference"
import SoftSkill from "@/features/viewer/templates/classic/blocks/SoftSkill"
import Achievement from "@/features/viewer/templates/classic/blocks/Achievement"
import Language from "@/features/viewer/templates/classic/blocks/Language"
import type { ClassicTemplateConfig, ResumePreviewData } from "@/entities/resume/types"

const defaultTemplateConfig: ClassicTemplateConfig = {
    blockSpace: 12,
    bulletText: false,
}

type ClassicProps = {
    data: ResumePreviewData
}

export default function Classic({ data }: ClassicProps) {
    const templateConfig = {
        ...defaultTemplateConfig,
        ...(data.template?.classic || {}),
    }

    const styles = StyleSheet.create({
        page: {
            fontFamily: data.configuration.fontStyle,
            fontSize: data.configuration.fontSize,
            gap: templateConfig.blockSpace,
        },
    })

    const sections = [
        {
            key: "summary",
            show: data.enableInRender.summary && Boolean(data.personalDetails.summary),
            title: "Profile",
            content: <Text>{data.personalDetails.summary}</Text>,
        },
        {
            key: "workExperiences",
            show: data.enableInRender.workExperiences && data.workExperiences.length > 0,
            title: "Professional Experience",
            content: <Experience items={data.workExperiences} />,
        },
        {
            key: "education",
            show: data.enableInRender.education && data.education.length > 0,
            title: "Education",
            content: <Education items={data.education} />,
        },
        {
            key: "coreSkills",
            show: data.enableInRender.coreSkills && data.coreSkills.length > 0,
            title: "Skills",
            content: <CoreSkill items={data.coreSkills} />,
        },
        {
            key: "softSkills",
            show: data.enableInRender.softSkills && data.softSkills.length > 0,
            title: "Soft Skills",
            content: <SoftSkill items={data.softSkills} />,
        },
        {
            key: "knownLanguages",
            show: data.enableInRender.language && data.personalDetails.knownLanguages.length > 0,
            title: "Languages",
            content: <Language items={data.personalDetails.knownLanguages} />,
        },
        {
            key: "personalProjects",
            show: data.enableInRender.personalProjects && data.personalProjects.length > 0,
            title: "Projects",
            content: <Project items={data.personalProjects} config={templateConfig} />,
        },
        {
            key: "certificates",
            show: data.enableInRender.certificates && data.certificates.length > 0,
            title: "Certificates",
            content: <Certificate items={data.certificates} config={templateConfig} />,
        },
        {
            key: "achievements",
            show: data.enableInRender.achievements && data.achievements.length > 0,
            title: "Awards",
            content: <Achievement items={data.achievements} config={templateConfig} />,
        },
        {
            key: "references",
            show: data.enableInRender.references && data.references.length > 0,
            title: "References",
            content: <Reference items={data.references} />,
        },
    ]

    const visibleSections = sections.filter(section => section.show)

    return (
        <View style={styles.page}>
            {data.personalDetails.fullName && (
                <Header data={data.personalDetails} />
            )}

            {visibleSections.map(section => (
                <Section key={section.key} title={section.title}>
                    {section.content}
                </Section>
            ))}
        </View>
    )
}
