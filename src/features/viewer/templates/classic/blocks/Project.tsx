import { View, Text, StyleSheet, Link } from "@react-pdf/renderer"
import Dot from "@/features/viewer/components/icons/Dot"
import SourceCode from "@/features/viewer/components/icons/SourceCode"
import Preview from "@/features/viewer/components/icons/Preview"
import type { ClassicTemplateConfig, ProjectItem } from "@/entities/resume/types"

type ProjectProps = {
    items: ProjectItem[]
    config: ClassicTemplateConfig
}

export default function Project({ items, config }: ProjectProps) {
    const styles = StyleSheet.create({
        container: {
            marginBottom: 6,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
        },
        name: {
            fontSize: 14,
            fontWeight: "bold",
        },
        dot: {
            marginTop: 1,
            marginRight: 4,
        },
        links: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
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
            fontSize: 10,
        },
        body: {
            marginTop: 2,
           
        },
        leftMargin: {
            marginLeft: config.bulletText ? 10 : 0,
        },
        lastChild: {
            marginBottom: 0,
        },
    })

    return items.map((item, index) => (
        <View key={item.id} style={index === items.length - 1 ? [styles.container, styles.lastChild] : styles.container}>
            {config.bulletText ? (
                <View style={styles.header}>
                    <Dot style={styles.dot} />
                    <Text style={styles.name}>{item.projectName}</Text>
                </View>
            ) : (
                <Text style={styles.name}>{item.projectName}</Text>
            )}
            {(item.sourceCode || item.preview) && (
                <View style={[
                    styles.links, styles.leftMargin
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
            <View style={[
                styles.body, styles.leftMargin
            ]}>
                <Text>{item.projectDescription}</Text>
            </View>
        </View>
    ))
}
