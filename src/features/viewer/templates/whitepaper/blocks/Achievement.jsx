import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "@/features/viewer/components/icons/Dot";

export default function Achievement({ items, config }) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 8,
        },
        row: {
            flexDirection: "row",
            gap: 3,
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
            marginLeft: 9,
        },
        dot: {
            marginTop: 2,
        },
        lastChild: {
            marginBottom: 0,
        },
    });

    return (
        items.map((item, index) => (
            <View key={item.id} style={[styles.container, index === items.length - 1 && styles.lastChild]}>
                <View style={styles.header}>
                    {config.bulletText ? (
                        <View style={styles.row}>
                            <Dot style={styles.dot} />
                            <Text style={styles.name}>{item.achievementName}</Text>
                        </View>
                    ) : (
                        <Text style={styles.name}>{item.achievementName}</Text>
                    )}
                    {item.yearIssued && <Text style={styles.subheader}>{item.yearIssued}</Text>}
                </View>

                <View style={config.bulletText && styles.margin}>
                    {item.achievementIssuer && <Text style={styles.subheader}>{item.achievementIssuer}</Text>}
                    <Text>{item.achievementDescription}</Text>
                </View>
            </View>
        ))
    );
}