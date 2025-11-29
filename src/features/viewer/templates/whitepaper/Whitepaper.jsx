import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Header from "./blocks/Header";
import Section from "./blocks/Section";
import Experience from "./blocks/Experience";
import Project from "./blocks/Project";
import Certificate from "./blocks/Certificate";
import Education from "./blocks/Education";
import CoreSkill from "./blocks/CoreSkill";
import Reference from "./blocks/Reference";
import SoftSkill from "./blocks/SoftSkill";
import Achievement from "./blocks/Achievement";

export default function Whitepaper({ data }) {
    const style = StyleSheet.create({
        page: {
            fontFamily: data.configuration.fontStyle,
            fontSize: data.configuration.fontSize,
            gap: data.template["whitepaper"].blockSpace,
        },
    });

    return (
        <View style={style.page}>
            {data.personalDetails.fullName && <Header data={data.personalDetails} config={data.template["whitepaper"]} />}

            {data.personalDetails.summary && (
                <Section title="About me">
                    <Text>{data.personalDetails.summary}</Text>
                </Section>
            )}

            {data.enableInRender.coreSkills && data.coreSkills.length > 0 && (
                <Section title="Core skills">
                    <CoreSkill items={data.coreSkills} />
                </Section>
            )}

            {data.enableInRender.workExperiences && data.workExperiences.length > 0 && (
                <Section title="Experience">
                    <Experience items={data.workExperiences} />
                </Section>
            )}

            {data.enableInRender.personalProjects && data.personalProjects.length > 0 && (
                <Section title="Personal Projects">
                    <Project items={data.personalProjects} config={data.template["whitepaper"]} /> 
                </Section>
            )}

            {data.enableInRender.certificates && data.certificates.length > 0 && (
                <Section title="Certificates">
                    <Certificate items={data.certificates} config={data.template["whitepaper"]} />
                </Section>
            )}

            {data.enableInRender.achievements && data.achievements.length > 0 && (
                <Section title="Achievements">
                    <Achievement items={data.achievements} config={data.template["whitepaper"]} />
                </Section>
            )}

            {data.enableInRender.softSkills && data.softSkills.length > 0 && (
                <Section title="Soft Skills">
                    <SoftSkill items={data.softSkills} />
                </Section>
            )}

            {data.enableInRender.education && data.education.length > 0 && (
                <Section title="Education">
                    <Education items={data.education} />
                </Section>
            )}

            {data.enableInRender.references && data.references.length > 0 && (
                <Section title="References" disableBorder={true}>
                    <Reference items={data.references} />
                </Section>
            )}
        </View>
    );
}