import clsx from "clsx"
import type { ReactNode } from "react"

type AlertVariant = "info" | "success" | "warning" | "error"

type AlertProps = {
    text: string
    icon?: ReactNode
    variant?: AlertVariant
    isSoft?: boolean
}

export default function Alert({
    text,
    icon,
    variant = "info",
    isSoft = false,
}: AlertProps) {
    const styles = {
        info: "alert-info",
        success: "alert-success",
        warning: "alert-warning",
        error: "alert-error",
    }

    return (
        <div
            role="alert"
            className={clsx(
                "alert animate-fade-in rounded-[var(--radius-field)] border border-base-300/70",
                styles[variant],
                isSoft && "alert-soft",
            )}
        >
            {icon}
            <span>{text}</span>
        </div>
    )
}
