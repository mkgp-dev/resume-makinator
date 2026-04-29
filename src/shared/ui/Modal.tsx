import clsx from "clsx"
import { forwardRef } from "react"
import type { MouseEventHandler, ReactEventHandler, ReactNode } from "react"

type ModalProps = {
    id?: string
    size?: "sm" | "md" | "lg"
    content: ReactNode
    actions?: ReactNode
    allowOutsideClick?: boolean
    onCancel?: ReactEventHandler<HTMLDialogElement>
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(({
    id,
    size,
    content,
    actions,
    allowOutsideClick = false,
    onCancel,
}, ref) => {
    const handleBackdropClick: MouseEventHandler<HTMLDialogElement> = (event) => {
        if (!allowOutsideClick) return
        if (event.target !== event.currentTarget) return
        event.currentTarget.close()
        window.requestAnimationFrame(() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        })
    }

    return (
    <dialog
        {...(id && { id: id })}
        ref={ref}
        {...(onCancel && { onCancel: onCancel })}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 m-0 hidden h-full max-h-none w-full max-w-none items-center justify-center overflow-hidden border-0 bg-slate-950/72 p-4 text-base-content backdrop:bg-slate-950/72 backdrop:backdrop-blur-sm open:flex open:animate-fade-in"
    >
        <div className={clsx(
            "animate-modal-in flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-[0.55rem] border border-slate-500/28 bg-base-200/96 text-base-content shadow-[0_30px_90px_rgba(2,6,23,0.58)] backdrop-blur-xl",
            size === "sm" && "max-w-sm",
            size === "md" && "max-w-md",
            size === "lg" && "max-w-lg",
        )}>
            <div className="primary-scroll min-h-0 overflow-y-auto p-5 sm:p-6">
                {content}
            </div>
            <div className="modal-action shrink-0 border-t border-slate-500/18 bg-slate-950/12 px-5 py-4 sm:px-6">
                {actions}
            </div>
        </div>
    </dialog>
    )
})

Modal.displayName = "Modal"

export default Modal
