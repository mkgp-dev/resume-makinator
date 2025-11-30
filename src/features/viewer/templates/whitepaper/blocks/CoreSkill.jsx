import { View, Text, StyleSheet } from "@react-pdf/renderer";

export default function CoreSkill({ items }) {
    const style = StyleSheet.create({
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        item: {
            width: "50%",
            paddingRight: 6,
            marginBottom: 2,
        },
        header: {
            fontWeight: "semibold",
        },
        subheader: {
            color: "#6F6F7D",
        },
    });

    return (
        <View style={style.row}>
            {items.map((item, index) => (
                <View key={index} style={style.item}>
                    <Text>
                        <Text style={style.header}>{item.devLanguage}</Text>
                        <Text> – </Text>
                        <Text style={style.subheader}>
                            {Array.isArray(item.devFramework)
                                ? item.devFramework.join(", ")
                                : item.devFramework}
                        </Text>
                    </Text>
                </View>
            ))}
        </View>
    );
}