import { View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ReactNode } from "react"

type SectionProps = {
    title: string
    children: ReactNode
}

export default function Section({ title, children }: SectionProps) {
    const styles = StyleSheet.create({
        title: {
            fontSize: 13,
            fontWeight: "bold",
            textTransform: "uppercase",
            borderBottomWidth: 2,
            borderBottomColor: "#000000",
            width: "100%",
            marginBottom: 5,
        },
    })

    return (
        <View>
            <View>
                <Text style={styles.title}>{title}</Text>
            </View>
            {children}
        </View>
    )
}
