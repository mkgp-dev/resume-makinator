import { View, Text, StyleSheet } from "@react-pdf/renderer";

export default function Education({ items }) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 8,
        },
        degree: {
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
        lastChild: {
            marginBottom: 0,
        },
    });

    return (
        items.map((item, index) => (
            <View key={item.id} style={[styles.container, index === items.length - 1 && styles.lastChild]}>
                <View style={styles.header}>
                    <Text style={styles.degree}>{item.courseDegree}</Text>
                    <Text style={styles.subheader}>{item.startYear} – {item.endYear}</Text>
                </View>
                <Text style={styles.subheader}>{item.schoolName}</Text>
            </View>
        ))
    );
}