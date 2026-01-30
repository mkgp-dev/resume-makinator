import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { CertificateItem, WhitepaperTemplateConfig } from "@/entities/resume/types"

type CertificateProps = {
    items: CertificateItem[]
    config: WhitepaperTemplateConfig
    baseFontSize: number
}

export default function Certificate({ items, config, baseFontSize }: CertificateProps) {
    const bulletIndent = Math.round(baseFontSize * 0.6) + 3
    const itemSpacing = 0

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
                            <Text style={styles.name}>• {item.certificateName}</Text>
                        </View>
                    ) : (
                        <Text style={styles.name}>{item.certificateName}</Text>
                    )}
                    {item.yearIssued && <Text style={styles.subheader}>{item.yearIssued}</Text>}
                </View>

                <View style={config.bulletText ? styles.margin : {}}>
                    {item.certificateIssuer && <Text style={styles.subheader}>{item.certificateIssuer}</Text>}
                    <Text>{item.certificateDescription}</Text>
                </View>
            </View>
        ))
    )
}
