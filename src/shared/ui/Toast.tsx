import clsx from "clsx"
import type { ReactNode } from "react"

type ToastVariant = "info" | "success" | "warning" | "error"

type ToastItem = {
    id?: string
    text: string
    icon?: ReactNode
    variant?: ToastVariant
    onClose?: () => void
}

type ToastPlacement =
    | "top-start"
    | "top-center"
    | "top-end"
    | "middle-start"
    | "middle-center"
    | "middle-end"
    | "bottom-start"
    | "bottom-center"
    | "bottom-end"

type ToastProps = {
    items: ToastItem[]
    placement?: ToastPlacement
}

const placementClasses: Record<ToastPlacement, string> = {
    "top-start": "toast-top toast-start",
    "top-center": "toast-top toast-center",
    "top-end": "toast-top toast-end",
    "middle-start": "toast-middle toast-start",
    "middle-center": "toast-middle toast-center",
    "middle-end": "toast-middle toast-end",
    "bottom-start": "toast-bottom toast-start",
    "bottom-center": "toast-bottom toast-center",
    "bottom-end": "toast-bottom toast-end",
}

const variantClasses: Record<ToastVariant, string> = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
}

export default function Toast({ items, placement = "top-end" }: ToastProps) {
    if (items.length === 0) return null

    return (
        <div className={clsx("toast", placementClasses[placement])}>
            {items.map((item, index) => {
                const variant = item.variant ?? "info"
                const key = item.id ?? `${variant}-${index}`

                return (
                    <div
                        key={key}
                        role="alert"
                        className={clsx("alert alert-soft", variantClasses[variant])}
                    >
                        {item.icon}
                        <span>{item.text}</span>
                        {item.onClose ? (
                            <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={item.onClose}
                                aria-label="Dismiss notification"
                            >
                                ✕
                            </button>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}
