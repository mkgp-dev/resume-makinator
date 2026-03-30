import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ReferenceItem, TemplateId } from "@/entities/resume/types"

type ReferenceProps = {
    items: ReferenceItem[]
    variant: TemplateId
    modernLayout?: "sidebar" | "main"
}

export default function Reference({ items, variant, modernLayout = "sidebar" }: ReferenceProps) {
    const isClassic = variant === "classic"
    const isModern = variant === "modern"
    const isModernMain = isModern && modernLayout === "main"

    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: isModernMain ? "wrap" : "nowrap",
            columnGap: isModernMain ? 12 : 0,
        },
        item: {
            flex: 1,
            flexDirection: "column",
            minWidth: isModernMain ? "48%" : undefined,
            marginBottom: isModern ? 8 : 0,
            marginRight: isModernMain ? 6 : 0,
        },
        header: {
            fontWeight: isClassic ? "bold" : "semibold",
        },
        subheader: {
            color: "#6F6F7D",
            ...(isClassic || isModern ? { fontSize: 10 } : {}),
        },
    })

    return (
        <View style={isModern && !isModernMain ? { flexDirection: "column" } : styles.row}>
            {items.map((item) => (
                <View key={item.id} style={styles.item}>
                    <Text style={styles.header}>{item.fullName}</Text>
                    {isClassic ? (
                        <>
                            <Text style={styles.subheader}>{item.jobTitle} - {item.companyName}</Text>
                            {item.defaultEmail ? <Text>{item.defaultEmail}</Text> : null}
                            {item.defaultPhoneNumber ? <Text>+{item.defaultPhoneNumber}</Text> : null}
                        </>
                    ) : isModern ? (
                        <>
                            <Text style={styles.subheader}>{item.jobTitle} - {item.companyName}</Text>
                            {item.defaultPhoneNumber ? <Text style={styles.subheader}>+{item.defaultPhoneNumber}</Text> : null}
                            {item.defaultEmail ? <Text style={styles.subheader}>{item.defaultEmail}</Text> : null}
                        </>
                    ) : (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.subheader}>{item.jobTitle}</Text>
                                <Text style={styles.subheader}>, </Text>
                                <Text style={styles.subheader}>{item.companyName}</Text>
                            </View>
                            {item.defaultPhoneNumber ? <Text style={styles.subheader}>+{item.defaultPhoneNumber}</Text> : null}
                            {item.defaultEmail ? <Text style={styles.subheader}>{item.defaultEmail}</Text> : null}
                        </>
                    )}
                </View>
            ))}
        </View>
    )
}
