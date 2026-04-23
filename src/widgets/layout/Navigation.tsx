import {
    ArchiveBoxIcon,
    AcademicCapIcon,
    Bars3Icon,
    BriefcaseIcon,
    CodeBracketIcon,
    Cog8ToothIcon,
    DocumentTextIcon,
    IdentificationIcon,
    StarIcon,
    UserIcon,
    UsersIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid"
import { usePageHook } from "@/features/editor/hooks/usePage"
import clsx from "clsx"
import { useState } from "react"
import type { ReactNode } from "react"
import type { ActivePage, PageId } from "@/app/navigation"

type NavigationProps = {
    active: ActivePage
}

type NavigationTab = {
    id: PageId
    label: string
    icon: ReactNode
}

const mainTabs: NavigationTab[] = [
    { id: "about", label: "About you", icon: <UserIcon className="size-4 shrink-0" /> },
    { id: "information", label: "Information", icon: <IdentificationIcon className="size-4 shrink-0" /> },
    { id: "education", label: "Education", icon: <AcademicCapIcon className="size-4 shrink-0" /> },
    { id: "skill", label: "Skill", icon: <WrenchScrewdriverIcon className="size-4 shrink-0" /> },
    { id: "work", label: "Work Experience", icon: <BriefcaseIcon className="size-4 shrink-0" /> },
    { id: "project", label: "Personal Project", icon: <CodeBracketIcon className="size-4 shrink-0" /> },
    { id: "certificate", label: "Certificate", icon: <DocumentTextIcon className="size-4 shrink-0" /> },
    { id: "achievement", label: "Achievement", icon: <StarIcon className="size-4 shrink-0" /> },
    { id: "reference", label: "Reference", icon: <UsersIcon className="size-4 shrink-0" /> },
]

const secondaryTabs: NavigationTab[] = [
    { id: "config", label: "Configuration", icon: <Cog8ToothIcon className="size-4 shrink-0" /> },
    { id: "data", label: "Data", icon: <ArchiveBoxIcon className="size-4 shrink-0" /> },
]

function NavigationButton({
    item,
    active,
    onClick,
    showLabel,
}: {
    item: NavigationTab
    active: boolean
    onClick: () => void
    showLabel?: boolean
}) {
    return (
        <div className={clsx(!showLabel && "tooltip tooltip-right")} data-tip={item.label}>
            <button
                type="button"
                onClick={onClick}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={clsx(
                    "group relative flex h-11 items-center gap-3 rounded-[0.35rem] border px-3 text-sm transition-colors duration-150",
                    showLabel ? "w-full justify-start" : "w-11 justify-center px-0",
                    active
                        ? "border-primary/50 bg-primary/16 text-slate-50 shadow-[0_0_0_1px_rgba(125,138,255,0.12)]"
                        : "border-slate-500/10 bg-transparent text-slate-400 hover:border-sky-300/55 hover:bg-slate-800/92 hover:text-slate-50 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.22),0_10px_28px_rgba(2,6,23,0.22)]",
                )}
            >
                {item.icon}
                <span className={clsx(showLabel ? "inline" : "sr-only")}>{item.label}</span>
            </button>
        </div>
    )
}

export default function Navigation({ active }: NavigationProps) {
    const { update } = usePageHook()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const activeItem = [...mainTabs, ...secondaryTabs].find((item) => item.id === active) ?? mainTabs[0]

    const handleSelect = (pageId: PageId) => {
        update(pageId)
        setIsMobileOpen(false)
    }

    return (
        <>
            <div className="editor-panel-surface sticky top-3 z-30 mb-4 flex items-center justify-between rounded-[0.45rem] px-3 py-2 lg:hidden">
                <div className="min-w-0">
                    <div className="truncate font-manrope text-base font-semibold text-slate-100">
                        {activeItem.label}
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn-sm rounded-[0.35rem] border border-base-300 bg-base-200/80 text-slate-100 shadow-none"
                    aria-label="Open navigation"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <Bars3Icon className="size-5" />
                </button>
            </div>

            <div
                className={clsx(
                    "fixed inset-0 z-40 lg:hidden",
                    isMobileOpen ? "pointer-events-auto" : "pointer-events-none",
                )}
                aria-hidden={!isMobileOpen}
            >
                <div
                    className={clsx(
                        "absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-150",
                        isMobileOpen ? "opacity-100" : "opacity-0",
                    )}
                    onClick={() => setIsMobileOpen(false)}
                />
                <aside
                    data-testid="editor-sidebar-mobile"
                    className={clsx(
                        "editor-panel-surface absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col gap-5 rounded-r-[0.65rem] border-l-0 px-4 py-4 transition-transform duration-200",
                        isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Navigation</div>
                            <div className="font-manrope text-lg font-semibold text-slate-100">Resume sections</div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-square btn-sm rounded-[0.35rem] border border-base-300 bg-base-200/80 text-slate-200 shadow-none"
                            aria-label="Close navigation"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <XMarkIcon className="size-5" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {mainTabs.map((item) => (
                            <NavigationButton
                                key={item.id}
                                item={item}
                                active={active === item.id}
                                showLabel={true}
                                onClick={() => handleSelect(item.id)}
                            />
                        ))}
                    </div>

                    <div className="h-px bg-slate-500/55" />

                    <div className="space-y-2">
                        {secondaryTabs.map((item) => (
                            <NavigationButton
                                key={item.id}
                                item={item}
                                active={active === item.id}
                                showLabel={true}
                                onClick={() => handleSelect(item.id)}
                            />
                        ))}
                    </div>
                </aside>
            </div>

            <div className="pointer-events-none fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:left-6">
                <nav
                    data-testid="editor-sidebar-desktop"
                    className="editor-glass-surface pointer-events-auto flex w-16 flex-col items-center gap-3 rounded-[0.9rem] px-2 py-3"
                >
                    <div data-testid="editor-sidebar-main-group" className="flex w-full flex-col items-center gap-2">
                        {mainTabs.map((item) => (
                            <NavigationButton
                                key={item.id}
                                item={item}
                                active={active === item.id}
                                onClick={() => handleSelect(item.id)}
                            />
                        ))}
                    </div>

                    <div className="h-px w-full bg-slate-500/55" />

                    <div data-testid="editor-sidebar-secondary-group" className="flex w-full flex-col items-center gap-2">
                        {secondaryTabs.map((item) => (
                            <NavigationButton
                                key={item.id}
                                item={item}
                                active={active === item.id}
                                onClick={() => handleSelect(item.id)}
                            />
                        ))}
                    </div>
                </nav>
            </div>
        </>
    )
}
