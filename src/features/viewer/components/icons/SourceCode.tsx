import { Svg, Path } from "@react-pdf/renderer"

type SourceCodeProps = {
    color?: string
}

export default function SourceCode({ color = "#6F6F7D" }: SourceCodeProps) {
    const styles = {
        width: 12,
        height: 12,
    }

    return (
        <Svg style={styles} viewBox="0 0 24 24">
            <Path
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}
