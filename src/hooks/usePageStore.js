import { useResumeStore } from "./useResumeStore";

export function usePageStore() {
    const page = useResumeStore(state => state.activePage);
    const update = useResumeStore(state => state.updatePage);
    const hydrate = useResumeStore(state => state.hasHydrated);

    return { page, hydrate, update };
}