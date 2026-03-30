import { Image, Link, Text, View, StyleSheet } from "@react-pdf/renderer"
import Home from "@/features/viewer/components/icons/Home"
import Mail from "@/features/viewer/components/icons/Mail"
import Phone from "@/features/viewer/components/icons/Phone"
import Github from "@/features/viewer/components/icons/Github"
import Linkedin from "@/features/viewer/components/icons/Linkedin"
import { createTemplateSections } from "@/features/viewer/templates/blocks/createSections"
import type {
    ModernAltTemplateConfig,
    ResumePreviewData,
} from "@/entities/resume/types"
import type { ReactElement, ReactNode } from "react"

type ModernAltProps = {
    data: ResumePreviewData
}

type ContactItem = {
    key: string
    icon: ReactElement
    text: string
    href?: string
}

const getContrastTextColor = (hex: string) => {
    const normalized = hex.replace("#", "")
    const red = Number.parseInt(normalized.slice(0, 2), 16)
    const green = Number.parseInt(normalized.slice(2, 4), 16)
    const blue = Number.parseInt(normalized.slice(4, 6), 16)
    const luminance = (0.299 * red) + (0.587 * green) + (0.114 * blue)

    return luminance > 160 ? "#111827" : "#FFFFFF"
}

function BannerSection({
    title,
    spacing,
    children,
}: {
    title: string
    spacing: number
    children: ReactNode
}) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: spacing,
        },
        titleWrap: {
            marginBottom: 7,
            paddingVertical: 4,
            paddingHorizontal: 10,
            backgroundColor: "#E5E7EB",
        },
        title: {
            fontSize: 10,
            fontWeight: "bold",
            textTransform: "uppercase",
            textAlign: "center",
            color: "#1F2937",
            letterSpacing: 0.4,
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.titleWrap}>
                <Text style={styles.title}>{title}</Text>
            </View>
            {children}
        </View>
    )
}

function ModernAltBanner({
    data,
    config,
}: {
    data: ResumePreviewData["personalDetails"]
    config: ModernAltTemplateConfig
}) {
    const contrastColor = getContrastTextColor(config.bannerColor)

    const styles = StyleSheet.create({
        banner: {
            marginTop: -15,
            marginLeft: -15,
            marginRight: -15,
            marginBottom: 14,
            paddingVertical: 18,
            paddingHorizontal: 16,
            backgroundColor: config.bannerColor,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
        },
        imageWrap: {
            marginRight: 16,
        },
        imageFrame: {
            width: config.pictureSize + 10,
            height: config.pictureSize + 10,
            padding: 5,
            borderWidth: 2,
            borderColor: contrastColor,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
        },
        image: {
            width: config.pictureSize,
            height: config.pictureSize,
            objectFit: "cover",
            borderRadius: 999,
        },
        content: {
            flex: 1,
        },
        name: {
            fontSize: 24,
            fontWeight: "bold",
            color: contrastColor,
        },
        title: {
            marginTop: 2,
            fontSize: 12,
            color: contrastColor,
        },
        contacts: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 10,
        },
        contactItem: {
            width: "48%",
            flexDirection: "row",
            alignItems: "center",
            marginRight: "2%",
            marginBottom: 6,
        },
        iconWrap: {
            marginRight: 6,
        },
        contactText: {
            flex: 1,
            fontSize: 9.5,
            color: contrastColor,
            textDecoration: "none",
        },
    })

    const contactItems = [
        data.defaultEmail ? { key: "email", icon: <Mail color={contrastColor} />, text: data.defaultEmail } : null,
        data.defaultPhoneNumber ? { key: "phone", icon: <Phone color={contrastColor} />, text: `+${data.defaultPhoneNumber}` } : null,
        data.defaultAddress ? { key: "address", icon: <Home color={contrastColor} />, text: data.defaultAddress } : null,
        data.socialLinkedin
            ? {
                key: "linkedin",
                icon: <Linkedin color={contrastColor} />,
                text: data.socialLinkedin,
                href: `https://www.linkedin.com/in/${data.socialLinkedin}`,
            }
            : null,
        data.socialGithub
            ? {
                key: "github",
                icon: <Github color={contrastColor} />,
                text: data.socialGithub,
                href: `https://github.com/${data.socialGithub}`,
            }
            : null,
    ].filter((item): item is ContactItem => Boolean(item))

    return (
        <View style={styles.banner}>
            <View style={styles.row}>
                {config.enablePicture && data.profilePicture ? (
                    <View style={styles.imageWrap}>
                        <View style={styles.imageFrame}>
                            <Image src={data.profilePicture} style={styles.image} />
                        </View>
                    </View>
                ) : null}

                <View style={styles.content}>
                    {data.fullName ? <Text style={styles.name}>{data.fullName}</Text> : null}
                    {data.jobTitle ? <Text style={styles.title}>{data.jobTitle}</Text> : null}

                    {contactItems.length > 0 ? (
                        <View style={styles.contacts}>
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
            </View>
        </View>
    )
}

export default function ModernAlt({ data }: ModernAltProps) {
    const templateConfig = data.template["modern-alt"]

    const styles = StyleSheet.create({
        page: {
            width: "100%",
            fontFamily: data.configuration.fontStyle,
            fontSize: data.configuration.fontSize,
        },
    })

    const sharedConfig = {
        blockSpace: templateConfig.blockSpace,
        enablePicture: templateConfig.enablePicture,
        pictureSize: templateConfig.pictureSize,
        bulletText: templateConfig.bulletText,
        inlineInformation: false,
        sectionOrder: templateConfig.sectionOrder,
    }

    const sections = createTemplateSections({
        data,
        config: sharedConfig,
        variant: "modern-alt",
        titles: {
            summary: "Profile",
            coreSkills: "Skills",
            workExperiences: "Work experience",
            personalProjects: "Projects",
            certificates: "Certificates",
            achievements: "Awards",
            softSkills: "Soft skills",
            education: "Education",
            knownLanguages: "Languages",
            references: "References",
        },
        baseFontSize: data.configuration.fontSize,
    })

    return (
        <View style={styles.page}>
            <ModernAltBanner data={data.personalDetails} config={templateConfig} />

            {sections.map((section) => (
                <BannerSection key={section.key} title={section.title} spacing={templateConfig.blockSpace}>
                    {section.content}
                </BannerSection>
            ))}
        </View>
    )
}
