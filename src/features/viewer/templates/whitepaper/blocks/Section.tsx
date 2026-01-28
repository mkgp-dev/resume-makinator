import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ReactNode } from "react"

type SectionProps = {
    title: string
    disableBorder?: boolean
    children: ReactNode
}

export default function Section({ title, disableBorder, children }: SectionProps) {
    const styles = StyleSheet.create({
        container: {
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: "#9E9EA8",
        },
        title: {
            fontSize: 16,
            fontWeight: "bold",
            textTransform: "uppercase",
        },
        lastItem: {
            paddingBottom: 0,
            borderBottomWidth: 0,
            borderBottomColor: "none",
        },
    })

    return (
        <View style={disableBorder ? [styles.container, styles.lastItem] : styles.container}>
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    )
}
