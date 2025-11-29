import { usePageStore } from "./usePageStore";

export function useDefaultStore() {
    const { update } = usePageStore();

    const buttonStart = () => update("about");

    return { buttonStart };
}