import { nanoid } from "nanoid"
import { useCommonHook } from "@/features/editor/hooks/useCommon"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"

export function useCertificateHook() {
    const { add, modify } = useCommonHook()
    const refresh = useInterfaceStore(state => state.updateItem)

    const newCertificate = () => {
        const id = nanoid()
        add("certificates", {
            id,
            certificateName: "",
            certificateIssuer: "",
            yearIssued: "",
            certificateDescription: "",
        })

        refresh(id)
    }

    const newAchievement = () => {
        const id = nanoid()
        add("achievements", {
            id,
            achievementName: "",
            achievementIssuer: "",
            yearIssued: "",
            achievementDescription: "",
        })

        refresh(id)
    }

    return { modify, newCertificate, newAchievement }
}