import { useResumeStore } from "@/stores/useResumeStore";

export function useCommonHook() {
    const add = useResumeStore(state => state.addItem);
    const modify = useResumeStore(state => state.updateItem);

    return { add, modify }
}