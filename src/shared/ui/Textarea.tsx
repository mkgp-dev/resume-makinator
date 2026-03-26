import clsx from "clsx"
import { useId } from "react"
import type { ChangeEventHandler } from "react"

type TextareaProps = {
    label?: string
    rows?: number
    value?: string
    placeholder?: string
    onChange?: ChangeEventHandler<HTMLTextAreaElement>
    isStretch?: boolean
    isFlex?: boolean
}

export default function Textarea({
    label,
    rows = 2,
    value,
    placeholder,
    onChange,
    isStretch = false,
    isFlex = false,
}: TextareaProps) {
    const textareaId = useId()

    return (
        <fieldset className={clsx(
            "fieldset",
            isFlex && "flex-1",
        )}>
            {label ? (
                <label htmlFor={textareaId} className="fieldset-legend text-sm font-medium">
                    {label}
                </label>
            ) : null}
            <textarea
                id={textareaId}
                rows={rows}
                value={value ?? ""}
                placeholder={placeholder}
                aria-label={label}
                onChange={onChange}
                className={clsx(
                    "textarea bg-slate-800 border border-slate-600 shadow-none outline-none resize-none placeholder:text-slate-600",
                    isStretch && "w-full",
                )}
            />
        </fieldset>
    )
}
