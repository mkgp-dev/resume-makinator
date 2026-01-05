import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Header from "@/features/viewer/templates/whitepaper/blocks/Header";
import Section from "@/features/viewer/templates/whitepaper/blocks/Section";
import Experience from "@/features/viewer/templates/whitepaper/blocks/Experience";
import Project from "@/features/viewer/templates/whitepaper/blocks/Project";
import Certificate from "@/features/viewer/templates/whitepaper/blocks/Certificate";
import Education from "@/features/viewer/templates/whitepaper/blocks/Education";
import CoreSkill from "@/features/viewer/templates/whitepaper/blocks/CoreSkill";
import Reference from "@/features/viewer/templates/whitepaper/blocks/Reference";
import SoftSkill from "@/features/viewer/templates/whitepaper/blocks/SoftSkill";
import Achievement from "@/features/viewer/templates/whitepaper/blocks/Achievement";
import Language from "@/features/viewer/templates/whitepaper/blocks/Language";

export default function Whitepaper({ data }) {
    const style = StyleSheet.create({
        page: {
            fontFamily: data.configuration.fontStyle,
            fontSize: data.configuration.fontSize,
            gap: data.template["whitepaper"].blockSpace,
        },
    });

    const sections = [
        {
            key: "summary",
            show: Boolean(data.personalDetails.summary),
            title: "About me",
            content: <Text>{data.personalDetails.summary}</Text>,
        },
        {
            key: "coreSkills",
            show: data.enableInRender.coreSkills && data.coreSkills.length > 0,
            title: "Core skills",
            content: <CoreSkill items={data.coreSkills} />,
        },
        {
            key: "workExperiences",
            show: data.enableInRender.workExperiences && data.workExperiences.length > 0,
            title: "Experience",
            content: <Experience items={data.workExperiences} />,
        },
        {
            key: "personalProjects",
            show: data.enableInRender.personalProjects && data.personalProjects.length > 0,
            title: "Personal Projects",
            content: <Project items={data.personalProjects} config={data.template["whitepaper"]} />,
        },
        {
            key: "certificates",
            show: data.enableInRender.certificates && data.certificates.length > 0,
            title: "Certificates",
            content: <Certificate items={data.certificates} config={data.template["whitepaper"]} />,
        },
        {
            key: "achievements",
            show: data.enableInRender.achievements && data.achievements.length > 0,
            title: "Achievements",
            content: <Achievement items={data.achievements} config={data.template["whitepaper"]} />,
        },
        {
            key: "softSkills",
            show: data.enableInRender.softSkills && data.softSkills.length > 0,
            title: "Soft Skills",
            content: <SoftSkill items={data.softSkills} />,
        },
        {
            key: "education",
            show: data.enableInRender.education && data.education.length > 0,
            title: "Education",
            content: <Education items={data.education} />,
        },
        {
            key: "knownLanguages",
            show: data.enableInRender.language && data.personalDetails.knownLanguages.length > 0,
            title: "Languages",
            content: <Language items={data.personalDetails.knownLanguages} />,
        },
        {
            key: "references",
            show: data.enableInRender.references && data.references.length > 0,
            title: "References",
            content: <Reference items={data.references} />,
        },
    ];

    const visibleSections = sections.filter(section => section.show);

    return (
        <View style={style.page}>
            {data.personalDetails.fullName && <Header data={data.personalDetails} config={data.template["whitepaper"]} />}

            {visibleSections.map((section, index) => (
                <Section
                    key={section.key}
                    title={section.title}
                    disableBorder={index === visibleSections.length - 1}
                >
                    {section.content}
                </Section>
            ))}
        </View>
    );
}