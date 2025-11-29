import { View, Text, StyleSheet, Image, Link } from "@react-pdf/renderer";
import Home from "../../../components/icons/Home";
import Mail from "../../../components/icons/Mail";
import Phone from "../../../components/icons/Phone";
import Github from "../../../components/icons/Github";
import Linkedin from "../../../components/icons/Linkedin";

const styles = StyleSheet.create({
    container: {
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#9E9EA8",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    left: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000000",
    },
    title: {
        fontSize: 14,
        marginTop: -5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginTop: 2,
    },
    column: {
        flexDirection: "column",
        gap: 2,
        marginTop: 2,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    link: {
        textDecoration: "none",
        color: "#000000",
    }
});

export default function Header({ data, config }) {

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.left}>
                    <Text style={styles.name}>{data.fullName}</Text>
                    {data.jobTitle && <Text style={styles.title}>{data.jobTitle}</Text>}

                    <View style={config.inlineInformation ? styles.row : styles.column}>
                        {data.defaultAddress && (
                            <View style={styles.item}>
                                <Home />
                                <Text>{data.defaultAddress}</Text>
                            </View>
                        )}

                        {data.defaultEmail && (
                            <View style={styles.item}>
                                <Mail />
                                <Text>{data.defaultEmail}</Text>
                            </View>
                        )}

                        {data.defaultPhoneNumber && (
                            <View style={styles.item}>
                                <Phone />
                                <Text>+{data.defaultPhoneNumber}</Text>
                            </View>
                        )}

                        {data.socialGithub && (
                            <View style={styles.item}>
                                <Github />
                                <Link
                                    src={`https://github.com/${data.socialGithub}`}
                                    style={styles.link}
                                >
                                    {data.socialGithub}
                                </Link>
                            </View>
                        )}

                        {data.socialLinkedin && (
                            <View style={styles.item}>
                                <Linkedin />
                                <Link
                                    src={`https://www.linkedin.com/in/${data.socialLinkedin}`}
                                    style={styles.link}
                                >
                                    {data.socialLinkedin}
                                </Link>
                            </View>
                        )}
                    </View>
                </View>

                {config.enablePicture && data.profilePicture && (
                    <View style={{
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "#000000",
                    }}>
                        <Image
                            src={data.profilePicture}
                            style={{
                                width: config.pictureSize,
                                height: config.pictureSize,
                                objectFit: "cover",
                            }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}