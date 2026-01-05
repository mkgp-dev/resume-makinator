import { Font } from "@react-pdf/renderer";

import LoraRegular from "@/features/viewer/components/fonts/Lora/Lora-Regular.ttf";
import LoraMedium from "@/features/viewer/components/fonts/Lora/Lora-Medium.ttf";
import LoraSemiBold from "@/features/viewer/components/fonts/Lora/Lora-SemiBold.ttf";
import LoraBold from "@/features/viewer/components/fonts/Lora/Lora-Bold.ttf";
import LoraItalic from "@/features/viewer/components/fonts/Lora/Lora-Italic.ttf";

import MontserratRegular from "@/features/viewer/components/fonts/Montserrat/Montserrat-Regular.ttf";
import MontserratMedium from "@/features/viewer/components/fonts/Montserrat/Montserrat-Medium.ttf";
import MontserratSemiBold from "@/features/viewer/components/fonts/Montserrat/Montserrat-SemiBold.ttf";
import MontserratBold from "@/features/viewer/components/fonts/Montserrat/Montserrat-Bold.ttf";
import MontserratItalic from "@/features/viewer/components/fonts/Montserrat/Montserrat-Italic.ttf";

import PlayfairDisplayRegular from "@/features/viewer/components/fonts/Playfair-Display/PlayfairDisplay-Regular.ttf";
import PlayfairDisplayMedium from "@/features/viewer/components/fonts/Playfair-Display/PlayfairDisplay-Medium.ttf";
import PlayfairDisplaySemiBold from "@/features/viewer/components/fonts/Playfair-Display/PlayfairDisplay-SemiBold.ttf";
import PlayfairDisplayBold from "@/features/viewer/components/fonts/Playfair-Display/PlayfairDisplay-Bold.ttf";
import PlayfairDisplayItalic from "@/features/viewer/components/fonts/Playfair-Display/PlayfairDisplay-Italic.ttf";

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