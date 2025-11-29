import clsx from "clsx";

export default function Modal({
    id,
    ref,
    size,
    content,
    actions,
    allowOutsideClick = false,
    onCancel
}) {

    return (
        <dialog
            {...(id && { id: id })}
            {...(ref && { ref: ref })}
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
    );
}