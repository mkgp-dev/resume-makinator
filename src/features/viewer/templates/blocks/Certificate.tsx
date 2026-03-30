import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { CertificateItem, SharedTemplateConfig, TemplateId } from "@/entities/resume/types"

type CertificateProps = {
    items: CertificateItem[]
    config: SharedTemplateConfig
    variant: TemplateId
    baseFontSize: number
}

export default function Certificate({ items, config, variant, baseFontSize }: CertificateProps) {
    const isClassic = variant === "classic"
    const bulletIndent = Math.round(baseFontSize * 0.6) + 3

    const styles = StyleSheet.create({
        container: {
            marginBottom: isClassic ? 6 : 0,
        },
        header: {
            flexDirection: "row",
            alignItems: isClassic ? "center" : "flex-start",
            justifyContent: "space-between",
            gap: 2,
        },
        row: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 0,
        },
        titleRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        name: {
            fontWeight: isClassic ? "bold" : "semibold",
        },
        dot: {
            marginTop: 1,
            marginRight: 4,
        },
        subheader: {
            color: "#6F6F7D",
            ...(isClassic ? { fontSize: 10 } : {}),
        },
        body: {
            marginTop: 0,
            marginLeft: config.bulletText
                ? (isClassic ? 10 : bulletIndent)
                : 0,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return items.map((item, index) => (
        <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
            <View style={styles.header}>
                {config.bulletText ? (
                    isClassic ? (
                        <View style={styles.titleRow}>
                            <Dot style={styles.dot} />
                            <Text style={styles.name}>{item.certificateName}</Text>
                        </View>
                    ) : (
                        <View style={styles.row}>
                            <Text style={styles.name}>• {item.certificateName}</Text>
                        </View>
                    )
                ) : (
                    <Text style={styles.name}>{item.certificateName}</Text>
                )}
                {item.yearIssued ? <Text style={styles.subheader}>{item.yearIssued}</Text> : null}
            </View>

            <View style={styles.body}>
                {item.certificateIssuer ? <Text style={styles.subheader}>{item.certificateIssuer}</Text> : null}
                <Text>{item.certificateDescription}</Text>
            </View>
        </View>
    ))
}
