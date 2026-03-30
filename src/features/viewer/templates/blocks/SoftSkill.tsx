import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { TemplateId } from "@/entities/resume/types"

type SoftSkillProps = {
    items: string[]
    variant: TemplateId
    baseFontSize: number
}

export default function SoftSkill({ items, variant, baseFontSize }: SoftSkillProps) {
    const isClassic = variant === "classic"
    const isBadgeVariant = variant === "modern" || variant === "modern-alt"
    const computedFontSize = isBadgeVariant ? Math.max(7, baseFontSize - 3) : 10

    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        item: {
            marginRight: 6,
            marginBottom: isClassic || isBadgeVariant ? 4 : 0,
            paddingRight: isClassic ? 2 : 0,
        },
        modernItem: {
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderWidth: 1,
            borderColor: "#AAB6C8",
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
        },
        text: {
            fontSize: computedFontSize,
        },
    })

    return (
        <View style={styles.row}>
            {items.map((item, index) => (
                <View key={index} style={isBadgeVariant ? [styles.item, styles.modernItem] : styles.item}>
                    <Text style={styles.text}>{isBadgeVariant ? item.trim() : `• ${item.trim()}`}</Text>
                </View>
            ))}
        </View>
    )
}
