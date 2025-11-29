import { Font } from "@react-pdf/renderer";

import LoraRegular from "./Lora/Lora-Regular.ttf";
import LoraMedium from "./Lora/Lora-Medium.ttf";
import LoraSemiBold from "./Lora/Lora-SemiBold.ttf";
import LoraBold from "./Lora/Lora-Bold.ttf";
import LoraItalic from "./Lora/Lora-Italic.ttf";

import MontserratRegular from "./Montserrat/Montserrat-Regular.ttf";
import MontserratMedium from "./Montserrat/Montserrat-Medium.ttf";
import MontserratSemiBold from "./Montserrat/Montserrat-SemiBold.ttf";
import MontserratBold from "./Montserrat/Montserrat-Bold.ttf";
import MontserratItalic from "./Montserrat/Montserrat-Italic.ttf";

import PlayfairDisplayRegular from "./Playfair-Display/PlayfairDisplay-Regular.ttf";
import PlayfairDisplayMedium from "./Playfair-Display/PlayfairDisplay-Medium.ttf";
import PlayfairDisplaySemiBold from "./Playfair-Display/PlayfairDisplay-SemiBold.ttf";
import PlayfairDisplayBold from "./Playfair-Display/PlayfairDisplay-Bold.ttf";
import PlayfairDisplayItalic from "./Playfair-Display/PlayfairDisplay-Italic.ttf";

Font.register({
    family: "Lora",
    fonts: [
        { src: LoraRegular, fontWeight: "normal" },
        { src: LoraMedium, fontWeight: "medium" },
        { src: LoraSemiBold, fontWeight: "semibold" },
        { src: LoraBold, fontWeight: "bold" },
        { src: LoraItalic, fontWeight: "normal", fontStyle: "italic" },
    ],
});

Font.register({
    family: "Montserrat",
    fonts: [
        { src: MontserratRegular, fontWeight: "normal" },
        { src: MontserratMedium, fontWeight: "medium" },
        { src: MontserratSemiBold, fontWeight: "semibold" },
        { src: MontserratBold, fontWeight: "bold" },
        { src: MontserratItalic, fontWeight: "normal", fontStyle: "italic" },
    ],
});

Font.register({
    family: "Playfair-Display",
    fonts: [
        { src: PlayfairDisplayRegular, fontWeight: "normal" },
        { src: PlayfairDisplayMedium, fontWeight: "medium" },
        { src: PlayfairDisplaySemiBold, fontWeight: "semibold" },
        { src: PlayfairDisplayBold, fontWeight: "bold" },
        { src: PlayfairDisplayItalic, fontWeight: "normal", fontStyle: "italic" },
    ],
});

Font.registerHyphenationCallback((word) => [word]);