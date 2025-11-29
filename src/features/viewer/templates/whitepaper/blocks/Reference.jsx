import { View, Text, StyleSheet } from "@react-pdf/renderer";

export default function Reference({ items }) {
    const style = StyleSheet.create({
        row: {
            flexDirection: "row",
        },
        item: {
            flex: 1,
            flexDirection: "column",
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
                <View key={item.id} style={style.item}>
                    <Text style={style.header}>{item.fullName}</Text>
                    <View style={style.row}>
                        <Text style={style.subheader}>{item.jobTitle}</Text>
                        <Text style={style.subheader}>, </Text>
                        <Text style={style.subheader}>{item.companyName}</Text>
                    </View>
                    {item.defaultPhoneNumber && <Text style={style.subheader}>+{item.defaultPhoneNumber}</Text>}
                    {item.defaultEmail && <Text style={style.subheader}>{item.defaultEmail}</Text>}
                </View>
            ))}
        </View>
    );
}