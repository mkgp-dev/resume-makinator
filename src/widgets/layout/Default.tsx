import { ArrowRightCircleIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import { useDefaultHook } from "@/features/editor/hooks/useDefault"

export default function Default() {
    const { buttonStart } = useDefaultHook()

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-4">
                    <h1 className="font-manrope font-normal text-4xl md:text-9xl">Click. Fill.</h1>
                    <span className="text-rotate text-4xl md:text-9xl">
                        <span className="text-primary font-bold uppercase">
                            <span>Done</span>
                            <span>Send</span>
                            <span>Apply</span>
                            <span>Export</span>
                        </span>
                    </span>
                </div>

                <div className="font-manrope font-bold text-1xl md:text-5xl">This is Resume <span className="text-primary">Makinator</span></div>

                <div className="mt-5">
                    <Button variant="entry" text="Get started" icon={<ArrowRightCircleIcon className="size-10" />} onClick={buttonStart} />
                </div>
            </div>
        </div>
    )
}