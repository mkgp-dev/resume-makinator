import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { WorkExperienceItem } from "@/entities/resume/types"

type ExperienceProps = {
    items: WorkExperienceItem[]
}

export default function Experience({ items }: ExperienceProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 10,
        },
        job: {
            fontSize: 14,
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
            alignItems: "flex-start",
            gap: 4,
        },
        dot: {
            marginTop: 5,
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
                        {item.bulletSummary?.map((line, index) => (
                            <View key={index} style={styles.listItem}>
                                <Dot style={styles.dot} />
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
