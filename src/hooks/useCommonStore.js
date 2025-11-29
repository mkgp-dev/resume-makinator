import { useResumeStore } from "./useResumeStore";

export function useCommonStore() {
    const add = useResumeStore(state => state.addItem);
    const modify = useResumeStore(state => state.updateItem);

    return { add, modify }
}