import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "../../../components/icons/Dot";

export default function Project({ items, config }) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 8,
        },
        row: {
            flexDirection: "row",
            gap: 4,
        },
        name: {
            fontSize: 14,
            fontWeight: "medium",
        },
        margin: {
            marginLeft: 13,
        },
        framework: {
            color: "#6F6F7D",
        },
        lastChild: {
            marginBottom: 0,
        },
    });

    return (
        items.map((item, index) => (
            <View key={item.id} style={[styles.container, index === items.length - 1 && styles.lastChild]}>
                {config.bulletText ? (
                    <View style={styles.row}>
                        <Dot isLarge={true} />
                        <Text style={styles.name}>{item.projectName}</Text>
                    </View>
                ) : (
                    <Text style={styles.name}>{item.projectName}</Text>
                )}
                <View style={config.bulletText && styles.margin}>
                    {item.projectFrameworks && <Text style={styles.framework}>{item.projectFrameworks}</Text>}
                    <Text>{item.projectDescription}</Text>
                </View>
            </View>
        ))
    );
}