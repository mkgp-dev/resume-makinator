import { View, Text, StyleSheet } from "@react-pdf/renderer"
type SoftSkillProps = {
    items: string[]
}

export default function SoftSkill({ items }: SoftSkillProps) {
    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        item: {
            marginRight: 10,
        },
    })

    return (
        <View style={styles.row}>
            {items.map((item, index)=> (
                <Text key={index} style={styles.item}>
                    • {item.trim()}
                </Text>
            ))}
        </View>
    )
}
