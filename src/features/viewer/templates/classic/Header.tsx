import { View, Text, StyleSheet, Image, Link } from "@react-pdf/renderer"
import Home from "@/features/viewer/components/icons/Home"
import Mail from "@/features/viewer/components/icons/Mail"
import Phone from "@/features/viewer/components/icons/Phone"
import Github from "@/features/viewer/components/icons/Github"
import Linkedin from "@/features/viewer/components/icons/Linkedin"
import type { ReactElement } from "react"
import type { PersonalDetails, SharedTemplateConfig } from "@/entities/resume/types"

type HeaderProps = {
    data: PersonalDetails
    config: SharedTemplateConfig
}

type ContactItem = {
    key: string
    icon: ReactElement
    text: string
    href?: string
}

export default function Header({ data, config }: HeaderProps) {
    const styles = StyleSheet.create({
        container: {
            paddingBottom: 2,
        },
        headerRow: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
        },
        content: {
            flexGrow: 1,
            alignItems: "center",
            textAlign: "center",
        },
        name: {
            fontSize: 24,
            fontWeight: "bold",
        },
        title: {
            fontSize: 12,
            marginBottom: 4,
        },
        contactRow: {
            flexDirection: config.inlineInformation ? "row" : "column",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: config.inlineInformation ? 10 : 0,
            marginBottom: 4,
        },
        iconWrap: {
            marginRight: 4,
        },
        contactText: {
            fontSize: 10,
            color: "#000000",
            textDecoration: "none",
        },
        imageFrame: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#000000",
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
            <View style={styles.headerRow}>
                <View style={styles.content}>
                    <Text style={styles.name}>{data.fullName}</Text>
                    {data.jobTitle ? <Text style={styles.title}>{data.jobTitle}</Text> : null}

                    {contactItems.length > 0 ? (
                        <View style={styles.contactRow}>
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

                {config.enablePicture && data.profilePicture ? (
                    <View style={styles.imageFrame}>
                        <Image
                            src={data.profilePicture}
                            style={{
                                width: config.pictureSize,
                                height: config.pictureSize,
                                objectFit: "cover",
                            }}
                        />
                    </View>
                ) : null}
            </View>
        </View>
    )
}
