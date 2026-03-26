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
            "fieldset",
            noPadding && "p-0",
        )}>
            {label ? (
                <label htmlFor={inputId} className="fieldset-legend text-sm font-medium">
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
                    "bg-slate-800 border border-slate-600 outline-none shadow-none placeholder:text-slate-600",
                    isStretch && "w-full",
                    type === "file" ? "file-input file:bg-slate-800 file:shadow-none" : "input",
                    type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0",
                )}
            />
        </fieldset>
    )
}
