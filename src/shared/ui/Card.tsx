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
            "card bg-slate-700/90 border border-slate-600/70 rounded-lg w-full",
            isPreview && "md:h-full",
            noRadius && "rounded-none",
        )}>
            <div className={clsx("card-body", noPadding && "p-0")}>
                {btnEnable ? (
                    <div className="flex items-center justify-between">
                        {header && <h2 className="font-manrope text-2xl font-semibold">{header}</h2>}
                        {btnEnable && <Button variant="transparent" icon={<PlusCircleIcon className="size-7" />} iconOnly={true} onClick={btnClick} />}
                    </div>
                ) : (
                    <>
                        {header && <h2 className="font-manrope text-2xl font-semibold">{header}</h2>}
                    </>
                )}

                {children}
            </div>
        </div>
    )
}
