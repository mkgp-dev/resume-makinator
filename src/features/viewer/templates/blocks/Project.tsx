import { View, Text, StyleSheet, Link } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import type { ProjectItem, TemplateId } from "@/entities/resume/types"

type ProjectProps = {
    items: ProjectItem[]
    variant: TemplateId
    baseFontSize: number
}

export default function Project({ items, variant, baseFontSize }: ProjectProps) {
    const isClassic = variant === "classic"
    const bulletIndent = Math.round(baseFontSize * 0.6) + 4

    const styles = StyleSheet.create({
        container: {
            marginBottom: isClassic ? 6 : 10,
        },
        name: {
            fontSize: isClassic ? 14 : baseFontSize + 2,
            fontWeight: isClassic ? "bold" : "medium",
            textDecoration: "none",
            color: "#000000",
        },
        nameLink: {
            textDecoration: "none",
            color: "#000000",
        },
        subtitle: {
            color: "#6F6F7D",
            ...(isClassic ? { fontSize: 10 } : {}),
        },
        list: {
            flexDirection: "column",
            ...(isClassic ? { marginTop: 3 } : {}),
        },
        listItem: {
            flexDirection: "row",
            alignItems: isClassic ? "flex-start" : undefined,
            gap: isClassic ? undefined : 2,
            marginBottom: isClassic ? 2 : 0,
        },
        bullet: {
            width: bulletIndent,
            textAlign: "center",
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
                        .filter(line => line.trim().length > 0)
                        .map((line, lineIndex) => (
                            isClassic ? (
                                <View key={lineIndex} style={styles.listItem}>
                                    <Dot style={styles.dot} />
                                    <Text style={styles.listText}>{line}</Text>
                                </View>
                            ) : (
                                <View key={lineIndex} style={styles.listItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.listText}>{line}</Text>
                                </View>
                            )
                        ))}
                </View>
            ) : (
                <Text>{item.briefSummary}</Text>
            )}
        </View>
    ))
}
