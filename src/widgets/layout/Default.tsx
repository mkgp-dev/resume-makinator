import {
    ArrowRightCircleIcon,
    ChatBubbleLeftRightIcon,
    PencilSquareIcon,
    RectangleStackIcon,
} from "@heroicons/react/24/outline"
import { useDefaultHook } from "@/features/editor/hooks/useDefault"

const proofCards = [
    {
        title: "Free resume builder",
        description: "Create and export your resume in the browser without a signup wall or paid gate.",
        eyebrow: "Free",
        icon: RectangleStackIcon,
    },
    {
        title: "Ready to edit and view",
        description: "Fill focused fields and keep the live resume preview beside you while you refine the output.",
        eyebrow: "Live editor",
        icon: PencilSquareIcon,
    },
    {
        title: "Chat assistant guidance",
        description: "Ask for help adding, editing, or improving one resume section at a time for cleaner wording.",
        eyebrow: "AI guided",
        icon: ChatBubbleLeftRightIcon,
    },
]

export default function Default() {
    const { buttonStart } = useDefaultHook()

    return (
        <main data-testid="landing-shell" className="landing-shell overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 lg:h-dvh lg:px-8 lg:py-6">
            <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[1380px] flex-col justify-center lg:h-[calc(100dvh-3rem)] lg:min-h-0">
                <section className="landing-hero-grid flex-1 lg:pb-8">
                    <div data-testid="landing-hero-copy" className="landing-rise-in flex max-w-3xl flex-col items-start">
                        <h1
                            id="landing-title"
                            className="max-w-4xl font-manrope text-5xl font-semibold leading-[0.98] text-slate-50 sm:text-7xl lg:text-[6.4rem]"
                        >
                            This is{" "}
                            <span className="text-slate-300 drop-shadow-[0_0_28px_rgba(203,213,225,0.18)]">
                                Resume Makinator
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                            A simple free resume builder with structured editing, a live preview, and a chat assistant that helps you shape better resume content.
                        </p>

                        <div className="mt-7">
                            <button
                                type="button"
                                aria-label="Get started"
                                onClick={buttonStart}
                                className="group relative inline-flex min-h-16 min-w-[22rem] items-center overflow-hidden rounded-full border border-sky-200/30 bg-sky-300/14 px-5 font-manrope text-base font-semibold text-sky-100 shadow-[0_18px_44px_rgba(14,165,233,0.18)] transition-[border-color,background-color] duration-200 hover:border-sky-100/55 hover:bg-sky-300/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 sm:text-lg"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute left-5 z-10 transition-transform duration-300 ease-out group-hover:translate-x-[17.2rem]"
                                >
                                    <ArrowRightCircleIcon className="size-9 sm:size-10" />
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center pl-10 transition-all duration-300 ease-out group-hover:-translate-x-8 group-hover:opacity-0">
                                    <span>Start editing in your browser</span>
                                </span>
                                <span className="absolute inset-0 flex translate-x-8 items-center justify-center opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                                    <span>Get started</span>
                                </span>
                            </button>
                        </div>
                    </div>

                    <div data-testid="landing-hero-visual" className="landing-rise-in-delay flex w-full justify-center lg:justify-end">
                        <div className="landing-hero-visual w-full max-w-[24rem] sm:max-w-[32rem] lg:max-w-[34rem]">
                            <div className="landing-hero-glow" aria-hidden="true" />

                            <div
                                data-testid="landing-proof-grid"
                                className="grid gap-3"
                            >
                                {proofCards.map(({ title, description, eyebrow, icon: Icon }) => (
                                    <article
                                        key={title}
                                        data-testid="landing-proof-card"
                                        className="editor-panel-surface rounded-[0.85rem] px-4 py-4 sm:px-5 sm:py-5"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
                                                {eyebrow}
                                            </p>
                                            <div className="flex h-9 w-9 items-center justify-center rounded-[0.6rem] border border-slate-400/18 bg-slate-900/35 text-slate-100">
                                                <Icon className="size-4" />
                                            </div>
                                        </div>
                                        <h2 className="mt-4 font-manrope text-base font-semibold leading-6 text-slate-50 sm:text-lg">
                                            {title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
