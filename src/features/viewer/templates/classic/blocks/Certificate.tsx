import { View, Text, StyleSheet } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { CertificateItem, ClassicTemplateConfig } from "@/entities/resume/types"

type CertificateProps = {
    items: CertificateItem[]
    config: ClassicTemplateConfig
}

export default function Certificate({ items, config }: CertificateProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 6,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        titleRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        name: {
            fontWeight: "bold",
        },
        dot: {
            marginTop: 1,
            marginRight: 4,
        },
        subheader: {
            color: "#6F6F7D",
            fontSize: 10,
        },
        body: {
            marginTop: 2,
            marginLeft: config.bulletText ? 10 : 0,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return items.map((item, index) => (
        <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
            <View style={styles.header}>
                {config.bulletText ? (
                    <View style={styles.titleRow}>
                        <Dot style={styles.dot} />
                        <Text style={styles.name}>{item.certificateName}</Text>
                    </View>
                ) : (
                    <Text style={styles.name}>{item.certificateName}</Text>
                )}
                {item.yearIssued && <Text style={styles.subheader}>{item.yearIssued}</Text>}
            </View>
            <View style={styles.body}>
                {item.certificateIssuer && <Text style={styles.subheader}>{item.certificateIssuer}</Text>}
                <Text>{item.certificateDescription}</Text>
            </View>
        </View>
    ))
}
