import { Image, Link, Text, View, StyleSheet } from "@react-pdf/renderer"
import Home from "@/features/viewer/components/icons/Home"
import Mail from "@/features/viewer/components/icons/Mail"
import Phone from "@/features/viewer/components/icons/Phone"
import Github from "@/features/viewer/components/icons/Github"
import Linkedin from "@/features/viewer/components/icons/Linkedin"
import { createTemplateSections } from "@/features/viewer/templates/blocks/createSections"
import type {
    ModernTemplateConfig,
    ResumePreviewData,
} from "@/entities/resume/types"
import type { ReactElement, ReactNode } from "react"

type ModernProps = {
    data: ResumePreviewData
}

type ContactItem = {
    key: string
    icon: ReactElement
    text: string
    href?: string
}

const SIDEBAR_WIDTH = "31%"
const CONTENT_OFFSET = "36%"

const getContrastTextColor = (hex: string) => {
    const normalized = hex.replace("#", "")
    const red = Number.parseInt(normalized.slice(0, 2), 16)
    const green = Number.parseInt(normalized.slice(2, 4), 16)
    const blue = Number.parseInt(normalized.slice(4, 6), 16)
    const luminance = (0.299 * red) + (0.587 * green) + (0.114 * blue)

    return luminance > 160 ? "#111827" : "#FFFFFF"
}

function ModernSidebarSection({
    title,
    accentColor,
    accentTextColor,
    spacing,
    children,
}: {
    title: string
    accentColor: string
    accentTextColor: string
    spacing: number
    children: ReactNode
}) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: spacing,
        },
        title: {
            marginBottom: 7,
            paddingHorizontal: 8,
            paddingVertical: 4,
            fontSize: 10,
            fontWeight: "bold",
            textTransform: "uppercase",
            backgroundColor: accentColor,
            color: accentTextColor,
            letterSpacing: 0.4,
        },
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    )
}

function ModernMainSection({
    title,
    accentColor,
    spacing,
    children,
}: {
    title: string
    accentColor: string
    spacing: number
    children: ReactNode
}) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: spacing,
        },
        title: {
            marginBottom: 6,
            paddingBottom: 3,
            fontSize: 13,
            fontWeight: "bold",
            textTransform: "uppercase",
            color: accentColor,
            borderBottomWidth: 1.5,
            borderBottomColor: accentColor,
            letterSpacing: 0.4,
        },
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    )
}

function ModernIdentityBlock({
    data,
    config,
    accentColor,
}: {
    data: ResumePreviewData["personalDetails"]
    config: ModernTemplateConfig
    accentColor: string
}) {
    const styles = StyleSheet.create({
        container: {
            alignItems: "center",
            marginBottom: 16,
        },
        imageFrame: {
            width: config.pictureSize + 10,
            height: config.pictureSize + 10,
            padding: 5,
            marginBottom: 10,
            borderWidth: 1.5,
            borderColor: accentColor,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
        },
        image: {
            width: config.pictureSize,
            height: config.pictureSize,
            objectFit: "cover",
            borderRadius: 999,
        },
        name: {
            fontSize: 21,
            fontWeight: "bold",
            textAlign: "center",
            color: "#111827",
        },
        title: {
            marginTop: 2,
            fontSize: 11,
            textAlign: "center",
            color: accentColor,
        },
        contactList: {
            width: "100%",
            marginTop: 12,
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
        },
        iconWrap: {
            marginRight: 6,
        },
        contactText: {
            flex: 1,
            fontSize: 9.5,
            color: "#111827",
            textDecoration: "none",
        },
    })

    const contactItems = [
        data.defaultAddress ? { key: "address", icon: <Home />, text: data.defaultAddress } : null,
        data.defaultEmail ? { key: "email", icon: <Mail />, text: data.defaultEmail } : null,
        data.defaultPhoneNumber ? { key: "phone", icon: <Phone />, text: `+${data.defaultPhoneNumber}` } : null,
        data.socialGithub
            ? {
                key: "github",
                icon: <Github />,
                text: data.socialGithub,
                href: `https://github.com/${data.socialGithub}`,
            }
            : null,
        data.socialLinkedin
            ? {
                key: "linkedin",
                icon: <Linkedin />,
                text: data.socialLinkedin,
                href: `https://www.linkedin.com/in/${data.socialLinkedin}`,
            }
            : null,
    ].filter((item): item is ContactItem => Boolean(item))

    return (
        <View style={styles.container}>
            {config.enablePicture && data.profilePicture ? (
                <View style={styles.imageFrame}>
                    <Image src={data.profilePicture} style={styles.image} />
                </View>
            ) : null}

            {data.fullName ? <Text style={styles.name}>{data.fullName}</Text> : null}
            {data.jobTitle ? <Text style={styles.title}>{data.jobTitle}</Text> : null}

            {contactItems.length > 0 ? (
                <View style={styles.contactList}>
                    {contactItems.map((item) => (
                        <View key={item.key} style={styles.contactItem}>
                            <View style={styles.iconWrap}>{item.icon}</View>
                            {item.href ? (
                                <Link src={item.href} style={styles.contactText}>
                                    {item.text}
                                </Link>
                            ) : (
                                <Text style={styles.contactText}>{item.text}</Text>
                            )}
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    )
}

export default function Modern({ data }: ModernProps) {
    const templateConfig = data.template.modern
    const baseFontSize = data.configuration.fontSize
    const accentTextColor = getContrastTextColor(templateConfig.accentColor)

    const styles = StyleSheet.create({
        page: {
            position: "relative",
            minHeight: "100%",
            fontFamily: data.configuration.fontStyle,
            fontSize: baseFontSize,
        },
        sidebar: {
            position: "absolute",
            top: 0,
            left: 0,
            width: SIDEBAR_WIDTH,
            minHeight: "100%",
            padding: 14,
            backgroundColor: "#F6F8FB",
            borderRightWidth: 1,
            borderRightColor: "#D7DEE8",
        },
        content: {
            marginLeft: CONTENT_OFFSET,
            paddingLeft: 4,
        },
    })

    const modernSectionConfig = {
        blockSpace: templateConfig.blockSpace,
        enablePicture: templateConfig.enablePicture,
        pictureSize: templateConfig.pictureSize,
        bulletText: templateConfig.bulletText,
        inlineInformation: false,
        sectionOrder: [...templateConfig.sidebarSections, ...templateConfig.mainSections],
    }

    const allSections = createTemplateSections({
        data,
        config: modernSectionConfig,
        variant: "modern",
        titles: {
            summary: "About me",
            coreSkills: "Core skills",
            workExperiences: "Experience",
            personalProjects: "Projects",
            certificates: "Certificates",
            achievements: "Achievements",
            softSkills: "Soft skills",
            education: "Education",
            knownLanguages: "Languages",
            references: "References",
        },
        baseFontSize,
        modernLayoutBySection: {
            references: templateConfig.sidebarSections.includes("references") ? "sidebar" : "main",
        },
    })

    const sectionMap = new Map(allSections.map((section) => [section.key, section]))
    const sidebarSections = templateConfig.sidebarSections
        .map((key) => sectionMap.get(key))
        .filter((section): section is NonNullable<typeof section> => Boolean(section))
    const mainSections = templateConfig.mainSections
        .map((key) => sectionMap.get(key))
        .filter((section): section is NonNullable<typeof section> => Boolean(section))

    return (
        <View style={styles.page}>
            <View style={styles.sidebar}>
                <ModernIdentityBlock data={data.personalDetails} config={templateConfig} accentColor={templateConfig.accentColor} />

                {sidebarSections.map((section) => (
                    <ModernSidebarSection
                        key={section.key}
                        title={section.title}
                        accentColor={templateConfig.accentColor}
                        accentTextColor={accentTextColor}
                        spacing={templateConfig.blockSpace}
                    >
                        {section.content}
                    </ModernSidebarSection>
                ))}
            </View>

            <View style={styles.content}>
                {mainSections.map((section) => (
                    <ModernMainSection
                        key={section.key}
                        title={section.title}
                        accentColor={templateConfig.accentColor}
                        spacing={templateConfig.blockSpace}
                    >
                        {section.content}
                    </ModernMainSection>
                ))}
            </View>
        </View>
    )
}
