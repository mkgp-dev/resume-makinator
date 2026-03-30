import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { TemplateId, WorkExperienceItem } from "@/entities/resume/types"

type ExperienceProps = {
    items: WorkExperienceItem[]
    variant: TemplateId
    baseFontSize: number
}

export default function Experience({ items, variant, baseFontSize }: ExperienceProps) {
    const isClassic = variant === "classic"
    const bulletIndent = Math.round(baseFontSize * 0.6) + 4

    const styles = StyleSheet.create({
        container: {
            marginBottom: isClassic ? 6 : 10,
        },
        header: {
            flexDirection: "row",
            alignItems: isClassic ? "baseline" : "center",
            justifyContent: "space-between",
            gap: 2,
        },
        title: {
            fontSize: isClassic ? undefined : baseFontSize + 2,
            fontWeight: isClassic ? "bold" : "medium",
        },
        subheader: {
            color: "#6F6F7D",
            ...(isClassic ? { fontSize: 10 } : {}),
        },
        company: {
            ...(isClassic ? { fontSize: 10, marginTop: 1 } : {}),
        },
        list: {
            flexDirection: "column",
            ...(isClassic ? { marginTop: 3 } : {}),
        },
        listItem: {
            flexDirection: "row",
            alignItems: isClassic ? "flex-start" : undefined,
            gap: isClassic ? undefined : 2,
            marginBottom: isClassic ? 2 : 0,
        },
        bullet: {
            width: bulletIndent,
            textAlign: "center",
        },
        dot: {
            marginTop: 5,
            marginRight: 4,
        },
        listText: {
            flex: 1,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return items.map((item, index) => (
        <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.jobTitle}</Text>
                <Text style={styles.subheader}>{item.startYear} - {item.endYear}</Text>
            </View>
            {item.companyName ? <Text style={isClassic ? styles.company : styles.subheader}>{item.companyName}</Text> : null}
            {item.bulletType ? (
                <View style={styles.list}>
                    {item.bulletSummary
                        .filter(line => line.trim().length > 0)
                        .map((line, lineIndex) => (
                            isClassic ? (
                                <View key={lineIndex} style={styles.listItem}>
                                    <Dot style={styles.dot} />
                                    <Text style={styles.listText}>{line}</Text>
                                </View>
                            ) : (
                                <View key={lineIndex} style={styles.listItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.listText}>{line}</Text>
                                </View>
                            )
                        ))}
                </View>
            ) : (
                <Text>{item.briefSummary}</Text>
            )}
        </View>
    ))
}
