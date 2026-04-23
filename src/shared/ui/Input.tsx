import clsx from "clsx"
import { useId, useState } from "react"
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
    maxLength?: number
    pattern?: string
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
    autoComplete?: string
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
    maxLength,
    pattern,
    inputMode,
    autoComplete,
}: InputProps) {
    const inputId = useId()
    const [fileName, setFileName] = useState("")

    if (type === "file") {
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
                <label
                    htmlFor={inputId}
                    className={clsx(
                        "editor-control editor-file-control flex min-h-11 items-center gap-3 rounded-[var(--radius-field)] text-sm",
                        isStretch && "w-full",
                        isDisabled ? "cursor-not-allowed opacity-55" : "cursor-pointer",
                    )}
                >
                    <span className="shrink-0 border-r border-slate-500/30 bg-slate-800/42 px-4 py-3 font-medium text-slate-100">
                        Browse
                    </span>
                    <span className="min-w-0 flex-1 truncate px-1 py-3 text-slate-300">
                        {fileName || "No file selected"}
                    </span>
                    <input
                        id={inputId}
                        type="file"
                        {...(accept === "image" && { accept: "image/*" })}
                        {...(accept === "json" && { accept: ".json,application/json,text/json" })}
                        aria-label={label}
                        disabled={isDisabled}
                        onChange={(event) => {
                            setFileName(event.target.files?.[0]?.name ?? "")
                            onChange?.(event)
                            if (!event.currentTarget.value) setFileName("")
                        }}
                        className="sr-only"
                    />
                </label>
            </fieldset>
        )
    }

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
                value={value ?? ""}
                placeholder={placeholder}
                aria-label={label}
                disabled={isDisabled}
                onChange={onChange}
                maxLength={maxLength}
                pattern={pattern}
                inputMode={inputMode}
                autoComplete={autoComplete}
                className={clsx(
                    "editor-control min-h-11 text-sm",
                    isStretch && "w-full",
                    "input rounded-[var(--radius-field)]",
                    type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0",
                )}
            />
        </fieldset>
    )
}
