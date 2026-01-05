import { usePageHook } from "@/hooks/usePage";

export function useDefaultHook() {
    const { update } = usePageHook();

    const buttonStart = () => update("about");

    return { buttonStart };
}