import { View, Text, StyleSheet } from "@react-pdf/renderer";

export default function Section({ title, children }) {
    const styles = StyleSheet.create({
        title: {
            fontSize: 13,
            fontWeight: "bold",
            textTransform: "uppercase",
            borderBottomWidth: 2,
            borderBottomColor: "#000000",
            width: "100%",
            marginBottom: 5,
        },
    });

    return (
        <View>
            <View>
                <Text style={styles.title}>{title}</Text>
            </View>
            {children}
        </View>
    );
}