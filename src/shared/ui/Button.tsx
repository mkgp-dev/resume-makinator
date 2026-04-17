import clsx from "clsx"
import type { MouseEventHandler, ReactNode } from "react"

type ButtonVariant =
    | "default"
    | "surface"
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
    className?: string
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
    className,
}: ButtonProps) {
    const styles = {
        default: "btn-primary border-primary/45",
        surface: "border-slate-500/34 bg-base-200/38 text-base-content hover:border-slate-400/45 hover:bg-base-200/55",
        transparent: "btn-ghost border-transparent bg-transparent text-slate-300 hover:bg-base-200/70 hover:text-base-content",
        dangerTransparent: "btn-ghost border-transparent bg-transparent text-slate-400 hover:bg-error/10 hover:text-error",
        sidebar: "border-transparent bg-transparent text-slate-400 hover:border-base-300 hover:bg-base-200/75 hover:text-base-content",
        addBullet: "btn-sm border-base-300 bg-base-200/78 text-base-content hover:border-primary/35 hover:bg-base-200",
        entry: "border-primary/45 bg-primary text-primary-content hover:bg-primary/90",
        warning: "btn-warning border-warning/40",
        danger: "btn-error border-error/40",
        neutral: "btn-neutral border-neutral/40",
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={clsx(
                "btn rounded-[var(--radius-field)] border font-manrope font-medium normal-case tracking-[0.01em] shadow-none",
                styles[variant],
                icon && "flex gap-2",
                alignCenter ? "justify-center" : "justify-start",
                iconOnly && "btn-square px-0",
                isStretch && "w-full",
                className,
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
