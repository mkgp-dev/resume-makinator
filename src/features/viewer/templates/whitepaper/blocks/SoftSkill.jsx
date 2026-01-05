import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "@/features/viewer/components/icons/Dot";

export default function SoftSkill({ items }) {
    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        item: {
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            marginRight: 10,
        },
        dot: {
            marginTop: 2,
        },
    });
    
    return (
        <View style={styles.row}>
            {items.map((item, index)=> (
                <View key={index} style={styles.item}>
                    <Dot style={styles.dot} />
                    <Text>{item.trim()}</Text>
                </View>
            ))}
        </View>
    );
}