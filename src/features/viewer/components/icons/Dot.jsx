import { Svg, Circle } from "@react-pdf/renderer";

export default function Dot({ isLarge = false }) {
    const styles = {
        width: isLarge ? "8" : "6",
        height: isLarge ? "8" : "6",
        marginTop: isLarge ? "6" : "4",
    };

    return (
        <Svg style={styles} viewBox="0 0 128 128">
            <Circle cx="50" cy="50" r="45" fill="#000000" />
        </Svg>
    );
}