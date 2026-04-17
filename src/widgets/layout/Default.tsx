import {
    ArrowDownTrayIcon,
    ArrowRightCircleIcon,
    ArrowsUpDownIcon,
    EyeIcon,
    RectangleStackIcon,
} from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import { useDefaultHook } from "@/features/editor/hooks/useDefault"

const proofCards = [
    {
        title: "Structured editing",
        description: "Work through focused sections instead of fighting a blank page. Every field stays organized and easy to revisit.",
        icon: RectangleStackIcon,
    },
    {
        title: "Live PDF preview",
        description: "See the document update as you type so spacing, hierarchy, and readability stay visible while you build.",
        icon: EyeIcon,
    },
    {
        title: "Export and reorder",
        description: "Drag sections into place, refine the flow, and export a polished resume without leaving the browser.",
        icon: ArrowDownTrayIcon,
    },
]

const editorHighlights = [
    "Browser based",
    "Drag to reorder",
    "PDF ready",
]

export default function Default() {
    const { buttonStart } = useDefaultHook()

    return (
        <main data-testid="landing-shell" className="landing-shell overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 lg:h-dvh lg:px-8 lg:py-6">
            <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[1380px] flex-col justify-center lg:h-[calc(100dvh-3rem)] lg:min-h-0">
                <section className="landing-hero-grid flex-1">
                    <div data-testid="landing-hero-copy" className="landing-rise-in flex max-w-2xl flex-col items-start">
                        <p className="font-manrope text-xs uppercase tracking-[0.28em] text-slate-400 sm:text-[0.9rem]">
                            Click. Fill. Done.
                        </p>

                        <h1
                            id="landing-title"
                            className="mt-3 max-w-3xl font-manrope text-3xl font-semibold leading-[1.03] text-slate-50 sm:text-5xl lg:text-[3.95rem]"
                        >
                            Free Resume Builder with Live PDF Preview
                        </h1>

                        <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-slate-300 sm:text-lg lg:max-w-xl lg:text-[1rem] lg:leading-7">
                            Resume Makinator gives you a cleaner way to shape your resume: structured inputs,
                            focused editing, live preview, and fast PDF export in one workspace.
                        </p>

                        <div className="mt-4 rounded-[0.55rem] border border-slate-500/24 bg-base-200/36 px-4 py-3 shadow-[0_16px_40px_rgba(2,6,23,0.18)] lg:max-w-[38rem]">
                            <p className="font-manrope text-base font-semibold text-slate-100 sm:text-xl">
                                This is Resume Makinator
                            </p>
                            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-400 sm:text-[0.95rem]">
                                Minimal by default, practical in use, and built to feel like a modern editing tool instead of a cluttered form wall.
                            </p>
                        </div>

                        <div className="mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <Button
                                variant="entry"
                                text="Get started"
                                icon={<ArrowRightCircleIcon className="size-7" />}
                                onClick={buttonStart}
                                className="h-[3.25rem] justify-center px-6 text-base sm:min-w-52"
                            />
                            <p className="hidden text-sm text-slate-400 sm:block">
                                Start in the browser. No signup wall, no extra setup.
                            </p>
                        </div>

                        <div className="mt-4 hidden flex-wrap gap-2 sm:flex lg:mt-3">
                            {editorHighlights.map((highlight) => (
                                <div
                                    key={highlight}
                                    className="rounded-full border border-slate-500/24 bg-base-200/28 px-4 py-2 text-sm text-slate-300"
                                >
                                    {highlight}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div data-testid="landing-hero-visual" className="landing-rise-in-delay flex w-full justify-center lg:justify-end">
                        <div className="landing-hero-visual w-full max-w-[22rem] sm:max-w-[30rem] lg:max-w-[35rem] xl:max-w-[39rem]">
                            <div className="landing-hero-glow" aria-hidden="true" />

                            <div className="landing-mock-shell editor-glass-surface landing-float">
                                <div className="flex items-center justify-between gap-4 border-b border-slate-500/20 px-4 py-2.5 sm:px-5 sm:py-3">
                                    <div>
                                        <p className="font-manrope text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">
                                            Resume Builder
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            Edit, preview, and export from one workspace
                                        </p>
                                    </div>
                                    <div className="rounded-full border border-sky-400/28 bg-sky-400/10 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-sky-200">
                                        Live
                                    </div>
                                </div>

                                <div className="landing-mock-grid">
                                    <div className="rounded-[0.65rem] border border-slate-500/22 bg-slate-950/24 p-3">
                                        <div className="flex items-center gap-3 pb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-[0.5rem] border border-slate-400/18 bg-base-200/52 text-slate-200">
                                                <RectangleStackIcon className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-manrope text-sm font-semibold text-slate-100">
                                                    About you
                                                </p>
                                                <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-500">
                                                    Structured form
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-[0.5rem] border border-slate-500/18 bg-base-200/36 px-3 py-2.5">
                                                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-500">
                                                    Name
                                                </p>
                                                <p className="mt-2 text-sm text-slate-200">Mark Kenneth Pelayo</p>
                                            </div>
                                            <div className="rounded-[0.5rem] border border-slate-500/18 bg-base-200/36 px-3 py-2.5">
                                                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-500">
                                                    Position
                                                </p>
                                                <p className="mt-2 text-sm text-slate-200">Web Developer</p>
                                            </div>
                                            <div className="rounded-[0.7rem] border border-slate-500/16 bg-base-200/28 px-3 py-3">
                                                <div className="flex items-start gap-2">
                                                    <ArrowsUpDownIcon className="mt-0.5 size-4 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm text-slate-200">Education</p>
                                                        <p className="mt-1 text-xs leading-6 text-slate-400">
                                                            Reorder sections and keep the flow readable.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[0.75rem] border border-slate-500/20 bg-slate-950/30 p-3 sm:p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-manrope text-sm font-semibold text-slate-100">
                                                    Preview
                                                </p>
                                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                                    A4 · Whitepaper
                                                </p>
                                            </div>
                                            <EyeIcon className="size-5 text-slate-400" />
                                        </div>

                                        <div className="landing-preview-sheet mt-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="h-3.5 w-40 rounded-full bg-slate-900/70" />
                                                    <div className="mt-2 h-2.5 w-28 rounded-full bg-slate-500/40" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-2.5 w-full rounded-full bg-slate-400/35" />
                                                    <div className="h-2.5 w-[92%] rounded-full bg-slate-400/30" />
                                                    <div className="h-2.5 w-[75%] rounded-full bg-slate-400/24" />
                                                </div>
                                                <div className="grid gap-3 pt-3 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <div className="h-2.5 w-24 rounded-full bg-sky-500/30" />
                                                        <div className="h-2.5 w-full rounded-full bg-slate-400/24" />
                                                        <div className="h-2.5 w-[88%] rounded-full bg-slate-400/18" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="h-2.5 w-24 rounded-full bg-sky-500/22" />
                                                        <div className="h-2.5 w-full rounded-full bg-slate-400/24" />
                                                        <div className="h-2.5 w-[82%] rounded-full bg-slate-400/18" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[0.55rem] border border-slate-500/18 bg-base-200/28 px-3 py-2">
                                                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
                                                    Live update
                                                </p>
                                                <p className="mt-2 text-sm text-slate-200">See changes instantly</p>
                                            </div>
                                            <div className="rounded-[0.55rem] border border-slate-500/18 bg-base-200/28 px-3 py-2">
                                                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
                                                    Export
                                                </p>
                                                <p className="mt-2 text-sm text-slate-200">Fast PDF output</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-rise-in-delay-2 lg:pt-2">
                    <div
                        data-testid="landing-proof-grid"
                        className="grid grid-cols-3 gap-2.5 sm:gap-4"
                    >
                        {proofCards.map(({ title, description, icon: Icon }) => (
                            <article
                                key={title}
                                data-testid="landing-proof-card"
                                className="editor-panel-surface rounded-[0.75rem] px-3 py-3 sm:rounded-[0.85rem] sm:px-5 sm:py-5"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-[0.6rem] border border-slate-400/18 bg-slate-900/35 text-slate-100 sm:h-12 sm:w-12 sm:rounded-[0.75rem]">
                                    <Icon className="size-4 sm:size-6" />
                                </div>
                                <h2 className="mt-3 font-manrope text-[0.78rem] font-semibold leading-5 text-slate-50 sm:mt-5 sm:text-xl lg:mt-3 lg:text-[1.02rem] lg:leading-6">
                                    {title}
                                </h2>
                                <p className="mt-3 hidden text-sm leading-7 text-slate-400 xl:block xl:text-[0.95rem]">
                                    {description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
