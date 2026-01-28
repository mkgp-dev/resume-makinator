import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import ResetModal from "@/widgets/modals/Reset"
import Button from "@/shared/ui/Button"

export default function ResetPanel() {
    const id = "reset-modal"

    return (
        <>
            <div className="flex flex-col gap-1">
                <Button
                    variant="danger"
                    text="Reset everything"
                    icon={<TrashIcon className="size-5" />}
                    onClick={() => {
                        const dialog = document.getElementById(id) as HTMLDialogElement | null
                        dialog?.showModal()
                    }}
                    alignCenter={true}
                />

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <ExclamationTriangleIcon className="size-6 shrink-0" />
                    <span>This action will delete all your saved data and cannot be undone.</span>
                </div>
            </div>

            <ResetModal />
        </>
    )
}
