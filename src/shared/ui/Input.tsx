import clsx from "clsx"
import { useId } from "react"
import type { ChangeEventHandler, HTMLInputTypeAttribute } from "react"

type InputProps = {
    type?: HTMLInputTypeAttribute
    accept?: "image" | "json"
    label?: string
    value?: string | number
    placeholder?: string
    onChange?: ChangeEventHandler<HTMLInputElement>
    isStretch?: boolean
    isDisabled?: boolean
    noPadding?: boolean
}

export default function Input({
    type = "text",
    accept,
    label,
    value,
    placeholder,
    onChange,
    isStretch = false,
    isDisabled = false,
    noPadding = false,
}: InputProps) {
    const inputId = useId()

    return (
        <fieldset className={clsx(
            "fieldset gap-1.5",
            noPadding && "p-0",
        )}>
            {label ? (
                <label htmlFor={inputId} className="fieldset-legend text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {label}
                </label>
            ) : null}
            <input
                id={inputId}
                type={type}
                {...(type !== "file" && { value: value ?? "" })}
                {...(type === "file" && accept === "image" && { accept: "image/*" })}
                {...(type === "file" && accept === "json" && { accept: ".json,application/json,text/json" })}
                placeholder={placeholder}
                aria-label={label}
                disabled={isDisabled}
                onChange={onChange}
                className={clsx(
                    "editor-control min-h-11 text-sm",
                    isStretch && "w-full",
                    type === "file"
                        ? "file-input w-full rounded-[var(--radius-field)] px-0 file:mr-4 file:border-0 file:border-r file:border-base-300 file:bg-base-300/70 file:px-4 file:text-sm file:font-medium file:text-slate-200"
                        : "input rounded-[var(--radius-field)]",
                    type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0",
                )}
            />
        </fieldset>
    )
}
