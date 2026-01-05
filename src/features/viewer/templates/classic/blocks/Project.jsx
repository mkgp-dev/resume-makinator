import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "@/features/viewer/components/icons/Dot";

export default function Project({ items, config }) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 6,
        },
        header: {
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
        framework: {
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
    });

    return items.map((item, index) => (
        <View key={item.id} style={[styles.container, index === items.length - 1 && styles.lastChild]}>
            {config.bulletText ? (
                <View style={styles.header}>
                    <Dot style={styles.dot} />
                    <Text style={styles.name}>{item.projectName}</Text>
                </View>
            ) : (
                <Text style={styles.name}>{item.projectName}</Text>
            )}
            <View style={styles.body}>
                {item.projectFrameworks && <Text style={styles.framework}>{item.projectFrameworks}</Text>}
                <Text>{item.projectDescription}</Text>
            </View>
        </View>
    ));
}