import { View, Text, StyleSheet, Link } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { ProjectItem } from "@/entities/resume/types"

type ProjectProps = {
    items: ProjectItem[]
}

export default function Project({ items }: ProjectProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 6,
        },
        name: {
            fontSize: 14,
            fontWeight: "bold",
        },
        linkText: {
            textDecoration: "none",
            color: "#000000",
        },
        nameLink: {
            textDecoration: "none",
            color: "#000000",
        },
        subtitle: {
            color: "#6F6F7D",
            fontSize: 10,
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
    })

    return items.map((item, index) => (
        <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
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
                        .map((line, lineIndex) => (
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
    ))
}
