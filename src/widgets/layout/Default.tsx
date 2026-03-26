import { ArrowRightCircleIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import { useDefaultHook } from "@/features/editor/hooks/useDefault"

export default function Default() {
    const { buttonStart } = useDefaultHook()

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <section aria-labelledby="landing-title" className="flex max-w-5xl flex-col items-center text-center">
                <header className="flex flex-col items-center gap-4">
                    <p className="font-manrope text-lg uppercase tracking-[0.3em] text-slate-400 md:text-xl">
                        Click. Fill. Done.
                    </p>
                    <h1 id="landing-title" className="font-manrope font-normal text-4xl md:text-7xl">
                        Free Resume Builder with Live PDF Preview
                    </h1>
                    <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-lg">
                        Resume Makinator helps you build a polished resume in the browser with structured fields,
                        drag-and-drop organization, live PDF preview, and fast export.
                    </p>
                </header>

                <div className="mt-3 font-manrope text-xl font-bold md:text-4xl">
                    This is Resume <span className="text-primary">Makinator</span>
                </div>

                <div className="mt-5">
                    <Button variant="entry" text="Get started" icon={<ArrowRightCircleIcon className="size-10" />} onClick={buttonStart} />
                </div>
            </section>
        </main>
    )
}
