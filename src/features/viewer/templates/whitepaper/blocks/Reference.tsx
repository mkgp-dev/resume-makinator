import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ReferenceItem } from "@/entities/resume/types"

type ReferenceProps = {
    items: ReferenceItem[]
}

export default function Reference({ items }: ReferenceProps) {
    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
        },
        item: {
            flex: 1,
            flexDirection: "column",
        },
        header: {
            fontWeight: "semibold",
        },
        subheader: {
            color: "#6F6F7D",
        },
    })

    return (
        <View style={styles.row}>
            {items.map((item) => (
                <View key={item.id} style={styles.item}>
                    <Text style={styles.header}>{item.fullName}</Text>
                    <View style={styles.row}>
                        <Text style={styles.subheader}>{item.jobTitle}</Text>
                        <Text style={styles.subheader}>, </Text>
                        <Text style={styles.subheader}>{item.companyName}</Text>
                    </View>
                    {item.defaultPhoneNumber && <Text style={styles.subheader}>+{item.defaultPhoneNumber}</Text>}
                    {item.defaultEmail && <Text style={styles.subheader}>{item.defaultEmail}</Text>}
                </View>
            ))}
        </View>
    )
}
