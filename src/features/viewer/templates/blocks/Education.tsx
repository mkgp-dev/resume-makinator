import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { EducationItem, TemplateId } from "@/entities/resume/types"

type EducationProps = {
    items: EducationItem[]
    variant: TemplateId
}

export default function Education({ items, variant }: EducationProps) {
    const isClassic = variant === "classic"

    const styles = StyleSheet.create({
        container: {
            marginBottom: isClassic ? 6 : 8,
        },
        header: {
            flexDirection: "row",
            alignItems: isClassic ? "baseline" : "center",
            justifyContent: "space-between",
            gap: 2,
        },
        title: {
            fontWeight: isClassic ? "bold" : "semibold",
        },
        subheader: {
            color: "#6F6F7D",
            ...(isClassic ? { fontSize: 10 } : {}),
        },
        school: {
            ...(isClassic ? { fontSize: 10, marginTop: 1 } : {}),
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return items.map((item, index) => (
        <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.courseDegree}</Text>
                <Text style={styles.subheader}>{item.startYear} - {item.endYear}</Text>
            </View>
            {item.schoolName ? <Text style={isClassic ? styles.school : styles.subheader}>{item.schoolName}</Text> : null}
        </View>
    ))
}
