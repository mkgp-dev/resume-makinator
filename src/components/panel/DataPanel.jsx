import { ArrowDownCircleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useConfigurationStore } from "../../hooks/useConfigurationStore";
import { useEffect } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

export default function DataPanel() {
    const { status, update, importData, exportData } = useConfigurationStore();

    useEffect(() => {
        update(null);
    }, []);

    return (
        <div className="flex w-full flex-col">
            <Card>
                <div className="flex flex-col gap-2">
                    <Button text="Download your data" icon={<ArrowDownCircleIcon className="size-6" />} onClick={exportData} alignCenter={true} />
                    <span className="text-xs text-slate-500">Save a copy of your data to your device. If localStorage is ever reset or corrupted, you can quickly import this file to restore everything.</span>
                </div>
            </Card>
            <div className="divider">OR</div>
            <Card>
                <div className="flex flex-col gap-2">
                    <Input type="file" accept="json" onChange={importData} noPadding={true} isStretch={true} />
                    {status === null && (
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                            <InformationCircleIcon className="size-6 shrink-0" />
                            <span>Import is limited to JSON files that were previously downloaded from this server. Other JSON files are not supported.</span>
                        </div>
                    )}

                    {status === true && (
                        <Alert text="Data import completed without issues" icon={<CheckCircleIcon className="size-6 shrink-0" />} variant="success" isSoft={true} />
                    )}

                    {status === false && (
                        <Alert text="The selected file does not match the required format" icon={<XCircleIcon className="size-6 shrink-0" />} variant="error" isSoft={true} />
                    )}
                </div>
            </Card>
        </div>
    );
}