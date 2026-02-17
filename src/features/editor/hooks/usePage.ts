import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useShallow } from "zustand/shallow"

export function usePageHook() {
    const { page, hydrate, update } = useResumeStore(useShallow((state) => ({
        page: state.activePage,
        hydrate: state.hasHydrated,
        update: state.updatePage,
    })))

    return { page, hydrate, update }
}
