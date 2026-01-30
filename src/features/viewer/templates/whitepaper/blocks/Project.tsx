import { View, Text, StyleSheet, Link } from "@react-pdf/renderer"
import SourceCode from "@/features/viewer/components/icons/SourceCode"
import Preview from "@/features/viewer/components/icons/Preview"
import type { ProjectItem, WhitepaperTemplateConfig } from "@/entities/resume/types"

type ProjectProps = {
    items: ProjectItem[]
    config: WhitepaperTemplateConfig
    baseFontSize: number
}

export default function Project({ items, config, baseFontSize }: ProjectProps) {
    const bulletIndent = Math.round(baseFontSize * 0.6) + 4
    const linkFontSize = Math.max(baseFontSize - 3, 8)
    const itemSpacing = config.bulletText ? 0 : 8

    const styles = StyleSheet.create({
        container: {
            marginBottom: itemSpacing,
        },
        row: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 0,
        },
        name: {
            fontSize: baseFontSize + 2,
            fontWeight: "medium",
        },
        margin: {
            marginLeft: bulletIndent,
        },
        links: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        linkItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        linkText: {
            fontSize: linkFontSize,
            color: "#6F6F7D",
            textDecoration: "none",
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
                        <Text style={styles.name}>• {item.projectName}</Text>
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
