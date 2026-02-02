import { View, Text, StyleSheet, Link } from "@react-pdf/renderer"
import type { ProjectItem } from "@/entities/resume/types"

type ProjectProps = {
    items: ProjectItem[]
    baseFontSize: number
}

export default function Project({ items, baseFontSize }: ProjectProps) {
    const bulletIndent = Math.round(baseFontSize * 0.6) + 4

    const styles = StyleSheet.create({
        container: {
            marginBottom: 10,
        },
        name: {
            fontSize: baseFontSize + 2,
            fontWeight: "medium",
            textDecoration: "none",
            color: "#000000",
        },
        nameLink: {
            textDecoration: "none",
            color: "#000000",
        },
        subtitle: {
            color: "#6F6F7D",
        },
        list: {
            flexDirection: "column",
        },
        listItem: {
            flexDirection: "row",
            gap: 2,
        },
        bullet: {
            width: bulletIndent,
            textAlign: "center",
        },
        listText: {
            flex: 1,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return (
        items.map((item, index) => (
            <View
                key={item.id}
                style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}
            >
                <Text style={styles.name}>
                    {item.preview ? (
                        <Link src={item.preview} style={styles.nameLink}>
                            {item.projectName}
                        </Link>
                    ) : (
                        item.projectName
                    )}
                </Text>
                {item.projectSubtitle ? <Text style={styles.subtitle}>{item.projectSubtitle}</Text> : null}
                {item.bulletType ? (
                    <View style={styles.list}>
                        {item.bulletSummary
                            ?.filter(line => line.trim().length > 0)
                            .map((line, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.listText}>{line}</Text>
                                </View>
                            ))}
                    </View>
                ) : (
                    <Text>{item.briefSummary}</Text>
                )}
            </View>
        ))
    )
}
