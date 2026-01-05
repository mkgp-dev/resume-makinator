import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Dot from "@/features/viewer/components/icons/Dot";

export default function Experience({ items }) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 6,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
        },
        title: {
            fontWeight: "bold",
        },
        subheader: {
            color: "#6F6F7D",
            fontSize: 10,
        },
        company: {
            fontSize: 10,
            marginTop: 1,
        },
        list: {
            marginTop: 3,
        },
        listItem: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 2,
        },
        dot: {
            marginTop: 5,
            marginRight: 4,
        },
        listText: {
            flex: 1,
        },
        lastChild: {
            marginBottom: 0,
        },
    });

    return items.map((item, index) => (
        <View key={item.id} style={[styles.container, index === items.length - 1 && styles.lastChild]}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.jobTitle}</Text>
                <Text style={styles.subheader}>{item.startYear} - {item.endYear}</Text>
            </View>
            {item.companyName && <Text style={styles.company}>{item.companyName}</Text>}
            {item.bulletType ? (
                <View style={styles.list}>
                    {item.bulletSummary?.map((line, lineIndex) => (
                        <View key={lineIndex} style={styles.listItem}>
                            <Dot style={styles.dot} />
                            <Text style={styles.listText}>{line}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text>{item.briefSummary}</Text>
            )}
        </View>
    ));
}