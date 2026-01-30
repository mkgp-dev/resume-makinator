import { View, Text, StyleSheet } from "@react-pdf/renderer"
type LanguageProps = {
    items: string[]
}

export default function Language({ items }: LanguageProps) {
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
