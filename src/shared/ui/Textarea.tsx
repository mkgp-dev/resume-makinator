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
            "fieldset gap-1.5",
            isFlex && "flex-1",
        )}>
            {label ? (
                <label htmlFor={textareaId} className="fieldset-legend text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
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
                    "editor-control textarea min-h-24 resize-none rounded-[var(--radius-field)] text-sm",
                    isStretch && "w-full",
                )}
            />
        </fieldset>
    )
}
