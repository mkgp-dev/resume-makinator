import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { CoreSkillItem } from "@/entities/resume/types"

type CoreSkillProps = {
    items: CoreSkillItem[]
}

export default function CoreSkill({ items }: CoreSkillProps) {
    const styles = StyleSheet.create({
        listItem: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 2,
        },
        dot: {
            marginTop: 5,
            marginRight: 4,
        },
        text: {
            flex: 1,
        },
        bold: {
            fontWeight: "medium",
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return items.map((item, index) => {
        const frameworks = Array.isArray(item.devFramework) ? item.devFramework.join(", ") : item.devFramework

        return (
            <View key={item.id} style={index === items.length - 1 ? [styles.listItem, styles.lastChild] : styles.listItem}>
                <Dot style={styles.dot} />
                <Text style={styles.text}>
                    <Text style={styles.bold}>{item.devLanguage}</Text>
                    <Text> – </Text>
                    <Text>{frameworks}</Text>
                </Text>
            </View>
        )
    })
}
