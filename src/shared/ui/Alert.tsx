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
                "alert rounded-md animate-fade-in",
                styles[variant],
                isSoft && "alert-soft",
            )}
        >
            {icon}
            <span>{text}</span>
        </div>
    )
}
