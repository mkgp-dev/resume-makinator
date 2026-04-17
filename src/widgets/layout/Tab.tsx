import { Suspense, lazy } from "react"
import type { ActivePage } from "@/app/navigation"
import type { PageId } from "@/app/navigation"

type TabProps = {
    active: ActivePage
}

const TAB_COMPONENTS: Record<PageId, ReturnType<typeof lazy>> = {
    about: lazy(() => import("@/features/editor/tabs/About")),
    information: lazy(() => import("@/features/editor/tabs/Information")),
    education: lazy(() => import("@/features/editor/tabs/Education")),
    skill: lazy(() => import("@/features/editor/tabs/Skill")),
    work: lazy(() => import("@/features/editor/tabs/Work")),
    project: lazy(() => import("@/features/editor/tabs/Project")),
    certificate: lazy(() => import("@/features/editor/tabs/Certificate")),
    achievement: lazy(() => import("@/features/editor/tabs/Achievement")),
    reference: lazy(() => import("@/features/editor/tabs/Reference")),
    config: lazy(() => import("@/features/editor/tabs/Configuration")),
    data: lazy(() => import("@/features/editor/tabs/Data")),
}

export default function Tab({ active }: TabProps) {
    if (!active) return null

    const ActiveTab = TAB_COMPONENTS[active]

    return (
        <div key={active} className="h-full animate-fade-in">
            <Suspense
                fallback={(
                    <div className="flex h-full min-h-[18rem] items-center justify-center py-10">
                        <span className="loading loading-spinner loading-md text-primary" />
                    </div>
                )}
            >
                <ActiveTab />
            </Suspense>
        </div>
    )
}
