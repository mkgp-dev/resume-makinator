import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import Modal from "@/shared/ui/Modal"

export default function ResetModal() {
    const { reset } = useConfigurationHook()
    const id = "reset-modal"
    const closeDialog = () => {
        const dialog = document.getElementById(id) as HTMLDialogElement | null
        dialog?.close()
        window.requestAnimationFrame(() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        })
    }

    const handleConfirm = () => {
        reset()
        closeDialog()
    }

    const handleCancel = () => closeDialog()

    return (
        <Modal
            id={id}
            size="sm"
            content={(
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-error/14 text-error">
                            <ExclamationTriangleIcon className="size-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-manrope text-xl font-semibold text-slate-50">Reset everything?</h3>
                            <p className="text-sm leading-6 text-slate-300">
                                This will clear all saved resume information from this browser and reset the editor to its original state.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-[0.4rem] border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm leading-6 text-slate-300">
                        This action cannot be undone unless you have already exported your data.
                    </div>
                </div>
            )}
            actions={(
                <>
                        <Button variant="surface" text="Cancel" onClick={() => handleCancel()} />
                        <Button variant="danger" text="Reset" onClick={() => handleConfirm()}/>
                </>
            )}
            allowOutsideClick={true}
        />
    )
}
