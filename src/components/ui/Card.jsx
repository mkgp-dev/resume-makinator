import { PlusCircleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import clsx from "clsx";

export default function Card({
    children,
    header,
    noPadding = false,
    noRadius = false,
    isPreview = false,
    btnEnable = false,
    btnClick,
}) {

    return (
        <div className={clsx(
            "card bg-slate-700/90 border border-slate-600/70 rounded-lg w-full",
            isPreview && "h-[45vh] md:h-full",
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
    );
}