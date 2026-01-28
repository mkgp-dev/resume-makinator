import { nanoid } from "nanoid"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import { useCommonHook } from "@/features/editor/hooks/useCommon"

export function useSkillHook() {
    const { add, modify } = useCommonHook()
    const common = useResumeStore(state => state.softSkills)
    const update = useResumeStore(state => state.updateSkills)
    const refresh = useInterfaceStore(state => state.updateItem)

    const newCore = () => {
        const id = nanoid()
        add("coreSkills", {
            id,
            devLanguage: "",
            devFramework: [],
        })

        refresh(id)
    }

    return { common, update, modify, newCore }
}