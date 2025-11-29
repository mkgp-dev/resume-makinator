import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import ResetModal from "../modal/Reset";
import Button from "../ui/Button";

export default function ResetPanel() {
    const id = "reset-modal";

    return (
        <>
            <div className="flex flex-col gap-1">
                <Button
                    variant="danger"
                    text="Reset everything"
                    icon={<TrashIcon className="size-5" />}
                    onClick={() => document.getElementById(id).showModal()}
                    alignCenter={true}
                />

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <ExclamationTriangleIcon className="size-6 shrink-0" />
                    <span>This action will delete all your saved data and cannot be undone.</span>
                </div>
            </div>

            <ResetModal />
        </>
    );
}