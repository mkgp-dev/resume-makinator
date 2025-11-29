import { View, Text, StyleSheet, Svg, Circle } from "@react-pdf/renderer";
import Dot from "../../../components/icons/Dot";

export default function Experience({ items }) {
    const style = StyleSheet.create({
        container: {
            marginBottom: 10,
        },
        job: {
            fontSize: 14,
            fontWeight: "medium",
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
        list: {
            flexDirection: "column",
        },
        listItem: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 4,
        },
        listText: {
            flex: 1,
        },
        lastChild: {
            marginBottom: 0,
        },
    });

    return (
        items.map((item, index) => (
            <View key={item.id} style={[style.container, index === items.length - 1 && style.lastChild]}>
                <View style={style.header}>
                    <Text style={style.job}>{item.jobTitle}</Text>
                    <Text style={style.subheader}>{item.startYear} – {item.endYear}</Text>
                </View>
                <Text style={style.subheader}>{item.companyName}</Text>
                {item.bulletType ? (
                    <View style={style.list}>
                        {item.bulletSummary?.map((line, index) => (
                            <View key={index} style={style.listItem}>
                                <Dot />
                                <Text style={style.listText}>{line}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text>{item.briefSummary}</Text>
                )}
            </View>
        ))
    );
}