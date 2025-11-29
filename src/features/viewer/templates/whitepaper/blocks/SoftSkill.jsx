import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "../../../components/icons/Dot";

export default function SoftSkill({ items }) {
    const styles = StyleSheet.create({
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap",
        },
        item: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 4,
        },
        header: {
            fontWeight: "semibold",
        },
        subheader: {
            color: "#6F6F7D",
        },
    });
    
    return (
        <View style={styles.row}>
            {items.map((item, index)=> (
                <View key={index} style={styles.item}>
                    <Dot />
                    <Text>{item.trim()}</Text>
                </View>
            ))}
        </View>
    );
}