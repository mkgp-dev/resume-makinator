import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { EducationItem } from "@/entities/resume/types"

type EducationProps = {
    items: EducationItem[]
}

export default function Education({ items }: EducationProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 6,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
        },
        title: {
            fontWeight: "bold",
        },
        subheader: {
            color: "#6F6F7D",
            fontSize: 10,
        },
        school: {
            fontSize: 10,
            marginTop: 1,
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
            {item.schoolName && <Text style={styles.school}>{item.schoolName}</Text>}
        </View>
    ))
}
