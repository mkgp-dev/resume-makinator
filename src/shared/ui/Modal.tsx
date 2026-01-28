import clsx from "clsx"
import { forwardRef } from "react"
import type { ReactEventHandler, ReactNode } from "react"

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
}, ref) => (
    <dialog
        {...(id && { id: id })}
        ref={ref}
        {...(onCancel && { onCancel: onCancel })}
        className="modal rounded-md select-none"
    >
        <div className={clsx(
            "modal-box bg-slate-800",
            size === "sm" && "max-w-sm",
            size === "md" && "max-w-md",
            size === "lg" && "max-w-lg",
        )}>
            {content}
            <div className="modal-action">
                {actions}
            </div>
        </div>
        {allowOutsideClick && (
            <form method="dialog" className="modal-backdrop">
                <button className="cursor-default" />
            </form>
        )}
    </dialog>
))

Modal.displayName = "Modal"

export default Modal
