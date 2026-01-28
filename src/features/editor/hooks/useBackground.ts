import { nanoid } from "nanoid"
import type { ChangeEventHandler } from "react"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useCommonHook } from "@/features/editor/hooks/useCommon"
import { validateProfileImage } from "@/entities/resume/validation/image"
import { normalizeTemplateId } from "@/entities/resume/validation/template"

export function useBackgroundHook() {
    const { add, modify } = useCommonHook()
    const details = useResumeStore(state => state.personalDetails)
    const update = useResumeStore(state => state.updateDetails)
    const refresh = useInterfaceStore(state => state.updateItem)
    const config = useResumeStore(state => state.configuration)
    const template = useResumeStore(state => state.updateTemplate)

    const handleImage: ChangeEventHandler<HTMLInputElement> = (event) => {
        const file = event.target.files?.[0]
        if (!file || !validateProfileImage(file)) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result !== "string") return
            update("profilePicture", reader.result)
            template(normalizeTemplateId(config.template), "enablePicture", true)
        }
        reader.readAsDataURL(file)
    }

    const newEducation = () => {
        const id = nanoid()
        add("education", {
            id,
            schoolName: "",
            courseDegree: "",
            startYear: "",
            endYear: "",
            currentEnrolled: false,
        })

        refresh(id)
    }

    const newReference = () => {
        const id = nanoid()
        add("references", {
            id,
            fullName: "",
            jobTitle: "",
            companyName: "",
            defaultPhoneNumber: "",
            defaultEmail: "",
        })

        refresh(id)
    }

    return { details, update, modify, handleImage, newEducation, newReference }
}
