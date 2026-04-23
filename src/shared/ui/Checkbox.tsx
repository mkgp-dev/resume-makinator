import type { ChangeEventHandler } from "react"
import clsx from "clsx"

type CheckboxProps = {
    label?: string
    isChecked?: boolean
    onChange?: ChangeEventHandler<HTMLInputElement>
    variant?: "inline" | "framed"
}

export default function Checkbox({
    label,
    isChecked,
    onChange,
    variant = "inline",
}: CheckboxProps) {
    const isFramed = variant === "framed"

    return (
        <div className="pt-1">
            <label
                className={clsx(
                    "label flex min-h-11 justify-start gap-3 text-sm text-slate-200",
                    isFramed
                        ? "rounded-[var(--radius-field)] border border-slate-500/38 bg-slate-900/42 px-3 py-2.5"
                        : "rounded-[0.35rem] px-0 py-2 text-slate-100",
                )}
            >
                <input
                    type="checkbox"
                    checked={isChecked ?? false}
                    className={clsx(
                        "checkbox checkbox-sm mt-0.5 shrink-0 rounded-[0.22rem] bg-slate-900/72 checked:bg-primary checked:text-primary-content",
                        isFramed
                            ? "border border-slate-500/62 checked:border-primary"
                            : "border border-slate-500/50 checked:border-primary",
                    )}
                    onChange={onChange}
                />
                <span className="leading-5">{label}</span>
            </label>
        </div>
    )
}
