import { usePageHook } from "@/features/editor/hooks/usePage"

export function useDefaultHook() {
    const { update } = usePageHook()

    const buttonStart = () => update("about")

    return { buttonStart }
}