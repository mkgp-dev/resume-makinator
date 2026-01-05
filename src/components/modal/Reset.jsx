import { useConfigurationHook } from "@/hooks/useConfiguration";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function ResetModal() {
    const { reset } = useConfigurationHook();
    const id = "reset-modal";

    const handleConfirm = () => {
        reset();
        const dialog = document.getElementById(id);
        if (dialog) dialog.close();
    }

    const handleCancel = () => {
        const dialog = document.getElementById(id);
        if (dialog) dialog.close();
    };

    return (
        <Modal
            id={id}
            size="sm"
            content={(
                <>
                    <h3 className="text-lg font-manrope font-bold">Confirmation</h3>
                    <p className="py-4">Are you sure you want to reset everything?</p>
                </>
            )}
            actions={(
                <>
                        <Button variant="danger" text="Confirm" onClick={() => handleConfirm()}/>
                        <Button text="Cancel" onClick={() => handleCancel()} />
                </>
            )}
            allowOutsideClick={true}
        />
    );
}