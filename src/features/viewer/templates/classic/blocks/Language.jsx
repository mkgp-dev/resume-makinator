import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "@/features/viewer/components/icons/Dot";

export default function Language({ items }) {
    const styles = StyleSheet.create({
        listItem: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 2,
        },
        dot: {
            marginTop: 5,
            marginRight: 4,
        },
        text: {
            flex: 1,
        },
        lastChild: {
            marginBottom: 0,
        },
    });

    return items.map((item, index) => (
        <View key={index} style={[styles.listItem, index === items.length - 1 && styles.lastChild]}>
            <Dot style={styles.dot} />
            <Text style={styles.text}>{item.trim()}</Text>
        </View>
    ));
}