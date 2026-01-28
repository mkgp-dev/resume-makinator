import { View, Text, StyleSheet, Link } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import SourceCode from "@/features/viewer/components/icons/SourceCode"
import Preview from "@/features/viewer/components/icons/Preview"
import type { ProjectItem, WhitepaperTemplateConfig } from "@/entities/resume/types"

type ProjectProps = {
    items: ProjectItem[]
    config: WhitepaperTemplateConfig
}

export default function Project({ items, config }: ProjectProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 8,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        name: {
            fontSize: 14,
            fontWeight: "medium",
        },
        margin: {
            marginLeft: 13,
        },
        links: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            fontSize: 9,
        },
        linkItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        linkText: {
            color: "#6F6F7D",
            textDecoration: "none",
        },
        dot: {
            marginTop: 2,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return (
        items.map((item, index) => (
            <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
                {config.bulletText ? (
                    <View style={styles.row}>
                        <Dot isLarge={true} style={styles.dot} />
                        <Text style={styles.name}>{item.projectName}</Text>
                    </View>
                ) : (
                    <Text style={styles.name}>{item.projectName}</Text>
                )}
                {(item.sourceCode || item.preview) && (
                    <View style={[
                        styles.links,
                        config.bulletText ? styles.margin : {}
                    ]}>
                        {item.sourceCode && (
                            <View style={styles.linkItem}>
                                    <SourceCode color="#6F6F7D" />
                                <Link src={item.sourceCode} style={styles.linkText}>
                                    View source
                                </Link>
                            </View>
                        )}
                        {item.preview && (
                            <View style={styles.linkItem}>
                                    <Preview color="#6F6F7D" />
                                <Link src={item.preview} style={styles.linkText}>
                                    Preview
                                </Link>
                            </View>
                        )}
                    </View>
                )}
                <View style={config.bulletText ? styles.margin : {}}>
                    <Text>{item.projectDescription}</Text>
                </View>
            </View>
        ))
    )
}
