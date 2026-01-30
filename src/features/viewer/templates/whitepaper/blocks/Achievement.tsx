import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { AchievementItem, WhitepaperTemplateConfig } from "@/entities/resume/types"

type AchievementProps = {
    items: AchievementItem[]
    config: WhitepaperTemplateConfig
    baseFontSize: number
}

export default function Achievement({ items, config, baseFontSize }: AchievementProps) {
    const bulletIndent = Math.round(baseFontSize * 0.6) + 3
    const itemSpacing = config.bulletText ? 0 : 8

    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 0,
        },
        name: {
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
        margin: {
            marginLeft: bulletIndent,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return (
        items.map((item, index) => (
            <View
                key={item.id}
                style={[
                    { marginBottom: itemSpacing },
                    index === items.length - 1 ? styles.lastChild : {},
                ]}
            >
                <View style={styles.header}>
                    {config.bulletText ? (
                        <View style={styles.row}>
                            <Text style={styles.name}>• {item.achievementName}</Text>
                        </View>
                    ) : (
                        <Text style={styles.name}>{item.achievementName}</Text>
                    )}
                    {item.yearIssued && <Text style={styles.subheader}>{item.yearIssued}</Text>}
                </View>

                <View style={config.bulletText ? styles.margin : {}}>
                    {item.achievementIssuer && <Text style={styles.subheader}>{item.achievementIssuer}</Text>}
                    <Text>{item.achievementDescription}</Text>
                </View>
            </View>
        ))
    )
}
