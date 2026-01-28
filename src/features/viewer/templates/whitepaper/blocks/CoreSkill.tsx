import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { CoreSkillItem } from "@/entities/resume/types"

type CoreSkillProps = {
    items: CoreSkillItem[]
}

export default function CoreSkill({ items }: CoreSkillProps) {
    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        item: {
            width: "50%",
            paddingRight: 6,
            marginBottom: 2,
        },
        header: {
            fontWeight: "semibold",
        },
        subheader: {
            color: "#6F6F7D",
        },
    })

    return (
        <View style={styles.row}>
            {items.map((item, index) => (
                <View key={index} style={styles.item}>
                    <Text>
                        <Text style={styles.header}>{item.devLanguage}</Text>
                        <Text> – </Text>
                        <Text style={styles.subheader}>
                            {Array.isArray(item.devFramework)
                                ? item.devFramework.join(", ")
                                : item.devFramework}
                        </Text>
                    </Text>
                </View>
            ))}
        </View>
    )
}
