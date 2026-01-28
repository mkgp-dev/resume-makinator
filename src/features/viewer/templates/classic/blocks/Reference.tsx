import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ReferenceItem } from "@/entities/resume/types"

type ReferenceProps = {
    items: ReferenceItem[]
}

export default function Reference({ items }: ReferenceProps) {
    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
        },
        item: {
            flex: 1,
            flexDirection: "column",
        },
        name: {
            fontWeight: "bold",
        },
        subheader: {
            color: "#6F6F7D",
            fontSize: 10,
        },
    })

    return (
        <View style={styles.container}>
            {items.map((item) => (
                <View key={item.id} style={styles.item}>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <Text style={styles.subheader}>{item.jobTitle} - {item.companyName}</Text>
                    <Text>{item.defaultEmail}</Text>
                    <Text>+{item.defaultPhoneNumber}</Text>
                </View>
            ))}
        </View>
    )
}
