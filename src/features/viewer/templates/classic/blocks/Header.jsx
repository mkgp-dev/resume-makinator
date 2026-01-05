import { View, Text, StyleSheet, Link } from "@react-pdf/renderer";
import Home from "@/features/viewer/components/icons/Home";
import Mail from "@/features/viewer/components/icons/Mail";
import Phone from "@/features/viewer/components/icons/Phone";
import Github from "@/features/viewer/components/icons/Github";
import Linkedin from "@/features/viewer/components/icons/Linkedin";

export default function Header({ data }) {
    const styles = StyleSheet.create({
        container: {
            alignItems: "center",
            textAlign: "center",
        },
        name: {
            fontSize: 24,
            fontWeight: "bold",
        },
        title: {
            fontSize: 12,
            marginBottom: 4,
        },
        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: 10,
            marginBottom: 4,
        },
        iconWrap: {
            marginRight: 4,
        },
        contactText: {
            fontSize: 10,
            color: "#000000",
            textDecoration: "none",
        },
    });

    const contactItems = [
        data.defaultAddress && { key: "address", icon: <Home />, text: data.defaultAddress },
        data.defaultEmail && { key: "email", icon: <Mail />, text: data.defaultEmail },
        data.defaultPhoneNumber && { key: "phone", icon: <Phone />, text: `+${data.defaultPhoneNumber}` },
        data.socialGithub && {
            key: "github",
            icon: <Github />,
            text: data.socialGithub,
            href: `https://github.com/${data.socialGithub}`,
        },
        data.socialLinkedin && {
            key: "linkedin",
            icon: <Linkedin />,
            text: data.socialLinkedin,
            href: `https://www.linkedin.com/in/${data.socialLinkedin}`,
        },
    ].filter(Boolean);

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{data.fullName}</Text>
            {data.jobTitle && <Text style={styles.title}>{data.jobTitle}</Text>}

            {contactItems.length > 0 && (
                <View style={styles.contactRow}>
                    {contactItems.map(item => (
                        <View key={item.key} style={styles.contactItem}>
                            <View style={styles.iconWrap}>{item.icon}</View>
                            {item.href ? (
                                <Link src={item.href} style={styles.contactText}>
                                    {item.text}
                                </Link>
                            ) : (
                                <Text style={styles.contactText}>{item.text}</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}