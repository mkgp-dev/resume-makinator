import clsx from "clsx"
import type { MouseEventHandler, ReactNode } from "react"

type ButtonVariant =
    | "default"
    | "transparent"
    | "dangerTransparent"
    | "sidebar"
    | "addBullet"
    | "entry"
    | "warning"
    | "danger"
    | "neutral"

type ButtonProps = {
    type?: "button" | "submit" | "reset"
    variant?: ButtonVariant
    text?: string
    icon?: ReactNode
    iconOnly?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
    isDisabled?: boolean
    alignCenter?: boolean
    isStretch?: boolean
}

export default function Button({
    type = "button",
    variant = "default",
    text = "Default",
    icon,
    iconOnly = false,
    onClick,
    isDisabled = false,
    alignCenter = false,
    isStretch = false,
}: ButtonProps) {
    const styles = {
        default: "btn-primary rounded-md",
        transparent: "bg-transparent hover:text-sky-600 hover:shadow-none",
        dangerTransparent: "bg-transparent hover:text-error hover:shadow-none",
        sidebar: "bg-transparent hover:bg-slate-700 hover:shadow-none",
        addBullet: "btn-primary btn-xs rounded-md hover:shadow-none",
        entry: "bg-transparent text-2xl hover:text-primary hover:shadow-none",
        warning: "btn-warning",
        danger: "btn-error",
        neutral: "btn-neutral",
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={clsx(
                "btn border-none font-manrope font-light",
                styles[variant],
                icon && "flex gap-2",
                alignCenter ? "items-center" : "justify-start",
                iconOnly && "p-0",
                isStretch && "w-full",
            )}
            disabled={isDisabled}
        >
            {iconOnly ? (
                icon
            ) : (
                <>
                    {icon}
                    {text}
                </>
            )}
        </button>
    )
}
