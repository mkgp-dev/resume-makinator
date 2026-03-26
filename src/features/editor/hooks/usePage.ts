import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useShallow } from "zustand/react/shallow"

export function usePageHook() {
    const { page, hasHydrated, update } = useResumeStore(useShallow((state) => ({
        page: state.activePage,
        hasHydrated: state.hasHydrated,
        update: state.updatePage,
    })))

    return { page, hasHydrated, update }
}
