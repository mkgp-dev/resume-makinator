import {
    ArrowDownCircleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline"
import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import { useEffect } from "react"
import Alert from "@/shared/ui/Alert"
import Button from "@/shared/ui/Button"
import Input from "@/shared/ui/Input"
import EditorSection from "@/shared/ui/EditorSection"

export default function DataPanel() {
    const { dataStatus, setDataStatus, importData, exportData } = useConfigurationHook()

    useEffect(() => {
        setDataStatus(null)
    }, [setDataStatus])

    return (
        <EditorSection title="Transfer data">
            <div className="editor-subtle-panel flex flex-col gap-3">
                <Button
                    text="Download your data"
                    icon={<ArrowDownCircleIcon className="size-5" />}
                    onClick={exportData}
                    alignCenter={true}
                    isStretch={true}
                />
                <span className="text-sm leading-6 text-slate-400">Save a copy of your data to your device. If localStorage is ever reset or corrupted, you can quickly import this file to restore everything.</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                <div className="h-px flex-1 bg-slate-500/45" />
                <span className="text-slate-400">Or</span>
                <div className="h-px flex-1 bg-slate-500/45" />
            </div>

            <div className="editor-subtle-panel flex flex-col gap-3">
                <Input type="file" accept="json" onChange={importData} noPadding={true} isStretch={true} />
                {dataStatus === null && (
                    <div className="flex items-start gap-2 text-sm leading-6 text-slate-400">
                        <InformationCircleIcon className="size-5 shrink-0" />
                        <span>Import is limited to JSON files that were previously downloaded from this server. Other JSON files are not supported.</span>
                    </div>
                )}

                {dataStatus === true && (
                    <Alert text="Data import completed without issues" icon={<CheckCircleIcon className="size-6 shrink-0" />} variant="success" isSoft={true} />
                )}

                {dataStatus === false && (
                    <Alert text="The selected file does not match the required format" icon={<XCircleIcon className="size-6 shrink-0" />} variant="error" isSoft={true} />
                )}
            </div>
        </EditorSection>
    )
}
