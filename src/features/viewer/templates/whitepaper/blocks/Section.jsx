import { View, Text, StyleSheet } from "@react-pdf/renderer";

export default function Section({ title, disableBorder, children }) {
    const style = StyleSheet.create({
        container: {
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: "#9E9EA8",
        },
        title: {
            fontSize: 16,
            fontWeight: "bold",
            textTransform: "uppercase",
        },
        lastItem: {
            paddingBottom: 0,
            borderBottomWidth: 0,
            borderBottomColor: "none",
        },
    });

    return (
        <View style={[style.container, disableBorder && style.lastItem]}>
            <Text style={style.title}>{title}</Text>
            {children}
        </View>
    );
}