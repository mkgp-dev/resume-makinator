import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { EducationItem } from "@/entities/resume/types"

type EducationProps = {
    items: EducationItem[]
}

export default function Education({ items }: EducationProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 8,
        },
        degree: {
            fontWeight: "semibold",
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
        lastChild: {
            marginBottom: 0,
        },
    })

    return (
        items.map((item, index) => (
            <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
                <View style={styles.header}>
                    <Text style={styles.degree}>{item.courseDegree}</Text>
                    <Text style={styles.subheader}>{item.startYear} – {item.endYear}</Text>
                </View>
                <Text style={styles.subheader}>{item.schoolName}</Text>
            </View>
        ))
    )
}
