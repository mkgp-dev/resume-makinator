import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { TemplateId } from "@/entities/resume/types"

type LanguageProps = {
    items: string[]
    variant: TemplateId
}

export default function Language({ items, variant }: LanguageProps) {
    const isClassic = variant === "classic"
    const isBadgeVariant = variant === "modern" || variant === "modern-alt"

    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        item: {
            marginRight: isBadgeVariant ? 6 : 10,
            marginBottom: isBadgeVariant ? 6 : 0,
        },
        modernItem: {
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderWidth: 1,
            borderColor: "#AAB6C8",
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
        },
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
        lastChild: {
            marginBottom: 0,
        },
    })

    if (!isClassic) {
        return (
            <View style={styles.row}>
                {items.map((item, index) => (
                    <Text key={index} style={isBadgeVariant ? [styles.item, styles.modernItem] : styles.item}>
                        {isBadgeVariant ? item.trim() : `• ${item.trim()}`}
                    </Text>
                ))}
            </View>
        )
    }

    return items.map((item, index) => (
        <View key={index} style={index === items.length - 1 ? [styles.listItem, styles.lastChild] : styles.listItem}>
            <Dot style={styles.dot} />
            <Text style={styles.text}>{item.trim()}</Text>
        </View>
    ))
}
