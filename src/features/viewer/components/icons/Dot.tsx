import { Svg, Circle } from "@react-pdf/renderer"
import type { Style } from "@react-pdf/types"

type DotProps = {
    isLarge?: boolean
    style?: Style
}

export default function Dot({ isLarge = false, style }: DotProps) {
    const styles = {
        width: isLarge ? "8" : "6",
        height: isLarge ? "8" : "6",
    }

    return (
        <Svg style={style ? [styles, style] : styles} viewBox="0 0 128 128">
            <Circle cx="50" cy="50" r="45" fill="#000000" />
        </Svg>
    )
}
