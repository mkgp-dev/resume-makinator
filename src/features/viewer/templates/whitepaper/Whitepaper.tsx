import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Header from "@/features/viewer/templates/whitepaper/blocks/Header"
import Section from "@/features/viewer/templates/whitepaper/blocks/Section"
import Experience from "@/features/viewer/templates/whitepaper/blocks/Experience"
import Project from "@/features/viewer/templates/whitepaper/blocks/Project"
import Certificate from "@/features/viewer/templates/whitepaper/blocks/Certificate"
import Education from "@/features/viewer/templates/whitepaper/blocks/Education"
import CoreSkill from "@/features/viewer/templates/whitepaper/blocks/CoreSkill"
import Reference from "@/features/viewer/templates/whitepaper/blocks/Reference"
import SoftSkill from "@/features/viewer/templates/whitepaper/blocks/SoftSkill"
import Achievement from "@/features/viewer/templates/whitepaper/blocks/Achievement"
import Language from "@/features/viewer/templates/whitepaper/blocks/Language"
import { WHITEPAPER_SECTION_ORDER_DEFAULT } from "@/entities/resume/constants/whitepaperSections"
import type { ReactNode } from "react"
import type { ResumePreviewData, WhitepaperSectionKey } from "@/entities/resume/types"

type WhitepaperProps = {
    data: ResumePreviewData
}

export default function Whitepaper({ data }: WhitepaperProps) {
    const baseFontSize = data.configuration.fontSize
    const style = StyleSheet.create({
        page: {
            fontFamily: data.configuration.fontStyle,
            fontSize: baseFontSize,
            gap: data.template["whitepaper"].blockSpace,
        },
    })

    const sectionOrder = data.template.whitepaper.sectionOrder?.length
        ? data.template.whitepaper.sectionOrder
        : WHITEPAPER_SECTION_ORDER_DEFAULT

    const sections: Record<WhitepaperSectionKey, { title: string, show: boolean, content: ReactNode }> = {
        summary: {
            title: "About me",
            show: data.enableInRender.summary && Boolean(data.personalDetails.summary),
            content: <Text>{data.personalDetails.summary}</Text>,
        },
        coreSkills: {
            title: "Core skills",
            show: data.enableInRender.coreSkills && data.coreSkills.length > 0,
            content: <CoreSkill items={data.coreSkills} />,
        },
        workExperiences: {
            title: "Experience",
            show: data.enableInRender.workExperiences && data.workExperiences.length > 0,
            content: <Experience items={data.workExperiences} baseFontSize={baseFontSize} />,
        },
        personalProjects: {
            title: "Personal Projects",
            show: data.enableInRender.personalProjects && data.personalProjects.length > 0,
            content: <Project items={data.personalProjects} baseFontSize={baseFontSize} />,
        },
        certificates: {
            title: "Certificates",
            show: data.enableInRender.certificates && data.certificates.length > 0,
            content: <Certificate items={data.certificates} config={data.template["whitepaper"]} baseFontSize={baseFontSize} />,
        },
        achievements: {
            title: "Achievements",
            show: data.enableInRender.achievements && data.achievements.length > 0,
            content: <Achievement items={data.achievements} config={data.template["whitepaper"]} baseFontSize={baseFontSize} />,
        },
        softSkills: {
            title: "Soft Skills",
            show: data.enableInRender.softSkills && data.softSkills.length > 0,
            content: <SoftSkill items={data.softSkills} />,
        },
        education: {
            title: "Education",
            show: data.enableInRender.education && data.education.length > 0,
            content: <Education items={data.education} />,
        },
        knownLanguages: {
            title: "Languages",
            show: data.enableInRender.language && data.personalDetails.knownLanguages.length > 0,
            content: <Language items={data.personalDetails.knownLanguages} />,
        },
        references: {
            title: "References",
            show: data.enableInRender.references && data.references.length > 0,
            content: <Reference items={data.references} />,
        },
    }

    const visibleSections = sectionOrder
        .map((key) => ({ key, ...sections[key] }))
        .filter((section) => section.show)

    return (
        <View style={style.page}>
            {data.personalDetails.fullName ? (
                <Header data={data.personalDetails} config={data.template["whitepaper"]} baseFontSize={baseFontSize} />
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
