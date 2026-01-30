import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { WorkExperienceItem } from "@/entities/resume/types"

type ExperienceProps = {
    items: WorkExperienceItem[]
    baseFontSize: number
}

export default function Experience({ items, baseFontSize }: ExperienceProps) {
    const bulletIndent = Math.round(baseFontSize * 0.6) + 4

    const styles = StyleSheet.create({
        container: {
            marginBottom: 10,
        },
        job: {
            fontSize: baseFontSize + 2,
            fontWeight: "medium",
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
        },
        subheader: {
            color: "#6F6F7D",
        },
        list: {
            flexDirection: "column",
        },
        listItem: {
            flexDirection: "row",
            gap: 2,
        },
        bullet: {
            width: bulletIndent,
            textAlign: "center",
        },
        listText: {
            flex: 1,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return (
        items.map((item, index) => (
            <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
                <View style={styles.header}>
                    <Text style={styles.job}>{item.jobTitle}</Text>
                    <Text style={styles.subheader}>{item.startYear} – {item.endYear}</Text>
                </View>
                <Text style={styles.subheader}>{item.companyName}</Text>
                {item.bulletType ? (
                    <View style={styles.list}>
                        {item.bulletSummary
                            ?.filter(line => line.trim().length > 0)
                            .map((line, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.listText}>{line}</Text>
                                </View>
                            ))}
                    </View>
                ) : (
                    <Text>{item.briefSummary}</Text>
                )}
            </View>
        ))
    )
}
