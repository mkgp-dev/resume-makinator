import { nanoid } from "nanoid"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import { useCommonHook } from "@/features/editor/hooks/useCommon"

export function useExperienceHook() {
    const { add, modify } = useCommonHook()
    const refresh = useInterfaceStore(state => state.updateItem)

    const newWork = () => {
        const id = nanoid()
        add("workExperiences", {
            id,
            companyName: "",
            jobTitle: "",
            briefSummary: "",
            startYear: "",
            endYear: "",
            currentlyHired: false,
            bulletType: false,
            bulletSummary: [],
        })

        refresh(id)
    }

    const newProject = () => {
        const id = nanoid()
        add("personalProjects", {
            id,
            projectName: "",
            projectSubtitle: "",
            preview: "",
            briefSummary: "",
            bulletType: false,
            bulletSummary: [],
        })

        refresh(id)
    }

    return { modify, newWork, newProject }
}
