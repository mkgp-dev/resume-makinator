import { nanoid } from "nanoid";
import { useCommonStore } from "./useCommonStore";
import { useInterfaceStore } from "./useInterfaceStore";

export function useCertificateStore() {
    const { add, modify } = useCommonStore();
    const refresh = useInterfaceStore(state => state.updateItem);

    const newCertificate = () => {
        const id = nanoid();
        add("certificates", {
            certificateName: "",
            certificateIssuer: "",
            yearIssued: "",
            certificateDescription: "",
        });

        refresh(id);
    };

    const newAchievement = () => {
        const id = nanoid();
        add("achievements", {
            achievementName: "",
            achievementIssuer: "",
            yearIssued: "",
            achievementDescription: "",
        });

        refresh(id);
    };

    return { modify, newCertificate, newAchievement }
}