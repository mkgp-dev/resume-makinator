import { PlusCircleIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import clsx from "clsx"
import type { ReactNode } from "react"

type CardProps = {
    children?: ReactNode
    header?: string
    noPadding?: boolean
    noRadius?: boolean
    isPreview?: boolean
    btnEnable?: boolean
    btnClick?: () => void
}

export default function Card({
    children,
    header,
    noPadding = false,
    noRadius = false,
    isPreview = false,
    btnEnable = false,
    btnClick,
}: CardProps) {

    return (
        <div className={clsx(
            "w-full border border-base-300/80 bg-base-200/72 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl",
            isPreview && "h-full",
            noRadius ? "rounded-none" : "rounded-[0.35rem]",
        )}>
            <div className={clsx("card-body gap-4", noPadding ? "h-full p-0" : "p-4 sm:p-5")}>
                {btnEnable ? (
                    <div className="flex items-center justify-between">
                        {header && <h2 className="font-manrope text-xl font-semibold">{header}</h2>}
                        {btnEnable && <Button variant="transparent" icon={<PlusCircleIcon className="size-7" />} iconOnly={true} onClick={btnClick} />}
                    </div>
                ) : (
                    <>
                        {header && <h2 className="font-manrope text-xl font-semibold">{header}</h2>}
                    </>
                )}

                {children}
            </div>
        </div>
    )
}
