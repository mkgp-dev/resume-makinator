import { View, Text, StyleSheet } from "@react-pdf/renderer";

export default function Education({ items }) {
    const style = StyleSheet.create({
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
            <View key={item.id} style={[style.container, index === items.length - 1 && style.lastChild]}>
                <View style={style.header}>
                    <Text style={style.degree}>{item.courseDegree}</Text>
                    <Text style={style.subheader}>{item.startYear} – {item.endYear}</Text>
                </View>
                <Text style={style.subheader}>{item.schoolName}</Text>
            </View>
        ))
    );
}